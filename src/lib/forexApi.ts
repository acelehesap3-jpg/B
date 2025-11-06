// ===========================================
// REAL FOREX API INTEGRATION
// ===========================================

import { apiConfig } from '@/lib/config/apiConfig';
import { Candle } from '@/types/trading';

export interface ForexQuote {
  instrument: string;
  bid: number;
  ask: number;
  spread: number;
  timestamp: number;
}

export interface ForexCandle {
  timestamp: number;
  bid: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  ask: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  volume: number;
}

export class OandaAPI {
  private baseUrl: string;
  private apiKey: string;
  private accountId: string;

  constructor() {
    this.apiKey = apiConfig.oanda.apiKey;
    this.accountId = apiConfig.oanda.accountId;
    this.baseUrl = apiConfig.oanda.environment === 'live' 
      ? 'https://api-fxtrade.oanda.com'
      : 'https://api-fxpractice.oanda.com';
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async getQuote(instrument: string): Promise<ForexQuote> {
    if (!this.apiKey) {
      throw new Error('OANDA API key not configured');
    }

    const url = `${this.baseUrl}/v3/accounts/${this.accountId}/pricing?instruments=${instrument}`;
    
    const response = await fetch(url, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`OANDA API error: ${response.statusText}`);
    }

    const data = await response.json();
    const price = data.prices[0];

    if (!price) {
      throw new Error('No pricing data available');
    }

    return {
      instrument: price.instrument,
      bid: parseFloat(price.bids[0].price),
      ask: parseFloat(price.asks[0].price),
      spread: parseFloat(price.asks[0].price) - parseFloat(price.bids[0].price),
      timestamp: new Date(price.time).getTime()
    };
  }

  async getCandles(
    instrument: string,
    granularity: 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D' = 'M5',
    count: number = 500
  ): Promise<Candle[]> {
    if (!this.apiKey) {
      throw new Error('OANDA API key not configured');
    }

    const url = `${this.baseUrl}/v3/instruments/${instrument}/candles?granularity=${granularity}&count=${count}`;
    
    const response = await fetch(url, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`OANDA API error: ${response.statusText}`);
    }

    const data = await response.json();

    return data.candles.map((candle: any) => ({
      x: new Date(candle.time).getTime(),
      y: [
        parseFloat(candle.mid.o),
        parseFloat(candle.mid.h),
        parseFloat(candle.mid.l),
        parseFloat(candle.mid.c)
      ]
    }));
  }

  async getAccountInfo(): Promise<any> {
    if (!this.apiKey || !this.accountId) {
      throw new Error('OANDA credentials not configured');
    }

    const url = `${this.baseUrl}/v3/accounts/${this.accountId}`;
    
    const response = await fetch(url, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`OANDA API error: ${response.statusText}`);
    }

    return response.json();
  }

  async placeOrder(
    instrument: string,
    units: number,
    type: 'MARKET' | 'LIMIT' = 'MARKET',
    price?: number
  ): Promise<any> {
    if (!this.apiKey || !this.accountId) {
      throw new Error('OANDA credentials not configured');
    }

    if (!apiConfig.trading.enableRealTrading) {
      throw new Error('Real trading is disabled. Enable in configuration.');
    }

    const orderData: any = {
      order: {
        type,
        instrument,
        units: units.toString()
      }
    };

    if (type === 'LIMIT' && price) {
      orderData.order.price = price.toString();
    }

    const url = `${this.baseUrl}/v3/accounts/${this.accountId}/orders`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OANDA Order Error: ${error.errorMessage || 'Unknown error'}`);
    }

    return response.json();
  }

  async getPositions(): Promise<any> {
    if (!this.apiKey || !this.accountId) {
      throw new Error('OANDA credentials not configured');
    }

    const url = `${this.baseUrl}/v3/accounts/${this.accountId}/positions`;
    
    const response = await fetch(url, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`OANDA API error: ${response.statusText}`);
    }

    return response.json();
  }
}

export class ForexDataProvider {
  private oanda: OandaAPI;

  constructor() {
    this.oanda = new OandaAPI();
  }

  async getQuote(instrument: string): Promise<ForexQuote> {
    return this.oanda.getQuote(instrument);
  }

  async getCandles(instrument: string, timeframe: string = '5m'): Promise<Candle[]> {
    let granularity: 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D' = 'M5';
    
    switch (timeframe) {
      case '1m': granularity = 'M1'; break;
      case '5m': granularity = 'M5'; break;
      case '15m': granularity = 'M15'; break;
      case '30m': granularity = 'M30'; break;
      case '1h': granularity = 'H1'; break;
      case '4h': granularity = 'H4'; break;
      case '1d': granularity = 'D'; break;
    }

    return this.oanda.getCandles(instrument, granularity);
  }

  async getAccountInfo(): Promise<any> {
    return this.oanda.getAccountInfo();
  }

  async placeBuyOrder(instrument: string, units: number, price?: number): Promise<any> {
    return this.oanda.placeOrder(instrument, Math.abs(units), price ? 'LIMIT' : 'MARKET', price);
  }

  async placeSellOrder(instrument: string, units: number, price?: number): Promise<any> {
    return this.oanda.placeOrder(instrument, -Math.abs(units), price ? 'LIMIT' : 'MARKET', price);
  }

  async getPositions(): Promise<any> {
    return this.oanda.getPositions();
  }

  isConfigured(): boolean {
    return Boolean(apiConfig.oanda.apiKey && apiConfig.oanda.accountId);
  }

  getConfiguration(): {
    hasCredentials: boolean;
    environment: string;
    tradingEnabled: boolean;
  } {
    return {
      hasCredentials: this.isConfigured(),
      environment: apiConfig.oanda.environment,
      tradingEnabled: apiConfig.trading.enableRealTrading
    };
  }
}

// Major Forex Pairs
export const MAJOR_FOREX_PAIRS = [
  'EUR_USD', 'GBP_USD', 'USD_JPY', 'USD_CHF', 'AUD_USD', 'USD_CAD', 'NZD_USD'
];

// Minor Forex Pairs
export const MINOR_FOREX_PAIRS = [
  'EUR_GBP', 'EUR_JPY', 'EUR_CHF', 'EUR_AUD', 'EUR_CAD', 'EUR_NZD',
  'GBP_JPY', 'GBP_CHF', 'GBP_AUD', 'GBP_CAD', 'GBP_NZD',
  'AUD_JPY', 'AUD_CHF', 'AUD_CAD', 'AUD_NZD',
  'CAD_JPY', 'CAD_CHF', 'CHF_JPY', 'NZD_JPY', 'NZD_CHF', 'NZD_CAD'
];

// Exotic Forex Pairs
export const EXOTIC_FOREX_PAIRS = [
  'USD_TRY', 'USD_ZAR', 'USD_MXN', 'USD_SGD', 'USD_HKD', 'USD_NOK', 'USD_SEK',
  'EUR_TRY', 'EUR_ZAR', 'EUR_NOK', 'EUR_SEK', 'GBP_TRY', 'GBP_ZAR'
];

export const forexDataProvider = new ForexDataProvider();