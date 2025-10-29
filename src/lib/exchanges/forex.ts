import { Candle, Trade, OrderBookLevel } from '@/types/trading';

export interface ForexQuote {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
}

export class ForexExchange {
  private baseUrl = 'https://query1.finance.yahoo.com/v8/finance';

  // API Endpoints
  getQuoteUrl(symbol: string): string {
    const forexSymbol = this.formatSymbol(symbol);
    return `${this.baseUrl}/chart/${forexSymbol}?interval=1m&range=1d`;
  }

  getChartUrl(symbol: string, range: string = '1d', interval: string = '1m'): string {
    const forexSymbol = this.formatSymbol(symbol);
    return `${this.baseUrl}/chart/${forexSymbol}?range=${range}&interval=${interval}`;
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

  formatQuoteResponse(data: any): ForexQuote | null {
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price = meta.regularMarketPrice || 0;
    
    return {
      symbol: meta.symbol,
      price: price,
      bid: price * 0.9999,
      ask: price * 1.0001,
      spread: price * 0.0002,
      change: (price || 0) - (meta.previousClose || 0),
      changePercent: ((price || 0) - (meta.previousClose || 0)) / (meta.previousClose || 1) * 100,
      high: meta.regularMarketDayHigh || 0,
      low: meta.regularMarketDayLow || 0,
      open: meta.regularMarketOpen || 0,
      timestamp: Date.now()
    };
  }

  // Symbol Formatters
  formatSymbol(symbol: string): string {
    // Convert pairs like EUR/USD to EURUSD=X for Yahoo Finance
    const normalized = symbol.replace('/', '').toUpperCase();
    return normalized.endsWith('=X') ? normalized : `${normalized}=X`;
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

  // Popular Forex Pairs
  readonly popularPairs = [
    'EUR/USD',  // Euro / US Dollar
    'GBP/USD',  // British Pound / US Dollar
    'USD/JPY',  // US Dollar / Japanese Yen
    'USD/CHF',  // US Dollar / Swiss Franc
    'AUD/USD',  // Australian Dollar / US Dollar
    'USD/CAD',  // US Dollar / Canadian Dollar
    'NZD/USD',  // New Zealand Dollar / US Dollar
    'EUR/GBP',  // Euro / British Pound
    'EUR/JPY',  // Euro / Japanese Yen
    'GBP/JPY',  // British Pound / Japanese Yen
    'EUR/CHF',  // Euro / Swiss Franc
    'AUD/JPY',  // Australian Dollar / Japanese Yen
    'EUR/AUD',  // Euro / Australian Dollar
    'USD/CNY',  // US Dollar / Chinese Yuan
    'USD/TRY'   // US Dollar / Turkish Lira
  ];

  // Market Hours (24/5 market)
  readonly marketHours = {
    open: 'Sunday 5:00 PM EST',
    close: 'Friday 5:00 PM EST',
    sessions: {
      sydney: { start: '17:00', end: '02:00' },
      tokyo: { start: '19:00', end: '04:00' },
      london: { start: '03:00', end: '12:00' },
      newYork: { start: '08:00', end: '17:00' }
    }
  };

  isMarketOpen(): boolean {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getUTCHours();
    
    // Forex is closed on weekends (Saturday and most of Sunday)
    if (dayOfWeek === 6) return false; // Saturday
    if (dayOfWeek === 0 && hour < 22) return false; // Sunday before 22:00 UTC
    if (dayOfWeek === 5 && hour >= 22) return false; // Friday after 22:00 UTC
    
    return true;
  }

  // Validation
  validateSymbol(symbol: string): boolean {
    const regex = /^[A-Z]{3}[\/]?[A-Z]{3}(=X)?$/;
    return regex.test(symbol.toUpperCase().replace('/', ''));
  }

  // Error Handler
  handleError(error: any): string {
    if (error.response?.data?.message) {
      return `Forex Error: ${error.response.data.message}`;
    }
    if (error.message) {
      return `Forex Error: ${error.message}`;
    }
    return 'Forex: Unknown error occurred';
  }

  // Mock OrderBook (Forex has real depth but using mock for demo)
  generateMockOrderBook(currentPrice: number): {
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
  } {
    const bids: OrderBookLevel[] = [];
    const asks: OrderBookLevel[] = [];
    const spread = currentPrice * 0.0001;

    for (let i = 1; i <= 10; i++) {
      bids.push({
        price: currentPrice - spread - (currentPrice * 0.00001 * i),
        volume: Math.random() * 10000000 * (11 - i)
      });

      asks.push({
        price: currentPrice + spread + (currentPrice * 0.00001 * i),
        volume: Math.random() * 10000000 * (11 - i)
      });
    }

    return { bids, asks };
  }
}

export const forex = new ForexExchange();
