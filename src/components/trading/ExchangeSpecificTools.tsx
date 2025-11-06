import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Zap, 
  Shield, 
  Target,
  Bot,
  Coins,
  Gift,
  Rocket,
  Copy,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Crown,
  Gem
} from 'lucide-react';

interface ExchangeSpecificToolsProps {
  exchange: string;
}

// Binance Specific Tools
const BinanceTools: React.FC = () => {
  const [launchpadData, setLaunchpadData] = useState([
    { name: 'PIXEL', status: 'Active', apy: '45.2%', endDate: '2024-12-15' },
    { name: 'PORTAL', status: 'Upcoming', apy: '38.7%', endDate: '2024-12-20' },
    { name: 'AEVO', status: 'Completed', apy: '52.1%', endDate: '2024-11-30' }
  ]);

  const [savingsProducts, setSavingsProducts] = useState([
    { asset: 'USDT', apy: '4.5%', type: 'Flexible', minAmount: '10' },
    { asset: 'BUSD', apy: '5.2%', type: 'Locked 30D', minAmount: '100' },
    { asset: 'BNB', apy: '6.8%', type: 'DeFi Staking', minAmount: '0.1' }
  ]);

  return (
    <div className="space-y-6">
      {/* Launchpad Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-yellow-500" />
            Binance Launchpad
          </CardTitle>
          <CardDescription>
            Participate in new token launches and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {launchpadData.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{project.name.slice(0, 2)}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{project.name}</h4>
                    <p className="text-sm text-gray-600">APY: {project.apy}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={project.status === 'Active' ? 'default' : project.status === 'Upcoming' ? 'secondary' : 'outline'}>
                    {project.status}
                  </Badge>
                  <Button size="sm" disabled={project.status === 'Completed'}>
                    {project.status === 'Active' ? 'Participate' : project.status === 'Upcoming' ? 'Notify Me' : 'View'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Savings & Earn */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Binance Earn Products
          </CardTitle>
          <CardDescription>
            Flexible and locked savings products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savingsProducts.map((product, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{product.asset}</span>
                  <Badge variant="outline">{product.type}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">APY</span>
                    <span className="text-green-600 font-semibold">{product.apy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Min Amount</span>
                    <span className="text-sm">{product.minAmount} {product.asset}</span>
                  </div>
                  <Button className="w-full" size="sm">Subscribe</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* BNB Vault */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            BNB Vault
          </CardTitle>
          <CardDescription>
            Automatic participation in Launchpool, Launchpad, and more
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Auto-Subscribe to New Projects</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span>BNB Balance</span>
              <span className="font-semibold">12.45 BNB</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Estimated Annual Rewards</span>
              <span className="text-green-600 font-semibold">8.2%</span>
            </div>
            <Button className="w-full">
              <Gift className="h-4 w-4 mr-2" />
              Subscribe to BNB Vault
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Bybit Specific Tools
const BybitTools: React.FC = () => {
  const [copyTraders, setCopyTraders] = useState([
    { name: 'CryptoMaster', roi: '+245%', followers: '12.5K', winRate: '78%', risk: 'Medium' },
    { name: 'TradingPro', roi: '+189%', followers: '8.2K', winRate: '82%', risk: 'Low' },
    { name: 'DerivativeKing', roi: '+312%', followers: '15.1K', winRate: '71%', risk: 'High' }
  ]);

  return (
    <div className="space-y-6">
      {/* Copy Trading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-blue-500" />
            Copy Trading
          </CardTitle>
          <CardDescription>
            Follow and copy successful traders automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {copyTraders.map((trader, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{trader.name.slice(0, 2)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{trader.name}</h4>
                      <p className="text-sm text-gray-600">{trader.followers} followers</p>
                    </div>
                  </div>
                  <Badge variant={trader.risk === 'Low' ? 'default' : trader.risk === 'Medium' ? 'secondary' : 'destructive'}>
                    {trader.risk} Risk
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">ROI</p>
                    <p className="font-semibold text-green-600">{trader.roi}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Win Rate</p>
                    <p className="font-semibold">{trader.winRate}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Risk Level</p>
                    <p className="font-semibold">{trader.risk}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">Copy Trade</Button>
                  <Button variant="outline" size="sm">View Profile</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Derivatives Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            Advanced Derivatives
          </CardTitle>
          <CardDescription>
            Professional derivatives trading tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Options Trading</h4>
              <p className="text-sm text-gray-600 mb-3">Trade BTC and ETH options</p>
              <Button className="w-full" size="sm">Open Options</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Perpetual Futures</h4>
              <p className="text-sm text-gray-600 mb-3">Up to 100x leverage</p>
              <Button className="w-full" size="sm">Trade Futures</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Inverse Contracts</h4>
              <p className="text-sm text-gray-600 mb-3">Settle in base currency</p>
              <Button className="w-full" size="sm">Trade Inverse</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">USDC Contracts</h4>
              <p className="text-sm text-gray-600 mb-3">Stable margin trading</p>
              <Button className="w-full" size="sm">Trade USDC</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Bots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-green-500" />
            Trading Bots
          </CardTitle>
          <CardDescription>
            Automated trading strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-semibold">Grid Bot</h4>
                <p className="text-sm text-gray-600">Profit from market volatility</p>
              </div>
              <Button size="sm">Create Bot</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-semibold">DCA Bot</h4>
                <p className="text-sm text-gray-600">Dollar cost averaging</p>
              </div>
              <Button size="sm">Create Bot</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-semibold">Martingale Bot</h4>
                <p className="text-sm text-gray-600">Advanced recovery strategy</p>
              </div>
              <Button size="sm">Create Bot</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// OKX Specific Tools
const OKXTools: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* DeFi Hub */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gem className="h-5 w-5 text-purple-500" />
            OKX DeFi Hub
          </CardTitle>
          <CardDescription>
            Access DeFi protocols directly from OKX
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Yield Farming</h4>
              <p className="text-sm text-gray-600 mb-3">Earn rewards on DeFi protocols</p>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Current APY</span>
                <span className="text-green-600 font-semibold">12.5%</span>
              </div>
              <Button className="w-full" size="sm">Start Farming</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Liquidity Mining</h4>
              <p className="text-sm text-gray-600 mb-3">Provide liquidity and earn</p>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Current APY</span>
                <span className="text-green-600 font-semibold">18.2%</span>
              </div>
              <Button className="w-full" size="sm">Add Liquidity</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Lending</h4>
              <p className="text-sm text-gray-600 mb-3">Lend crypto and earn interest</p>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Current APY</span>
                <span className="text-green-600 font-semibold">8.7%</span>
              </div>
              <Button className="w-full" size="sm">Start Lending</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Staking</h4>
              <p className="text-sm text-gray-600 mb-3">Stake tokens for rewards</p>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Current APY</span>
                <span className="text-green-600 font-semibold">15.3%</span>
              </div>
              <Button className="w-full" size="sm">Stake Now</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NFT Trading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-pink-500" />
            NFT Marketplace
          </CardTitle>
          <CardDescription>
            Trade NFTs with zero fees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg mx-auto mb-2"></div>
                <p className="text-sm font-semibold">Trending</p>
                <p className="text-xs text-gray-600">Hot collections</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg mx-auto mb-2"></div>
                <p className="text-sm font-semibold">Gaming</p>
                <p className="text-xs text-gray-600">Game assets</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg mx-auto mb-2"></div>
                <p className="text-sm font-semibold">Art</p>
                <p className="text-xs text-gray-600">Digital art</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg mx-auto mb-2"></div>
                <p className="text-sm font-semibold">Utility</p>
                <p className="text-xs text-gray-600">Utility NFTs</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">Browse NFTs</Button>
              <Button variant="outline" className="flex-1">Create NFT</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Web3 Wallet Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Web3 Wallet
          </CardTitle>
          <CardDescription>
            Connect to DeFi protocols and dApps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Connected Networks</span>
              <Badge>5 Networks</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>DeFi Protocols</span>
              <Badge>12 Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Total Portfolio Value</span>
              <span className="font-semibold">$45,230.12</span>
            </div>
            <Button className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Connect More dApps
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// KuCoin Specific Tools
const KuCoinTools: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* KuCoin Futures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            KuCoin Futures
          </CardTitle>
          <CardDescription>
            Advanced futures trading with up to 100x leverage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">USDT-M Futures</h4>
              <p className="text-sm text-gray-600 mb-3">USDT margined contracts</p>
              <Button className="w-full" size="sm">Trade USDT-M</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Coin-M Futures</h4>
              <p className="text-sm text-gray-600 mb-3">Coin margined contracts</p>
              <Button className="w-full" size="sm">Trade Coin-M</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Bots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            KuCoin Trading Bots
          </CardTitle>
          <CardDescription>
            Automated trading strategies for all market conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Smart Rebalance</h4>
                <Badge variant="outline">Popular</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">Automatically rebalance your portfolio</p>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Success Rate</span>
                <span className="text-green-600 font-semibold">85%</span>
              </div>
              <Button className="w-full" size="sm">Create Bot</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Infinity Grid</h4>
                <Badge variant="outline">New</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">Advanced grid trading strategy</p>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Avg. Return</span>
                <span className="text-green-600 font-semibold">12.5%</span>
              </div>
              <Button className="w-full" size="sm">Create Bot</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pool-X Staking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-purple-500" />
            Pool-X Staking
          </CardTitle>
          <CardDescription>
            Stake your tokens and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['KCS', 'DOT', 'ATOM', 'ADA'].map((token, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{token}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{token}</h4>
                    <p className="text-sm text-gray-600">Flexible staking</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{(Math.random() * 10 + 5).toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">APY</p>
                </div>
                <Button size="sm">Stake</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Kraken Specific Tools
const KrakenTools: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Margin Trading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-500" />
            Kraken Margin Trading
          </CardTitle>
          <CardDescription>
            Professional margin trading with up to 5x leverage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg text-center">
                <p className="text-sm text-gray-600">Available Margin</p>
                <p className="font-semibold">$12,450.00</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <p className="text-sm text-gray-600">Used Margin</p>
                <p className="font-semibold">$3,200.00</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Leverage</Label>
              <Select defaultValue="2x">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2x">2x Leverage</SelectItem>
                  <SelectItem value="3x">3x Leverage</SelectItem>
                  <SelectItem value="5x">5x Leverage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full">Open Margin Position</Button>
          </div>
        </CardContent>
      </Card>

      {/* Kraken Staking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Kraken Staking
          </CardTitle>
          <CardDescription>
            Secure staking with institutional-grade security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { token: 'ETH', apy: '4.5%', minAmount: '0.00001' },
              { token: 'DOT', apy: '12.0%', minAmount: '1' },
              { token: 'ADA', apy: '4.5%', minAmount: '5' },
              { token: 'ATOM', apy: '8.5%', minAmount: '0.25' }
            ].map((stake, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{stake.token}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{stake.token}</h4>
                    <p className="text-sm text-gray-600">Min: {stake.minAmount} {stake.token}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{stake.apy}</p>
                  <p className="text-sm text-gray-600">APY</p>
                </div>
                <Button size="sm">Stake</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Kraken Pro Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Kraken Pro
          </CardTitle>
          <CardDescription>
            Advanced trading features for professionals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Advanced Orders</h4>
              <p className="text-sm text-gray-600 mb-3">Stop-loss, take-profit, and more</p>
              <Button className="w-full" size="sm">Use Advanced Orders</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">API Trading</h4>
              <p className="text-sm text-gray-600 mb-3">Algorithmic trading support</p>
              <Button className="w-full" size="sm">Setup API</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">OTC Trading</h4>
              <p className="text-sm text-gray-600 mb-3">Large volume trades</p>
              <Button className="w-full" size="sm">Contact OTC</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Institutional</h4>
              <p className="text-sm text-gray-600 mb-3">White-glove service</p>
              <Button className="w-full" size="sm">Learn More</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ExchangeSpecificTools: React.FC<ExchangeSpecificToolsProps> = ({ exchange }) => {
  const renderExchangeTools = () => {
    switch (exchange.toLowerCase()) {
      case 'binance':
        return <BinanceTools />;
      case 'bybit':
        return <BybitTools />;
      case 'okx':
        return <OKXTools />;
      case 'kucoin':
        return <KuCoinTools />;
      case 'kraken':
        return <KrakenTools />;
      default:
        return (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">Select an exchange to view specific tools</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">{exchange.slice(0, 2).toUpperCase()}</span>
        </div>
        <h2 className="text-2xl font-bold">{exchange} Specific Tools</h2>
      </div>
      {renderExchangeTools()}
    </div>
  );
};

export default ExchangeSpecificTools;