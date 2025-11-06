import { supabase } from '@/integrations/supabase/client';
import { coldWalletPaymentSystem } from './coldWalletPayments';
import { apiConfig } from '@/lib/config/apiConfig';
import { binance } from './exchanges/binance';
import { stocksDataProvider } from './stocksApi';
import { forexDataProvider } from './forexApi';

export interface RealOrder {
  id: string;
  userId: string;
  exchange: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  price: number;
  amount: number;
  filled: number;
  status: 'pending' | 'filled' | 'cancelled' | 'partial';
  timestamp: Date;
  externalOrderId?: string;
}

export interface RealTrade {
  id: string;
  userId: string;
  orderId: string;
  exchange: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  fee: number;
  timestamp: Date;
}

export interface ExchangeCredentials {
  userId: string;
  exchange: string;
  apiKey: string;
  apiSecret: string;
  testnet: boolean;
}

export type AssetType = 'crypto' | 'stocks' | 'forex' | 'commodities';

export interface TradingAccount {
  userId: string;
  exchange: string;
  assetType: AssetType;
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  testnet: boolean;
  isActive: boolean;
}

export class RealTradingEngine {
  private userId: string | null = null;

  async initialize(userId: string) {
    this.userId = userId;
    await coldWalletPaymentSystem.initialize(userId);
  }

  async saveCredentials(exchange: string, apiKey: string, apiSecret: string, testnet: boolean = true) {
    if (!this.userId) throw new Error('User not initialized');

    const { error } = await supabase
      .from('exchange_credentials')
      .upsert({
        user_id: this.userId,
        exchange,
        api_key: apiKey,
        api_secret: apiSecret,
        testnet,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,exchange'
      });

    if (error) throw error;
  }

  async getCredentials(exchange: string): Promise<ExchangeCredentials | null> {
    if (!this.userId) throw new Error('User not initialized');

    const { data, error } = await supabase
      .from('exchange_credentials')
      .select('*')
      .eq('user_id', this.userId)
      .eq('exchange', exchange)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async executeCryptoOrder(
    exchange: string,
    symbol: string,
    side: 'buy' | 'sell',
    type: 'market' | 'limit' | 'stop',
    amount: number,
    price?: number
  ): Promise<RealOrder> {
    if (!this.userId) throw new Error('User not initialized');
    
    if (!apiConfig.trading.enableRealTrading) {
      throw new Error('Real trading is disabled. Enable in configuration.');
    }

    const order: RealOrder = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: this.userId,
      exchange,
      symbol,
      side,
      type,
      price: price || 0,
      amount,
      filled: 0,
      status: 'pending',
      timestamp: new Date(),
    };

    try {
      let externalOrderId: string | undefined;

      // Execute real order based on exchange
      switch (exchange.toLowerCase()) {
        case 'binance':
          if (!binance.isConfigured()) {
            throw new Error('Binance API credentials not configured');
          }
          
          const binanceResult = side === 'buy' 
            ? await binance.placeBuyOrder(symbol, amount, price, type === 'limit' ? 'LIMIT' : 'MARKET')
            : await binance.placeSellOrder(symbol, amount, price, type === 'limit' ? 'LIMIT' : 'MARKET');
          
          externalOrderId = binanceResult.orderId.toString();
          order.status = binanceResult.status === 'FILLED' ? 'filled' : 'pending';
          order.filled = parseFloat(binanceResult.executedQty);
          break;

        default:
          throw new Error(`Exchange ${exchange} not supported for real trading yet`);
      }

      // Save order to database
      const { error } = await supabase
        .from('orders')
        .insert({
          id: order.id,
          user_id: order.userId,
          exchange: order.exchange,
          symbol: order.symbol,
          side: order.side,
          type: order.type,
          price: order.price,
          amount: order.amount,
          filled: order.filled,
          status: order.status,
          external_order_id: externalOrderId,
          created_at: order.timestamp.toISOString(),
        });

      if (error) throw error;

      // Process automated payment
      await coldWalletPaymentSystem.automatePaymentOnTrade(
        order.id,
        amount * (price || order.price),
        symbol,
        exchange
      ).catch(err => console.error('Automated payment failed:', err));

      return { ...order, externalOrderId };

    } catch (error) {
      // Update order status to failed
      order.status = 'cancelled';
      await supabase
        .from('orders')
        .insert({
          id: order.id,
          user_id: order.userId,
          exchange: order.exchange,
          symbol: order.symbol,
          side: order.side,
          type: order.type,
          price: order.price,
          amount: order.amount,
          filled: 0,
          status: 'cancelled',
          created_at: order.timestamp.toISOString(),
        });

      throw error;
    }
  }

  async executeForexOrder(
    instrument: string,
    side: 'buy' | 'sell',
    units: number,
    price?: number
  ): Promise<RealOrder> {
    if (!this.userId) throw new Error('User not initialized');
    
    if (!apiConfig.trading.enableRealTrading) {
      throw new Error('Real trading is disabled. Enable in configuration.');
    }

    if (!forexDataProvider.isConfigured()) {
      throw new Error('Forex trading credentials not configured');
    }

    const order: RealOrder = {
      id: `FOREX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: this.userId,
      exchange: 'OANDA',
      symbol: instrument,
      side,
      type: price ? 'limit' : 'market',
      price: price || 0,
      amount: units,
      filled: 0,
      status: 'pending',
      timestamp: new Date(),
    };

    try {
      const oandaResult = side === 'buy'
        ? await forexDataProvider.placeBuyOrder(instrument, units, price)
        : await forexDataProvider.placeSellOrder(instrument, units, price);

      order.externalOrderId = oandaResult.orderCreateTransaction?.id;
      order.status = oandaResult.orderFillTransaction ? 'filled' : 'pending';
      order.filled = oandaResult.orderFillTransaction ? units : 0;

      // Save to database
      const { error } = await supabase
        .from('orders')
        .insert({
          id: order.id,
          user_id: order.userId,
          exchange: order.exchange,
          symbol: order.symbol,
          side: order.side,
          type: order.type,
          price: order.price,
          amount: order.amount,
          filled: order.filled,
          status: order.status,
          external_order_id: order.externalOrderId,
          created_at: order.timestamp.toISOString(),
        });

      if (error) throw error;

      return order;

    } catch (error) {
      order.status = 'cancelled';
      await supabase
        .from('orders')
        .insert({
          id: order.id,
          user_id: order.userId,
          exchange: order.exchange,
          symbol: order.symbol,
          side: order.side,
          type: order.type,
          price: order.price,
          amount: order.amount,
          filled: 0,
          status: 'cancelled',
          created_at: order.timestamp.toISOString(),
        });

      throw error;
    }
  }

  // Legacy method for backward compatibility
  async executeOrder(
    exchange: string,
    symbol: string,
    side: 'buy' | 'sell',
    type: 'market' | 'limit' | 'stop',
    amount: number,
    price?: number
  ): Promise<RealOrder> {
    // Determine asset type based on exchange
    if (exchange.toLowerCase() === 'oanda' || symbol.includes('_')) {
      return this.executeForexOrder(symbol, side, amount, price);
    } else {
      return this.executeCryptoOrder(exchange, symbol, side, type, amount, price);
    }
  }

  async getOrders(filter?: { exchange?: string; symbol?: string; status?: string }): Promise<RealOrder[]> {
    if (!this.userId) throw new Error('User not initialized');

    let query = supabase
      .from('orders')
      .select('*')
      .eq('user_id', this.userId);

    if (filter?.exchange) query = query.eq('exchange', filter.exchange);
    if (filter?.symbol) query = query.eq('symbol', filter.symbol);
    if (filter?.status) query = query.eq('status', filter.status);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(d => ({
      id: d.id,
      userId: d.user_id,
      exchange: d.exchange,
      symbol: d.symbol,
      side: d.side as 'buy' | 'sell',
      type: d.type as 'market' | 'limit' | 'stop',
      price: d.price,
      amount: d.amount,
      filled: d.filled,
      status: d.status as 'pending' | 'filled' | 'cancelled' | 'partial',
      timestamp: new Date(d.created_at),
      externalOrderId: d.external_order_id,
    }));
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    if (!this.userId) throw new Error('User not initialized');

    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .eq('user_id', this.userId);

    return !error;
  }

  async getRealBalance(exchange: string): Promise<{ [key: string]: { free: number; locked: number } }> {
    if (!this.userId) throw new Error('User not initialized');

    try {
      switch (exchange.toLowerCase()) {
        case 'binance':
          if (!binance.isConfigured()) {
            throw new Error('Binance API credentials not configured');
          }
          
          const accountInfo = await binance.getAccountInfo();
          const balances: { [key: string]: { free: number; locked: number } } = {};
          
          accountInfo.balances.forEach(balance => {
            const free = parseFloat(balance.free);
            const locked = parseFloat(balance.locked);
            if (free > 0 || locked > 0) {
              balances[balance.asset] = { free, locked };
            }
          });
          
          return balances;

        case 'oanda':
          if (!forexDataProvider.isConfigured()) {
            throw new Error('OANDA credentials not configured');
          }
          
          const accountData = await forexDataProvider.getAccountInfo();
          return {
            'USD': {
              free: parseFloat(accountData.account.balance),
              locked: parseFloat(accountData.account.marginUsed || '0')
            }
          };

        default:
          throw new Error(`Exchange ${exchange} not supported for real balance fetching`);
      }
    } catch (error) {
      console.error(`Failed to fetch real balance from ${exchange}:`, error);
      throw error;
    }
  }

  async getBalance(exchange: string): Promise<{ [key: string]: number }> {
    if (!this.userId) throw new Error('User not initialized');

    try {
      // Try to get real balance first
      const realBalances = await this.getRealBalance(exchange);
      const balances: { [key: string]: number } = {};
      
      Object.entries(realBalances).forEach(([asset, balance]) => {
        balances[asset] = balance.free + balance.locked;
      });
      
      return balances;
    } catch (error) {
      // Fallback to database balances
      const { data, error: dbError } = await supabase
        .from('balances')
        .select('*')
        .eq('user_id', this.userId)
        .eq('exchange', exchange);

      if (dbError) throw dbError;

      const balances: { [key: string]: number } = {};
      (data || []).forEach(b => {
        balances[b.asset] = b.amount;
      });

      return balances;
    }
  }

  async syncBalances(exchange: string): Promise<void> {
    if (!this.userId) throw new Error('User not initialized');

    try {
      const realBalances = await this.getRealBalance(exchange);
      
      // Update database with real balances
      for (const [asset, balance] of Object.entries(realBalances)) {
        const totalBalance = balance.free + balance.locked;
        
        await supabase
          .from('balances')
          .upsert({
            user_id: this.userId,
            exchange,
            asset,
            amount: totalBalance,
            free: balance.free,
            locked: balance.locked,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,exchange,asset'
          });
      }
    } catch (error) {
      console.error(`Failed to sync balances for ${exchange}:`, error);
      throw error;
    }
  }

  async getAccountSummary(): Promise<{
    exchanges: string[];
    totalValue: number;
    activeOrders: number;
    tradingEnabled: boolean;
  }> {
    if (!this.userId) throw new Error('User not initialized');

    const exchanges: string[] = [];
    let totalValue = 0;
    
    // Check configured exchanges
    if (binance.isConfigured()) exchanges.push('Binance');
    if (forexDataProvider.isConfigured()) exchanges.push('OANDA');
    if (stocksDataProvider.isConfigured()) exchanges.push('Stocks');

    // Get active orders count
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', this.userId)
      .in('status', ['pending', 'partial']);

    const activeOrders = orders?.length || 0;

    return {
      exchanges,
      totalValue,
      activeOrders,
      tradingEnabled: apiConfig.trading.enableRealTrading
    };
  }

  async getAvailableAssets(assetType: AssetType): Promise<string[]> {
    switch (assetType) {
      case 'crypto':
        return binance.defaultPairs;
      
      case 'forex':
        return [...forexDataProvider.constructor.prototype.MAJOR_FOREX_PAIRS || []];
      
      case 'stocks':
        return stocksDataProvider.constructor.prototype.POPULAR_STOCKS || [];
      
      default:
        return [];
    }
  }

  isRealTradingEnabled(): boolean {
    return apiConfig.trading.enableRealTrading;
  }

  getConfiguredExchanges(): { exchange: string; assetType: AssetType; configured: boolean }[] {
    return [
      { exchange: 'Binance', assetType: 'crypto', configured: binance.isConfigured() },
      { exchange: 'OANDA', assetType: 'forex', configured: forexDataProvider.isConfigured() },
      { exchange: 'Stocks', assetType: 'stocks', configured: stocksDataProvider.isConfigured() }
    ];
  }
}

export const realTradingEngine = new RealTradingEngine();
