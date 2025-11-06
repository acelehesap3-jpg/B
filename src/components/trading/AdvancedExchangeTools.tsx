import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Target, 
  Shield, 
  AlertTriangle,
  BarChart3,
  Settings,
  Layers,
  Clock,
  DollarSign,
  Percent,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import { useRealMarketData } from '@/hooks/useRealMarketData';
import { useRealOrderExecution } from '@/hooks/useRealOrderExecution';
import { toast } from 'sonner';

interface AdvancedExchangeToolsProps {
  exchange: string;
  userId: string;
}

interface GridTradingConfig {
  symbol: string;
  upperPrice: number;
  lowerPrice: number;
  gridCount: number;
  investmentAmount: number;
  isActive: boolean;
}

interface DCAConfig {
  symbol: string;
  intervalHours: number;
  amountPerOrder: number;
  maxOrders: number;
  isActive: boolean;
}

interface ArbitrageOpportunity {
  symbol: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  profit: number;
  profitPercent: number;
}

export const AdvancedExchangeTools: React.FC<AdvancedExchangeToolsProps> = ({ 
  exchange, 
  userId 
}) => {
  const [activeTab, setActiveTab] = useState('grid');
  const [gridConfigs, setGridConfigs] = useState<GridTradingConfig[]>([]);
  const [dcaConfigs, setDCAConfigs] = useState<DCAConfig[]>([]);
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const { marketData } = useRealMarketData();
  const { executeOrder, isExecuting } = useRealOrderExecution();

  // Grid Trading Component
  const GridTradingTool = () => {
    const [newGrid, setNewGrid] = useState<Partial<GridTradingConfig>>({
      symbol: 'BTCUSDT',
      upperPrice: 70000,
      lowerPrice: 60000,
      gridCount: 10,
      investmentAmount: 1000
    });

    const createGridStrategy = async () => {
      if (!newGrid.symbol || !newGrid.upperPrice || !newGrid.lowerPrice || !newGrid.gridCount || !newGrid.investmentAmount) {
        toast.error('Please fill all grid parameters');
        return;
      }

      const gridConfig: GridTradingConfig = {
        symbol: newGrid.symbol,
        upperPrice: newGrid.upperPrice,
        lowerPrice: newGrid.lowerPrice,
        gridCount: newGrid.gridCount,
        investmentAmount: newGrid.investmentAmount,
        isActive: true
      };

      try {
        // Calculate grid levels
        const priceRange = gridConfig.upperPrice - gridConfig.lowerPrice;
        const gridSpacing = priceRange / (gridConfig.gridCount - 1);
        const amountPerGrid = gridConfig.investmentAmount / gridConfig.gridCount;

        // Place initial grid orders
        for (let i = 0; i < gridConfig.gridCount; i++) {
          const price = gridConfig.lowerPrice + (i * gridSpacing);
          
          // Place buy orders below current price and sell orders above
          const currentPrice = marketData.find(m => m.symbol.replace('/', '') === gridConfig.symbol)?.price || 0;
          
          if (price < currentPrice) {
            // Place buy order
            await executeOrder(exchange, gridConfig.symbol, 'buy', 'limit', amountPerGrid / price, price);
          } else if (price > currentPrice) {
            // Place sell order (assuming we have the asset)
            await executeOrder(exchange, gridConfig.symbol, 'sell', 'limit', amountPerGrid / price, price);
          }
        }

        setGridConfigs(prev => [...prev, gridConfig]);
        toast.success(`Grid trading strategy created for ${gridConfig.symbol}`);
      } catch (error) {
        toast.error(`Failed to create grid strategy: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Create Grid Trading Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Trading Pair</Label>
                <Select value={newGrid.symbol} onValueChange={(value) => setNewGrid(prev => ({ ...prev, symbol: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {marketData.map(market => (
                      <SelectItem key={market.symbol} value={market.symbol.replace('/', '')}>
                        {market.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Investment Amount (USDT)</Label>
                <Input
                  type="number"
                  value={newGrid.investmentAmount}
                  onChange={(e) => setNewGrid(prev => ({ ...prev, investmentAmount: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Upper Price</Label>
                <Input
                  type="number"
                  value={newGrid.upperPrice}
                  onChange={(e) => setNewGrid(prev => ({ ...prev, upperPrice: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Lower Price</Label>
                <Input
                  type="number"
                  value={newGrid.lowerPrice}
                  onChange={(e) => setNewGrid(prev => ({ ...prev, lowerPrice: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Grid Count</Label>
                <Input
                  type="number"
                  value={newGrid.gridCount}
                  onChange={(e) => setNewGrid(prev => ({ ...prev, gridCount: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <Button onClick={createGridStrategy} disabled={isExecuting} className="w-full">
              {isExecuting ? 'Creating...' : 'Create Grid Strategy'}
            </Button>
          </CardContent>
        </Card>

        {/* Active Grid Strategies */}
        <div className="space-y-4">
          {gridConfigs.map((config, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{config.symbol} Grid</h4>
                    <p className="text-sm text-muted-foreground">
                      Range: ${config.lowerPrice} - ${config.upperPrice} | Grids: {config.gridCount}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={config.isActive ? 'default' : 'secondary'}>
                      {config.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Switch
                      checked={config.isActive}
                      onCheckedChange={(checked) => {
                        setGridConfigs(prev => prev.map((c, i) => 
                          i === index ? { ...c, isActive: checked } : c
                        ));
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // DCA Tool Component
  const DCATool = () => {
    const [newDCA, setNewDCA] = useState<Partial<DCAConfig>>({
      symbol: 'BTCUSDT',
      intervalHours: 24,
      amountPerOrder: 100,
      maxOrders: 10
    });

    const createDCAStrategy = () => {
      if (!newDCA.symbol || !newDCA.intervalHours || !newDCA.amountPerOrder || !newDCA.maxOrders) {
        toast.error('Please fill all DCA parameters');
        return;
      }

      const dcaConfig: DCAConfig = {
        symbol: newDCA.symbol,
        intervalHours: newDCA.intervalHours,
        amountPerOrder: newDCA.amountPerOrder,
        maxOrders: newDCA.maxOrders,
        isActive: true
      };

      setDCAConfigs(prev => [...prev, dcaConfig]);
      toast.success(`DCA strategy created for ${dcaConfig.symbol}`);
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Dollar Cost Averaging (DCA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Trading Pair</Label>
                <Select value={newDCA.symbol} onValueChange={(value) => setNewDCA(prev => ({ ...prev, symbol: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {marketData.map(market => (
                      <SelectItem key={market.symbol} value={market.symbol.replace('/', '')}>
                        {market.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount per Order (USDT)</Label>
                <Input
                  type="number"
                  value={newDCA.amountPerOrder}
                  onChange={(e) => setNewDCA(prev => ({ ...prev, amountPerOrder: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Interval (Hours)</Label>
                <Input
                  type="number"
                  value={newDCA.intervalHours}
                  onChange={(e) => setNewDCA(prev => ({ ...prev, intervalHours: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Max Orders</Label>
                <Input
                  type="number"
                  value={newDCA.maxOrders}
                  onChange={(e) => setNewDCA(prev => ({ ...prev, maxOrders: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <Button onClick={createDCAStrategy} className="w-full">
              Create DCA Strategy
            </Button>
          </CardContent>
        </Card>

        {/* Active DCA Strategies */}
        <div className="space-y-4">
          {dcaConfigs.map((config, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{config.symbol} DCA</h4>
                    <p className="text-sm text-muted-foreground">
                      ${config.amountPerOrder} every {config.intervalHours}h | Max: {config.maxOrders} orders
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={config.isActive ? 'default' : 'secondary'}>
                      {config.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Switch
                      checked={config.isActive}
                      onCheckedChange={(checked) => {
                        setDCAConfigs(prev => prev.map((c, i) => 
                          i === index ? { ...c, isActive: checked } : c
                        ));
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Arbitrage Scanner Component
  const ArbitrageScanner = () => {
    const scanArbitrageOpportunities = async () => {
      setIsScanning(true);
      try {
        // Simulate arbitrage scanning
        const opportunities: ArbitrageOpportunity[] = [
          {
            symbol: 'BTCUSDT',
            buyExchange: 'Binance',
            sellExchange: 'OKX',
            buyPrice: 67850,
            sellPrice: 67920,
            profit: 70,
            profitPercent: 0.103
          },
          {
            symbol: 'ETHUSDT',
            buyExchange: 'KuCoin',
            sellExchange: 'Bybit',
            buyPrice: 3375,
            sellPrice: 3382,
            profit: 7,
            profitPercent: 0.207
          }
        ];

        setArbitrageOpportunities(opportunities);
        toast.success(`Found ${opportunities.length} arbitrage opportunities`);
      } catch (error) {
        toast.error('Failed to scan arbitrage opportunities');
      } finally {
        setIsScanning(false);
      }
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5" />
              Arbitrage Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={scanArbitrageOpportunities} 
              disabled={isScanning}
              className="w-full"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                'Scan Arbitrage Opportunities'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Arbitrage Opportunities */}
        <div className="space-y-4">
          {arbitrageOpportunities.map((opportunity, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{opportunity.symbol}</h4>
                    <p className="text-sm text-muted-foreground">
                      Buy: {opportunity.buyExchange} @ ${opportunity.buyPrice} → 
                      Sell: {opportunity.sellExchange} @ ${opportunity.sellPrice}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-green-500 font-semibold">
                      +${opportunity.profit.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-500">
                      {opportunity.profitPercent.toFixed(3)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Advanced Trading Tools</h2>
        <Badge variant="outline">{exchange.toUpperCase()}</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="grid">Grid Trading</TabsTrigger>
          <TabsTrigger value="dca">DCA</TabsTrigger>
          <TabsTrigger value="arbitrage">Arbitrage</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <GridTradingTool />
        </TabsContent>

        <TabsContent value="dca">
          <DCATool />
        </TabsContent>

        <TabsContent value="arbitrage">
          <ArbitrageScanner />
        </TabsContent>
      </Tabs>
    </div>
  );
};