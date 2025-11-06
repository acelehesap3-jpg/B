import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { MarketType } from '@/types/market';
import { MARKET_SPECIFIC_TOOLS } from '@/lib/config/market-specific-tools';
import { useMarketTools } from '@/hooks/useMarketTools';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface MarketTabsProps {
  initialMarketType?: MarketType;
  onMarketChange?: (market: MarketType) => void;
}

interface ToolTabProps {
  title: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const ToolTab: React.FC<ToolTabProps> = ({ title, children, isActive }) => (
  <div className={`tool-tab ${isActive ? 'active' : ''} p-4`}>
    <h3 className="text-lg font-semibold mb-3">{title}</h3>
    {children}
  </div>
);

export const MarketTabs: React.FC<MarketTabsProps> = ({
  initialMarketType = 'crypto',
  onMarketChange,
}) => {
  const [selectedMarket, setSelectedMarket] = useState<MarketType>(initialMarketType);
  const { tools, activeFeatures, toggleFeature, activeIndicators, toggleIndicator } = useMarketTools(selectedMarket);

  const markets: MarketType[] = ['crypto', 'stocks', 'forex', 'indices', 'commodities'];

  const handleMarketChange = (market: MarketType) => {
    setSelectedMarket(market);
    onMarketChange?.(market);
  };

  return (
    <div className="w-full px-2 py-16 sm:px-0">
      <Tab.Group onChange={(index) => handleMarketChange(markets[index])}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {markets.map((market) => (
            <Tab
              key={market}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white shadow text-blue-700'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              {MARKET_SPECIFIC_TOOLS[market].name}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-2">
          {markets.map((market) => (
            <Tab.Panel
              key={market}
              className={classNames(
                'rounded-xl bg-white p-3',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
              )}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Sol Panel - Temel Araçlar */}
                <div className="space-y-4">
                  {/* Temel Analiz */}
                  <ToolTab title="Temel Analiz">
                    <div className="grid grid-cols-2 gap-3">
                      {MARKET_SPECIFIC_TOOLS[market].analysis.fundamental.map((tool, idx) => (
                        <button
                          key={idx}
                          className="p-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          {tool}
                        </button>
                      ))}
                    </div>
                  </ToolTab>

                  {/* Teknik Analiz */}
                  <ToolTab title="Teknik Analiz">
                    <div className="grid grid-cols-2 gap-3">
                      {MARKET_SPECIFIC_TOOLS[market].indicators.map((indicator, idx) => (
                        <button
                          key={idx}
                          onClick={() => toggleIndicator(indicator)}
                          className={`p-2 text-sm rounded-lg ${
                            activeIndicators.includes(indicator)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          {indicator}
                        </button>
                      ))}
                    </div>
                  </ToolTab>

                  {/* Özel Araçlar */}
                  <ToolTab title="Özel Araçlar">
                    <div className="grid grid-cols-2 gap-3">
                      {MARKET_SPECIFIC_TOOLS[market].features.map((feature, idx) => (
                        <button
                          key={idx}
                          onClick={() => toggleFeature(feature)}
                          className={`p-2 text-sm rounded-lg ${
                            activeFeatures.includes(feature)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          {feature}
                        </button>
                      ))}
                    </div>
                  </ToolTab>
                </div>

                {/* Sağ Panel - Gelişmiş Özellikler */}
                <div className="space-y-4">
                  {/* Otomasyon Stratejileri */}
                  <ToolTab title="Otomasyon Stratejileri">
                    <div className="grid grid-cols-1 gap-3">
                      {MARKET_SPECIFIC_TOOLS[market].automations.map((automation, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium">{automation}</h4>
                          <button className="mt-2 text-sm text-blue-600 hover:underline">
                            Stratejiyi Yapılandır
                          </button>
                        </div>
                      ))}
                    </div>
                  </ToolTab>

                  {/* Risk Yönetimi */}
                  <ToolTab title="Risk Yönetimi">
                    <div className="space-y-3">
                      {MARKET_SPECIFIC_TOOLS[market].riskManagement.features.map((feature, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium">{feature}</h4>
                          <div className="mt-2 text-sm text-gray-600">
                            {Object.entries(MARKET_SPECIFIC_TOOLS[market].riskManagement.defaultSettings)
                              .map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center">
                                  <span>{key}:</span>
                                  <span className="font-mono">{value}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ToolTab>

                  {/* Piyasa Duyarlılığı */}
                  <ToolTab title="Piyasa Duyarlılığı">
                    <div className="grid grid-cols-1 gap-3">
                      {MARKET_SPECIFIC_TOOLS[market].analysis.sentiment.map((tool, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium">{tool}</h4>
                          <button className="mt-2 text-sm text-blue-600 hover:underline">
                            Analizi Görüntüle
                          </button>
                        </div>
                      ))}
                    </div>
                  </ToolTab>
                </div>
              </div>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};