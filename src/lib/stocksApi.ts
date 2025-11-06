// ===========================================
// REAL STOCKS API INTEGRATION
// ===========================================

import { apiConfig } from '@/lib/config/apiConfig';
import { Candle, Trade } from '@/types/trading';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  high52Week?: number;
  low52Week?: number;
}

export interface StockCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class AlphaVantageAPI {
  private baseUrl = 'https://www.alphavantage.co/query';
  private apiKey: string;

  constructor() {
    this.apiKey = apiConfig.alphaVantage.apiKey;
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    if (!this.apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const url = `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.statusText}`);
    }

    const data = await response.json();
    const quote = data['Global Quote'];

    if (!quote) {
      throw new Error('Invalid symbol or API limit reached');
    }

    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume'])
    };
  }

  async getIntradayData(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min'): Promise<Candle[]> {
    if (!this.apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const url = `${this.baseUrl}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${this.apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.statusText}`);
    }

    const data = await response.json();
    const timeSeries = data[`Time Series (${interval})`];

    if (!timeSeries) {
      throw new Error('No data available or API limit reached');
    }

    return Object.entries(timeSeries).map(([timestamp, values]: [string, any]) => ({
      x: new Date(timestamp).getTime(),
      y: [
        parseFloat(values['1. open']),
        parseFloat(values['2. high']),
        parseFloat(values['3. low']),
        parseFloat(values['4. close'])
      ]
    })).reverse();
  }

  async getDailyData(symbol: string): Promise<Candle[]> {
    if (!this.apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const url = `${this.baseUrl}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.statusText}`);
    }

    const data = await response.json();
    const timeSeries = data['Time Series (Daily)'];

    if (!timeSeries) {
      throw new Error('No data available or API limit reached');
    }

    return Object.entries(timeSeries).slice(0, 100).map(([timestamp, values]: [string, any]) => ({
      x: new Date(timestamp).getTime(),
      y: [
        parseFloat(values['1. open']),
        parseFloat(values['2. high']),
        parseFloat(values['3. low']),
        parseFloat(values['4. close'])
      ]
    })).reverse();
  }
}

export class PolygonAPI {
  private baseUrl = 'https://api.polygon.io';
  private apiKey: string;

  constructor() {
    this.apiKey = apiConfig.polygon.apiKey;
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    if (!this.apiKey) {
      throw new Error('Polygon API key not configured');
    }

    const url = `${this.baseUrl}/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apikey=${this.apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.statusText}`);
    }

    const data = await response.json();
    const ticker = data.results;

    if (!ticker) {
      throw new Error('Invalid symbol or no data available');
    }

    return {
      symbol: ticker.ticker,
      price: ticker.lastQuote?.price || ticker.prevDay?.c || 0,
      change: ticker.todaysChange || 0,
      changePercent: ticker.todaysChangePerc || 0,
      volume: ticker.day?.v || 0
    };
  }

  async getAggregates(
    symbol: string, 
    multiplier: number = 1, 
    timespan: 'minute' | 'hour' | 'day' = 'minute',
    from: string,
    to: string
  ): Promise<Candle[]> {
    if (!this.apiKey) {
      throw new Error('Polygon API key not configured');
    }

    const url = `${this.baseUrl}/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&limit=5000&apikey=${this.apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.results) {
      throw new Error('No data available');
    }

    return data.results.map((candle: any) => ({
      x: candle.t,
      y: [candle.o, candle.h, candle.l, candle.c]
    }));
  }
}

export class FinnhubAPI {
  private baseUrl = 'https://finnhub.io/api/v1';
  private apiKey: string;

  constructor() {
    this.apiKey = apiConfig.finnhub.apiKey;
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    if (!this.apiKey) {
      throw new Error('Finnhub API key not configured');
    }

    const url = `${this.baseUrl}/quote?symbol=${symbol}&token=${this.apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Finnhub error: ${data.error}`);
    }

    return {
      symbol,
      price: data.c || 0,
      change: data.d || 0,
      changePercent: data.dp || 0,
      volume: 0 // Finnhub doesn't provide volume in quote endpoint
    };
  }

  async getCandles(
    symbol: string,
    resolution: '1' | '5' | '15' | '30' | '60' | 'D' = '5',
    from: number,
    to: number
  ): Promise<Candle[]> {
    if (!this.apiKey) {
      throw new Error('Finnhub API key not configured');
    }

    const url = `${this.baseUrl}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${this.apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.s !== 'ok') {
      throw new Error('No data available');
    }

    return data.t.map((timestamp: number, index: number) => ({
      x: timestamp * 1000,
      y: [data.o[index], data.h[index], data.l[index], data.c[index]]
    }));
  }

  async getCompanyProfile(symbol: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Finnhub API key not configured');
    }

    const url = `${this.baseUrl}/stock/profile2?symbol=${symbol}&token=${this.apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.statusText}`);
    }

    return response.json();
  }
}

export class StocksDataProvider {
  private alphaVantage: AlphaVantageAPI;
  private polygon: PolygonAPI;
  private finnhub: FinnhubAPI;

  constructor() {
    this.alphaVantage = new AlphaVantageAPI();
    this.polygon = new PolygonAPI();
    this.finnhub = new FinnhubAPI();
  }

  async getQuote(symbol: string, provider: 'alphavantage' | 'polygon' | 'finnhub' = 'finnhub'): Promise<StockQuote> {
    switch (provider) {
      case 'alphavantage':
        return this.alphaVantage.getQuote(symbol);
      case 'polygon':
        return this.polygon.getQuote(symbol);
      case 'finnhub':
        return this.finnhub.getQuote(symbol);
      default:
        throw new Error('Invalid provider');
    }
  }

  async getCandles(
    symbol: string, 
    timeframe: string = '5m',
    provider: 'alphavantage' | 'polygon' | 'finnhub' = 'finnhub'
  ): Promise<Candle[]> {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    switch (provider) {
      case 'alphavantage':
        if (timeframe.includes('m')) {
          const interval = timeframe.replace('m', 'min') as '1min' | '5min' | '15min' | '30min' | '60min';
          return this.alphaVantage.getIntradayData(symbol, interval);
        } else {
          return this.alphaVantage.getDailyData(symbol);
        }
      
      case 'polygon':
        const multiplier = parseInt(timeframe.replace(/[a-zA-Z]/g, ''));
        const timespan = timeframe.includes('m') ? 'minute' : timeframe.includes('h') ? 'hour' : 'day';
        const fromDate = new Date(oneDayAgo).toISOString().split('T')[0];
        const toDate = new Date(now).toISOString().split('T')[0];
        return this.polygon.getAggregates(symbol, multiplier, timespan, fromDate, toDate);
      
      case 'finnhub':
        let resolution: '1' | '5' | '15' | '30' | '60' | 'D' = '5';
        if (timeframe === '1m') resolution = '1';
        else if (timeframe === '5m') resolution = '5';
        else if (timeframe === '15m') resolution = '15';
        else if (timeframe === '30m') resolution = '30';
        else if (timeframe === '1h') resolution = '60';
        else if (timeframe === '1d') resolution = 'D';
        
        return this.finnhub.getCandles(symbol, resolution, Math.floor(oneDayAgo / 1000), Math.floor(now / 1000));
      
      default:
        throw new Error('Invalid provider');
    }
  }

  getAvailableProviders(): string[] {
    const providers: string[] = [];
    
    if (apiConfig.alphaVantage.apiKey) providers.push('alphavantage');
    if (apiConfig.polygon.apiKey) providers.push('polygon');
    if (apiConfig.finnhub.apiKey) providers.push('finnhub');
    
    return providers;
  }

  isConfigured(): boolean {
    return this.getAvailableProviders().length > 0;
  }
}

// Popular stock symbols
export const POPULAR_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
  'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'PYPL', 'UBER', 'SPOT',
  'ZOOM', 'SQ', 'TWTR', 'SNAP', 'PINS', 'ROKU', 'ZM', 'DOCU'
];

export const stocksDataProvider = new StocksDataProvider();