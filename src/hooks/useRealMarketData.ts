import { useState, useEffect, useRef } from 'react';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  high24h: number;
  low24h: number;
  lastUpdate: number;
}

interface WebSocketMessage {
  stream: string;
  data: {
    s: string; // symbol
    c: string; // close price
    P: string; // price change percent
    v: string; // volume
    h: string; // high price
    l: string; // low price
  };
}

export const useRealMarketData = (symbols: string[] = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT']) => {
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatSymbol = (symbol: string) => {
    return symbol.replace('USDT', '/USDT').replace('BUSD', '/BUSD');
  };

  const connectWebSocket = () => {
    try {
      // Close existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Create streams for all symbols
      const streams = symbols.map(symbol => `${symbol.toLowerCase()}@ticker`).join('/');
      const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected for market data');
        setError(null);
        setLoading(false);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          if (message.data && message.data.s) {
            const symbol = message.data.s;
            const price = parseFloat(message.data.c);
            const changePercent = parseFloat(message.data.P);
            const volume = message.data.v;
            const high24h = parseFloat(message.data.h);
            const low24h = parseFloat(message.data.l);

            setMarketData(prev => ({
              ...prev,
              [symbol]: {
                symbol: formatSymbol(symbol),
                price,
                change: (price * changePercent) / 100,
                changePercent,
                volume: formatVolume(parseFloat(volume)),
                high24h,
                low24h,
                lastUpdate: Date.now()
              }
            }));
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        
        // Reconnect after 5 seconds if not manually closed
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            connectWebSocket();
          }, 5000);
        }
      };

    } catch (err) {
      console.error('Error connecting WebSocket:', err);
      setError('Failed to connect to market data');
      setLoading(false);
    }
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(1)}B`;
    } else if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(1)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(1)}K`;
    }
    return volume.toFixed(2);
  };

  // Initial data fetch from REST API
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const promises = symbols.map(async (symbol) => {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
        if (!response.ok) throw new Error(`Failed to fetch ${symbol}`);
        return response.json();
      });

      const results = await Promise.all(promises);
      const initialData: Record<string, MarketData> = {};

      results.forEach((data) => {
        const price = parseFloat(data.lastPrice);
        const changePercent = parseFloat(data.priceChangePercent);
        
        initialData[data.symbol] = {
          symbol: formatSymbol(data.symbol),
          price,
          change: parseFloat(data.priceChange),
          changePercent,
          volume: formatVolume(parseFloat(data.volume)),
          high24h: parseFloat(data.highPrice),
          low24h: parseFloat(data.lowPrice),
          lastUpdate: Date.now()
        };
      });

      setMarketData(initialData);
    } catch (err) {
      console.error('Error fetching initial market data:', err);
      setError('Failed to fetch initial market data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initial data
    fetchInitialData();
    
    // Connect WebSocket for real-time updates
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Convert to array format for easier use
  const marketDataArray = Object.values(marketData);

  return {
    marketData: marketDataArray,
    marketDataMap: marketData,
    loading,
    error,
    refetch: fetchInitialData,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  };
};