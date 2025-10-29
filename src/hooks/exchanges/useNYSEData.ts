import { useState, useEffect, useCallback, useRef } from 'react';
import { Candle, Trade, Timeframe } from '@/types/trading';
import { nyse } from '@/lib/exchanges/nyse';
import { toast } from 'sonner';

export function useNYSEData(symbol: string, timeframe: Timeframe = '1d') {
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
      const { range, interval } = nyse.convertTimeframe(timeframe);
      const normalizedSymbol = nyse.formatSymbol(symbol);
      const url = nyse.getChartUrl(normalizedSymbol, range, interval);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const formattedCandles = nyse.formatYahooDataToCandles(data);
      
      setCandles(formattedCandles);
      if (formattedCandles.length > 0) {
        setLastPrice(formattedCandles[formattedCandles.length - 1].y[3]);
      }
      
      const quoteData = nyse.formatQuoteResponse(data);
      if (quoteData) {
        setLastPrice(quoteData.price);
      }
      
      toast.success(`NYSE: ${formattedCandles.length} candles loaded`);
    } catch (error) {
      const errorMsg = nyse.handleError(error);
      console.error('NYSE candles error:', errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe]);

  const checkMarketStatus = useCallback(() => {
    const isOpen = nyse.isMarketOpen();
    setMarketOpen(isOpen);
    return isOpen;
  }, []);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    fetchCandles();
    checkMarketStatus();

    const interval = nyse.isMarketOpen() ? 5000 : 60000;
    
    pollingIntervalRef.current = setInterval(() => {
      fetchCandles();
      checkMarketStatus();
    }, interval);
  }, [fetchCandles, checkMarketStatus]);

  const generateSimulatedTrade = useCallback(() => {
    if (!lastPrice) return;

    const change = (Math.random() - 0.5) * (lastPrice * 0.001);
    const newPrice = lastPrice + change;
    
    const trade: Trade = {
      price: newPrice,
      volume: Math.random() * 100,
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
      if (nyse.isMarketOpen() && lastPrice) {
        generateSimulatedTrade();
      }
    }, 2000);

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
