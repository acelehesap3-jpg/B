import { CandlestickPattern } from '@/types/trading';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

interface CandlestickPatternsProps {
  patterns: CandlestickPattern[];
}

export const CandlestickPatterns = ({ patterns }: CandlestickPatternsProps) => {
  if (patterns.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-chart-2" />
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Patterns</h3>
        </div>
        <div className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/20">No patterns detected</div>
      </div>
    );
  }

  const getIcon = (signal: string) => signal === 'bullish' ? TrendingUp : signal === 'bearish' ? TrendingDown : Minus;
  const getColor = (signal: string) => signal === 'bullish' ? 'text-success bg-success/10 border-success/20' : signal === 'bearish' ? 'text-destructive bg-destructive/10 border-destructive/20' : 'text-muted-foreground bg-muted/20 border-muted/20';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-chart-2" />
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Patterns</h3>
      </div>
      <div className="space-y-2">
        {patterns.slice(0, 5).map((pattern, i) => {
          const Icon = getIcon(pattern.signal);
          return (
            <div key={i} className={`p-3 rounded-lg border ${getColor(pattern.signal)} transition-all hover:scale-105`}>
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{pattern.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-background/50 uppercase">{(pattern.strength * 100).toFixed(0)}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 capitalize">{pattern.signal} signal</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
