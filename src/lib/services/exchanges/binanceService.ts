import { Order } from '../services/tradingService';
import { Binance } from 'binance-api-node';

const binanceClient = Binance({
  apiKey: import.meta.env.VITE_BINANCE_API_KEY,
  apiSecret: import.meta.env.VITE_BINANCE_SECRET_KEY,
});

class BinanceService {
  async placeOrder(order: Order) {
    try {
      const params = {
        symbol: order.symbol,
        side: order.side.toUpperCase(),
        type: order.orderType.toUpperCase(),
        quantity: order.quantity.toString(),
      };

      if (order.price) {
        params['price'] = order.price.toString();
      }

      if (order.triggerPrice) {
        params['stopPrice'] = order.triggerPrice.toString();
      }

      const result = await binanceClient.order(params);
      return {
        id: result.orderId.toString(),
        status: result.status.toLowerCase(),
      };
    } catch (error) {
      console.error('Binance order error:', error);
      throw error;
    }
  }

  async getMarketData(symbol: string) {
    try {
      const ticker = await binanceClient.dailyStats({ symbol });
      return {
        price: parseFloat(ticker.lastPrice),
        high24h: parseFloat(ticker.highPrice),
        low24h: parseFloat(ticker.lowPrice),
        volume24h: parseFloat(ticker.volume),
        change24h: parseFloat(ticker.priceChangePercent),
      };
    } catch (error) {
      console.error('Binance market data error:', error);
      throw error;
    }
  }

  async getBalance(asset: string) {
    try {
      const accountInfo = await binanceClient.accountInfo();
      const balance = accountInfo.balances.find(b => b.asset === asset);
      return balance ? {
        free: parseFloat(balance.free),
        locked: parseFloat(balance.locked),
        total: parseFloat(balance.free) + parseFloat(balance.locked),
      } : null;
    } catch (error) {
      console.error('Binance balance error:', error);
      throw error;
    }
  }
}

export const binanceService = new BinanceService();