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
  marketType: 'crypto' | 'forex' | 'stocks' | 'indices';
  exchange?: string;
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

export const useRealMarketData = (
  symbols: string[] = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT'],
  marketType: 'crypto' | 'forex' | 'stocks' | 'indices' = 'crypto',
  exchange?: string
) => {
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

      // Get WebSocket URL based on market type
      const getWsUrl = () => {
        switch (marketType) {
          case 'crypto':
            const streams = symbols.map(symbol => `${symbol.toLowerCase()}@ticker`).join('/');
            return `wss://stream.binance.com:9443/ws/${streams}`;
          case 'forex':
            return `wss://stream.oanda.com/v3/instruments/${symbols.join(',')}/price`;
          case 'stocks':
          case 'indices':
            return `wss://ws.finnhub.io?token=${import.meta.env.VITE_FINNHUB_API_KEY}`;
          default:
            return null;
        }
      };

      const wsUrl = getWsUrl();
      if (!wsUrl) {
        throw new Error(`WebSocket not supported for market type: ${marketType}`);
      }
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected for market data');
        setError(null);
        setLoading(false);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (marketType) {
            case 'crypto':
              if (data.data && data.data.s) {
                const symbol = data.data.s;
                const price = parseFloat(data.data.c);
                const changePercent = parseFloat(data.data.P);
                const volume = data.data.v;
                const high24h = parseFloat(data.data.h);
                const low24h = parseFloat(data.data.l);

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
                    lastUpdate: Date.now(),
                    marketType,
                    exchange
                  }
                }));
              }
              break;

            case 'forex':
              if (data.type === 'PRICE') {
                const symbol = data.instrument;
                const price = parseFloat(data.bids[0].price);
                const prevPrice = data.closeoutBid;
                const change = price - prevPrice;
                const changePercent = (change / prevPrice) * 100;

                setMarketData(prev => ({
                  ...prev,
                  [symbol]: {
                    symbol: formatSymbol(symbol),
                    price,
                    change,
                    changePercent,
                    volume: 'N/A',
                    high24h: price,
                    low24h: price,
                    lastUpdate: Date.now(),
                    marketType,
                    exchange
                  }
                }));
              }
              break;

            case 'stocks':
            case 'indices':
              if (data.type === 'trade') {
                const symbol = data.data[0].s;
                const price = parseFloat(data.data[0].p);
                const prevPrice = price - parseFloat(data.data[0].c);
                const change = price - prevPrice;
                const changePercent = (change / prevPrice) * 100;
                const volume = data.data[0].v;

                setMarketData(prev => ({
                  ...prev,
                  [symbol]: {
                    symbol: formatSymbol(symbol),
                    price,
                    change,
                    changePercent,
                    volume: formatVolume(parseFloat(volume)),
                    high24h: price,
                    low24h: price,
                    lastUpdate: Date.now(),
                    marketType,
                    exchange
                  }
                }));
              }
              break;
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
      
      const getApiEndpoint = () => {
        switch (marketType) {
          case 'crypto':
            return `https://api.binance.com/api/v3/ticker/24hr`;
          case 'forex':
            return `https://api.oanda.com/v3/instruments`;
          case 'stocks':
            return `https://finnhub.io/api/v1/quote`;
          case 'indices':
            return `https://finnhub.io/api/v1/quote`;
          default:
            return `https://api.binance.com/api/v3/ticker/24hr`;
        }
      };

      const getHeaders = () => {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };

        switch (marketType) {
          case 'forex':
            headers['Authorization'] = `Bearer ${import.meta.env.VITE_OANDA_API_KEY}`;
            break;
          case 'stocks':
          case 'indices':
            headers['X-Finnhub-Token'] = import.meta.env.VITE_FINNHUB_API_KEY;
            break;
        }

        return headers;
      };

      const promises = symbols.map(async (symbol) => {
        const endpoint = getApiEndpoint();
        const headers = getHeaders();
        
        let url = endpoint;
        switch (marketType) {
          case 'crypto':
            url = `${endpoint}?symbol=${symbol}`;
            break;
          case 'forex':
            url = `${endpoint}/${symbol}/candles/latest`;
            break;
          case 'stocks':
          case 'indices':
            url = `${endpoint}?symbol=${symbol}`;
            break;
        }

        const response = await fetch(url, { headers });
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
          lastUpdate: Date.now(),
          marketType,
          exchange
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