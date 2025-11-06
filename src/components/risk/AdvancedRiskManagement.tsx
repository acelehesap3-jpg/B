import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Shield, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Target, 
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Bell,
  Settings,
  Calculator,
  DollarSign,
  Percent,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';

interface RiskMetrics {
  portfolioValue: number;
  totalRisk: number;
  maxDrawdown: number;
  sharpeRatio: number;
  volatility: number;
  var95: number; // Value at Risk 95%
  beta: number;
}

interface Position {
  symbol: string;
  size: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  risk: number;
  pnl: number;
  pnlPercent: number;
}

const AdvancedRiskManagement: React.FC = () => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    portfolioValue: 50000,
    totalRisk: 15.2,
    maxDrawdown: 8.5,
    sharpeRatio: 1.85,
    volatility: 22.3,
    var95: 2850,
    beta: 1.12
  });

  const [positions, setPositions] = useState<Position[]>([
    {
      symbol: 'BTC/USDT',
      size: 0.5,
      entryPrice: 43500,
      currentPrice: 44200,
      stopLoss: 42000,
      takeProfit: 46000,
      risk: 3.4,
      pnl: 350,
      pnlPercent: 1.6
    },
    {
      symbol: 'ETH/USDT',
      size: 8,
      entryPrice: 2600,
      currentPrice: 2650,
      stopLoss: 2450,
      takeProfit: 2800,
      risk: 4.6,
      pnl: 400,
      pnlPercent: 1.9
    },
    {
      symbol: 'ADA/USDT',
      size: 5000,
      entryPrice: 0.45,
      currentPrice: 0.42,
      stopLoss: 0.40,
      takeProfit: 0.52,
      risk: 2.2,
      pnl: -150,
      pnlPercent: -6.7
    }
  ]);

  const [riskSettings, setRiskSettings] = useState({
    maxRiskPerTrade: 2,
    maxPortfolioRisk: 10,
    stopLossEnabled: true,
    takeProfitEnabled: true,
    trailingStopEnabled: false,
    autoRiskAdjustment: true,
    riskRewardRatio: 2,
    maxDrawdownLimit: 15
  });

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'ADA/USDT pozisyonu %5 kayıpta', timestamp: new Date() },
    { id: 2, type: 'info', message: 'Portföy riski %15.2 seviyesinde', timestamp: new Date() },
    { id: 3, type: 'success', message: 'BTC/USDT hedef fiyata yaklaşıyor', timestamp: new Date() }
  ]);

  const calculatePositionSize = (accountBalance: number, riskPercent: number, entryPrice: number, stopLoss: number) => {
    const riskAmount = accountBalance * (riskPercent / 100);
    const priceRisk = Math.abs(entryPrice - stopLoss);
    return riskAmount / priceRisk;
  };

  const getRiskLevel = (risk: number) => {
    if (risk < 5) return { level: 'Düşük', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (risk < 15) return { level: 'Orta', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Yüksek', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const totalRiskLevel = getRiskLevel(riskMetrics.totalRisk);

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${totalRiskLevel.color}`}>
                {riskMetrics.totalRisk}%
              </span>
              <Badge className={totalRiskLevel.bgColor}>
                {totalRiskLevel.level}
              </Badge>
            </div>
            <Progress value={riskMetrics.totalRisk} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-red-600">
                {riskMetrics.maxDrawdown}%
              </span>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <Progress value={riskMetrics.maxDrawdown} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">
                {riskMetrics.sharpeRatio}
              </span>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-xs text-gray-600 mt-2">Risk-adjusted return</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">VaR (95%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">
                ${riskMetrics.var95}
              </span>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-xs text-gray-600 mt-2">1-day potential loss</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Risk Yönetimi Ayarları
          </CardTitle>
          <CardDescription>
            Otomatik risk kontrolü ve pozisyon yönetimi ayarları
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>İşlem Başına Max Risk (%)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Slider
                    value={[riskSettings.maxRiskPerTrade]}
                    onValueChange={(value) => setRiskSettings(prev => ({ ...prev, maxRiskPerTrade: value[0] }))}
                    max={10}
                    min={0.5}
                    step={0.5}
                    className="flex-1"
                  />
                  <span className="w-12 text-sm font-medium">{riskSettings.maxRiskPerTrade}%</span>
                </div>
              </div>

              <div>
                <Label>Portföy Max Risk (%)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Slider
                    value={[riskSettings.maxPortfolioRisk]}
                    onValueChange={(value) => setRiskSettings(prev => ({ ...prev, maxPortfolioRisk: value[0] }))}
                    max={25}
                    min={5}
                    step={1}
                    className="flex-1"
                  />
                  <span className="w-12 text-sm font-medium">{riskSettings.maxPortfolioRisk}%</span>
                </div>
              </div>

              <div>
                <Label>Risk/Ödül Oranı</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Slider
                    value={[riskSettings.riskRewardRatio]}
                    onValueChange={(value) => setRiskSettings(prev => ({ ...prev, riskRewardRatio: value[0] }))}
                    max={5}
                    min={1}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="w-12 text-sm font-medium">1:{riskSettings.riskRewardRatio}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Otomatik Stop-Loss</Label>
                <Switch
                  checked={riskSettings.stopLossEnabled}
                  onCheckedChange={(checked) => setRiskSettings(prev => ({ ...prev, stopLossEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Otomatik Take-Profit</Label>
                <Switch
                  checked={riskSettings.takeProfitEnabled}
                  onCheckedChange={(checked) => setRiskSettings(prev => ({ ...prev, takeProfitEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Trailing Stop</Label>
                <Switch
                  checked={riskSettings.trailingStopEnabled}
                  onCheckedChange={(checked) => setRiskSettings(prev => ({ ...prev, trailingStopEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Otomatik Risk Ayarı</Label>
                <Switch
                  checked={riskSettings.autoRiskAdjustment}
                  onCheckedChange={(checked) => setRiskSettings(prev => ({ ...prev, autoRiskAdjustment: checked }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Pozisyon Risk Analizi
          </CardTitle>
          <CardDescription>
            Açık pozisyonların risk durumu ve yönetimi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positions.map((position, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{position.symbol.split('/')[0]}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{position.symbol}</h4>
                      <p className="text-sm text-gray-600">Size: {position.size}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${position.pnl} ({position.pnlPercent}%)
                    </p>
                    <Badge variant={position.risk < 3 ? 'default' : position.risk < 5 ? 'secondary' : 'destructive'}>
                      Risk: {position.risk}%
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Entry Price</p>
                    <p className="font-semibold">${position.entryPrice}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Current Price</p>
                    <p className="font-semibold">${position.currentPrice}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Stop Loss</p>
                    <p className="font-semibold text-red-600">${position.stopLoss}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Take Profit</p>
                    <p className="font-semibold text-green-600">${position.takeProfit}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3 mr-1" />
                    Ayarla
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calculator className="h-3 w-3 mr-1" />
                    Hesapla
                  </Button>
                  <Button size="sm" variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Kapat
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Position Size Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Pozisyon Boyutu Hesaplayıcı
          </CardTitle>
          <CardDescription>
            Risk bazlı pozisyon boyutu hesaplama
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Hesap Bakiyesi ($)</Label>
                <Input type="number" placeholder="50000" />
              </div>
              <div>
                <Label>Risk Yüzdesi (%)</Label>
                <Input type="number" placeholder="2" />
              </div>
              <div>
                <Label>Giriş Fiyatı ($)</Label>
                <Input type="number" placeholder="44000" />
              </div>
              <div>
                <Label>Stop Loss Fiyatı ($)</Label>
                <Input type="number" placeholder="42000" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Hesaplama Sonucu</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Risk Miktarı:</span>
                    <span className="font-semibold">$1,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fiyat Riski:</span>
                    <span className="font-semibold">$2,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Önerilen Pozisyon:</span>
                    <span className="font-semibold text-blue-600">0.5 BTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk/Ödül Oranı:</span>
                    <span className="font-semibold">1:2</span>
                  </div>
                </div>
              </div>
              <Button className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Hesapla
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Risk Uyarıları
          </CardTitle>
          <CardDescription>
            Gerçek zamanlı risk bildirimleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                alert.type === 'info' ? 'border-blue-500 bg-blue-50' :
                'border-green-500 bg-green-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                    {alert.type === 'info' && <Activity className="h-4 w-4 text-blue-600" />}
                    {alert.type === 'success' && <TrendingUp className="h-4 w-4 text-green-600" />}
                    <span className="text-sm font-medium">{alert.message}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {alert.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedRiskManagement;