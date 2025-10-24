export type Exchange = 'BINANCE' | 'OKX' | 'KUCOIN' | 'COINBASE';
export type DataSource = 'ws' | 'rest';

export interface Candle {
  x: number;
  y: [number, number, number, number]; // [open, high, low, close]
}

export interface OrderBookLevel {
  price: number;
  volume: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export interface Trade {
  price: number;
  volume: number;
  timestamp: number;
  side: 'buy' | 'sell';
}

export interface NewsItem {
  title: string;
  body: string;
  url: string;
  source: string;
  published_on: number;
}

export interface IndicatorSettings {
  showSMA: boolean;
  showEMA: boolean;
  showRSI: boolean;
  showMACD: boolean;
  showBB: boolean;
  showFib: boolean;
  showPatterns: boolean;
  smaPeriod: number;
  emaPeriod: number;
  rsiPeriod: number;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

export interface CandlestickPattern {
  type: string;
  name: string;
  timestamp: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  strength: number;
}

export interface FibonacciLevel {
  level: number;
  price: number;
  label: string;
}
