import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bitcoin, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Package 
} from 'lucide-react';
import { MarketType } from '@/types/market';
import { TradingViewChart } from '../chart/TradingViewChart';
import { AdvancedMarketTools } from '../trading/AdvancedMarketTools';
import { useRealMarketData } from '@/hooks/useRealMarketData';
import { Watchlist } from './Watchlist';
import { TradingAlerts } from './TradingAlerts';
import { MarketAnalysis } from './MarketAnalysis';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export const MultiMarketTabs = () => {
  const [activeMarket, setActiveMarket] = useState<'crypto' | 'stocks' | 'forex' | 'indices'>('crypto');
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');

  const marketConfigs = {
    crypto: {
      icon: Bitcoin,
      title: 'Kripto',
      symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'BNBUSDT'],
      exchange: 'BINANCE'
    },
    stocks: {
      icon: TrendingUp,
      title: 'Hisse Senetleri',
      symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'],
      exchange: 'NASDAQ'
    },
    forex: {
      icon: DollarSign,
      title: 'Forex',
      symbols: ['EUR_USD', 'GBP_USD', 'USD_JPY', 'USD_CHF', 'USD_CAD'],
      exchange: 'OANDA'
    },
    indices: {
      icon: BarChart3,
      title: 'Endeksler',
      symbols: ['.SPX', '.DJI', '.IXIC', '.FTSE', '.GDAXI'],
      exchange: 'INDEX'
    }
  };

  const { marketData, loading, error } = useRealMarketData(
    marketConfigs[activeMarket].symbols,
    activeMarket,
    marketConfigs[activeMarket].exchange
  );

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="crypto" onValueChange={(value) => {
        setActiveMarket(value as 'crypto' | 'stocks' | 'forex' | 'indices');
        setSelectedSymbol(marketConfigs[value as keyof typeof marketConfigs].symbols[0]);
      }}>
        <TabsList className="grid grid-cols-4 gap-4 p-2 bg-background/95 backdrop-blur">
          {(Object.keys(marketConfigs) as Array<keyof typeof marketConfigs>).map((market) => {
            const Icon = marketConfigs[market].icon;
            return (
              <TabsTrigger
                key={market}
                value={market}
                className="flex items-center space-x-2 px-4 py-2"
              >
                <Icon className="h-4 w-4" />
                <span>{marketConfigs[market].title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(marketConfigs) as Array<keyof typeof marketConfigs>).map((market) => (
          <TabsContent key={market} value={market} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3">
                <Card>
                  <CardContent className="p-4">
                    <TradingViewChart 
                      symbol={selectedSymbol}
                      marketType={market as 'crypto' | 'forex' | 'stocks' | 'indices'}
                      exchange={marketConfigs[market].exchange}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <ScrollArea className="h-[300px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sembol</TableHead>
                            <TableHead>Fiyat</TableHead>
                            <TableHead>Değişim %</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={3}>Yükleniyor...</TableCell>
                            </TableRow>
                          ) : (
                            marketData.map((item) => (
                              <TableRow
                                key={item.symbol}
                                className={`cursor-pointer ${selectedSymbol === item.symbol ? 'bg-muted' : ''}`}
                                onClick={() => setSelectedSymbol(item.symbol)}
                              >
                                <TableCell>{item.symbol}</TableCell>
                                <TableCell>{item.price.toFixed(2)}</TableCell>
                                <TableCell className={item.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                                  {item.changePercent.toFixed(2)}%
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* İzleme Listesi */}
                <Watchlist marketType={market as 'crypto' | 'forex' | 'stocks' | 'indices'} />

                {/* Fiyat Alarmları */}
                <TradingAlerts 
                  marketType={market as 'crypto' | 'forex' | 'stocks' | 'indices'}
                  symbol={selectedSymbol}
                />

                {/* Piyasa Analizi */}
                <MarketAnalysis
                  marketType={market as 'crypto' | 'forex' | 'stocks' | 'indices'}
                  symbol={selectedSymbol}
                />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};