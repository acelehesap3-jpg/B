import { Candle, Trade, OrderBookLevel } from '@/types/trading';
import { apiConfig } from '@/lib/config/apiConfig';
import CryptoJS from 'crypto-js';

export interface BinanceKline {
  [0]: number;  // Open time
  [1]: string;  // Open
  [2]: string;  // High
  [3]: string;  // Low
  [4]: string;  // Close
  [5]: string;  // Volume
  [6]: number;  // Close time
  [7]: string;  // Quote asset volume
  [8]: number;  // Number of trades
  [9]: string;  // Taker buy base asset volume
  [10]: string; // Taker buy quote asset volume
  [11]: string; // Ignore
}

export interface BinanceDepthResponse {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

export interface BinanceTradeMessage {
  e: string;      // Event type
  E: number;      // Event time
  s: string;      // Symbol
  t: number;      // Trade ID
  p: string;      // Price
  q: string;      // Quantity
  b: number;      // Buyer order ID
  a: number;      // Seller order ID
  T: number;      // Trade time
  m: boolean;     // Is buyer the market maker
  M: boolean;     // Ignore
}

export interface BinanceOrderResponse {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  transactTime: number;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  fills: Array<{
    price: string;
    qty: string;
    commission: string;
    commissionAsset: string;
  }>;
}

export interface BinanceAccountInfo {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  accountType: string;
  balances: Array<{
    asset: string;
    free: string;
    locked: string;
  }>;
}

export class BinanceExchange {
  private baseUrl: string;
  private wsBaseUrl = 'wss://stream.binance.com:9443/ws';
  private apiKey: string;
  private secretKey: string;

  constructor() {
    this.apiKey = apiConfig.binance.apiKey;
    this.secretKey = apiConfig.binance.secretKey;
    this.baseUrl = apiConfig.binance.testnet 
      ? 'https://testnet.binance.vision/api/v3'
      : 'https://api.binance.com/api/v3';
  }

  // API Endpoints
  getKlinesUrl(symbol: string, interval: string, limit: number = 500): string {
    return `${this.baseUrl}/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`;
  }

  getDepthUrl(symbol: string, limit: number = 100): string {
    return `${this.baseUrl}/depth?symbol=${symbol.toUpperCase()}&limit=${limit}`;
  }

  getTickerUrl(symbol: string): string {
    return `${this.baseUrl}/ticker/price?symbol=${symbol.toUpperCase()}`;
  }

  get24hrTickerUrl(symbol: string): string {
    return `${this.baseUrl}/ticker/24hr?symbol=${symbol.toUpperCase()}`;
  }

  getTradeWebSocketUrl(symbol: string): string {
    return `${this.wsBaseUrl}/${symbol.toLowerCase()}@trade`;
  }

  getDepthWebSocketUrl(symbol: string): string {
    return `${this.wsBaseUrl}/${symbol.toLowerCase()}@depth`;
  }

  getKlineWebSocketUrl(symbol: string, interval: string): string {
    return `${this.wsBaseUrl}/${symbol.toLowerCase()}@kline_${interval}`;
  }

  // Data Formatters
  formatKlinesToCandles(klines: BinanceKline[]): Candle[] {
    return klines.map(k => ({
      x: k[0],
      y: [
        parseFloat(k[1]), // open
        parseFloat(k[2]), // high
        parseFloat(k[3]), // low
        parseFloat(k[4])  // close
      ]
    }));
  }

  formatDepthResponse(data: BinanceDepthResponse): { 
    bids: OrderBookLevel[]; 
    asks: OrderBookLevel[]; 
  } {
    return {
      bids: data.bids.map(([price, volume]) => ({
        price: parseFloat(price),
        volume: parseFloat(volume)
      })),
      asks: data.asks.map(([price, volume]) => ({
        price: parseFloat(price),
        volume: parseFloat(volume)
      }))
    };
  }

  formatTradeMessage(msg: BinanceTradeMessage): Trade {
    return {
      price: parseFloat(msg.p),
      volume: parseFloat(msg.q),
      timestamp: msg.T,
      side: msg.m ? 'sell' : 'buy'
    };
  }

  // Timeframe conversion
  convertTimeframe(timeframe: string): string {
    const mapping: Record<string, string> = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d',
      '1w': '1w'
    };
    return mapping[timeframe] || '1m';
  }

  // Symbol Formatters
  formatSymbol(base: string, quote: string): string {
    return `${base.toUpperCase()}${quote.toUpperCase()}`;
  }

  parseSymbol(symbol: string): { base: string; quote: string } {
    // For Binance, common quote assets
    const quoteAssets = ['USDT', 'USDC', 'BUSD', 'BTC', 'ETH', 'BNB'];
    
    for (const quote of quoteAssets) {
      if (symbol.endsWith(quote)) {
        return {
          base: symbol.slice(0, -quote.length),
          quote: quote
        };
      }
    }
    
    // Default fallback
    return {
      base: symbol.slice(0, -4),
      quote: symbol.slice(-4)
    };
  }

  // Rate Limiting
  readonly rateLimits = {
    weight: 1200,      // requests per minute
    orders: 10,        // orders per second
    rawRequests: 6100  // raw requests per 5 minutes
  };

  // Default Trading Pairs
  readonly defaultPairs = [
    'BTCUSDT',
    'ETHUSDT',
    'BNBUSDT',
    'SOLUSDT',
    'ADAUSDT',
    'XRPUSDT',
    'DOGEUSDT',
    'DOTUSDT',
    'MATICUSDT',
    'AVAXUSDT'
  ];

  // Validation
  validateSymbol(symbol: string): boolean {
    const regex = /^[A-Z]{3,10}$/;
    return regex.test(symbol.toUpperCase());
  }

  // Authentication & Signature
  private createSignature(queryString: string): string {
    return CryptoJS.HmacSHA256(queryString, this.secretKey).toString();
  }

  private createAuthHeaders(): Record<string, string> {
    return {
      'X-MBX-APIKEY': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  private createSignedParams(params: Record<string, any>): string {
    const timestamp = Date.now();
    const queryString = new URLSearchParams({
      ...params,
      timestamp: timestamp.toString()
    }).toString();
    
    const signature = this.createSignature(queryString);
    return `${queryString}&signature=${signature}`;
  }

  // Real Trading Functions
  async getAccountInfo(): Promise<BinanceAccountInfo> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Binance API credentials not configured');
    }

    const params = this.createSignedParams({});
    const url = `${this.baseUrl}/account?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.createAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Binance API Error: ${error.msg || 'Unknown error'}`);
    }

    return response.json();
  }

  async getBalance(asset: string): Promise<{ free: number; locked: number }> {
    const accountInfo = await this.getAccountInfo();
    const balance = accountInfo.balances.find(b => b.asset === asset.toUpperCase());
    
    return {
      free: parseFloat(balance?.free || '0'),
      locked: parseFloat(balance?.locked || '0')
    };
  }

  async placeBuyOrder(
    symbol: string, 
    quantity: number, 
    price?: number, 
    type: 'MARKET' | 'LIMIT' = 'MARKET'
  ): Promise<BinanceOrderResponse> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Binance API credentials not configured');
    }

    if (!apiConfig.trading.enableRealTrading) {
      throw new Error('Real trading is disabled. Enable in configuration.');
    }

    const params: Record<string, any> = {
      symbol: symbol.toUpperCase(),
      side: 'BUY',
      type,
      quantity: quantity.toString()
    };

    if (type === 'LIMIT' && price) {
      params.price = price.toString();
      params.timeInForce = 'GTC';
    }

    const queryString = this.createSignedParams(params);
    const url = `${this.baseUrl}/order`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.createAuthHeaders(),
      body: queryString
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Binance Order Error: ${error.msg || 'Unknown error'}`);
    }

    return response.json();
  }

  async placeSellOrder(
    symbol: string, 
    quantity: number, 
    price?: number, 
    type: 'MARKET' | 'LIMIT' = 'MARKET'
  ): Promise<BinanceOrderResponse> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Binance API credentials not configured');
    }

    if (!apiConfig.trading.enableRealTrading) {
      throw new Error('Real trading is disabled. Enable in configuration.');
    }

    const params: Record<string, any> = {
      symbol: symbol.toUpperCase(),
      side: 'SELL',
      type,
      quantity: quantity.toString()
    };

    if (type === 'LIMIT' && price) {
      params.price = price.toString();
      params.timeInForce = 'GTC';
    }

    const queryString = this.createSignedParams(params);
    const url = `${this.baseUrl}/order`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.createAuthHeaders(),
      body: queryString
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Binance Order Error: ${error.msg || 'Unknown error'}`);
    }

    return response.json();
  }

  async cancelOrder(symbol: string, orderId: number): Promise<any> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Binance API credentials not configured');
    }

    const params = this.createSignedParams({
      symbol: symbol.toUpperCase(),
      orderId: orderId.toString()
    });

    const url = `${this.baseUrl}/order`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.createAuthHeaders(),
      body: params
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Binance Cancel Error: ${error.msg || 'Unknown error'}`);
    }

    return response.json();
  }

  async getOpenOrders(symbol?: string): Promise<any[]> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Binance API credentials not configured');
    }

    const params: Record<string, any> = {};
    if (symbol) {
      params.symbol = symbol.toUpperCase();
    }

    const queryString = this.createSignedParams(params);
    const url = `${this.baseUrl}/openOrders?${queryString}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.createAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Binance API Error: ${error.msg || 'Unknown error'}`);
    }

    return response.json();
  }

  // Real-time Data with Authentication
  async fetchKlines(symbol: string, interval: string, limit: number = 500): Promise<Candle[]> {
    try {
      const url = this.getKlinesUrl(symbol, interval, limit);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: BinanceKline[] = await response.json();
      return this.formatKlinesToCandles(data);
    } catch (error) {
      console.error('Binance fetchKlines error:', error);
      throw error;
    }
  }

  async fetchOrderBook(symbol: string, limit: number = 100): Promise<{ bids: OrderBookLevel[]; asks: OrderBookLevel[] }> {
    try {
      const url = this.getDepthUrl(symbol, limit);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: BinanceDepthResponse = await response.json();
      return this.formatDepthResponse(data);
    } catch (error) {
      console.error('Binance fetchOrderBook error:', error);
      throw error;
    }
  }

  async fetchTicker(symbol: string): Promise<{ price: number; change24h?: number }> {
    try {
      const [priceResponse, tickerResponse] = await Promise.all([
        fetch(this.getTickerUrl(symbol)),
        fetch(this.get24hrTickerUrl(symbol))
      ]);
      
      if (!priceResponse.ok || !tickerResponse.ok) {
        throw new Error('Failed to fetch ticker data');
      }
      
      const priceData = await priceResponse.json();
      const tickerData = await tickerResponse.json();
      
      return {
        price: parseFloat(priceData.price),
        change24h: parseFloat(tickerData.priceChangePercent)
      };
    } catch (error) {
      console.error('Binance fetchTicker error:', error);
      throw error;
    }
  }

  // WebSocket Connection with Authentication
  createAuthenticatedWebSocket(): WebSocket | null {
    if (!this.apiKey || !this.secretKey) {
      console.warn('Binance API credentials not configured for WebSocket');
      return null;
    }

    // For user data stream, we need to create a listen key first
    // This is a simplified version - in production, you'd need to handle listen key creation
    return new WebSocket(this.wsBaseUrl);
  }

  // Configuration Check
  isConfigured(): boolean {
    return Boolean(this.apiKey && this.secretKey);
  }

  getConfiguration(): { 
    hasCredentials: boolean; 
    testnet: boolean; 
    tradingEnabled: boolean 
  } {
    return {
      hasCredentials: this.isConfigured(),
      testnet: apiConfig.binance.testnet || false,
      tradingEnabled: apiConfig.trading.enableRealTrading
    };
  }

  // Error Handler
  handleError(error: any): string {
    if (error.response?.data?.msg) {
      return `Binance Error: ${error.response.data.msg}`;
    }
    if (error.message) {
      return `Binance Error: ${error.message}`;
    }
    return 'Binance: Unknown error occurred';
  }
}

export const binance = new BinanceExchange();
