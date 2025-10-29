import { Candle, Trade, OrderBookLevel } from '@/types/trading';

export interface CMEQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
  high: number;
  low: number;
  open: number;
  settlement: number;
  expiryDate?: string;
}

export class CMEExchange {
  private baseUrl = 'https://query1.finance.yahoo.com/v8/finance';

  // API Endpoints
  getQuoteUrl(symbol: string): string {
    const futuresSymbol = this.formatSymbol(symbol);
    return `${this.baseUrl}/chart/${futuresSymbol}?interval=1m&range=1d`;
  }

  getChartUrl(symbol: string, range: string = '1d', interval: string = '1m'): string {
    const futuresSymbol = this.formatSymbol(symbol);
    return `${this.baseUrl}/chart/${futuresSymbol}?range=${range}&interval=${interval}`;
  }

  // Data Formatters
  formatYahooDataToCandles(data: any): Candle[] {
    const quotes = data.chart?.result?.[0];
    if (!quotes) return [];

    const timestamps = quotes.timestamp || [];
    const ohlc = quotes.indicators?.quote?.[0];
    
    if (!ohlc) return [];

    return timestamps.map((timestamp: number, index: number) => ({
      x: timestamp * 1000,
      y: [
        ohlc.open?.[index] || 0,
        ohlc.high?.[index] || 0,
        ohlc.low?.[index] || 0,
        ohlc.close?.[index] || 0
      ]
    })).filter((candle: Candle) => 
      candle.y.every(v => v > 0)
    );
  }

  formatQuoteResponse(data: any): CMEQuote | null {
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price = meta.regularMarketPrice || 0;
    
    return {
      symbol: meta.symbol,
      price: price,
      change: (price || 0) - (meta.previousClose || 0),
      changePercent: ((price || 0) - (meta.previousClose || 0)) / (meta.previousClose || 1) * 100,
      volume: meta.regularMarketVolume || 0,
      openInterest: 0,
      high: meta.regularMarketDayHigh || 0,
      low: meta.regularMarketDayLow || 0,
      open: meta.regularMarketOpen || 0,
      settlement: meta.previousClose || 0
    };
  }

  // Symbol Formatters
  formatSymbol(symbol: string): string {
    // Convert commodity symbols to Yahoo Finance format
    const normalized = symbol.toUpperCase();
    
    // Map common commodity symbols
    const symbolMap: Record<string, string> = {
      'GC': 'GC=F',   // Gold
      'SI': 'SI=F',   // Silver
      'CL': 'CL=F',   // Crude Oil
      'NG': 'NG=F',   // Natural Gas
      'HG': 'HG=F',   // Copper
      'ZC': 'ZC=F',   // Corn
      'ZW': 'ZW=F',   // Wheat
      'ZS': 'ZS=F',   // Soybeans
      'LE': 'LE=F',   // Live Cattle
      'HE': 'HE=F',   // Lean Hogs
      'ES': 'ES=F',   // E-mini S&P 500
      'NQ': 'NQ=F',   // E-mini NASDAQ 100
      'YM': 'YM=F',   // E-mini Dow
      'RTY': 'RTY=F'  // E-mini Russell 2000
    };

    return symbolMap[normalized] || (normalized.endsWith('=F') ? normalized : `${normalized}=F`);
  }

  // Timeframe conversion
  convertTimeframe(timeframe: string): { range: string; interval: string } {
    const mapping: Record<string, { range: string; interval: string }> = {
      '1m': { range: '1d', interval: '1m' },
      '5m': { range: '5d', interval: '5m' },
      '15m': { range: '5d', interval: '15m' },
      '1h': { range: '1mo', interval: '1h' },
      '4h': { range: '3mo', interval: '1d' },
      '1d': { range: '1y', interval: '1d' },
      '1w': { range: '5y', interval: '1wk' }
    };
    return mapping[timeframe] || { range: '1d', interval: '1m' };
  }

  // Rate Limiting
  readonly rateLimits = {
    requests: 2000,
    burst: 50
  };

  // Popular Commodities & Futures
  readonly popularContracts = [
    'GC',   // Gold Futures
    'SI',   // Silver Futures
    'CL',   // Crude Oil Futures
    'NG',   // Natural Gas Futures
    'HG',   // Copper Futures
    'ZC',   // Corn Futures
    'ZW',   // Wheat Futures
    'ZS',   // Soybean Futures
    'LE',   // Live Cattle Futures
    'HE',   // Lean Hog Futures
    'ES',   // E-mini S&P 500
    'NQ',   // E-mini NASDAQ 100
    'YM',   // E-mini Dow
    'RTY',  // E-mini Russell 2000
    'BTC'   // Bitcoin Futures
  ];

  // Market Hours (varies by product)
  readonly marketHours = {
    energy: {
      open: '18:00 Sunday',
      close: '17:00 Friday',
      description: 'Nearly 24-hour trading'
    },
    metals: {
      open: '18:00 Sunday',
      close: '17:00 Friday',
      description: 'Nearly 24-hour trading'
    },
    agriculture: {
      open: '20:00 Sunday',
      close: '14:20 Friday',
      description: 'Day and evening sessions'
    },
    equity: {
      open: '18:00 Sunday',
      close: '17:00 Friday',
      description: 'Nearly 24-hour trading'
    }
  };

  isMarketOpen(): boolean {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getUTCHours();
    
    // Most CME markets are closed on weekends
    if (dayOfWeek === 6) return false; // Saturday
    if (dayOfWeek === 0 && hour < 23) return false; // Sunday before 23:00 UTC
    if (dayOfWeek === 5 && hour >= 22) return false; // Friday after 22:00 UTC
    
    return true;
  }

  // Validation
  validateSymbol(symbol: string): boolean {
    const regex = /^[A-Z]{1,4}(=F)?$/;
    return regex.test(symbol.toUpperCase());
  }

  // Error Handler
  handleError(error: any): string {
    if (error.response?.data?.message) {
      return `CME Error: ${error.response.data.message}`;
    }
    if (error.message) {
      return `CME Error: ${error.message}`;
    }
    return 'CME: Unknown error occurred';
  }

  // Mock OrderBook
  generateMockOrderBook(currentPrice: number): {
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
  } {
    const bids: OrderBookLevel[] = [];
    const asks: OrderBookLevel[] = [];
    const tickSize = currentPrice * 0.0001;

    for (let i = 1; i <= 10; i++) {
      bids.push({
        price: currentPrice - (tickSize * i),
        volume: Math.random() * 500 * (11 - i)
      });

      asks.push({
        price: currentPrice + (tickSize * i),
        volume: Math.random() * 500 * (11 - i)
      });
    }

    return { bids, asks };
  }
}

export const cme = new CMEExchange();
