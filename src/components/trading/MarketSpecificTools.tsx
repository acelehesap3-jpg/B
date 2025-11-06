import React from 'react';
import { MarketType } from '@/types/market';
import { MarketTabs } from '@/components/trading/MarketTabs';

interface MarketSpecificToolsProps {
  marketType: MarketType;
  onMarketChange?: (market: MarketType) => void;
}

export const MarketSpecificTools: React.FC<MarketSpecificToolsProps> = ({
  marketType,
  onMarketChange
}) => {
  return (
    <div className="market-tools">
      <MarketTabs
        initialMarketType={marketType}
        onMarketChange={onMarketChange}
      />
    </div>
  );
};