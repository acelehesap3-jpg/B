import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { LiveIndicator } from './LiveIndicator';

interface PriceDisplayProps {
  symbol: string;
  price: number | null;
  previousPrice: number | null;
  source: string;
}

export function PriceDisplay({ symbol, price, previousPrice, source }: PriceDisplayProps) {
  const isUp = price && previousPrice ? price >= previousPrice : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card/90 to-card/50 shadow-2xl backdrop-blur-xl hover-lift">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-accent/8 opacity-60" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Top Neon Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      
      <div className="relative z-10 p-8">
        <div className="flex items-start justify-between gap-6">
          {/* Left: Price Info */}
          <div className="flex-1 space-y-4">
            {/* Symbol Header */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center ring-4 ring-primary/20 shadow-lg shadow-primary/30">
                  <span className="text-lg font-black text-background">{symbol[0].toUpperCase()}</span>
                </div>
                <div>
                  <h2 className="font-mono text-4xl font-black tracking-tighter text-foreground">
                    {symbol.toUpperCase()}
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Perpetual / USDT
                  </p>
                </div>
              </div>
              <LiveIndicator />
            </div>
            
            {/* Price Display */}
            {price && (
              <div className="flex items-end gap-4">
                <div className="flex items-baseline gap-2">
                  <span 
                    className={`font-mono text-6xl font-black tracking-tighter transition-all duration-300 ${
                      isUp ? 'text-success' : 'text-destructive'
                    }`}
                    style={{
                      textShadow: isUp 
                        ? '0 0 20px hsl(var(--glow-success)), 0 0 40px hsl(var(--glow-success))'
                        : '0 0 20px hsl(var(--glow-destructive)), 0 0 40px hsl(var(--glow-destructive))'
                    }}
                  >
                    ${price.toFixed(2)}
                  </span>
                  <span className="font-mono text-2xl text-muted-foreground font-bold pb-1">
                    .{price.toFixed(6).split('.')[1].slice(2, 6)}
                  </span>
                </div>
                
                {isUp !== null && (
                  <div className={`flex items-center gap-2 rounded-xl px-4 py-2 mb-1 ${
                    isUp 
                      ? 'bg-success/15 border border-success/30 shadow-lg shadow-success/20' 
                      : 'bg-destructive/15 border border-destructive/30 shadow-lg shadow-destructive/20'
                  }`}>
                    {isUp ? (
                      <TrendingUp className="h-6 w-6 text-success" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-destructive" />
                    )}
                    <span className={`font-mono text-lg font-black ${isUp ? 'text-success' : 'text-destructive'}`}>
                      {isUp ? '+' : ''}{previousPrice ? ((price - previousPrice) / previousPrice * 100).toFixed(2) : '0.00'}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Right: Status Cards */}
          <div className="flex flex-col gap-3">
            {/* Source Badge */}
            <div className="metric-card rounded-xl p-3 min-w-[140px]">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Data Source</span>
              </div>
              <div className="text-center font-mono text-base font-black text-primary">
                {source.toUpperCase()}
              </div>
            </div>
            
            {/* Time Badge */}
            <div className="metric-card rounded-xl p-3">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center mb-2">
                Last Update
              </div>
              <div className="text-center font-mono text-sm font-bold text-foreground">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Accent Line */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r transition-all duration-300 ${
        isUp 
          ? 'from-transparent via-success to-transparent' 
          : 'from-transparent via-destructive to-transparent'
      }`} />
    </div>
  );
}
