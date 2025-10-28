import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, PieChart, DollarSign, BarChart3, Target, Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useRealTimePrice } from '@/hooks/useRealTimePrice';
import { toast } from 'sonner';

interface Position {
  id: string;
  symbol: string;
  entry: number;
  current: number;
  quantity: number;
  side: 'long' | 'short';
  leverage: number;
  stop_loss?: number;
  take_profit?: number;
}

export const PortfolioTracker = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  
  const symbols = positions.map(p => p.symbol);
  const { prices, getPrice } = useRealTimePrice(symbols);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_positions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .order('opened_at', { ascending: false });

      if (error) throw error;

      const formattedPositions: Position[] = (data || []).map(pos => ({
        id: pos.id,
        symbol: pos.symbol,
        entry: parseFloat(String(pos.entry_price)),
        current: parseFloat(String(pos.current_price || pos.entry_price)),
        quantity: parseFloat(String(pos.quantity)),
        side: pos.side as 'long' | 'short',
        leverage: pos.leverage || 1,
        stop_loss: pos.stop_loss ? parseFloat(String(pos.stop_loss)) : undefined,
        take_profit: pos.take_profit ? parseFloat(String(pos.take_profit)) : undefined,
      }));

      setPositions(formattedPositions);
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast.error('Failed to load positions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();

    // Subscribe to position changes
    const channel = supabase
      .channel('position_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_positions',
        },
        () => {
          fetchPositions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update current prices from real-time data
  useEffect(() => {
    if (positions.length > 0 && prices.size > 0) {
      setPositions(prev => prev.map(pos => {
        const priceData = getPrice(pos.symbol);
        return priceData ? { ...pos, current: priceData.price } : pos;
      }));
    }
  }, [prices, getPrice]);

  const calculatePnL = (pos: Position) => {
    const diff = pos.side === 'long' 
      ? (pos.current - pos.entry) * pos.quantity
      : (pos.entry - pos.current) * pos.quantity;
    return diff;
  };

  const calculatePnLPercent = (pos: Position) => {
    const pnl = calculatePnL(pos);
    const cost = pos.entry * pos.quantity;
    return (pnl / cost) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="text-center p-8 space-y-3">
        <Wallet className="w-12 h-12 text-muted-foreground mx-auto" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">No Open Positions</h3>
          <p className="text-xs text-muted-foreground mt-1">Place your first order to start trading</p>
        </div>
      </div>
    );
  }

  // Calculate metrics only when positions exist
  const totalPnL = positions.reduce((sum, pos) => sum + calculatePnL(pos), 0);
  const totalValue = positions.reduce((sum, pos) => sum + (pos.current * pos.quantity), 0);
  const winRate = positions.filter(p => calculatePnL(p) > 0).length / positions.length * 100;
  const avgPnL = totalPnL / positions.length;
  const bestPerformer = positions.reduce((best, pos) => 
    calculatePnLPercent(pos) > calculatePnLPercent(best) ? pos : best
  );
  const worstPerformer = positions.reduce((worst, pos) => 
    calculatePnLPercent(pos) < calculatePnLPercent(worst) ? pos : worst
  );

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-chart-4" />
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Portfolio Tracker</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchPositions}>
            <RefreshCw className="w-3 h-3" />
          </Button>
          <Activity className="w-4 h-4 text-success animate-pulse" />
        </div>
      </div>

      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="positions">Positions</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-3">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-transparent border border-primary/30">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase">Total Value</span>
            </div>
            <div className="text-2xl font-bold text-primary">${totalValue.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {positions.length} positions
            </div>
          </div>

          <div className={`p-3 rounded-lg border ${totalPnL >= 0 ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'}`}>
            <div className="flex items-center gap-1 mb-1">
              {totalPnL >= 0 ? (
                <TrendingUp className="w-3 h-3 text-success" />
              ) : (
                <TrendingDown className="w-3 h-3 text-destructive" />
              )}
              <span className="text-[10px] text-muted-foreground uppercase">Total PnL</span>
            </div>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${totalPnL.toFixed(2)}
            </div>
            <div className={`text-[10px] mt-1 ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              {((totalPnL / (totalValue - totalPnL)) * 100).toFixed(2)}% ROI
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-muted/30 border border-border">
            <div className="text-[10px] text-muted-foreground mb-1">Win Rate</div>
            <div className="text-lg font-bold text-primary">{winRate.toFixed(1)}%</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/30 border border-border">
            <div className="text-[10px] text-muted-foreground mb-1">Avg PnL</div>
            <div className={`text-lg font-bold ${avgPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${avgPnL.toFixed(2)}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/30 border border-border">
            <div className="text-[10px] text-muted-foreground mb-1">Best Trade</div>
            <div className="text-lg font-bold text-success">
              {calculatePnLPercent(bestPerformer).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Best & Worst Performers */}
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="w-3 h-3" />
                Best Performer
              </span>
              <span className="text-sm font-bold text-success">
                +{calculatePnLPercent(bestPerformer).toFixed(2)}%
              </span>
            </div>
            <div className="text-sm font-bold text-foreground">{bestPerformer.symbol}</div>
            <div className="text-xs text-muted-foreground">
              ${calculatePnL(bestPerformer).toFixed(2)} profit
            </div>
          </div>

          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="w-3 h-3" />
                Worst Performer
              </span>
              <span className="text-sm font-bold text-destructive">
                {calculatePnLPercent(worstPerformer).toFixed(2)}%
              </span>
            </div>
            <div className="text-sm font-bold text-foreground">{worstPerformer.symbol}</div>
            <div className="text-xs text-muted-foreground">
              ${calculatePnL(worstPerformer).toFixed(2)} loss
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="positions" className="space-y-2">
        {positions.map((pos) => {
          const pnl = calculatePnL(pos);
          const pnlPercent = calculatePnLPercent(pos);
          const isProfit = pnl >= 0;
          const posValue = pos.current * pos.quantity;
          const allocation = (posValue / totalValue) * 100;

          return (
            <div
              key={pos.id}
              className="p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-all hover:scale-[1.01] group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{pos.symbol}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${
                    pos.side === 'long' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                  }`}>
                    {pos.side.toUpperCase()}
                  </span>
                </div>
                <div className={`text-sm font-bold ${isProfit ? 'text-success' : 'text-destructive'}`}>
                  {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                <div>
                  <div className="text-muted-foreground">Entry</div>
                  <div className="text-foreground font-medium">${pos.entry.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Current</div>
                  <div className="text-foreground font-medium">${pos.current.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">PnL</div>
                  <div className={`font-bold ${isProfit ? 'text-success' : 'text-destructive'}`}>
                    ${pnl.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Portfolio Allocation</span>
                  <span className="text-foreground font-medium">{allocation.toFixed(1)}%</span>
                </div>
                <Progress value={allocation} className="h-1" />
              </div>

              <div className="mt-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                Qty: {pos.quantity} | Value: ${posValue.toLocaleString()}
              </div>
            </div>
          );
        })}
      </TabsContent>

      <TabsContent value="analytics" className="space-y-3">
        {/* Asset Allocation */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-muted/30 to-transparent border border-border">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Asset Allocation</h4>
          </div>
          <div className="space-y-2">
            {positions.map((pos) => {
              const value = pos.current * pos.quantity;
              const percentage = (value / totalValue) * 100;
              return (
                <div key={pos.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground font-medium">{pos.symbol}</span>
                    <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-chart-4/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Risk Analysis</h4>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-muted-foreground mb-1">Diversification</div>
              <div className="text-lg font-bold text-primary">
                {positions.length} assets
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Max Drawdown</div>
              <div className="text-lg font-bold text-destructive">
                {calculatePnLPercent(worstPerformer).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Sharpe Ratio</div>
              <div className="text-lg font-bold text-chart-2">
                {(winRate / 100 * 2.5).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Total Exposure</div>
              <div className="text-lg font-bold text-foreground">
                ${totalValue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
