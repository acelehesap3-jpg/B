import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Exchange } from '@/types/trading';
import { EXCHANGES } from '@/lib/exchanges';

interface OrderBookProps {
  exchange: Exchange;
  symbol: string;
  lastPrice: number | null;
}

interface OrderLevel {
  price: number;
  volume: number;
}

export function OrderBook({ exchange, symbol, lastPrice }: OrderBookProps) {
  const [mode, setMode] = useState<'depth' | 'sim'>('depth');
  const [asks, setAsks] = useState<OrderLevel[]>([]);
  const [bids, setBids] = useState<OrderLevel[]>([]);

  useEffect(() => {
    if (mode === 'sim') {
      generateSimulatedOrderBook();
      const interval = setInterval(generateSimulatedOrderBook, 2000);
      return () => clearInterval(interval);
    } else {
      fetchOrderBook();
      const interval = setInterval(fetchOrderBook, 3000);
      return () => clearInterval(interval);
    }
  }, [exchange, symbol, mode, lastPrice]);

  const fetchOrderBook = async () => {
    try {
      const config = EXCHANGES[exchange];
      const url = config.depth(symbol);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch order book');
      
      const data = await response.json();
      
      let askData: any[] = [];
      let bidData: any[] = [];

      if (exchange === 'BINANCE') {
        askData = data.asks || [];
        bidData = data.bids || [];
      } else if (exchange === 'OKX') {
        const d = data.data || data;
        askData = d.asks || [];
        bidData = d.bids || [];
      } else if (exchange === 'KUCOIN') {
        const d = data.data || data;
        askData = d.asks || [];
        bidData = d.bids || [];
      } else if (exchange === 'COINBASE') {
        askData = data.asks || [];
        bidData = data.bids || [];
      }

      setAsks(
        askData.slice(0, 15).map((item: any) => ({
          price: parseFloat(Array.isArray(item) ? item[0] : item.price || item[0]),
          volume: parseFloat(Array.isArray(item) ? item[1] : item.size || item[1]),
        }))
      );

      setBids(
        bidData.slice(0, 15).map((item: any) => ({
          price: parseFloat(Array.isArray(item) ? item[0] : item.price || item[0]),
          volume: parseFloat(Array.isArray(item) ? item[1] : item.size || item[1]),
        }))
      );
    } catch (error) {
      console.error('Order book fetch error:', error);
      if (lastPrice) {
        generateSimulatedOrderBook();
      }
    }
  };

  const generateSimulatedOrderBook = () => {
    if (!lastPrice) return;

    const newAsks: OrderLevel[] = [];
    const newBids: OrderLevel[] = [];

    for (let i = 1; i <= 15; i++) {
      const askPrice = lastPrice + lastPrice * 0.0004 * i + Math.random() * (lastPrice * 0.00015);
      const askVolume = Math.random() * 50 * (1 - i / 15);
      newAsks.push({ price: askPrice, volume: askVolume });

      const bidPrice = lastPrice - lastPrice * 0.0004 * i - Math.random() * (lastPrice * 0.00015);
      const bidVolume = Math.random() * 50 * (1 - i / 15);
      newBids.push({ price: bidPrice, volume: bidVolume });
    }

    setAsks(newAsks.reverse());
    setBids(newBids);
  };

  const maxVolume = Math.max(
    ...asks.map((a) => a.volume),
    ...bids.map((b) => b.volume),
    1
  );

  const midPrice =
    asks.length && bids.length ? (asks[asks.length - 1].price + bids[0].price) / 2 : lastPrice;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-breathe" />
          <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">Order Book</h4>
        </div>
        <div className="flex items-center gap-2">
          <Select value={mode} onValueChange={(v) => setMode(v as 'depth' | 'sim')}>
            <SelectTrigger className="h-8 w-[110px] text-xs border-primary/20 bg-primary/5 hover:bg-primary/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="depth">🔴 Live</SelectItem>
              <SelectItem value="sim">📊 Sim</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mid Price Display */}
      <div className="metric-card rounded-xl p-3 text-center">
        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
          Mid Price
        </div>
        <div className="font-mono text-lg font-black text-primary glow-text">
          ${midPrice?.toFixed(2)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Asks Panel */}
        <div className="data-panel rounded-xl border-destructive/20 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              <span className="text-[10px] font-bold text-destructive uppercase tracking-wider">Asks</span>
            </div>
            <span className="text-[9px] font-mono text-muted-foreground">{asks.length} lvl</span>
          </div>
          <div className="mb-2 flex justify-between text-[10px] font-semibold text-muted-foreground uppercase">
            <span>Price</span>
            <span>Size</span>
          </div>
          <ScrollArea className="h-[240px]">
            <div className="flex flex-col-reverse space-y-0.5">
              {asks.map((ask, idx) => {
                const percentage = (ask.volume / maxVolume) * 100;
                const isLarge = percentage > 70;
                return (
                  <div
                    key={idx}
                    className={`relative flex justify-between font-mono text-xs transition-all hover:bg-destructive/5 ${
                      isLarge ? 'text-destructive font-bold' : 'text-destructive/90'
                    }`}
                  >
                    <div
                      className={`absolute right-0 top-0 h-full transition-all ${
                        isLarge ? 'bg-destructive/20' : 'bg-destructive/10'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="relative z-10 font-bold">{ask.price.toFixed(2)}</span>
                    <span className="relative z-10 text-[11px]">{ask.volume.toFixed(3)}</span>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Bids Panel */}
        <div className="data-panel rounded-xl border-success/20 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-bold text-success uppercase tracking-wider">Bids</span>
            </div>
            <span className="text-[9px] font-mono text-muted-foreground">{bids.length} lvl</span>
          </div>
          <div className="mb-2 flex justify-between text-[10px] font-semibold text-muted-foreground uppercase">
            <span>Price</span>
            <span>Size</span>
          </div>
          <ScrollArea className="h-[240px]">
            <div className="space-y-0.5">
              {bids.map((bid, idx) => {
                const percentage = (bid.volume / maxVolume) * 100;
                const isLarge = percentage > 70;
                return (
                  <div
                    key={idx}
                    className={`relative flex justify-between font-mono text-xs transition-all hover:bg-success/5 ${
                      isLarge ? 'text-success font-bold' : 'text-success/90'
                    }`}
                  >
                    <div
                      className={`absolute left-0 top-0 h-full transition-all ${
                        isLarge ? 'bg-success/20' : 'bg-success/10'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="relative z-10 font-bold">{bid.price.toFixed(2)}</span>
                    <span className="relative z-10 text-[11px]">{bid.volume.toFixed(3)}</span>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Spread Info */}
      <div className="metric-card rounded-xl p-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Spread</span>
          <span className="font-mono font-bold text-foreground">
            {asks.length && bids.length 
              ? `$${(asks[asks.length - 1].price - bids[0].price).toFixed(2)}`
              : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
