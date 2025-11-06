import { useState, useEffect, useMemo } from 'react';
import { MarketType } from '@/types/trading';
import { MARKET_SPECIFIC_TOOLS } from '@/lib/config/market-specific-tools';

export function useMarketTools(marketType: MarketType) {
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
  const [activeIndicators, setActiveIndicators] = useState<string[]>([]);

  // Seçili piyasa için tüm araçları getir
  const marketTools = useMemo(() => {
    return MARKET_SPECIFIC_TOOLS[marketType];
  }, [marketType]);

  // Varsayılan göstergeleri yükle
  useEffect(() => {
    if (marketTools) {
      setActiveIndicators(marketTools.chart.defaultIndicators);
    }
  }, [marketTools]);

  // Özellik durumunu değiştir
  const toggleFeature = (feature: string) => {
    setActiveFeatures(prev => 
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  // Gösterge durumunu değiştir
  const toggleIndicator = (indicator: string) => {
    setActiveIndicators(prev =>
      prev.includes(indicator)
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  // Risk yönetimi ayarlarını güncelle
  const updateRiskSettings = (settings: Partial<Record<string, any>>) => {
    // Burada risk yönetimi ayarlarını güncelleyecek mantık eklenebilir
    console.log('Risk settings updated:', settings);
  };

  // Otomasyonları yönet
  const toggleAutomation = (automation: string, params?: Record<string, any>) => {
    // Burada otomasyon başlatma/durdurma mantığı eklenebilir
    console.log('Automation toggled:', automation, params);
  };

  // Analiz verilerini getir
  const getAnalysis = async (type: 'technical' | 'fundamental' | 'sentiment') => {
    // Burada seçilen analiz türüne göre veri getirme mantığı eklenebilir
    const analysisData = marketTools.analysis[type];
    return analysisData;
  };

  return {
    tools: marketTools,
    activeFeatures,
    activeIndicators,
    toggleFeature,
    toggleIndicator,
    updateRiskSettings,
    toggleAutomation,
    getAnalysis,
    defaultTimeframe: marketTools.chart.defaultTimeframe,
    supportedResolutions: marketTools.chart.supportedResolutions,
    riskSettings: marketTools.riskManagement.defaultSettings,
  };
}