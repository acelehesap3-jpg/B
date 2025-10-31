import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/navigation/Navbar';
import { Header } from '@/components/trading/Header';
import { ParticleBackground } from '@/components/effects/ParticleBackground';
import { CryptoPayment } from '@/components/web3/CryptoPayment';
import { SwapInterface } from '@/components/web3/SwapInterface';
import { WalletButton } from '@/components/web3/WalletButton';
import { Watchlist } from '@/components/trading/Watchlist';
import { PriceDisplay } from '@/components/trading/PriceDisplay';
import { TradeFeed } from '@/components/trading/TradeFeed';
import { IndicatorControls } from '@/components/trading/IndicatorControls';
import { Terminal } from '@/components/trading/Terminal';
import { OptimizedChart } from '@/components/trading/OptimizedChart';
import { OrderBook } from '@/components/trading/OrderBook';
import { NewsFeed } from '@/components/trading/NewsFeed';
import { MarketSummary } from '@/components/trading/MarketSummary';
import { PerformanceMetrics } from '@/components/trading/PerformanceMetrics';
import { VolumeChart } from '@/components/trading/VolumeChart';
import { TradingSignals } from '@/components/trading/TradingSignals';
import { DepthChart } from '@/components/trading/DepthChart';
import { QuickStats } from '@/components/trading/QuickStats';
import { TimeframeSelector } from '@/components/trading/TimeframeSelector';
import { CandlestickPatterns } from '@/components/trading/CandlestickPatterns';
import { RealHeatmap } from '@/components/trading/RealHeatmap';
import { BuyOmni99 } from '@/components/tokens/BuyOmni99';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { PriceAlerts } from '@/components/trading/PriceAlerts';
import { RiskCalculator } from '@/components/trading/RiskCalculator';
import { EconomicCalendar } from '@/components/trading/EconomicCalendar';
import { MarketSentiment } from '@/components/trading/MarketSentiment';
import { PortfolioTracker } from '@/components/trading/PortfolioTracker';
import { MarketScanner } from '@/components/trading/MarketScanner';
import { OrderPanel } from '@/components/trading/OrderPanel';
import { LiquidityZones } from '@/components/trading/LiquidityZones';
import { HotkeyPanel } from '@/components/trading/HotkeyPanel';
import { TradeJournal } from '@/components/trading/TradeJournal';
import { DrawingTools } from '@/components/trading/DrawingTools';
import { SocialTrading } from '@/components/trading/SocialTrading';
import { AutoTradingSignals } from '@/components/trading/AutoTradingSignals';
import { MultiChartLayout } from '@/components/trading/MultiChartLayout';
import { AdvancedOrderTypes } from '@/components/trading/AdvancedOrderTypes';
import { MarketSelector } from '@/components/trading/MarketSelector';
import { Exchange, DataSource, IndicatorSettings, Timeframe, AssetType } from '@/types/trading';
import { getExchangeDefaults } from '@/lib/exchanges';
import { useTradingData } from '@/hooks/useTradingData';
import { detectCandlestickPatterns } from '@/lib/indicators';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Check if user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      setIsAdmin(!!roleData);
      
      if (roleData) {
        toast.success('Admin Panel Erişimi Aktif', {
          description: 'Yönetici özellikleri kullanıma hazır'
        });
      }
    };

    checkAuth();
  }, [navigate]);

  const [exchange, setExchange] = useState<Exchange>(
    (localStorage.getItem('omni_exchange') as Exchange) || 'BINANCE'
  );
  const [symbol, setSymbol] = useState<string>(
    localStorage.getItem('omni_symbol') || getExchangeDefaults('BINANCE')[0].toLowerCase()
  );
  const [source, setSource] = useState<DataSource>(
    (localStorage.getItem('omni_source') as DataSource) || 'ws'
  );
  const [timeframe, setTimeframe] = useState<Timeframe>(
    (localStorage.getItem('omni_timeframe') as Timeframe) || '15m'
  );
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [assetType, setAssetType] = useState<AssetType>('crypto');
  
  const [indicatorSettings, setIndicatorSettings] = useState<IndicatorSettings>({
    showSMA: true,
    showEMA: true,
    showRSI: true,
    showMACD: false,
    showBB: false,
    showFib: false,
    showPatterns: true,
    smaPeriod: parseInt(localStorage.getItem('omni_sma') || '20'),
    emaPeriod: parseInt(localStorage.getItem('omni_ema') || '20'),
    rsiPeriod: parseInt(localStorage.getItem('omni_rsi') || '14'),
  });

  const [logs, setLogs] = useState<Array<{ message: string; level: 'info' | 'warn' | 'error'; timestamp: Date }>>([]);

  const addLog = useCallback((message: string, level: 'info' | 'warn' | 'error' = 'info') => {
    setLogs(prev => [{ message, level, timestamp: new Date() }, ...prev.slice(0, 199)]);
  }, []);

  const { candles, lastPrice, trades, loading, refetch } = useTradingData(exchange, symbol, source, timeframe);
  
  const detectedPatterns = useMemo(() => {
    if (!indicatorSettings.showPatterns || candles.length < 10) return [];
    return detectCandlestickPatterns(candles);
  }, [candles, indicatorSettings.showPatterns]);

  useEffect(() => {
    const defaults = getExchangeDefaults(exchange).map(s => s.toLowerCase());
    setSymbols(defaults);
    if (!defaults.includes(symbol)) {
      setSymbol(defaults[0]);
    }
  }, [exchange]);

  useEffect(() => {
    localStorage.setItem('omni_exchange', exchange);
    localStorage.setItem('omni_symbol', symbol);
    localStorage.setItem('omni_source', source);
    localStorage.setItem('omni_timeframe', timeframe);
  }, [exchange, symbol, source, timeframe]);

  useEffect(() => {
    if (lastPrice !== null && previousPrice !== null) {
      addLog(`Price updated: $${lastPrice.toFixed(6)}`, 'info');
    }
    setPreviousPrice(lastPrice);
  }, [lastPrice]);

  useEffect(() => {
    addLog(`Trading terminal initialized - ${exchange} / ${symbol.toUpperCase()}`, 'info');
  }, []);

  const handleExchangeChange = (newExchange: Exchange) => {
    setExchange(newExchange);
    const defaults = getExchangeDefaults(newExchange);
    setSymbol(defaults[0].toLowerCase());
    addLog(`Switched to ${newExchange}`, 'info');
    toast.success(`Switched to ${newExchange}`);
  };

  const handleSymbolChange = (newSymbol: string) => {
    setSymbol(newSymbol);
    addLog(`Symbol changed to ${newSymbol.toUpperCase()}`, 'info');
  };

  const handleSourceChange = (newSource: DataSource) => {
    setSource(newSource);
    addLog(`Data source changed to ${newSource.toUpperCase()}`, 'info');
    toast.info(`Using ${newSource.toUpperCase()} data source`);
  };

  const handleRefresh = () => {
    refetch();
    addLog('Manual refresh triggered', 'info');
    toast.success('Data refreshed');
  };

  const handleApplyIndicators = (settings: IndicatorSettings) => {
    setIndicatorSettings(settings);
    localStorage.setItem('omni_sma', settings.smaPeriod.toString());
    localStorage.setItem('omni_ema', settings.emaPeriod.toString());
    localStorage.setItem('omni_rsi', settings.rsiPeriod.toString());
    addLog('Indicators updated', 'info');
    toast.success('Indicators applied');
  };

  if (showAdminPanel && isAdmin) {
    return (
      <>
        <Navbar onAdminClick={() => setShowAdminPanel(false)} isAdmin={isAdmin} />
        <div className="relative min-h-screen pt-24 p-4 animate-fade-in">
          <ParticleBackground />
          <div className="relative z-10 mx-auto max-w-[1800px] space-y-4">
            <div className="glass-panel-strong rounded-2xl p-6 animate-scale-in">
              <AdminPanel />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar onAdminClick={() => setShowAdminPanel(true)} isAdmin={isAdmin} />
      <div className="relative min-h-screen pt-24 p-4 animate-fade-in">
        <ParticleBackground />
        <div className="relative z-10 mx-auto max-w-[1800px] space-y-4">
          <div className="glass-panel-strong rounded-2xl p-4 neon-border-strong animate-slide-fade-down">
            <Header
              exchange={exchange}
              symbol={symbol}
              source={source}
              symbols={symbols}
              onExchangeChange={handleExchangeChange}
              onSymbolChange={handleSymbolChange}
              onSourceChange={handleSourceChange}
              onRefresh={handleRefresh}
            />
          </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr_380px]">
          {/* Left Sidebar */}
          <aside className="glass-panel space-y-4 rounded-2xl p-5 shadow-2xl transition-all duration-300 hover:shadow-primary/10 animate-fade-in-up">
            <Watchlist
              symbols={symbols}
              activeSymbol={symbol}
              onSymbolClick={handleSymbolChange}
            />
            
            <TimeframeSelector
              selected={timeframe}
              onChange={setTimeframe}
            />
            
            <MultiChartLayout />
            
            <DrawingTools />
            
            <IndicatorControls
              settings={indicatorSettings}
              onApply={handleApplyIndicators}
            />

            {indicatorSettings.showPatterns && (
              <CandlestickPatterns patterns={detectedPatterns} />
            )}

            <PerformanceMetrics
              candles={candles}
              currentPrice={lastPrice}
              symbol={symbol}
            />

            <QuickStats symbol={symbol} price={lastPrice} />

            <TradingSignals candles={candles} symbol={symbol} />

            <Terminal logs={logs} />
          </aside>

          {/* Main Chart Area */}
          <main className="glass-panel space-y-4 rounded-2xl p-5 shadow-2xl animate-scale-in gradient-glow">
            <RealHeatmap />
            
            <PriceDisplay
              symbol={symbol}
              price={lastPrice}
              previousPrice={previousPrice}
              source={source.toUpperCase()}
            />

            <OptimizedChart
              candles={candles}
              showSMA={indicatorSettings.showSMA}
              showEMA={indicatorSettings.showEMA}
              showRSI={indicatorSettings.showRSI}
              showMACD={indicatorSettings.showMACD}
              showBB={indicatorSettings.showBB}
              showFib={indicatorSettings.showFib}
              smaPeriod={indicatorSettings.smaPeriod}
              emaPeriod={indicatorSettings.emaPeriod}
              rsiPeriod={indicatorSettings.rsiPeriod}
              symbol={symbol}
            />

            <VolumeChart
              data={candles.map((c) => ({
                x: c.x,
                y: (c.y[1] - c.y[2]) * Math.random() * 1000,
              }))}
            />

            <DepthChart exchange={exchange} symbol={symbol} />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TradeFeed trades={trades} />
              <OrderBook exchange={exchange} symbol={symbol} lastPrice={lastPrice} />
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="glass-panel space-y-4 rounded-2xl p-5 shadow-2xl transition-all duration-300 hover:shadow-primary/10 animate-slide-in-right">
            <BuyOmni99 />
            <WalletButton />
            <MarketSelector 
              onSelectSymbol={(sym, type) => {
                setSymbol(sym.toLowerCase());
                setAssetType(type);
              }} 
              selectedSymbol={symbol}
            />
            <OrderPanel 
              symbol={symbol} 
              currentPrice={lastPrice} 
              assetType={assetType}
              exchange={exchange}
            />
            <AdvancedOrderTypes />
            <PortfolioTracker />
            <AutoTradingSignals />
            <SocialTrading />
            <MarketScanner />
            <MarketSentiment />
            <PriceAlerts />
            <RiskCalculator />
            <LiquidityZones />
            <EconomicCalendar />
            <HotkeyPanel />
            <TradeJournal />
            <SwapInterface />
            <CryptoPayment />
            <MarketSummary exchange={exchange} symbol={symbol} />
            <NewsFeed />
          </aside>
        </div>
      </div>
    </div>
    </>
  );
};

export default Index;
