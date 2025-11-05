import ccxt from './ccxtBrowserAdapter';

export interface ExchangeConfig {
  id: string;
  name: string;
  type: 'crypto' | 'stock' | 'forex' | 'commodity';
  ccxtId?: string;
  requiresCredentials: boolean;
  supportedFeatures: {
    spot: boolean;
    margin: boolean;
    futures: boolean;
    options: boolean;
    swap: boolean;
  };
}

export const EXCHANGE_CONFIGS: Record<string, ExchangeConfig> = {
  BINANCE: {
    id: 'BINANCE',
    name: 'Binance',
    type: 'crypto',
    ccxtId: 'binance',
    requiresCredentials: true,
    supportedFeatures: {
      spot: true,
      margin: true,
      futures: true,
      options: true,
      swap: true,
    },
  },
  COINBASE: {
    id: 'COINBASE',
    name: 'Coinbase Pro',
    type: 'crypto',
    ccxtId: 'coinbasepro',
    requiresCredentials: true,
    supportedFeatures: {
      spot: true,
      margin: false,
      futures: false,
      options: false,
      swap: false,
    },
  },
  OKX: {
    id: 'OKX',
    name: 'OKX',
    type: 'crypto',
    ccxtId: 'okx',
    requiresCredentials: true,
    supportedFeatures: {
      spot: true,
      margin: true,
      futures: true,
      options: true,
      swap: true,
    },
  },
  KUCOIN: {
    id: 'KUCOIN',
    name: 'KuCoin',
    type: 'crypto',
    ccxtId: 'kucoin',
    requiresCredentials: true,
    supportedFeatures: {
      spot: true,
      margin: true,
      futures: true,
      options: false,
      swap: false,
    },
  },
  KRAKEN: {
    id: 'KRAKEN',
    name: 'Kraken',
    type: 'crypto',
    ccxtId: 'kraken',
    requiresCredentials: true,
    supportedFeatures: {
      spot: true,
      margin: true,
      futures: true,
      options: false,
      swap: false,
    },
  },
  BYBIT: {
    id: 'BYBIT',
    name: 'Bybit',
    type: 'crypto',
    ccxtId: 'bybit',
    requiresCredentials: true,
    supportedFeatures: {
      spot: true,
      margin: false,
      futures: true,
      options: true,
      swap: true,
    },
  },
  BITFINEX: {
    id: 'BITFINEX',
    name: 'Bitfinex',
    type: 'crypto',
    ccxtId: 'bitfinex',
    requiresCredentials: true,
    supportedFeatures: {
      spot: true,
      margin: true,
      futures: false,
      options: false,
      swap: false,
    },
  },
  NASDAQ: {
    id: 'NASDAQ',
    name: 'NASDAQ',
    type: 'stock',
    requiresCredentials: true,
    supportedFeatures: {
      spot: true,
      margin: true,
      futures: false,
      options: true,
      swap: false,
    },
  },
  NYSE: {
    id: 'NYSE',
    name: 'New York Stock Exchange',
    type: 'stock',
    requiresCredentials: true,
    supportedFeatures: {
      spot: true,
      margin: true,
      futures: false,
      options: true,
      swap: false,
    },
  },
  FOREX: {
    id: 'FOREX',
    name: 'Forex Market',
    type: 'forex',
    requiresCredentials: true,
    supportedFeatures: {
      spot: true,
      margin: true,
      futures: false,
      options: false,
      swap: true,
    },
  },
  CME: {
    id: 'CME',
    name: 'Chicago Mercantile Exchange',
    type: 'commodity',
    requiresCredentials: true,
    supportedFeatures: {
      spot: false,
      margin: false,
      futures: true,
      options: true,
      swap: false,
    },
  },
};

export class RealExchangeConnector {
  private exchanges: Map<string, any> = new Map();

  createExchange(exchangeId: string, apiKey: string, apiSecret: string, testnet: boolean = true) {
    const config = EXCHANGE_CONFIGS[exchangeId];
    if (!config || !config.ccxtId) {
      throw new Error(`Exchange ${exchangeId} not supported for real trading`);
    }

    const ExchangeClass = (ccxt as any)[config.ccxtId];
    if (!ExchangeClass) {
      throw new Error(`CCXT exchange ${config.ccxtId} not found`);
    }

    const exchange = new ExchangeClass({
      apiKey,
      secret: apiSecret,
      enableRateLimit: true,
      options: {
        defaultType: 'spot',
        adjustForTimeDifference: true,
      },
    });

    if (testnet) {
      exchange.setSandboxMode(true);
    }

    this.exchanges.set(exchangeId, exchange);
    return exchange;
  }

  getExchange(exchangeId: string) {
    return this.exchanges.get(exchangeId);
  }

  async fetchBalance(exchangeId: string) {
    const exchange = this.getExchange(exchangeId);
    if (!exchange) throw new Error(`Exchange ${exchangeId} not connected`);
    return await exchange.fetchBalance();
  }

  async createOrder(
    exchangeId: string,
    symbol: string,
    type: string,
    side: string,
    amount: number,
    price?: number
  ) {
    const exchange = this.getExchange(exchangeId);
    if (!exchange) throw new Error(`Exchange ${exchangeId} not connected`);
    return await exchange.createOrder(symbol, type, side, amount, price);
  }

  async cancelOrder(exchangeId: string, orderId: string, symbol?: string) {
    const exchange = this.getExchange(exchangeId);
    if (!exchange) throw new Error(`Exchange ${exchangeId} not connected`);
    return await exchange.cancelOrder(orderId, symbol);
  }

  async fetchOrders(exchangeId: string, symbol?: string) {
    const exchange = this.getExchange(exchangeId);
    if (!exchange) throw new Error(`Exchange ${exchangeId} not connected`);
    return await exchange.fetchOrders(symbol);
  }

  async fetchOpenOrders(exchangeId: string, symbol?: string) {
    const exchange = this.getExchange(exchangeId);
    if (!exchange) throw new Error(`Exchange ${exchangeId} not connected`);
    return await exchange.fetchOpenOrders(symbol);
  }

  async fetchTicker(exchangeId: string, symbol: string) {
    const exchange = this.getExchange(exchangeId);
    if (!exchange) throw new Error(`Exchange ${exchangeId} not connected`);
    return await exchange.fetchTicker(symbol);
  }

  async fetchOHLCV(exchangeId: string, symbol: string, timeframe: string, limit: number = 100) {
    const exchange = this.getExchange(exchangeId);
    if (!exchange) throw new Error(`Exchange ${exchangeId} not connected`);
    return await exchange.fetchOHLCV(symbol, timeframe, undefined, limit);
  }

  async withdraw(exchangeId: string, code: string, amount: number, address: string, tag?: string) {
    const exchange = this.getExchange(exchangeId);
    if (!exchange) throw new Error(`Exchange ${exchangeId} not connected`);
    return await exchange.withdraw(code, amount, address, tag);
  }

  async fetchDeposits(exchangeId: string, code?: string) {
    const exchange = this.getExchange(exchangeId);
    if (!exchange) throw new Error(`Exchange ${exchangeId} not connected`);
    return await exchange.fetchDeposits(code);
  }

  async fetchWithdrawals(exchangeId: string, code?: string) {
    const exchange = this.getExchange(exchangeId);
    if (!exchange) throw new Error(`Exchange ${exchangeId} not connected`);
    return await exchange.fetchWithdrawals(code);
  }

  async fetchDepositAddress(exchangeId: string, code: string) {
    const exchange = this.getExchange(exchangeId);
    if (!exchange) throw new Error(`Exchange ${exchangeId} not connected`);
    return await exchange.fetchDepositAddress(code);
  }

  disconnectExchange(exchangeId: string) {
    this.exchanges.delete(exchangeId);
  }

  disconnectAll() {
    this.exchanges.clear();
  }
}

export const realExchangeConnector = new RealExchangeConnector();
