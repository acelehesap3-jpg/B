import { Exchange, Timeframe, Candle, Trade } from '@/types/trading';
import { useBinanceData } from './useBinanceData';
import { useOKXData } from './useOKXData';
import { useKuCoinData } from './useKuCoinData';
import { useCoinbaseData } from './useCoinbaseData';
import { useNASDAQData } from './useNASDAQData';
import { useNYSEData } from './useNYSEData';
import { useForexData } from './useForexData';
import { useCMEData } from './useCMEData';

export interface ExchangeDataResult {
  candles: Candle[];
  lastPrice: number | null;
  trades: Trade[];
  loading: boolean;
  connected: boolean;
  marketOpen?: boolean;
  refetch: () => void;
}

export function useExchangeData(
  exchange: Exchange,
  symbol: string,
  timeframe: Timeframe = '15m'
): ExchangeDataResult {
  const binanceData = useBinanceData(
    exchange === 'BINANCE' ? symbol : '',
    timeframe
  );
  
  const okxData = useOKXData(
    exchange === 'OKX' ? symbol : '',
    timeframe
  );
  
  const kucoinData = useKuCoinData(
    exchange === 'KUCOIN' ? symbol : '',
    timeframe
  );
  
  const coinbaseData = useCoinbaseData(
    exchange === 'COINBASE' ? symbol : '',
    timeframe
  );
  
  const nasdaqData = useNASDAQData(
    exchange === 'NASDAQ' ? symbol : '',
    timeframe
  );
  
  const nyseData = useNYSEData(
    exchange === 'NYSE' ? symbol : '',
    timeframe
  );
  
  const forexData = useForexData(
    exchange === 'FOREX' ? symbol : '',
    timeframe
  );
  
  const cmeData = useCMEData(
    exchange === 'CME' ? symbol : '',
    timeframe
  );

  switch (exchange) {
    case 'BINANCE':
      return binanceData;
    case 'OKX':
      return okxData;
    case 'KUCOIN':
      return kucoinData;
    case 'COINBASE':
      return coinbaseData;
    case 'NASDAQ':
      return nasdaqData;
    case 'NYSE':
      return nyseData;
    case 'FOREX':
      return forexData;
    case 'CME':
      return cmeData;
    default:
      return {
        candles: [],
        lastPrice: null,
        trades: [],
        loading: false,
        connected: false,
        refetch: () => {},
      };
  }
}

export * from './useBinanceData';
export * from './useOKXData';
export * from './useKuCoinData';
export * from './useCoinbaseData';
export * from './useNASDAQData';
export * from './useNYSEData';
export * from './useForexData';
export * from './useCMEData';
