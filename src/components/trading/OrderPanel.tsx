import { useState } from 'react';
import { ShoppingCart, TrendingUp, TrendingDown, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export const OrderPanel = () => {
  const [orderType, setOrderType] = useState('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');

  const placeOrder = () => {
    if (!price || !quantity) {
      toast.error('Please fill in price and quantity');
      return;
    }

    toast.success(`${side.toUpperCase()} order placed!`, {
      description: `${orderType.toUpperCase()}: ${quantity} @ $${price}`,
    });

    // Reset form
    setPrice('');
    setQuantity('');
    setStopLoss('');
    setTakeProfit('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-4/10 ring-2 ring-chart-4/30">
          <ShoppingCart className="w-4 h-4 text-chart-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Place Order</h3>
          <p className="text-[10px] text-muted-foreground">Professional Trading Panel</p>
        </div>
      </div>

      <Tabs value={side} onValueChange={(v) => setSide(v as 'buy' | 'sell')}>
        <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/30 backdrop-blur-xl">
          <TabsTrigger 
            value="buy" 
            className="data-[state=active]:bg-success/20 data-[state=active]:text-success data-[state=active]:shadow-lg data-[state=active]:shadow-success/20 font-bold transition-all"
          >
            <TrendingUp className="w-4 h-4 mr-1.5" />
            Buy Long
          </TabsTrigger>
          <TabsTrigger 
            value="sell" 
            className="data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive data-[state=active]:shadow-lg data-[state=active]:shadow-destructive/20 font-bold transition-all"
          >
            <TrendingDown className="w-4 h-4 mr-1.5" />
            Sell Short
          </TabsTrigger>
        </TabsList>

        <TabsContent value={side} className="space-y-3">
          {/* Order Type */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground uppercase tracking-wider">Order Type</Label>
            <Select value={orderType} onValueChange={setOrderType}>
              <SelectTrigger className="h-10 border-primary/20 bg-primary/5 hover:bg-primary/10 font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">
                  <div className="flex items-center gap-2 font-semibold">
                    <Zap className="w-4 h-4 text-warning" />
                    <span>Market Order</span>
                  </div>
                </SelectItem>
                <SelectItem value="limit">
                  <div className="flex items-center gap-2">
                    <span>📊 Limit Order</span>
                  </div>
                </SelectItem>
                <SelectItem value="stop_loss">
                  <div className="flex items-center gap-2">
                    <span>🛡️ Stop Loss</span>
                  </div>
                </SelectItem>
                <SelectItem value="stop_limit">
                  <div className="flex items-center gap-2">
                    <span>🎯 Stop Limit</span>
                  </div>
                </SelectItem>
                <SelectItem value="trailing_stop">
                  <div className="flex items-center gap-2">
                    <span>📈 Trailing Stop</span>
                  </div>
                </SelectItem>
                <SelectItem value="oco">
                  <div className="flex items-center gap-2">
                    <span>🔄 OCO Order</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Input */}
          {orderType !== 'market' && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Price (USDT)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-9"
              />
            </div>
          )}

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quantity</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="h-9"
            />
            <div className="flex gap-1">
              {[25, 50, 75, 100].map((pct) => (
                <Button
                  key={pct}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-7 text-xs"
                  onClick={() => setQuantity((1000 * (pct / 100)).toString())}
                >
                  {pct}%
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Risk Management */}
          <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-chart-4/20 ring-2 ring-chart-4/30">
                <Shield className="w-4 h-4 text-chart-4" />
              </div>
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Risk Management</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-destructive uppercase tracking-wider flex items-center gap-1">
                  <div className="h-1 w-1 rounded-full bg-destructive" />
                  Stop Loss
                </Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="h-9 text-xs font-mono font-bold border-destructive/30 bg-destructive/5 focus:border-destructive focus:ring-destructive"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-success uppercase tracking-wider flex items-center gap-1">
                  <div className="h-1 w-1 rounded-full bg-success" />
                  Take Profit
                </Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="h-9 text-xs font-mono font-bold border-success/30 bg-success/5 focus:border-success focus:ring-success"
                />
              </div>
            </div>

            {/* Risk/Reward Display */}
            {stopLoss && takeProfit && price && (
              <div className="metric-card p-2.5 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Risk/Reward</span>
                  <span className="font-mono font-bold text-primary">
                    1:{((parseFloat(takeProfit) - parseFloat(price)) / (parseFloat(price) - parseFloat(stopLoss))).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Total Display */}
          <div className="data-panel p-4 rounded-xl border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order Total</span>
                <span className="text-[10px] font-mono text-muted-foreground">USDT</span>
              </div>
              <div className="font-mono text-2xl font-black text-primary glow-text">
                ${(parseFloat(price || '0') * parseFloat(quantity || '0')).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Enhanced Place Order Button */}
          <Button
            onClick={placeOrder}
            className={`w-full h-12 font-black text-base uppercase tracking-wider transition-all hover:scale-[1.02] ${
              side === 'buy'
                ? 'bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-white shadow-lg shadow-success/30 hover:shadow-xl hover:shadow-success/40'
                : 'bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 text-white shadow-lg shadow-destructive/30 hover:shadow-xl hover:shadow-destructive/40'
            }`}
          >
            <div className="flex items-center gap-2">
              {side === 'buy' ? (
                <>
                  <TrendingUp className="w-5 h-5" />
                  Execute Buy {orderType.toUpperCase()}
                </>
              ) : (
                <>
                  <TrendingDown className="w-5 h-5" />
                  Execute Sell {orderType.toUpperCase()}
                </>
              )}
            </div>
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};
