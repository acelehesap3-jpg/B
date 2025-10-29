import { binance } from './binance';
import { okx } from './okx';
import { kucoin } from './kucoin';
import { coinbase } from './coinbase';
import { nasdaq } from './nasdaq';
import { nyse } from './nyse';
import { forex } from './forex';
import { cme } from './cme';
import { Exchange } from '@/types/trading';

export const exchanges = {
  BINANCE: binance,
  OKX: okx,
  KUCOIN: kucoin,
  COINBASE: coinbase,
  NASDAQ: nasdaq,
  NYSE: nyse,
  FOREX: forex,
  CME: cme,
} as const;

export function getExchange(exchange: Exchange) {
  return exchanges[exchange];
}

export function isCryptoExchange(exchange: Exchange): boolean {
  return ['BINANCE', 'OKX', 'KUCOIN', 'COINBASE'].includes(exchange);
}

export function isStockExchange(exchange: Exchange): boolean {
  return ['NASDAQ', 'NYSE'].includes(exchange);
}

export function isForexExchange(exchange: Exchange): boolean {
  return exchange === 'FOREX';
}

export function isCommodityExchange(exchange: Exchange): boolean {
  return exchange === 'CME';
}

export * from './binance';
export * from './okx';
export * from './kucoin';
export * from './coinbase';
export * from './nasdaq';
export * from './nyse';
export * from './forex';
export * from './cme';
