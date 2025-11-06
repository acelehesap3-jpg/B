import { supabase } from '@/lib/supabase';
import { MARKET_TYPES } from '@/lib/config/marketConfig';
import { binanceService } from './exchanges/binanceService';
import { forexService } from './exchanges/forexService';
import { stocksService } from './exchanges/stocksService';

export interface Order {
  id?: string;
  userId: string;
  marketType: keyof typeof MARKET_TYPES;
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  quantity: number;
  price?: number;
  triggerPrice?: number;
  exchange: string;
}

export interface Position {
  id?: string;
  userId: string;
  marketType: keyof typeof MARKET_TYPES;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  pnl: number;
  exchange: string;
}

class TradingService {
  private getExchangeService(marketType: keyof typeof MARKET_TYPES) {
    switch (marketType) {
      case 'CRYPTO':
        return binanceService;
      case 'FOREX':
        return forexService;
      case 'STOCKS':
      case 'INDICES':
        return stocksService;
      default:
        throw new Error('Unsupported market type');
    }
  }

  async placeOrder(order: Order) {
    try {
      const exchangeService = this.getExchangeService(order.marketType);
      const externalOrder = await exchangeService.placeOrder(order);

      const { data, error } = await supabase
        .from('trading_orders')
        .insert({
          user_id: order.userId,
          market_type: order.marketType.toLowerCase(),
          symbol: order.symbol,
          side: order.side,
          order_type: order.orderType,
          quantity: order.quantity,
          price: order.price,
          trigger_price: order.triggerPrice,
          status: 'pending',
          exchange: order.exchange,
          external_order_id: externalOrder.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  async getPositions(userId: string, marketType?: keyof typeof MARKET_TYPES) {
    try {
      let query = supabase
        .from('trading_positions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'open');

      if (marketType) {
        query = query.eq('market_type', marketType.toLowerCase());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting positions:', error);
      throw error;
    }
  }

  async getBalance(userId: string, marketType: keyof typeof MARKET_TYPES, asset: string) {
    try {
      const { data, error } = await supabase
        .from('real_balances')
        .select('*')
        .eq('user_id', userId)
        .eq('market_type', marketType.toLowerCase())
        .eq('asset', asset)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  async getMarketData(marketType: keyof typeof MARKET_TYPES, symbol: string) {
    try {
      const exchangeService = this.getExchangeService(marketType);
      const marketData = await exchangeService.getMarketData(symbol);
      return marketData;
    } catch (error) {
      console.error('Error getting market data:', error);
      throw error;
    }
  }
}

export const tradingService = new TradingService();