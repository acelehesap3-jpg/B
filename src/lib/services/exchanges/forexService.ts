import { Order } from '../services/tradingService';
import axios from 'axios';

const OANDA_API_KEY = import.meta.env.VITE_OANDA_API_KEY;
const baseUrl = 'https://api-fxtrade.oanda.com/v3';

class ForexService {
  private headers = {
    'Authorization': `Bearer ${OANDA_API_KEY}`,
    'Content-Type': 'application/json'
  };

  async placeOrder(order: Order) {
    try {
      const response = await axios.post(
        `${baseUrl}/accounts/${order.userId}/orders`,
        {
          order: {
            type: order.orderType,
            instrument: order.symbol,
            units: order.side === 'buy' ? order.quantity : -order.quantity,
            price: order.price,
            stopLossOnFill: order.triggerPrice ? {
              price: order.triggerPrice.toString()
            } : undefined
          }
        },
        { headers: this.headers }
      );

      return {
        id: response.data.orderCreateTransaction.id,
        status: response.data.orderCreateTransaction.type.toLowerCase()
      };
    } catch (error) {
      console.error('Forex order error:', error);
      throw error;
    }
  }

  async getMarketData(symbol: string) {
    try {
      const response = await axios.get(
        `${baseUrl}/instruments/${symbol}/candles`,
        {
          params: {
            count: 1,
            granularity: 'D'
          },
          headers: this.headers
        }
      );

      const candle = response.data.candles[0];
      return {
        price: parseFloat(candle.mid.c),
        high24h: parseFloat(candle.mid.h),
        low24h: parseFloat(candle.mid.l),
        volume24h: parseInt(candle.volume),
        change24h: ((parseFloat(candle.mid.c) - parseFloat(candle.mid.o)) / parseFloat(candle.mid.o)) * 100
      };
    } catch (error) {
      console.error('Forex market data error:', error);
      throw error;
    }
  }

  async getBalance(accountId: string) {
    try {
      const response = await axios.get(
        `${baseUrl}/accounts/${accountId}/summary`,
        { headers: this.headers }
      );

      return {
        free: parseFloat(response.data.account.balance),
        locked: parseFloat(response.data.account.marginUsed),
        total: parseFloat(response.data.account.balance)
      };
    } catch (error) {
      console.error('Forex balance error:', error);
      throw error;
    }
  }
}

export const forexService = new ForexService();