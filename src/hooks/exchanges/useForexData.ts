import { useState, useEffect, useCallback, useRef } from 'react';
import { Candle, Trade, Timeframe } from '@/types/trading';
import { forex } from '@/lib/exchanges/forex';
import { toast } from 'sonner';

export function useForexData(symbol: string, timeframe: Timeframe = '15m') {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCandles = useCallback(async () => {
    if (!symbol) return;
    
    try {
      setLoading(true);
      const { range, interval } = forex.convertTimeframe(timeframe);
      const normalizedSymbol = forex.formatSymbol(symbol);
      const url = forex.getChartUrl(normalizedSymbol, range, interval);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const formattedCandles = forex.formatYahooDataToCandles(data);
      
      setCandles(formattedCandles);
      if (formattedCandles.length > 0) {
        setLastPrice(formattedCandles[formattedCandles.length - 1].y[3]);
      }
      
      const quoteData = forex.formatQuoteResponse(data);
      if (quoteData) {
        setLastPrice(quoteData.price);
      }
      
      toast.success(`Forex: ${formattedCandles.length} candles loaded`);
    } catch (error) {
      const errorMsg = forex.handleError(error);
      console.error('Forex candles error:', errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe]);

  const checkMarketStatus = useCallback(() => {
    const isOpen = forex.isMarketOpen();
    setMarketOpen(isOpen);
    return isOpen;
  }, []);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    fetchCandles();
    checkMarketStatus();

    const interval = forex.isMarketOpen() ? 3000 : 30000;
    
    pollingIntervalRef.current = setInterval(() => {
      fetchCandles();
      checkMarketStatus();
    }, interval);
  }, [fetchCandles, checkMarketStatus]);

  const generateSimulatedTrade = useCallback(() => {
    if (!lastPrice) return;

    const change = (Math.random() - 0.5) * (lastPrice * 0.0001);
    const newPrice = lastPrice + change;
    
    const trade: Trade = {
      price: newPrice,
      volume: Math.random() * 1000000,
      timestamp: Date.now(),
      side: change > 0 ? 'buy' : 'sell'
    };

    setTrades(prev => [trade, ...prev.slice(0, 99)]);
    setLastPrice(newPrice);

    setCandles(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const lastCandle = updated[updated.length - 1];
      lastCandle.y[3] = newPrice;
      if (newPrice > lastCandle.y[1]) lastCandle.y[1] = newPrice;
      if (newPrice < lastCandle.y[2]) lastCandle.y[2] = newPrice;
      return updated;
    });
  }, [lastPrice]);

  useEffect(() => {
    if (!symbol) return;

    startPolling();

    const tradeInterval = setInterval(() => {
      if (forex.isMarketOpen() && lastPrice) {
        generateSimulatedTrade();
      }
    }, 1000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      clearInterval(tradeInterval);
    };
  }, [symbol, startPolling, generateSimulatedTrade, lastPrice]);

  return {
    candles,
    lastPrice,
    trades,
    loading,
    connected: true,
    marketOpen,
    refetch: fetchCandles,
  };
}
