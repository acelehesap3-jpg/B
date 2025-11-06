import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Wallet, 
  Settings, 
  BarChart3, 
  Zap,
  Shield,
  Globe,
  Coins,
  CreditCard,
  Users,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  Star,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernTradingInterfaceProps {
  user: any;
  onLogout: () => void;
}

const ModernTradingInterface: React.FC<ModernTradingInterfaceProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(3);
  const [balance, setBalance] = useState({ demo: 99320.98, omni99: 0.00 });
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
    { id: 'trading', label: 'Trading', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet, color: 'from-purple-500 to-pink-500' },
    { id: 'omni99', label: 'OMNI99', icon: Coins, color: 'from-orange-500 to-red-500' },
    { id: 'admin', label: 'Admin', icon: Shield, color: 'from-indigo-500 to-purple-500' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-slate-500' }
  ];

  const marketData = [
    { symbol: 'BTC/USDT', price: 67902.36, change: 2.45, volume: '1.2B' },
    { symbol: 'ETH/USDT', price: 3379.01, change: -1.23, volume: '890M' },
    { symbol: 'SOL/USDT', price: 158.15, change: 5.67, volume: '456M' },
    { symbol: 'ADA/USDT', price: 0.534, change: -0.89, volume: '234M' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-50 bg-black/20 backdrop-blur-xl border-b border-white/10"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-white/10"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">OMNI TERMINAL</h1>
                <p className="text-xs text-gray-400">Professional Trading Platform</p>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search markets..."
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Balance */}
            <Card className="bg-black/30 border-white/20">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                    className="p-1 h-auto text-gray-400 hover:text-white"
                  >
                    {isBalanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <div>
                    <p className="text-xs text-gray-400">Total Balance</p>
                    <p className="text-sm font-bold text-white">
                      {isBalanceVisible ? `$${balance.demo.toLocaleString()}` : '••••••'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/10">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-xs">
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-white hover:bg-white/10"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-80 bg-black/20 backdrop-blur-xl border-r border-white/10 relative z-40"
            >
              <div className="p-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                        activeTab === tab.id
                          ? "bg-gradient-to-r " + tab.color + " text-white shadow-lg"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                      {activeTab === tab.id && (
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      )}
                    </motion.button>
                  ))}
                </nav>

                {/* Quick Stats */}
                <div className="mt-8 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Quick Stats
                  </h3>
                  {marketData.map((item, index) => (
                    <motion.div
                      key={item.symbol}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{item.symbol}</p>
                        <p className="text-xs text-gray-400">{item.volume}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">
                          ${item.price.toLocaleString()}
                        </p>
                        <div className={cn(
                          "flex items-center text-xs",
                          item.change > 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {item.change > 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(item.change)}%
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full p-6"
            >
              {activeTab === 'dashboard' && <DashboardContent />}
              {activeTab === 'trading' && <TradingContent user={user} />}
              {activeTab === 'portfolio' && <PortfolioContent />}
              {activeTab === 'omni99' && <OMNI99Content user={user} />}
              {activeTab === 'admin' && <AdminContent user={user} />}
              {activeTab === 'settings' && <SettingsContent />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-3xl font-bold text-white">Dashboard</h2>
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        <Activity className="h-3 w-3 mr-1" />
        Live
      </Badge>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { title: 'Total Balance', value: '$99,320.98', change: '+2.45%', color: 'from-green-500 to-emerald-500' },
        { title: 'Today P&L', value: '+$1,234.56', change: '+5.67%', color: 'from-blue-500 to-cyan-500' },
        { title: 'Open Positions', value: '3', change: '+1', color: 'from-purple-500 to-pink-500' },
        { title: 'OMNI99 Tokens', value: '0.00', change: '0%', color: 'from-orange-500 to-red-500' }
      ].map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-black/30 border-white/20 hover:bg-black/40 transition-all duration-200">
            <CardContent className="p-6">
              <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-r mb-4 flex items-center justify-center", stat.color)}>
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-green-400">{stat.change}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>

    {/* Chart Area */}
    <Card className="bg-black/30 border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Advanced charts loading...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Trading Content Component
const TradingContent = ({ user }: { user: any }) => {
  const [RealTradingTerminal, setRealTradingTerminal] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    import('./RealTradingTerminal').then((module) => {
      setRealTradingTerminal(() => module.default);
    });
  }, []);

  if (!RealTradingTerminal) {
    return (
      <div className="text-center text-gray-400 mt-20">
        <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p>Loading advanced trading terminal...</p>
      </div>
    );
  }

  return <RealTradingTerminal user={user} />;
};

// Portfolio Content Component
const PortfolioContent = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-white">Portfolio</h2>
    <div className="text-center text-gray-400 mt-20">
      <Wallet className="h-16 w-16 mx-auto mb-4 opacity-50" />
      <p>Portfolio management loading...</p>
    </div>
  </div>
);

// OMNI99 Content Component
const OMNI99Content = ({ user }: { user: any }) => {
  const [OMNI99TokenSystem, setOMNI99TokenSystem] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    import('./OMNI99TokenSystem').then((module) => {
      setOMNI99TokenSystem(() => module.default);
    });
  }, []);

  if (!OMNI99TokenSystem) {
    return (
      <div className="text-center text-gray-400 mt-20">
        <Coins className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p>Loading OMNI99 token system...</p>
      </div>
    );
  }

  return <OMNI99TokenSystem user={user} />;
};

// Admin Content Component
const AdminContent = ({ user }: { user: any }) => {
  const [AdvancedAdminPanel, setAdvancedAdminPanel] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    import('./AdvancedAdminPanel').then((module) => {
      setAdvancedAdminPanel(() => module.default);
    });
  }, []);

  if (!AdvancedAdminPanel) {
    return (
      <div className="text-center text-gray-400 mt-20">
        <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return <AdvancedAdminPanel user={user} />;
};

// Settings Content Component
const SettingsContent = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-white">Settings</h2>
    <div className="text-center text-gray-400 mt-20">
      <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
      <p>Settings panel loading...</p>
    </div>
  </div>
);

export default ModernTradingInterface;