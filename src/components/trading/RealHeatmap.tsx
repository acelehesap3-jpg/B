import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
}

export const RealHeatmap = () => {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRealData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1&sparkline=false'
      );
      const data = await response.json();
      setCryptos(data);
    } catch (error) {
      console.error('Failed to fetch crypto data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
    const interval = setInterval(fetchRealData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const getSize = (marketCap: number) => {
    if (cryptos.length === 0) return 100;
    const max = Math.max(...cryptos.map(c => c.market_cap));
    const min = Math.min(...cryptos.map(c => c.market_cap));
    const normalized = (marketCap - min) / (max - min);
    return 80 + normalized * 180; // 80px to 260px
  };

  const getColor = (change: number) => {
    if (change > 5) return 'from-success/90 to-success/70';
    if (change > 0) return 'from-success/60 to-success/40';
    if (change > -5) return 'from-destructive/60 to-destructive/40';
    return 'from-destructive/90 to-destructive/70';
  };

  const getIntensity = (change: number) => {
    const abs = Math.abs(change);
    if (abs > 7) return 'font-bold text-lg';
    if (abs > 3) return 'font-semibold';
    return 'font-medium';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Live Market Heatmap
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchRealData}
          disabled={loading}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4 bg-muted/20 rounded-xl">
        {loading && cryptos.length === 0 ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted/30 animate-pulse rounded-lg" />
          ))
        ) : (
          cryptos.map((crypto) => {
            const size = getSize(crypto.market_cap);
            const isPositive = crypto.price_change_percentage_24h >= 0;
            
            return (
              <div
                key={crypto.id}
                className={`relative overflow-hidden rounded-lg transition-all hover:scale-105 hover:z-10 cursor-pointer bg-gradient-to-br ${getColor(crypto.price_change_percentage_24h)} border border-border/50 shadow-lg`}
                style={{ minHeight: `${size}px` }}
              >
                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                  <div>
                    <div className="text-sm font-bold text-foreground flex items-center gap-1">
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {crypto.symbol.toUpperCase()}
                    </div>
                    <div className="text-xs text-foreground/80 mt-1">
                      ${crypto.current_price.toLocaleString()}
                    </div>
                  </div>
                  
                  <div>
                    <div className={`${getIntensity(crypto.price_change_percentage_24h)} ${isPositive ? 'text-success-foreground' : 'text-destructive-foreground'}`}>
                      {isPositive ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%
                    </div>
                    <div className="text-[10px] text-foreground/60 mt-1">
                      Vol: ${(crypto.total_volume / 1e9).toFixed(2)}B
                    </div>
                  </div>
                </div>
                
                {/* Glow effect */}
                <div className={`absolute inset-0 opacity-0 hover:opacity-20 transition-opacity ${isPositive ? 'bg-success' : 'bg-destructive'}`} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};