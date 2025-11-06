import { MarketType } from '@/types/trading';
import { TradingViewWidget, ResolutionString } from 'react-tradingview-widget';

// Gelişmiş piyasa araçları konfigürasyonu için tip tanımı
export interface MarketToolsConfig {
  name: string;
  description: string;
  features: string[];
  indicators: string[];
  chart: {
    defaultTimeframe: ResolutionString;
    supportedResolutions: ResolutionString[];
    defaultIndicators: string[];
  };
  analysis: {
    technical: string[];
    fundamental: string[];
    sentiment: string[];
    ai: string[]; // Yapay zeka analiz kategorisi
  };
  automations: string[];
  riskManagement: {
    defaultSettings: {
      maxPositionSize: number;
      stopLossPercent: number;
      takeProfitPercent: number;
      trailingStopPercent: number;
      [key: string]: number; // Diğer özel ayarlar için
    };
    features: string[];
  };
  additionalTools: { // Ek özelleştirilmiş araçlar
    name: string;
    description: string;
    tools: string[];
  }[];
}

// Her piyasa türü için özelleştirilmiş araç ve gösterge tanımları
export const MARKET_SPECIFIC_TOOLS: Record<MarketType, MarketToolsConfig> = {
  crypto: {
    name: 'Kripto Para Piyasaları',
    description: 'Yapay zeka destekli gelişmiş kripto para analiz ve alım-satım platformu',
    features: [
      'Derinlik Analizi',
      'Çoklu Arbitraj Tarayıcı',
      'Gelişmiş Zincir Analizi',
      'DEX Agregator',
      'NFT Pazar Analizi',
      'DeFi Protokol İzleme',
      'Stake & Lending Optimizasyonu',
      'ICO/IEO Değerlendirme',
      'Cross-Chain Bridge İzleme',
      'MEV Bot Entegrasyonu',
      'Smart Contract Güvenlik Tarayıcı',
      'Gas Optimizasyonu',
      'Flash Loan Fırsat Tarayıcı',
      'Wallet Profiling',
      'Token Vesting Takibi',
      'DAO Governance İzleme',
      'Layer 2 Analizi',
      'Protokol TVL Takibi'
    ],
    indicators: [
      'MACD',
      'RSI',
      'Bollinger Bands',
      'Moving Averages',
      'Volume Profile',
      'Order Flow',
      'Fibonacci',
      'Network Value Indicators',
      'Whale Transaction Alerts',
      'Mining Profitability',
      'Hash Rate Analysis',
      'Lightning Network Metrics',
      'DeFi Yield Indicators',
      'Token Velocity',
      'Supply Distribution',
      'Exchange Reserve Flow',
      'Mempool Analysis',
      'Gas Price Predictor'
    ],
    chart: {
      defaultTimeframe: '15',
      supportedResolutions: ['1', '5', '15', '30', '60', '240', 'D', 'W'],
      defaultIndicators: ['Volume', 'MA', 'EMA', 'RSI']
    },
    analysis: {
      technical: [
        'Whale Alert',
        'Network Analysis',
        'Mining Difficulty',
        'Exchange Flow Analysis',
        'MEV Analysis',
        'Transaction Graph',
        'Block Space Usage',
        'Network Health',
        'Protocol Metrics',
        'Cross-chain Analysis'
      ],
      fundamental: [
        'Token Metrics',
        'Team Analysis',
        'Development Activity',
        'Community Growth',
        'Protocol Revenue',
        'Token Distribution',
        'Governance Analysis',
        'Competition Analysis',
        'Security Audits',
        'Regulatory Impact'
      ],
      sentiment: [
        'Social Media Analysis',
        'News Sentiment',
        'Fear & Greed Index',
        'Market Dominance',
        'Developer Sentiment',
        'Validator Sentiment',
        'Community Engagement',
        'Influencer Impact',
        'Institutional Interest',
        'Regulatory Sentiment'
      ],
      ai: [
        'Pattern Recognition',
        'Anomaly Detection',
        'Sentiment Analysis',
        'Price Prediction',
        'Risk Assessment',
        'Portfolio Optimization',
        'Market Manipulation Detection',
        'Whale Behavior Analysis'
      ]
    },
    automations: [
      'Grid Trading',
      'DCA Bot',
      'Multi-Exchange Arbitrage',
      'Signal Following',
      'Portfolio Rebalancing',
      'Yield Farming Bot',
      'MEV Bot',
      'Flash Loan Bot',
      'Cross-Chain Arbitrage',
      'Liquidity Provision Bot',
      'Options Market Making',
      'Delta-Neutral Strategy'
    ],
    riskManagement: {
      defaultSettings: {
        maxPositionSize: 5,
        stopLossPercent: 2,
        takeProfitPercent: 6,
        trailingStopPercent: 1,
        maxLeverage: 10,
        minLiquidity: 100000,
        maxSlippage: 1,
        hedgeRatio: 0.5
      },
      features: [
        'Dynamic Position Sizing',
        'Multi-Exchange Risk Control',
        'Volatility Adjustment',
        'Correlation Analysis',
        'Smart Contract Risk',
        'Protocol Risk Score',
        'Liquidity Risk',
        'Counterparty Risk',
        'Cross-Chain Risk',
        'Regulatory Risk'
      ]
    },
    additionalTools: [
      {
        name: 'DeFi Optimizasyon',
        description: 'DeFi protokolleri için optimizasyon araçları',
        tools: [
          'Yield Optimizer',
          'Gas Optimizer',
          'Collateral Manager',
          'Flash Loan Scanner',
          'Protocol Risk Scanner'
        ]
      },
      {
        name: 'NFT Araçları',
        description: 'NFT piyasası için analiz ve trading araçları',
        tools: [
          'Rarity Calculator',
          'Collection Analyzer',
          'Floor Price Tracker',
          'Wash Trading Detector',
          'Metadata Analyzer'
        ]
      },
      {
        name: 'Güvenlik Araçları',
        description: 'Güvenlik ve risk analiz araçları',
        tools: [
          'Contract Auditor',
          'Scam Detector',
          'Permission Analyzer',
          'Transaction Simulator',
          'Risk Score Calculator'
        ]
      }
    ]
  },
  stocks: {
    name: 'Hisse Senedi Piyasaları',
    description: 'Yapay zeka destekli profesyonel hisse senedi analiz platformu',
    features: [
      'Finansal Tablo Analizi',
      'SEC Filing Tarayıcı',
      'Insider Trading İzleme',
      'ESG Skor Analizi',
      'Patent Analizi',
      'Supply Chain Takibi',
      'M&A Aktivite İzleme',
      'Earnings Call Analizi',
      'Rakip Analizi',
      'Pazar Payı Takibi',
      'Regülasyon Etkisi',
      'Yönetim Değişiklikleri',
      'AR/VR Görselleştirme',
      'Sektör Trendleri',
      'Global Makro Etki',
      'Politik Risk Analizi'
    ],
    indicators: [
      'Smart Money Flow',
      'Dark Pool Activity',
      'Options Flow',
      'Unusual Volume',
      'Block Trade Scanner',
      'Institutional Activity',
      'Short Interest Ratio',
      'Gamma Exposure',
      'Put/Call Ratio',
      'DIX & GEX',
      'Market Profile',
      'Volume Profile',
      'VWAP Analysis',
      'Sector Rotation',
      'Money Flow Index',
      'Composite Momentum'
    ],
    chart: {
      defaultTimeframe: 'D',
      supportedResolutions: ['1', '5', '15', '30', '60', 'D', 'W', 'M'],
      defaultIndicators: ['Volume', 'VWAP', 'RSI', 'Money Flow']
    },
    analysis: {
      technical: [
        'Market Profile',
        'Volume Analysis',
        'Order Flow',
        'Market Structure',
        'Dark Pool Activity',
        'Options Chain',
        'Futures Analysis',
        'Statistical Arbitrage',
        'Pairs Trading',
        'Sector Rotation'
      ],
      fundamental: [
        'Financial Statements',
        'Valuation Models',
        'Industry Analysis',
        'Competition Analysis',
        'Supply Chain Analysis',
        'ESG Analysis',
        'Patent Analysis',
        'Management Quality',
        'Brand Value',
        'Market Share'
      ],
      sentiment: [
        'News Impact',
        'Social Media',
        'Analyst Coverage',
        'Insider Activity',
        'Institutional Flows',
        'Options Sentiment',
        'Dark Pool Sentiment',
        'Market Breadth',
        'Retail Sentiment',
        'Sector Sentiment'
      ],
      ai: [
        'Earnings Prediction',
        'Price Target Analysis',
        'Risk Detection',
        'Pattern Recognition',
        'Sentiment Analysis',
        'Anomaly Detection',
        'Trend Prediction',
        'Market Regime'
      ]
    },
    automations: [
      'Earnings Trading',
      'News Trading',
      'Options Strategy',
      'Statistical Arbitrage',
      'Pairs Trading',
      'Market Making',
      'Factor Investing',
      'Smart Beta',
      'Alpha Generation',
      'Sector Rotation',
      'Event-Driven',
      'Dividend Capture'
    ],
    riskManagement: {
      defaultSettings: {
        maxPositionSize: 2,
        stopLossPercent: 1,
        takeProfitPercent: 3,
        trailingStopPercent: 0.5,
        sectorExposure: 20,
        betaTarget: 1,
        correlationLimit: 0.7,
        volatilityTarget: 15
      },
      features: [
        'Position Sizing',
        'Portfolio Optimization',
        'Sector Exposure',
        'Factor Exposure',
        'Beta Management',
        'Correlation Control',
        'VaR Analysis',
        'Stress Testing',
        'Liquidity Risk',
        'Credit Risk'
      ]
    },
    additionalTools: [
      {
        name: 'Kurumsal Analiz',
        description: 'Şirket analizi ve değerleme araçları',
        tools: [
          'Financial Modeler',
          'Valuation Calculator',
          'Peer Comparison',
          'Industry Scanner',
          'Management Scorer'
        ]
      },
      {
        name: 'ESG Analizi',
        description: 'ESG ve sürdürülebilirlik analiz araçları',
        tools: [
          'ESG Scorer',
          'Carbon Footprint',
          'Sustainability Metrics',
          'Social Impact',
          'Governance Rating'
        ]
      },
      {
        name: 'Regülasyon Araçları',
        description: 'Regülasyon ve uyum analiz araçları',
        tools: [
          'SEC Filing Analyzer',
          'Compliance Checker',
          'Insider Activity',
          'Regulatory News',
          'Risk Disclosure'
        ]
      }
    ]
  },
  forex: {
    name: 'Forex Piyasaları',
    description: 'Yapay zeka destekli ileri düzey forex alım-satım platformu',
    features: [
      'Real-time Economic Calendar',
      'Central Bank Analytics',
      'Interest Rate Impact',
      'Currency Flow Analysis',
      'Global Risk Monitor',
      'Political Risk Scanner',
      'Correlation Matrix',
      'Market Regime Detector',
      'Liquidity Analysis',
      'Order Flow Analysis',
      'Cross-Market Impact',
      'Trade Flow Analysis',
      'Volatility Surface',
      'Options Risk Matrix',
      'Swap Point Calculator',
      'Forward Rate Analysis'
    ],
    indicators: [
      'Currency Strength',
      'Relative Strength Matrix',
      'Interest Rate Differentials',
      'Yield Curve Analysis',
      'COT Data Analysis',
      'Order Flow Indicators',
      'Liquidity Flow',
      'Market Stress Index',
      'Global Risk Appetite',
      'Volatility Regime',
      'Correlation Analysis',
      'Currency Momentum',
      'Market Microstructure',
      'Flow Analytics',
      'Positioning Indicators',
      'Cross-Rate Matrix'
    ],
    chart: {
      defaultTimeframe: '15',
      supportedResolutions: ['1', '5', '15', '30', '60', '240', 'D', 'W'],
      defaultIndicators: ['RSI', 'MA', 'BB', 'Currency Strength']
    },
    analysis: {
      technical: [
        'Price Action',
        'Wave Analysis',
        'Market Structure',
        'Order Flow',
        'Liquidity Analysis',
        'Volume Analysis',
        'Volatility Analysis',
        'Correlation Studies',
        'Cross-Rate Analysis',
        'Market Profile'
      ],
      fundamental: [
        'Economic Analysis',
        'Interest Rate Analysis',
        'Trade Balance',
        'GDP Impact',
        'Inflation Analysis',
        'Political Events',
        'Central Bank Policy',
        'Capital Flows',
        'Risk Events',
        'Global Trade'
      ],
      sentiment: [
        'Positioning Analysis',
        'Risk Appetite',
        'Market Sentiment',
        'Flow Analysis',
        'Institutional Activity',
        'Retail Sentiment',
        'Option Sentiment',
        'Market Stress',
        'Global Risk',
        'Regional Sentiment'
      ],
      ai: [
        'Regime Detection',
        'Flow Prediction',
        'Risk Assessment',
        'Pattern Recognition',
        'News Impact Analysis',
        'Sentiment Analysis',
        'Volatility Prediction',
        'Crisis Detection'
      ]
    },
    automations: [
      'News Trading Bot',
      'Carry Trade Bot',
      'Volatility Strategy',
      'Mean Reversion',
      'Trend Following',
      'Grid Trading',
      'Range Trading',
      'Correlation Trading',
      'Risk Parity',
      'Multi-Pair Strategy',
      'Options Strategy',
      'Forward Strategy'
    ],
    riskManagement: {
      defaultSettings: {
        maxPositionSize: 3,
        stopLossPercent: 0.5,
        takeProfitPercent: 1.5,
        trailingStopPercent: 0.3,
        leverageLimit: 20,
        correlationLimit: 0.8,
        volTarget: 12,
        drawdownLimit: 15
      },
      features: [
        'Position Sizing',
        'Leverage Control',
        'Correlation Risk',
        'Volatility Adjustment',
        'Drawdown Control',
        'Gap Risk',
        'Liquidity Risk',
        'Carry Risk',
        'Weekend Risk',
        'Event Risk'
      ]
    },
    additionalTools: [
      {
        name: 'Makro Analiz',
        description: 'Makroekonomik analiz araçları',
        tools: [
          'Economic Calendar',
          'Central Bank Monitor',
          'Interest Rate Analysis',
          'Trade Balance Scanner',
          'Political Risk Gauge'
        ]
      },
      {
        name: 'Flow Analizi',
        description: 'Para akışı ve likidite analiz araçları',
        tools: [
          'Order Flow Analyzer',
          'Liquidity Scanner',
          'Flow Predictor',
          'Volume Profile',
          'Market Impact'
        ]
      },
      {
        name: 'Risk Araçları',
        description: 'Risk yönetimi ve analiz araçları',
        tools: [
          'Position Calculator',
          'Risk Scanner',
          'Correlation Matrix',
          'VaR Calculator',
          'Stress Tester'
        ]
      }
    ]
  },
  indices: {
    name: 'Endeks Piyasaları',
    description: 'Yapay zeka destekli global endeks analiz platformu',
    features: [
      'Constituent Analysis',
      'ETF Comparison',
      'Sector Breakdown',
      'Factor Analysis',
      'Global Macro Impact',
      'Cross-Asset Correlation',
      'Risk Premia Analysis',
      'Market Regime Detection',
      'Sector Rotation Analysis',
      'Beta Decomposition',
      'Style Factor Analysis',
      'Futures Basis',
      'Roll Yield Analysis',
      'Index Arbitrage Scanner',
      'VIX Term Structure',
      'Market Breadth Analysis'
    ],
    indicators: [
      'Market Breadth',
      'Advance/Decline',
      'New High/Low Ratio',
      'McClellan Oscillator',
      'Arms Index (TRIN)',
      'VIX Analysis',
      'Put/Call Ratio',
      'Sector Rotation',
      'Market Profile',
      'Volume Analysis',
      'Money Flow Index',
      'Sector Strength',
      'Breadth Thrust',
      'Index RSI',
      'Volatility Indicators',
      'Beta Indicators'
    ],
    chart: {
      defaultTimeframe: '60',
      supportedResolutions: ['5', '15', '30', '60', 'D', 'W', 'M'],
      defaultIndicators: ['Volume', 'VIX', 'Market Breadth', 'TRIN']
    },
    analysis: {
      technical: [
        'Market Internals',
        'Breadth Analysis',
        'Volume Analysis',
        'Volatility Analysis',
        'Momentum Studies',
        'Sector Analysis',
        'Relative Strength',
        'Intermarket Analysis',
        'Market Profile',
        'Time & Sales'
      ],
      fundamental: [
        'Economic Impact',
        'Earnings Analysis',
        'Sector Weights',
        'Factor Exposure',
        'Global Events',
        'Policy Impact',
        'Macro Trends',
        'Industry Analysis',
        'Geographic Exposure',
        'Style Analysis'
      ],
      sentiment: [
        'VIX Analysis',
        'Put/Call Ratio',
        'Fund Flows',
        'Positioning Data',
        'Market Internals',
        'Investor Surveys',
        'Risk Appetite',
        'Fear & Greed',
        'Options Sentiment',
        'Technical Sentiment'
      ],
      ai: [
        'Regime Detection',
        'Factor Analysis',
        'Risk Prediction',
        'Sentiment Analysis',
        'Pattern Recognition',
        'Anomaly Detection',
        'Trend Prediction',
        'Crisis Detection'
      ]
    },
    automations: [
      'Index Arbitrage',
      'Sector Rotation',
      'VIX Strategy',
      'Market Timing',
      'Factor Strategy',
      'Statistical Arbitrage',
      'Beta Neutral',
      'Risk Premia',
      'Market Making',
      'ETF Arbitrage',
      'Options Strategy',
      'Volatility Trading'
    ],
    riskManagement: {
      defaultSettings: {
        maxPositionSize: 4,
        stopLossPercent: 1,
        takeProfitPercent: 2,
        trailingStopPercent: 0.5,
        betaTarget: 1,
        sectorLimit: 25,
        volTarget: 15,
        drawdownLimit: 10
      },
      features: [
        'Beta Management',
        'Sector Exposure',
        'Factor Exposure',
        'Volatility Control',
        'Correlation Risk',
        'Liquidity Risk',
        'Gap Risk',
        'Tail Risk',
        'Systemic Risk',
        'Event Risk'
      ]
    },
    additionalTools: [
      {
        name: 'Faktör Analizi',
        description: 'Faktör ve stil analiz araçları',
        tools: [
          'Factor Scanner',
          'Style Analysis',
          'Risk Premia',
          'Factor Attribution',
          'Portfolio Tilts'
        ]
      },
      {
        name: 'Market Breadth',
        description: 'Piyasa genişlik analiz araçları',
        tools: [
          'Breadth Scanner',
          'Internal Strength',
          'Market Profile',
          'Sector Heat Map',
          'Rotation Analysis'
        ]
      },
      {
        name: 'Volatilite Araçları',
        description: 'Volatilite analiz ve trading araçları',
        tools: [
          'VIX Analyzer',
          'Term Structure',
          'Skew Analysis',
          'Volatility Surface',
          'Options Strategy'
        ]
      }
    ]
  },
  commodities: {
    name: 'Emtia Piyasaları',
    description: 'Yapay zeka destekli kapsamlı emtia analiz platformu',
    features: [
      'Supply/Demand Analysis',
      'Weather Impact Scanner',
      'Production Analytics',
      'Storage Analysis',
      'Transportation Monitor',
      'Futures Curve Analysis',
      'Physical Market Data',
      'Spread Scanner',
      'Geographic Analysis',
      'Quality Premium',
      'Basis Calculator',
      'Cost Analysis',
      'Logistics Tracker',
      'Processing Margins',
      'Regional Premium',
      'Contract Roll Analysis'
    ],
    indicators: [
      'Seasonality',
      'Supply/Demand Ratio',
      'Storage Levels',
      'Production Rate',
      'Weather Impact',
      'Transportation Cost',
      'Quality Spread',
      'Location Spread',
      'Processing Spread',
      'Roll Yield',
      'Basis Analysis',
      'Term Structure',
      'Inventory Turnover',
      'Capacity Utilization',
      'Price Discovery',
      'Market Structure'
    ],
    chart: {
      defaultTimeframe: 'D',
      supportedResolutions: ['60', '240', 'D', 'W', 'M'],
      defaultIndicators: ['Volume', 'Term Structure', 'Seasonality', 'Basis']
    },
    analysis: {
      technical: [
        'Price Analysis',
        'Spread Analysis',
        'Term Structure',
        'Basis Analysis',
        'Seasonal Patterns',
        'Market Profile',
        'Volume Analysis',
        'Roll Analysis',
        'Calendar Spreads',
        'Geographic Spreads'
      ],
      fundamental: [
        'Supply Analysis',
        'Demand Analysis',
        'Production Data',
        'Storage Levels',
        'Weather Impact',
        'Transportation',
        'Quality Analysis',
        'Processing Capacity',
        'Policy Impact',
        'Global Trade'
      ],
      sentiment: [
        'COT Report',
        'Physical Premium',
        'Market Structure',
        'Trade Flow',
        'Storage Premium',
        'Quality Premium',
        'Geographic Premium',
        'Processing Margins',
        'Market Balance',
        'Regional Demand'
      ],
      ai: [
        'Weather Prediction',
        'Supply Chain Analysis',
        'Demand Forecasting',
        'Price Discovery',
        'Market Regime Detection',
        'Anomaly Detection',
        'Pattern Recognition',
        'Risk Assessment'
      ]
    },
    automations: [
      'Calendar Spread',
      'Location Spread',
      'Quality Spread',
      'Roll Strategy',
      'Storage Strategy',
      'Seasonal Trading',
      'Arbitrage Bot',
      'Processing Spread',
      'Basis Trading',
      'Weather Strategy',
      'Production Strategy',
      'Global Arbitrage'
    ],
    riskManagement: {
      defaultSettings: {
        maxPositionSize: 3,
        stopLossPercent: 1.5,
        takeProfitPercent: 4,
        trailingStopPercent: 0.8,
        storageRisk: 20,
        qualityRisk: 15,
        weatherRisk: 10,
        basisRisk: 5
      },
      features: [
        'Storage Risk',
        'Quality Risk',
        'Weather Risk',
        'Transportation Risk',
        'Basis Risk',
        'Roll Risk',
        'Delivery Risk',
        'Counterparty Risk',
        'Location Risk',
        'Political Risk'
      ]
    },
    additionalTools: [
      {
        name: 'Fiziksel Piyasa',
        description: 'Fiziksel piyasa analiz araçları',
        tools: [
          'Quality Scanner',
          'Location Analysis',
          'Premium Calculator',
          'Storage Monitor',
          'Logistics Tracker'
        ]
      },
      {
        name: 'Üretim Analizi',
        description: 'Üretim ve kapasite analiz araçları',
        tools: [
          'Production Scanner',
          'Capacity Monitor',
          'Cost Analysis',
          'Yield Calculator',
          'Efficiency Metrics'
        ]
      },
      {
        name: 'Hava & İklim',
        description: 'Hava ve iklim analiz araçları',
        tools: [
          'Weather Impact',
          'Climate Analysis',
          'Seasonal Patterns',
          'Natural Events',
          'Long-term Forecasts'
        ]
      }
    ]
  }
};