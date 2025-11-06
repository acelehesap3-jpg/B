export type MarketType = 'crypto' | 'stocks' | 'forex' | 'indices' | 'commodities';

export interface MarketData {
  symbol: string;
  type: MarketType;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
  timestamp: number;
}

export interface MarketSettings {
  type: MarketType;
  defaultTimeframe: string;
  defaultIndicators: string[];
  riskSettings: {
    maxPositionSize: number;
    stopLossPercent: number;
    takeProfitPercent: number;
    trailingStopPercent: number;
  };
}

export interface MarketFeature {
  id: string;
  name: string;
  description: string;
  marketTypes: MarketType[];
  isEnabled: boolean;
  requiredPermissions: string[];
}