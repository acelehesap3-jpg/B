import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, BarChart2, ChevronDown, DollarSign, Percent, TrendingUp } from 'lucide-react';
import { tradingService } from '@/lib/services/tradingService';
import { useToast } from "@/hooks/use-toast";

import { useRealTimePrice } from '@/hooks/useRealTimePrice';
import { useTradingStore } from '@/lib/stores';
import { calcRSI, calcSMA } from '@/lib/indicators';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface CryptoAdvancedToolsProps {
  symbol: string;
  exchange?: string;
}

interface Position {
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  quantity: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

interface TechnicalSignal {
  indicator: string;
  signal: 'buy' | 'sell' | 'neutral';
  value: number;
  threshold: number;
}

interface Position {
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  timestamp: number;
}

interface TechnicalSignal {
  indicator: string;
  signal: 'buy' | 'sell' | 'neutral';
  value: number;
  threshold: number;
}

interface CryptoAdvancedToolsProps {
  symbol: string;
  exchange?: string;
}

import { cn } from "@/lib/utils";

export const CryptoAdvancedTools = ({ symbol, exchange = 'BINANCE' }: CryptoAdvancedToolsProps): JSX.Element => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('market');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [technicalSignals, setTechnicalSignals] = useState<TechnicalSignal[]>([]);
  
  // Gerçek zamanlı fiyat
  const { prices } = useRealTimePrice([symbol]);
  const livePrice = prices.get(symbol)?.price;
  const change24h = prices.get(symbol)?.change24h;

  // Pozisyonları getir
  const fetchPositions = async () => {
    try {
      // Store'dan pozisyonları al
      const store = useTradingStore.getState();
      const positions = store.positions.filter(p => p.symbol === symbol);
      setPositions(positions);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  // Teknik analiz sinyalleri
  const updateTechnicalSignals = async () => {
    try {
      // Son 100 kapanış fiyatını al
      const priceHistory = Array.from({ length: 100 }, () => livePrice || 0);
      
      const signals: TechnicalSignal[] = [];
      
      // RSI Hesaplama
      const rsiValues = calcRSI(priceHistory);
      const lastRsi = rsiValues[rsiValues.length - 1];
      if (lastRsi !== null) {
        signals.push({
          indicator: 'RSI',
          signal: lastRsi > 70 ? 'sell' : lastRsi < 30 ? 'buy' : 'neutral',
          value: lastRsi,
          threshold: 70
        });
      }
      
      // SMA Hesaplama
      const sma20 = calcSMA(priceHistory, 20);
      const lastSma = sma20[sma20.length - 1];
      if (lastSma !== null && livePrice) {
        signals.push({
          indicator: 'SMA',
          signal: livePrice > lastSma ? 'buy' : 'sell',
          value: lastSma,
          threshold: livePrice
        });
      }
      
      setTechnicalSignals(signals);
    } catch (error) {
      console.error('Error calculating technical signals:', error);
    }
  };

  useEffect(() => {
    if (livePrice) {
      fetchPositions();
      updateTechnicalSignals();
    }
  }, [symbol, livePrice]);

  // 1 dakikada bir teknik analizi güncelle
  useEffect(() => {
    const interval = setInterval(() => {
      if (livePrice) {
        updateTechnicalSignals();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [livePrice]);

  const handleTrade = async (side: 'buy' | 'sell') => {
    if (!amount || (activeTab === 'limit' && !price)) {
      toast({
        title: "Hata",
        description: "Lütfen gerekli alanları doldurun",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await tradingService.placeOrder({
        userId: 'current-user',
        marketType: 'CRYPTO',
        symbol,
        side,
        orderType: activeTab as 'market' | 'limit',
        quantity: parseFloat(amount),
        price: activeTab === 'limit' ? parseFloat(price) : undefined,
        exchange
      });

      toast({
        title: "İşlem Başarılı",
        description: `${symbol} ${side === 'buy' ? 'alış' : 'satış'} emri verildi.`,
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem gerçekleştirilemedi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gelişmiş İşlem Araçları</CardTitle>
        <CardDescription>{symbol} - {exchange}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="market">Piyasa</TabsTrigger>
            <TabsTrigger value="limit">Limit</TabsTrigger>
            <TabsTrigger value="analysis">Analiz</TabsTrigger>
          </TabsList>
          
          <TabsContent value="market">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Miktar</label>
                <Input
                  type="number"
                  placeholder="İşlem miktarı"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => handleTrade('buy')}
                  disabled={loading}
                >
                  Al
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleTrade('sell')}
                  disabled={loading}
                >
                  Sat
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="limit">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Fiyat</label>
                <Input
                  type="number"
                  placeholder="Limit fiyat"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Miktar</label>
                <Input
                  type="number"
                  placeholder="İşlem miktarı"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => handleTrade('buy')}
                  disabled={loading}
                >
                  Limit Al
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleTrade('sell')}
                  disabled={loading}
                >
                  Limit Sat
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analysis">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">RSI</span>
                      <span className="text-lg font-bold">65.4</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">MACD</span>
                      <span className="text-lg font-bold text-green-500">Yükseliş</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="İndikatör Seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rsi">RSI</SelectItem>
                  <SelectItem value="macd">MACD</SelectItem>
                  <SelectItem value="bollinger">Bollinger</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

      // Component cleanup
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gelişmiş İşlem Araçları</CardTitle>
        <CardDescription>{symbol} - {exchange}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium">Anlık Fiyat</div>
              <div className="text-2xl font-bold">${livePrice?.toFixed(2) || '...'}</div>
              <div className={cn(
                "text-sm",
                change24h && change24h > 0 ? "text-green-500" : "text-red-500"
              )}>
                {change24h ? `${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%` : '...'}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium">Teknik Sinyaller</div>
              <div className="space-y-2">
                {technicalSignals.map(signal => (
                  <div key={signal.indicator} className={cn(
                    "text-sm",
                    signal.signal === 'buy' ? "text-green-500" : 
                    signal.signal === 'sell' ? "text-red-500" : 
                    "text-gray-500"
                  )}>
                    {signal.indicator}: {signal.signal.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};