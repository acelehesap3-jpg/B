import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  Shield, 
  Star,
  Gift,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Plus,
  Minus,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OMNI99TokenSystemProps {
  user: any;
}

const OMNI99TokenSystem: React.FC<OMNI99TokenSystemProps> = ({ user }) => {
  const [balance, setBalance] = useState(0);
  const [purchaseAmount, setPurchaseAmount] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'purchase', amount: 500, status: 'completed', date: '2024-11-06', price: 0.1 },
    { id: 2, type: 'reward', amount: 50, status: 'completed', date: '2024-11-05', price: 0 },
    { id: 3, type: 'purchase', amount: 1000, status: 'pending', date: '2024-11-06', price: 0.1 }
  ]);
  const [rewards, setRewards] = useState({
    daily: { available: true, amount: 10 },
    trading: { volume: 15420, required: 50000, reward: 100 },
    referral: { count: 3, reward: 150 }
  });

  const tokenPrice = 0.10; // $0.10 per OMNI99 token
  const minPurchase = 10;
  const maxPurchase = 10000;

  const purchaseOptions = [
    { amount: 100, bonus: 0, popular: false },
    { amount: 500, bonus: 25, popular: true },
    { amount: 1000, bonus: 100, popular: false },
    { amount: 5000, bonus: 750, popular: false }
  ];

  const benefits = [
    { icon: TrendingUp, title: 'Reduced Trading Fees', description: 'Up to 50% discount on all trades' },
    { icon: Shield, title: 'Premium Features', description: 'Access to advanced trading tools' },
    { icon: Star, title: 'Priority Support', description: '24/7 dedicated customer support' },
    { icon: Gift, title: 'Exclusive Rewards', description: 'Special bonuses and airdrops' }
  ];

  const handlePurchase = async (amount: number) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTransaction = {
        id: Date.now(),
        type: 'purchase' as const,
        amount,
        status: 'pending' as const,
        date: new Date().toISOString().split('T')[0],
        price: tokenPrice
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      toast.success(`Purchase request for ${amount} OMNI99 tokens submitted for admin approval!`);
      
    } catch (error) {
      toast.error('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const claimDailyReward = () => {
    if (rewards.daily.available) {
      setBalance(prev => prev + rewards.daily.amount);
      setRewards(prev => ({
        ...prev,
        daily: { ...prev.daily, available: false }
      }));
      toast.success(`Claimed ${rewards.daily.amount} OMNI99 tokens!`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending': return Clock;
      case 'failed': return AlertCircle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">OMNI99 Token</h2>
          <p className="text-gray-400">Premium utility token for enhanced trading experience</p>
        </div>
        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
          <Coins className="h-4 w-4 mr-1" />
          ${tokenPrice} per token
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Coins className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-white">Your Balance</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-4xl font-bold text-white mb-2">{balance.toLocaleString()}</p>
              <p className="text-orange-300">OMNI99 Tokens</p>
              <p className="text-sm text-gray-400 mt-2">
                ≈ ${(balance * tokenPrice).toFixed(2)} USD
              </p>
            </CardContent>
          </Card>

          {/* Daily Reward */}
          <Card className="bg-black/30 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Gift className="h-5 w-5 mr-2 text-purple-400" />
                Daily Reward
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{rewards.daily.amount} OMNI99</p>
                  <p className="text-sm text-gray-400">Daily bonus</p>
                </div>
                <Button
                  onClick={claimDailyReward}
                  disabled={!rewards.daily.available}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {rewards.daily.available ? 'Claim' : 'Claimed'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Trading Progress */}
          <Card className="bg-black/30 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                Trading Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Volume Progress</span>
                  <span className="text-white">${rewards.trading.volume.toLocaleString()} / ${rewards.trading.required.toLocaleString()}</span>
                </div>
                <Progress 
                  value={(rewards.trading.volume / rewards.trading.required) * 100} 
                  className="h-2"
                />
                <p className="text-sm text-gray-400">
                  Earn {rewards.trading.reward} OMNI99 tokens when you reach ${rewards.trading.required.toLocaleString()} trading volume
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purchase Options */}
          <Card className="bg-black/30 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Purchase OMNI99 Tokens</CardTitle>
              <p className="text-gray-400">Choose your package and unlock premium features</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {purchaseOptions.map((option, index) => (
                  <motion.div
                    key={option.amount}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={cn(
                        "cursor-pointer transition-all duration-200 border-2",
                        option.popular 
                          ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50" 
                          : "bg-black/20 border-white/20 hover:border-white/40",
                        purchaseAmount === option.amount && "ring-2 ring-purple-500"
                      )}
                      onClick={() => setPurchaseAmount(option.amount)}
                    >
                      <CardContent className="p-4">
                        {option.popular && (
                          <Badge className="mb-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                            Most Popular
                          </Badge>
                        )}
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white">{option.amount}</p>
                          <p className="text-sm text-gray-400 mb-2">OMNI99 Tokens</p>
                          <p className="text-lg font-semibold text-green-400">
                            ${(option.amount * tokenPrice).toFixed(2)}
                          </p>
                          {option.bonus > 0 && (
                            <p className="text-sm text-orange-400 mt-1">
                              +{option.bonus} bonus tokens
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Custom Amount
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                        min={minPurchase}
                        max={maxPurchase}
                        className="bg-white/10 border-white/20 text-white pr-20"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        OMNI99
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-2">Total Cost</p>
                    <p className="text-xl font-bold text-white">
                      ${(purchaseAmount * tokenPrice).toFixed(2)}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => handlePurchase(purchaseAmount)}
                  disabled={isLoading || purchaseAmount < minPurchase || purchaseAmount > maxPurchase}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Purchase Tokens</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  * All purchases require admin approval and may take 24-48 hours to process
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="bg-black/30 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Token Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <benefit.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{benefit.title}</h4>
                      <p className="text-sm text-gray-400">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction History */}
      <Card className="bg-black/30 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((tx) => {
              const StatusIcon = getStatusIcon(tx.status);
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      tx.type === 'purchase' ? "bg-orange-500/20" : "bg-green-500/20"
                    )}>
                      {tx.type === 'purchase' ? (
                        <CreditCard className="h-5 w-5 text-orange-400" />
                      ) : (
                        <Gift className="h-5 w-5 text-green-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {tx.type === 'purchase' ? 'Token Purchase' : 'Reward'}
                      </p>
                      <p className="text-sm text-gray-400">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">+{tx.amount} OMNI99</p>
                    {tx.price > 0 && (
                      <p className="text-sm text-gray-400">${(tx.amount * tx.price).toFixed(2)}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusIcon className={cn("h-4 w-4", getStatusColor(tx.status))} />
                    <span className={cn("text-sm capitalize", getStatusColor(tx.status))}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OMNI99TokenSystem;