import { supabase } from '@/integrations/supabase/client';

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

export class RealTradingEngine {
  private userId: string | null = null;

  async initialize(userId: string) {
    this.userId = userId;
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

  async executeOrder(
    exchange: string,
    symbol: string,
    side: 'buy' | 'sell',
    type: 'market' | 'limit' | 'stop',
    amount: number,
    price?: number
  ): Promise<RealOrder> {
    if (!this.userId) throw new Error('User not initialized');

    const credentials = await this.getCredentials(exchange);
    if (!credentials) throw new Error(`No credentials found for ${exchange}`);

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
        created_at: order.timestamp.toISOString(),
      });

    if (error) throw error;

    return order;
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

  async getBalance(exchange: string): Promise<{ [key: string]: number }> {
    if (!this.userId) throw new Error('User not initialized');

    const credentials = await this.getCredentials(exchange);
    if (!credentials) throw new Error(`No credentials found for ${exchange}`);

    const { data, error } = await supabase
      .from('balances')
      .select('*')
      .eq('user_id', this.userId)
      .eq('exchange', exchange);

    if (error) throw error;

    const balances: { [key: string]: number } = {};
    (data || []).forEach(b => {
      balances[b.asset] = b.amount;
    });

    return balances;
  }
}

export const realTradingEngine = new RealTradingEngine();
