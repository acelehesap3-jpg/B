export interface StockBrokerConfig {
  id: string;
  name: string;
  type: 'stock' | 'options';
  apiEndpoint: string;
  requiresOAuth: boolean;
}

export const STOCK_BROKERS: Record<string, StockBrokerConfig> = {
  ALPACA: {
    id: 'ALPACA',
    name: 'Alpaca',
    type: 'stock',
    apiEndpoint: 'https://api.alpaca.markets',
    requiresOAuth: false,
  },
  TRADIER: {
    id: 'TRADIER',
    name: 'Tradier',
    type: 'stock',
    apiEndpoint: 'https://api.tradier.com',
    requiresOAuth: false,
  },
  INTERACTIVEBROKERS: {
    id: 'INTERACTIVEBROKERS',
    name: 'Interactive Brokers',
    type: 'stock',
    apiEndpoint: 'https://api.ibkr.com',
    requiresOAuth: true,
  },
};

export interface AlpacaOrder {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  qty: number;
  filled_qty: number;
  status: 'new' | 'partially_filled' | 'filled' | 'canceled' | 'expired' | 'replaced';
  created_at: string;
  updated_at: string;
  filled_avg_price: number | null;
}

export class StockBrokerConnector {
  private apiKey: string = '';
  private apiSecret: string = '';
  private baseUrl: string = '';
  private isPaperTrading: boolean = true;

  initializeAlpaca(apiKey: string, apiSecret: string, paperTrading: boolean = true) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.isPaperTrading = paperTrading;
    this.baseUrl = paperTrading 
      ? 'https://paper-api.alpaca.markets' 
      : 'https://api.alpaca.markets';
  }

  private async alpacaRequest(endpoint: string, method: string = 'GET', body?: any) {
    const headers: HeadersInit = {
      'APCA-API-KEY-ID': this.apiKey,
      'APCA-API-SECRET-KEY': this.apiSecret,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Alpaca API request failed');
    }

    return await response.json();
  }

  async getAlpacaAccount() {
    return await this.alpacaRequest('/v2/account');
  }

  async getAlpacaPositions() {
    return await this.alpacaRequest('/v2/positions');
  }

  async createAlpacaOrder(
    symbol: string,
    qty: number,
    side: 'buy' | 'sell',
    type: 'market' | 'limit' | 'stop' | 'stop_limit',
    timeInForce: 'day' | 'gtc' | 'ioc' | 'fok' = 'gtc',
    limitPrice?: number,
    stopPrice?: number
  ): Promise<AlpacaOrder> {
    const orderData: any = {
      symbol,
      qty,
      side,
      type,
      time_in_force: timeInForce,
    };

    if (limitPrice) orderData.limit_price = limitPrice;
    if (stopPrice) orderData.stop_price = stopPrice;

    return await this.alpacaRequest('/v2/orders', 'POST', orderData);
  }

  async cancelAlpacaOrder(orderId: string) {
    return await this.alpacaRequest(`/v2/orders/${orderId}`, 'DELETE');
  }

  async getAlpacaOrders(status: 'open' | 'closed' | 'all' = 'open') {
    return await this.alpacaRequest(`/v2/orders?status=${status}`);
  }

  async getAlpacaQuote(symbol: string) {
    return await this.alpacaRequest(`/v2/stocks/${symbol}/quotes/latest`);
  }

  async getAlpacaBars(
    symbol: string,
    timeframe: '1Min' | '5Min' | '15Min' | '1Hour' | '1Day',
    start?: string,
    end?: string,
    limit: number = 100
  ) {
    let url = `/v2/stocks/${symbol}/bars?timeframe=${timeframe}&limit=${limit}`;
    if (start) url += `&start=${start}`;
    if (end) url += `&end=${end}`;
    return await this.alpacaRequest(url);
  }
}

export class ForexBrokerConnector {
  private apiKey: string = '';
  private accountId: string = '';
  private baseUrl: string = '';
  private isPractice: boolean = true;

  initializeOanda(apiKey: string, accountId: string, practice: boolean = true) {
    this.apiKey = apiKey;
    this.accountId = accountId;
    this.isPractice = practice;
    this.baseUrl = practice
      ? 'https://api-fxpractice.oanda.com'
      : 'https://api-fxtrade.oanda.com';
  }

  private async oandaRequest(endpoint: string, method: string = 'GET', body?: any) {
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errorMessage || 'OANDA API request failed');
    }

    return await response.json();
  }

  async getOandaAccount() {
    return await this.oandaRequest(`/v3/accounts/${this.accountId}`);
  }

  async createOandaOrder(
    instrument: string,
    units: number,
    type: 'MARKET' | 'LIMIT' | 'STOP' = 'MARKET',
    price?: number
  ) {
    const orderData: any = {
      order: {
        instrument,
        units: units.toString(),
        type,
        timeInForce: 'FOK',
        positionFill: 'DEFAULT',
      }
    };

    if (price && type !== 'MARKET') {
      orderData.order.price = price.toString();
    }

    return await this.oandaRequest(`/v3/accounts/${this.accountId}/orders`, 'POST', orderData);
  }

  async getOandaPricing(instruments: string[]) {
    const instrumentsParam = instruments.join(',');
    return await this.oandaRequest(`/v3/accounts/${this.accountId}/pricing?instruments=${instrumentsParam}`);
  }

  async getOandaCandles(
    instrument: string,
    granularity: 'M1' | 'M5' | 'M15' | 'H1' | 'H4' | 'D' = 'M5',
    count: number = 100
  ) {
    return await this.oandaRequest(`/v3/instruments/${instrument}/candles?granularity=${granularity}&count=${count}`);
  }
}

export class CommodityBrokerConnector {
  private apiKey: string = '';
  private baseUrl: string = 'https://www.cmegroup.com/services';

  initializeCME(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async cmeRequest(endpoint: string) {
    const headers: HeadersInit = {
      'X-API-KEY': this.apiKey,
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('CME API request failed');
    }

    return await response.json();
  }

  async getCMEMarketData(productCode: string) {
    return await this.cmeRequest(`/marketdata/price/${productCode}`);
  }

  async getCMEQuotes(symbols: string[]) {
    return await this.cmeRequest(`/marketdata/quotes?symbols=${symbols.join(',')}`);
  }
}

export const stockBrokerConnector = new StockBrokerConnector();
export const forexBrokerConnector = new ForexBrokerConnector();
export const commodityBrokerConnector = new CommodityBrokerConnector();
