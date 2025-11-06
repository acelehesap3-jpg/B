import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Zap,
  DollarSign,
  Bitcoin,
  Coins,
  Activity,
  Eye,
  EyeOff,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Settings,
  Filter,
  Search,
  Bell,
  Wallet,
  CreditCard,
  Globe,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RealTradingTerminalProps {
  user: any;
}

const RealTradingTerminal: React.FC<RealTradingTerminalProps> = ({ user }) => {
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [orderType, setOrderType] = useState('market');
  const [tradeType, setTradeType] = useState('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const [marketData, setMarketData] = useState([
    { 
      symbol: 'BTC/USDT', 
      price: 67902.36, 
      change: 2.45, 
      volume: '1.2B', 
      high: 68500.00, 
      low: 66800.00,
      exchange: 'Binance'
    },
    { 
      symbol: 'ETH/USDT', 
      price: 3379.01, 
      change: -1.23, 
      volume: '890M', 
      high: 3420.50, 
      low: 3350.00,
      exchange: 'Coinbase'
    },
    { 
      symbol: 'SOL/USDT', 
      price: 158.15, 
      change: 5.67, 
      volume: '456M', 
      high: 162.00, 
      low: 148.50,
      exchange: 'Kraken'
    },
    { 
      symbol: 'ADA/USDT', 
      price: 0.534, 
      change: -0.89, 
      volume: '234M', 
      high: 0.548, 
      low: 0.521,
      exchange: 'OKX'
    },
    { 
      symbol: 'AAPL', 
      price: 189.95, 
      change: 1.24, 
      volume: '45M', 
      high: 191.20, 
      low: 187.80,
      exchange: 'NYSE'
    },
    { 
      symbol: 'EUR/USD', 
      price: 1.0845, 
      change: 0.15, 
      volume: '2.1B', 
      high: 1.0867, 
      low: 1.0823,
      exchange: 'OANDA'
    }
  ]);

  const [positions, setPositions] = useState([
    { id: 1, symbol: 'BTC/USDT', type: 'long', size: 0.5, entry: 66500.00, current: 67902.36, pnl: 701.18, pnlPercent: 2.11 },
    { id: 2, symbol: 'ETH/USDT', type: 'short', size: 2.0, entry: 3420.00, current: 3379.01, pnl: 81.98, pnlPercent: 1.20 },
    { id: 3, symbol: 'SOL/USDT', type: 'long', size: 10.0, entry: 145.00, current: 158.15, pnl: 131.50, pnlPercent: 9.07 }
  ]);

  const [orderHistory, setOrderHistory] = useState([
    { id: 1, symbol: 'BTC/USDT', type: 'buy', amount: 0.5, price: 66500.00, status: 'filled', time: '10:30:45' },
    { id: 2, symbol: 'ETH/USDT', type: 'sell', amount: 1.0, price: 3420.00, status: 'filled', time: '09:15:22' },
    { id: 3, symbol: 'SOL/USDT', type: 'buy', amount: 10.0, price: 145.00, status: 'filled', time: '08:45:10' }
  ]);

  const [balance] = useState({
    USDT: 15420.50,
    BTC: 0.5,
    ETH: 2.0,
    SOL: 10.0,
    total: 25847.32
  });

  const selectedMarket = marketData.find(m => m.symbol === selectedPair) || marketData[0];

  const handleTrade = async () => {
    if (!amount || (orderType === 'limit' && !price)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call to exchange
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newOrder = {
        id: Date.now(),
        symbol: selectedPair,
        type: tradeType,
        amount: parseFloat(amount),
        price: orderType === 'market' ? selectedMarket.price : parseFloat(price),
        status: 'filled' as const,
        time: new Date().toLocaleTimeString()
      };
      
      setOrderHistory(prev => [newOrder, ...prev]);
      
      // Update positions if needed
      if (tradeType === 'buy') {
        const existingPosition = positions.find(p => p.symbol === selectedPair && p.type === 'long');
        if (existingPosition) {
          setPositions(prev => prev.map(p => 
            p.id === existingPosition.id 
              ? { ...p, size: p.size + parseFloat(amount) }
              : p
          ));
        } else {
          const newPosition = {
            id: Date.now(),
            symbol: selectedPair,
            type: 'long' as const,
            size: parseFloat(amount),
            entry: newOrder.price,
            current: selectedMarket.price,
            pnl: 0,
            pnlPercent: 0
          };
          setPositions(prev => [...prev, newPosition]);
        }
      }
      
      toast.success(`${tradeType.toUpperCase()} order executed successfully!`);
      setAmount('');
      setPrice('');
      
    } catch (error) {
      toast.error('Trade execution failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closePosition = (positionId: number) => {
    setPositions(prev => prev.filter(p => p.id !== positionId));
    toast.success('Position closed successfully!');
  };

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(market => ({
        ...market,
        price: market.price * (1 + (Math.random() - 0.5) * 0.002),
        change: market.change + (Math.random() - 0.5) * 0.1
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Trading Terminal</h2>
          <p className="text-gray-400">Real-time trading across multiple exchanges</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Activity className="h-3 w-3 mr-1" />
            Live Market Data
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Market List */}
        <div className="xl:col-span-1">
          <Card className="bg-black/30 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Markets
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search markets..."
                  className="pl-10 bg-white/10 border-white/20 text-white text-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {marketData.map((market) => (
                  <motion.div
                    key={market.symbol}
                    onClick={() => setSelectedPair(market.symbol)}
                    className={cn(
                      "p-3 cursor-pointer transition-all duration-200 border-l-2",
                      selectedPair === market.symbol
                        ? "bg-purple-500/20 border-purple-500"
                        : "hover:bg-white/5 border-transparent"
                    )}
                    whileHover={{ x: 2 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white text-sm">{market.symbol}</p>
                        <p className="text-xs text-gray-400">{market.exchange}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">
                          ${market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </p>
                        <div className={cn(
                          "flex items-center text-xs",
                          market.change > 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {market.change > 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(market.change).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trading Interface */}
        <div className="xl:col-span-2 space-y-6">
          {/* Price Chart Placeholder */}
          <Card className="bg-black/30 border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">{selectedPair}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={cn(
                    "px-2 py-1",
                    selectedMarket.change > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  )}>
                    {selectedMarket.change > 0 ? '+' : ''}{selectedMarket.change.toFixed(2)}%
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div>
                  <span className="text-gray-400">Price: </span>
                  <span className="text-white font-bold">
                    ${selectedMarket.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">24h High: </span>
                  <span className="text-green-400">${selectedMarket.high.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">24h Low: </span>
                  <span className="text-red-400">${selectedMarket.low.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Volume: </span>
                  <span className="text-white">{selectedMarket.volume}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400 bg-black/20 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Advanced TradingView chart integration</p>
                  <p className="text-sm">Real-time candlestick data</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Form */}
          <Card className="bg-black/30 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Place Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Type Tabs */}
              <Tabs value={orderType} onValueChange={setOrderType}>
                <TabsList className="bg-black/30 border border-white/20 w-full">
                  <TabsTrigger value="market" className="flex-1 data-[state=active]:bg-white/20">
                    Market
                  </TabsTrigger>
                  <TabsTrigger value="limit" className="flex-1 data-[state=active]:bg-white/20">
                    Limit
                  </TabsTrigger>
                  <TabsTrigger value="stop" className="flex-1 data-[state=active]:bg-white/20">
                    Stop
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Buy/Sell Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => setTradeType('buy')}
                  className={cn(
                    "transition-all duration-200",
                    tradeType === 'buy'
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-white/10 hover:bg-white/20 text-gray-400"
                  )}
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Buy
                </Button>
                <Button
                  onClick={() => setTradeType('sell')}
                  className={cn(
                    "transition-all duration-200",
                    tradeType === 'sell'
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white/10 hover:bg-white/20 text-gray-400"
                  )}
                >
                  <ArrowDownRight className="h-4 w-4 mr-2" />
                  Sell
                </Button>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Amount</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              {/* Price Input (for limit orders) */}
              {orderType === 'limit' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Price</label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              )}

              {/* Order Summary */}
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estimated Total:</span>
                  <span className="text-white font-medium">
                    ${amount && (orderType === 'market' ? selectedMarket.price : (price || selectedMarket.price)) 
                      ? (parseFloat(amount || '0') * (orderType === 'market' ? selectedMarket.price : parseFloat(price || '0'))).toLocaleString()
                      : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">Trading Fee (0.1%):</span>
                  <span className="text-white">
                    ${amount && (orderType === 'market' ? selectedMarket.price : (price || selectedMarket.price))
                      ? ((parseFloat(amount || '0') * (orderType === 'market' ? selectedMarket.price : parseFloat(price || '0'))) * 0.001).toFixed(2)
                      : '0.00'}
                  </span>
                </div>
              </div>

              {/* Execute Button */}
              <Button
                onClick={handleTrade}
                disabled={isLoading || !amount}
                className={cn(
                  "w-full font-semibold py-3 transition-all duration-200",
                  tradeType === 'buy'
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Executing...</span>
                  </div>
                ) : (
                  <span>{tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedPair}</span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Account & Positions */}
        <div className="xl:col-span-1 space-y-6">
          {/* Balance */}
          <Card className="bg-black/30 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Wallet className="h-5 w-5 mr-2" />
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center p-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg">
                  <p className="text-sm text-gray-400">Total Balance</p>
                  <p className="text-xl font-bold text-white">
                    {showBalance ? `$${balance.total.toLocaleString()}` : '••••••'}
                  </p>
                </div>
                
                {Object.entries(balance).filter(([key]) => key !== 'total').map(([currency, amount]) => (
                  <div key={currency} className="flex justify-between items-center p-2 bg-white/5 rounded">
                    <span className="text-gray-400 text-sm">{currency}</span>
                    <span className="text-white font-medium">
                      {showBalance ? amount.toLocaleString() : '••••'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Open Positions */}
          <Card className="bg-black/30 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {positions.map((position) => (
                  <div
                    key={position.id}
                    className="p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-white">{position.symbol}</p>
                        <p className="text-xs text-gray-400">
                          {position.type.toUpperCase()} • {position.size}
                        </p>
                      </div>
                      <Badge className={cn(
                        "px-2 py-1 text-xs",
                        position.pnl > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      )}>
                        {position.pnl > 0 ? '+' : ''}${position.pnl.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>Entry: ${position.entry.toLocaleString()}</span>
                      <span>Current: ${position.current.toLocaleString()}</span>
                    </div>
                    <Button
                      onClick={() => closePosition(position.id)}
                      size="sm"
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10 text-xs"
                    >
                      Close Position
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Order History */}
      <Card className="bg-black/30 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {orderHistory.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    order.type === 'buy' ? "bg-green-500/20" : "bg-red-500/20"
                  )}>
                    {order.type === 'buy' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-400" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {order.type.toUpperCase()} {order.symbol}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.amount} @ ${order.price.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-500/20 text-green-400 mb-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {order.status}
                  </Badge>
                  <p className="text-xs text-gray-400">{order.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTradingTerminal;