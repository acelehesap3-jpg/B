import React from 'react';
import { LineChart, BarChart, Save } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MarketAnalysisProps {
  marketType: 'crypto' | 'forex' | 'stocks' | 'indices';
  symbol: string;
}

export const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ marketType, symbol }) => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('technical');
  const [newAnalysis, setNewAnalysis] = React.useState({
    timeframe: '1h',
    notes: '',
    indicators: {}
  });

  React.useEffect(() => {
    if (user) {
      loadAnalyses();
    }
  }, [user, symbol]);

  const loadAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('market_analysis')
        .select('*')
        .eq('user_id', user?.id)
        .eq('market_type', marketType)
        .eq('symbol', symbol)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error loading analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAnalysis = async () => {
    try {
      const { error } = await supabase
        .from('market_analysis')
        .insert([
          {
            user_id: user?.id,
            market_type: marketType,
            symbol,
            timeframe: newAnalysis.timeframe,
            analysis_type: activeTab,
            indicators: newAnalysis.indicators,
            notes: newAnalysis.notes
          }
        ]);

      if (error) throw error;
      setNewAnalysis({ timeframe: '1h', notes: '', indicators: {} });
      await loadAnalyses();
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  };

  const renderTechnicalAnalysis = () => {
    const indicators = [
      { name: 'RSI', options: ['Aşırı Alım', 'Normal', 'Aşırı Satım'] },
      { name: 'MACD', options: ['Alış Sinyali', 'Satış Sinyali', 'Nötr'] },
      { name: 'Bollinger', options: ['Üst Band', 'Orta Band', 'Alt Band'] },
      { name: 'Trend', options: ['Yükseliş', 'Düşüş', 'Yatay'] }
    ];

    return (
      <div className="space-y-4">
        <Select
          onValueChange={(value) => setNewAnalysis({ ...newAnalysis, timeframe: value })}
          defaultValue={newAnalysis.timeframe}
        >
          <SelectTrigger>
            <SelectValue placeholder="Zaman Aralığı" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5m">5 Dakika</SelectItem>
            <SelectItem value="15m">15 Dakika</SelectItem>
            <SelectItem value="1h">1 Saat</SelectItem>
            <SelectItem value="4h">4 Saat</SelectItem>
            <SelectItem value="1d">Günlük</SelectItem>
          </SelectContent>
        </Select>

        {indicators.map((indicator) => (
          <div key={indicator.name} className="space-y-2">
            <label className="font-medium">{indicator.name}</label>
            <Select
              onValueChange={(value) => setNewAnalysis({
                ...newAnalysis,
                indicators: { ...newAnalysis.indicators, [indicator.name]: value }
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder={`${indicator.name} Değeri`} />
              </SelectTrigger>
              <SelectContent>
                {indicator.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    );
  };

  const renderFundamentalAnalysis = () => {
    return (
      <div className="space-y-4">
        <Select
          onValueChange={(value) => setNewAnalysis({ ...newAnalysis, timeframe: value })}
          defaultValue={newAnalysis.timeframe}
        >
          <SelectTrigger>
            <SelectValue placeholder="Analiz Periyodu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Günlük</SelectItem>
            <SelectItem value="1w">Haftalık</SelectItem>
            <SelectItem value="1m">Aylık</SelectItem>
            <SelectItem value="3m">3 Aylık</SelectItem>
            <SelectItem value="1y">Yıllık</SelectItem>
          </SelectContent>
        </Select>

        {marketType === 'stocks' && (
          <>
            {/* Hisse senetleri için özel metrikler */}
            <div className="space-y-2">
              <label className="font-medium">Şirket Değerlemesi</label>
              <Select
                onValueChange={(value) => setNewAnalysis({
                  ...newAnalysis,
                  indicators: { ...newAnalysis.indicators, valuation: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Değerleme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undervalued">Düşük Değerli</SelectItem>
                  <SelectItem value="fair">Makul Değerli</SelectItem>
                  <SelectItem value="overvalued">Yüksek Değerli</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {marketType === 'forex' && (
          <>
            {/* Forex için özel metrikler */}
            <div className="space-y-2">
              <label className="font-medium">Faiz Farkı Analizi</label>
              <Select
                onValueChange={(value) => setNewAnalysis({
                  ...newAnalysis,
                  indicators: { ...newAnalysis.indicators, interestRate: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Faiz Farkı" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Pozitif</SelectItem>
                  <SelectItem value="neutral">Nötr</SelectItem>
                  <SelectItem value="negative">Negatif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Piyasa Analizi</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="technical">
              <LineChart className="h-4 w-4 mr-2" />
              Teknik
            </TabsTrigger>
            <TabsTrigger value="fundamental">
              <BarChart className="h-4 w-4 mr-2" />
              Temel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="technical" className="space-y-4">
            {renderTechnicalAnalysis()}
          </TabsContent>

          <TabsContent value="fundamental" className="space-y-4">
            {renderFundamentalAnalysis()}
          </TabsContent>

          <div className="mt-4">
            <Textarea
              placeholder="Analiz notları..."
              value={newAnalysis.notes}
              onChange={(e) => setNewAnalysis({ ...newAnalysis, notes: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          <Button onClick={saveAnalysis} className="mt-4">
            <Save className="h-4 w-4 mr-2" />
            Analizi Kaydet
          </Button>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Önceki Analizler</h3>
            {analyses.map((analysis) => (
              <div key={analysis.id} className="border rounded p-3 mb-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium">
                    {analysis.timeframe} - {analysis.analysis_type}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-2">{analysis.notes}</div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
  );
};