import { useState, useEffect, useCallback, useRef } from 'react';
import { Exchange, DataSource, Candle, Trade, Timeframe } from '@/types/trading';
import { EXCHANGES } from '@/lib/exchanges';
import { binance } from '@/lib/exchanges/binance';
import { stocksDataProvider } from '@/lib/stocksApi';
import { forexDataProvider } from '@/lib/forexApi';
import { toast } from 'sonner';

const timeframeToLimit: Record<Timeframe, number> = {
  '1m': 500,
  '5m': 500,
  '15m': 500,
  '1h': 500,
  '4h': 400,
  '1d': 365,
  '1w': 200,
};

const timeframeToInterval: Record<Timeframe, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1d': '1d',
  '1w': '1w',
};

export function useTradingData(
  exchange: Exchange,
  symbol: string,
  source: DataSource,
  timeframe: Timeframe = '15m'
) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCandles = useCallback(async () => {
    try {
      setLoading(true);
      let processedCandles: Candle[] = [];

      // Determine asset type and use appropriate API
      if (exchange === 'BINANCE' && binance.isConfigured()) {
        // Use real Binance API
        const interval = timeframeToInterval[timeframe];
        const limit = timeframeToLimit[timeframe];
        processedCandles = await binance.fetchKlines(symbol, interval, limit);
        
        // Get current price
        const ticker = await binance.fetchTicker(symbol);
        setLastPrice(ticker.price);
        
      } else if (exchange === 'STOCKS' && stocksDataProvider.isConfigured()) {
        // Use real stocks API
        processedCandles = await stocksDataProvider.getCandles(symbol, timeframe);
        
        // Get current price
        const quote = await stocksDataProvider.getQuote(symbol);
        setLastPrice(quote.price);
        
      } else if (exchange === 'FOREX' && forexDataProvider.isConfigured()) {
        // Use real forex API
        processedCandles = await forexDataProvider.getCandles(symbol, timeframe);
        
        // Get current price
        const quote = await forexDataProvider.getQuote(symbol);
        setLastPrice((quote.bid + quote.ask) / 2);
        
      } else {
        // Fallback to demo data
        const config = EXCHANGES[exchange];
        const limit = timeframeToLimit[timeframe];
        const interval = timeframeToInterval[timeframe];
        
        let url = config.restKlines(symbol, limit);
        if (exchange === 'BINANCE') {
          url = url.replace(/interval=[^&]*/, `interval=${interval}`);
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        if (exchange === 'BINANCE') {
          processedCandles = data.map((d: any[]) => ({
            x: d[0],
            y: [parseFloat(d[1]), parseFloat(d[2]), parseFloat(d[3]), parseFloat(d[4])],
          }));
        } else if (exchange === 'OKX') {
          const arr = data.data || data;
          processedCandles = (arr || []).map((d: any[]) => ({
            x: parseInt(d[0]),
            y: [parseFloat(d[1]), parseFloat(d[2]), parseFloat(d[3]), parseFloat(d[4])],
          }));
        } else if (exchange === 'KUCOIN') {
          const arr = data.data || data;
          processedCandles = (arr || []).map((d: any[]) => ({
            x: d[0] > 1e12 ? d[0] : d[0] * 1000,
            y: [parseFloat(d[1]), parseFloat(d[2]), parseFloat(d[3]), parseFloat(d[4])],
          }));
        } else if (exchange === 'COINBASE') {
          processedCandles = data.map((d: any[]) => ({
            x: d[0] * 1000,
            y: [parseFloat(d[3]), parseFloat(d[2]), parseFloat(d[1]), parseFloat(d[4])],
          }));
        }
        
        // Normalize timestamps
        processedCandles = processedCandles.map(c => ({
          x: c.x > 1e12 ? c.x : c.x * 1000,
          y: c.y.map(v => parseFloat(v.toString())) as [number, number, number, number],
        }));
        
        if (processedCandles.length > 0) {
          setLastPrice(processedCandles[processedCandles.length - 1].y[3]);
        }
      }
      
      setCandles(processedCandles);
      toast.success(`Loaded ${processedCandles.length} candles from real API`);
      
    } catch (error) {
      console.error('Failed to fetch candles:', error);
      toast.error('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  }, [exchange, symbol, timeframe]);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      if (exchange === 'BINANCE') {
        const ws = new WebSocket(EXCHANGES.BINANCE.wsTrade(symbol));
        wsRef.current = ws;

        ws.onopen = () => {
          toast.success('WebSocket connected');
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            const price = parseFloat(msg.p || msg.price);
            const volume = parseFloat(msg.q || msg.qty || 0);
            const timestamp = msg.T ? Math.floor(msg.T / 1000) : Math.floor(Date.now() / 1000);

            if (price) {
              setLastPrice(price);
              setTrades(prev => [
                { price, volume, timestamp: timestamp * 1000, side: 'buy' },
                ...prev.slice(0, 99)
              ]);
            }
          } catch (e) {
            console.error('WebSocket message error:', e);
          }
        };

        ws.onerror = () => {
          toast.error('WebSocket error');
        };

        ws.onclose = () => {
          wsRef.current = null;
        };
      }
      // Add other exchanges as needed
    } catch (error) {
      console.error('WebSocket connection error:', error);
      toast.error('Failed to connect WebSocket');
    }
  }, [exchange, symbol]);

  const startRestPolling = useCallback(() => {
    fetchCandles();
    
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
    }
    
    restTimerRef.current = setInterval(() => {
      fetchCandles();
    }, 15000);
  }, [fetchCandles]);

  useEffect(() => {
    fetchCandles();

    if (source === 'ws') {
      connectWebSocket();
    } else {
      startRestPolling();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    };
  }, [exchange, symbol, source, fetchCandles, connectWebSocket, startRestPolling]);

  return {
    candles,
    lastPrice,
    trades,
    loading,
    refetch: fetchCandles,
  };
}
