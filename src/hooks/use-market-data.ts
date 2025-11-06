import { useState, useEffect, useRef } from 'react';
import { SUPPORTED_MARKETS } from '@/lib/config/trading';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  high24h: number;
  low24h: number;
  lastUpdate: number;
  marketType: 'crypto' | 'stocks' | 'indices' | 'forex' | 'commodities';
  exchange?: string;
  bid?: number;
  ask?: number;
  spread?: number;
}

// WebSocket mesaj tipleri
interface WebSocketMessage {
  type: string;
  data: any;
}

interface PriceSubscription {
  marketType: keyof typeof SUPPORTED_MARKETS;
  symbol: string;
}

export const useMarketData = (subscriptions: PriceSubscription[]) => {
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<Record<string, WebSocket>>({});
  const reconnectTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toFixed(2);
  };

  const connectWebSocket = (marketType: string, symbols: string[]) => {
    try {
      let wsUrl: string;
      
      switch (marketType) {
        case 'crypto':
          wsUrl = `wss://stream.binance.com:9443/ws/${symbols.map(s => s.toLowerCase().replace('/', '')).join('@ticker/')}`;
          break;
        case 'stocks':
          wsUrl = `wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`;
          break;
        case 'forex':
          wsUrl = `wss://stream.forex.com/prices?pairs=${symbols.join(',')}`;
          break;
        default:
          throw new Error(`Unsupported market type: ${marketType}`);
      }

      if (wsRef.current[marketType]) {
        wsRef.current[marketType].close();
      }

      wsRef.current[marketType] = new WebSocket(wsUrl);

      wsRef.current[marketType].onopen = () => {
        console.log(`WebSocket connected for ${marketType}`);
        setError(null);
        
        // Forex ve Stocks için subscription mesajı gönder
        if (marketType === 'stocks') {
          symbols.forEach(symbol => {
            wsRef.current[marketType].send(JSON.stringify({
              type: 'subscribe',
              symbol: symbol
            }));
          });
        } else if (marketType === 'forex') {
          wsRef.current[marketType].send(JSON.stringify({
            type: 'subscribe',
            pairs: symbols
          }));
        }
      };

      wsRef.current[marketType].onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          let updatedData: Partial<MarketData> = {};

          switch (marketType) {
            case 'crypto':
              updatedData = {
                symbol: message.data.s,
                price: parseFloat(message.data.c),
                change: parseFloat(message.data.p),
                changePercent: parseFloat(message.data.P),
                volume: formatVolume(parseFloat(message.data.v)),
                high24h: parseFloat(message.data.h),
                low24h: parseFloat(message.data.l),
                marketType: 'crypto',
                exchange: 'Binance',
                lastUpdate: Date.now()
              };
              break;

            case 'stocks':
              updatedData = {
                symbol: message.data.symbol,
                price: message.data.price,
                change: message.data.price - message.data.previousClose,
                changePercent: ((message.data.price - message.data.previousClose) / message.data.previousClose) * 100,
                volume: formatVolume(message.data.volume),
                high24h: message.data.high,
                low24h: message.data.low,
                marketType: 'stocks',
                lastUpdate: Date.now()
              };
              break;

            case 'forex':
              updatedData = {
                symbol: message.data.pair,
                price: (message.data.bid + message.data.ask) / 2,
                bid: message.data.bid,
                ask: message.data.ask,
                spread: message.data.ask - message.data.bid,
                changePercent: message.data.dailyChange,
                marketType: 'forex',
                lastUpdate: Date.now()
              };
              break;
          }

          if (updatedData.symbol) {
            setMarketData(prev => ({
              ...prev,
              [updatedData.symbol!]: {
                ...prev[updatedData.symbol!],
                ...updatedData
              }
            }));
          }
        } catch (err) {
          console.error(`Error parsing ${marketType} WebSocket message:`, err);
        }
      };

      wsRef.current[marketType].onerror = (error) => {
        console.error(`WebSocket error for ${marketType}:`, error);
        setError(`WebSocket connection error for ${marketType}`);
      };

      wsRef.current[marketType].onclose = (event) => {
        console.log(`WebSocket closed for ${marketType}:`, event.code, event.reason);
        
        // Yeniden bağlan
        if (event.code !== 1000) {
          reconnectTimeoutRef.current[marketType] = setTimeout(() => {
            console.log(`Attempting to reconnect WebSocket for ${marketType}...`);
            connectWebSocket(marketType, symbols);
          }, 5000);
        }
      };

    } catch (err) {
      console.error(`Error connecting WebSocket for ${marketType}:`, err);
      setError(`Failed to connect to ${marketType} market data`);
    }
  };

  // REST API ile ilk verileri getir
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const promises = subscriptions.map(async ({ marketType, symbol }) => {
        let response;
        
        switch (marketType) {
          case 'crypto':
            response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol.replace('/', '')}`);
            break;
          case 'stocks':
            response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`);
            break;
          case 'forex':
            response = await fetch(`https://api.forex.com/prices/${symbol}`);
            break;
          default:
            throw new Error(`Unsupported market type: ${marketType}`);
        }

        if (!response.ok) throw new Error(`Failed to fetch ${symbol}`);
        
        const data = await response.json();
        return { marketType, symbol, data };
      });

      const results = await Promise.all(promises);
      const initialData: Record<string, MarketData> = {};

      results.forEach(({ marketType, symbol, data }) => {
        let marketData: MarketData;

        switch (marketType) {
          case 'crypto':
            marketData = {
              symbol,
              price: parseFloat(data.lastPrice),
              change: parseFloat(data.priceChange),
              changePercent: parseFloat(data.priceChangePercent),
              volume: formatVolume(parseFloat(data.volume)),
              high24h: parseFloat(data.highPrice),
              low24h: parseFloat(data.lowPrice),
              marketType: 'crypto',
              exchange: 'Binance',
              lastUpdate: Date.now()
            };
            break;

          case 'stocks':
            marketData = {
              symbol,
              price: data.c,
              change: data.c - data.pc,
              changePercent: ((data.c - data.pc) / data.pc) * 100,
              volume: formatVolume(data.v || 0),
              high24h: data.h,
              low24h: data.l,
              marketType: 'stocks',
              lastUpdate: Date.now()
            };
            break;

          case 'forex':
            marketData = {
              symbol,
              price: (data.bid + data.ask) / 2,
              bid: data.bid,
              ask: data.ask,
              spread: data.ask - data.bid,
              changePercent: data.dailyChange,
              marketType: 'forex',
              lastUpdate: Date.now()
            };
            break;

          default:
            throw new Error(`Unsupported market type: ${marketType}`);
        }

        initialData[symbol] = marketData;
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
    // İlk verileri getir
    fetchInitialData();
    
    // Market tiplerine göre WebSocket bağlantılarını başlat
    const marketTypes = new Set(subscriptions.map(s => s.marketType));
    marketTypes.forEach(marketType => {
      const symbols = subscriptions
        .filter(s => s.marketType === marketType)
        .map(s => s.symbol);
      connectWebSocket(marketType, symbols);
    });

    return () => {
      // Bağlantıları temizle
      Object.values(wsRef.current).forEach(ws => ws.close(1000, 'Component unmounting'));
      Object.values(reconnectTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, [JSON.stringify(subscriptions)]); // subscriptions değişince yeniden bağlan

  // Market verilerini dizi formatına çevir
  const marketDataArray = Object.values(marketData);

  return {
    marketData: marketDataArray,
    marketDataMap: marketData,
    loading,
    error,
    refetch: fetchInitialData,
    isConnected: Object.values(wsRef.current).every(ws => ws.readyState === WebSocket.OPEN)
  };
};

export type { MarketData, PriceSubscription };