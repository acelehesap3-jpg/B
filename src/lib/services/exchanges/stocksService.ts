import { Order } from '../services/tradingService';
import axios from 'axios';

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const baseUrl = 'https://finnhub.io/api/v1';

class StocksService {
  async placeOrder(order: Order) {
    // TODO: Implement real broker integration
    throw new Error('Stock trading is not implemented yet');
  }

  async getMarketData(symbol: string) {
    try {
      const quote = await axios.get(`${baseUrl}/quote`, {
        params: {
          symbol,
          token: FINNHUB_API_KEY
        }
      });

      return {
        price: quote.data.c,
        high24h: quote.data.h,
        low24h: quote.data.l,
        volume24h: quote.data.v,
        change24h: ((quote.data.c - quote.data.pc) / quote.data.pc) * 100,
      };
    } catch (error) {
      console.error('Stock market data error:', error);
      throw error;
    }
  }

  async getBalance(userId: string) {
    // TODO: Implement real broker balance check
    throw new Error('Stock balance check is not implemented yet');
  }
}

export const stocksService = new StocksService();