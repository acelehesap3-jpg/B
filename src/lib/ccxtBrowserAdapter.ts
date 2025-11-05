// Browser-compatible CCXT adapter
// Note: CCXT requires Node.js modules and cannot run directly in the browser.
// This adapter provides a mock interface for build compatibility.
// For production, implement a backend proxy service to handle exchange API calls.

export interface ExchangeInterface {
  fetchBalance(): Promise<any>;
  createOrder(symbol: string, type: string, side: string, amount: number, price?: number): Promise<any>;
  cancelOrder(orderId: string, symbol?: string): Promise<any>;
  fetchOrders(symbol?: string): Promise<any>;
  fetchOpenOrders(symbol?: string): Promise<any>;
  fetchTicker(symbol: string): Promise<any>;
  fetchOHLCV(symbol: string, timeframe: string, since?: number, limit?: number): Promise<any>;
  withdraw(code: string, amount: number, address: string, tag?: string): Promise<any>;
  fetchDeposits(code?: string): Promise<any>;
  fetchWithdrawals(code?: string): Promise<any>;
  fetchDepositAddress(code: string): Promise<any>;
  setSandboxMode(enabled: boolean): void;
}

class BrowserExchangeMock implements ExchangeInterface {
  private config: any;
  private sandboxMode: boolean = false;

  constructor(config: any) {
    this.config = config;
    console.warn(
      'CCXT cannot run in browser environment. ' +
      'Please implement a backend service to proxy exchange API calls. ' +
      'See documentation: https://docs.ccxt.com/en/latest/manual.html#proxy'
    );
  }

  setSandboxMode(enabled: boolean): void {
    this.sandboxMode = enabled;
  }

  private throwNotImplemented(method: string): never {
    throw new Error(
      `${method} is not available in browser mode. ` +
      'Implement a backend service to handle exchange operations.'
    );
  }

  async fetchBalance(): Promise<any> {
    this.throwNotImplemented('fetchBalance');
  }

  async createOrder(symbol: string, type: string, side: string, amount: number, price?: number): Promise<any> {
    this.throwNotImplemented('createOrder');
  }

  async cancelOrder(orderId: string, symbol?: string): Promise<any> {
    this.throwNotImplemented('cancelOrder');
  }

  async fetchOrders(symbol?: string): Promise<any> {
    this.throwNotImplemented('fetchOrders');
  }

  async fetchOpenOrders(symbol?: string): Promise<any> {
    this.throwNotImplemented('fetchOpenOrders');
  }

  async fetchTicker(symbol: string): Promise<any> {
    this.throwNotImplemented('fetchTicker');
  }

  async fetchOHLCV(symbol: string, timeframe: string, since?: number, limit?: number): Promise<any> {
    this.throwNotImplemented('fetchOHLCV');
  }

  async withdraw(code: string, amount: number, address: string, tag?: string): Promise<any> {
    this.throwNotImplemented('withdraw');
  }

  async fetchDeposits(code?: string): Promise<any> {
    this.throwNotImplemented('fetchDeposits');
  }

  async fetchWithdrawals(code?: string): Promise<any> {
    this.throwNotImplemented('fetchWithdrawals');
  }

  async fetchDepositAddress(code: string): Promise<any> {
    this.throwNotImplemented('fetchDepositAddress');
  }
}

// Mock CCXT object for browser environment
export const ccxtBrowser: Record<string, any> = {
  binance: BrowserExchangeMock,
  coinbasepro: BrowserExchangeMock,
  okx: BrowserExchangeMock,
  kucoin: BrowserExchangeMock,
  kraken: BrowserExchangeMock,
  bybit: BrowserExchangeMock,
  bitfinex: BrowserExchangeMock,
  // Add more exchanges as needed
};

export default ccxtBrowser;
