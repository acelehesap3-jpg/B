import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  Shield, 
  Globe, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  Star,
  BarChart3,
  Coins,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernLoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onSignUp?: (email: string, password: string) => void;
  isLoading?: boolean;
  error?: string;
}

const ModernLoginScreen: React.FC<ModernLoginScreenProps> = ({ onLogin, onSignUp, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      icon: TrendingUp,
      title: 'Real-Time Trading',
      description: 'Execute trades across 15+ exchanges with lightning speed',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your funds are protected with military-grade encryption',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Professional charts and technical analysis tools',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Coins,
      title: 'OMNI99 Rewards',
      description: 'Earn exclusive tokens for premium features',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const stats = [
    { label: 'Active Traders', value: '50K+', icon: Globe },
    { label: 'Daily Volume', value: '$2.5B', icon: BarChart3 },
    { label: 'Supported Assets', value: '500+', icon: Coins },
    { label: 'Uptime', value: '99.9%', icon: Shield }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding & Features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Logo & Title */}
          <div className="text-center lg:text-left">
            <motion.div 
              className="flex items-center justify-center lg:justify-start space-x-4 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">OMNI TERMINAL</h1>
                <p className="text-purple-300">Professional Trading Platform</p>
              </div>
            </motion.div>

            <motion.p 
              className="text-xl text-gray-300 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Trade cryptocurrencies, stocks, and forex with institutional-grade tools
            </motion.p>
          </div>

          {/* Feature Carousel */}
          <div className="relative h-32">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <Card className="bg-black/30 border-white/20 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center",
                        features[currentSlide].color
                      )}>
                        {React.createElement(features[currentSlide].icon, { className: "h-6 w-6 text-white" })}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {features[currentSlide].title}
                        </h3>
                        <p className="text-gray-300">
                          {features[currentSlide].description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Slide Indicators */}
            <div className="flex justify-center space-x-2 mt-4">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-200",
                    index === currentSlide ? "bg-purple-500 w-8" : "bg-white/30"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-center p-4 bg-black/20 rounded-xl border border-white/10"
              >
                {React.createElement(stat.icon, { className: "h-6 w-6 text-purple-400 mx-auto mb-2" })}
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="bg-black/40 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-white mb-2">
                Welcome Back
              </CardTitle>
              <p className="text-gray-400">
                Sign in to access your trading dashboard
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Sign Up Button */}
              {onSignUp && (
                <div className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onSignUp(email, password)}
                    className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Hesap Oluştur
                  </Button>
                </div>
              )}

              {/* Features List */}
              <div className="space-y-3 pt-4 border-t border-white/20">
                <p className="text-sm font-medium text-gray-300 text-center">
                  What you get:
                </p>
                <div className="space-y-2">
                  {[
                    'Real-time market data',
                    'Advanced trading tools',
                    'Portfolio management',
                    'OMNI99 token rewards'
                  ].map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="flex items-center space-x-2 text-sm text-gray-300"
                    >
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex items-center justify-center space-x-6 mt-6 text-gray-400"
          >
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span className="text-xs">SSL Secured</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4" />
              <span className="text-xs">5-Star Rated</span>
            </div>
            <div className="flex items-center space-x-1">
              <Globe className="h-4 w-4" />
              <span className="text-xs">Global Access</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModernLoginScreen;