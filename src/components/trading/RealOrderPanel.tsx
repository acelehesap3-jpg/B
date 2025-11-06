import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  DollarSign,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useRealOrderExecution } from '@/hooks/useRealOrderExecution';
import { useTradingStore } from '@/lib/stores';
import { toast } from 'sonner';

interface RealOrderPanelProps {
  exchange: string;
  symbol: string;
  currentPrice: number;
}

export const RealOrderPanel = ({ exchange, symbol, currentPrice }: RealOrderPanelProps) => {
  const { executeOrder, isExecuting, getBalance } = useRealOrderExecution();
  const { mode } = useTradingStore();
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<string>('');
  const [price, setPrice] = useState<string>(currentPrice.toString());
  const [usePercentage, setUsePercentage] = useState(false);
  const [percentage, setPercentage] = useState<string>('25');

  const balance = getBalance(exchange, 'USDT');

  const calculateAmount = () => {
    if (usePercentage) {
      const pct = parseFloat(percentage) / 100;
      const totalValue = balance * pct;
      return totalValue / (orderType === 'market' ? currentPrice : parseFloat(price));
    }
    return parseFloat(amount);
  };

  const handleExecuteOrder = async () => {
    const actualAmount = calculateAmount();
    
    if (isNaN(actualAmount) || actualAmount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    const orderPrice = orderType === 'market' ? undefined : parseFloat(price);

    if (orderType !== 'market' && (!orderPrice || isNaN(orderPrice))) {
      toast.error('Invalid price');
      return;
    }

    const estimatedCost = actualAmount * (orderPrice || currentPrice);
    if (side === 'buy' && estimatedCost > balance) {
      toast.error(`Insufficient balance. Required: ${estimatedCost.toFixed(2)} USDT, Available: ${balance.toFixed(2)} USDT`);
      return;
    }

    try {
      await executeOrder(exchange, symbol, side, orderType, actualAmount, orderPrice);
      toast.success(`${side.toUpperCase()} order executed successfully`);
      setAmount('');
      setPercentage('25');
    } catch (error) {
      toast.error(`Order execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Real trading mode - no demo restrictions

  return (
    <Card className="p-4 bg-gradient-to-br from-background to-primary/5 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Place Order</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          <DollarSign className="w-3 h-3 mr-1" />
          {balance.toFixed(2)} USDT
        </Badge>
      </div>

      <Tabs value={orderType} onValueChange={(v) => setOrderType(v as any)} className="mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="limit">Limit</TabsTrigger>
          <TabsTrigger value="stop">Stop</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={side === 'buy' ? 'default' : 'outline'}
            onClick={() => setSide('buy')}
            className={side === 'buy' ? 'bg-success hover:bg-success/90' : ''}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Buy
          </Button>
          <Button
            variant={side === 'sell' ? 'default' : 'outline'}
            onClick={() => setSide('sell')}
            className={side === 'sell' ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            <TrendingDown className="w-4 h-4 mr-1" />
            Sell
          </Button>
        </div>

        {orderType !== 'market' && (
          <div className="space-y-2">
            <Label htmlFor="price" className="text-xs">Price (USDT)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label htmlFor="usePercentage" className="text-xs">Use % of Balance</Label>
          <Switch
            id="usePercentage"
            checked={usePercentage}
            onCheckedChange={setUsePercentage}
          />
        </div>

        {usePercentage ? (
          <div className="space-y-2">
            <Label htmlFor="percentage" className="text-xs">Percentage (%)</Label>
            <Input
              id="percentage"
              type="number"
              min="1"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="h-9 text-sm"
            />
            <div className="flex gap-2">
              {['25', '50', '75', '100'].map((pct) => (
                <Button
                  key={pct}
                  variant="outline"
                  size="sm"
                  onClick={() => setPercentage(pct)}
                  className="flex-1 h-7 text-xs"
                >
                  {pct}%
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs">Amount ({symbol.replace('USDT', '')})</Label>
            <Input
              id="amount"
              type="number"
              step="0.00001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-9 text-sm"
            />
          </div>
        )}

        <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order Type:</span>
            <span className="font-semibold uppercase">{orderType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Est. Cost:</span>
            <span className="font-semibold">
              {(calculateAmount() * (orderType === 'market' ? currentPrice : parseFloat(price) || 0)).toFixed(2)} USDT
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fee (0.1%):</span>
            <span className="font-semibold">
              {((calculateAmount() * (orderType === 'market' ? currentPrice : parseFloat(price) || 0)) * 0.001).toFixed(2)} USDT
            </span>
          </div>
        </div>

        <Button
          onClick={handleExecuteOrder}
          disabled={isExecuting}
          className={`w-full ${side === 'buy' ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'}`}
        >
          {isExecuting ? (
            'Executing...'
          ) : (
            <>
              <Zap className="w-4 h-4 mr-1" />
              {side === 'buy' ? 'Buy' : 'Sell'} {symbol}
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          Real trades executed on {exchange}
        </div>
      </div>
    </Card>
  );
};
