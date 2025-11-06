// ===========================================
// OMNI TRADING TERMINAL - API CONFIGURATION
// ===========================================

export interface ExchangeConfig {
  apiKey: string;
  secretKey: string;
  passphrase?: string;
  testnet?: boolean;
  sandbox?: boolean;
}

export interface ApiConfig {
  // Cryptocurrency Exchanges
  binance: ExchangeConfig;
  coinbase: ExchangeConfig;
  kraken: ExchangeConfig;
  okx: ExchangeConfig;
  bybit: ExchangeConfig;
  kucoin: ExchangeConfig;
  
  // Stock Market APIs
  alphaVantage: { apiKey: string };
  iexCloud: { apiKey: string };
  polygon: { apiKey: string };
  finnhub: { apiKey: string };
  
  // Forex APIs
  oanda: { 
    apiKey: string; 
    accountId: string; 
    environment: 'practice' | 'live';
  };
  fxcm: { apiKey: string; secretKey: string };
  
  // Commodities & Indices
  quandl: { apiKey: string };
  marketstack: { apiKey: string };
  
  // Cold Wallet Addresses
  coldWallets: {
    btc: string;
    eth: string;
    bsc: string;
    polygon: string;
    solana: string;
    tron: string;
  };
  
  // Web3 Configuration
  web3: {
    walletConnectProjectId: string;
  };
  
  // Trading Configuration
  trading: {
    enableRealTrading: boolean;
    maxPositionSize: number;
    maxDailyLoss: number;
    enableStopLoss: boolean;
  };
  
  // Supabase
  supabase: {
    url: string;
    anonKey: string;
  };
}

// Load configuration from environment variables
export const apiConfig: ApiConfig = {
  binance: {
    apiKey: import.meta.env.VITE_BINANCE_API_KEY || '',
    secretKey: import.meta.env.VITE_BINANCE_SECRET_KEY || '',
    testnet: import.meta.env.VITE_BINANCE_TESTNET === 'true',
  },
  
  coinbase: {
    apiKey: import.meta.env.VITE_COINBASE_API_KEY || '',
    secretKey: import.meta.env.VITE_COINBASE_SECRET_KEY || '',
    passphrase: import.meta.env.VITE_COINBASE_PASSPHRASE || '',
    sandbox: import.meta.env.VITE_COINBASE_SANDBOX === 'true',
  },
  
  kraken: {
    apiKey: import.meta.env.VITE_KRAKEN_API_KEY || '',
    secretKey: import.meta.env.VITE_KRAKEN_SECRET_KEY || '',
  },
  
  okx: {
    apiKey: import.meta.env.VITE_OKX_API_KEY || '',
    secretKey: import.meta.env.VITE_OKX_SECRET_KEY || '',
    passphrase: import.meta.env.VITE_OKX_PASSPHRASE || '',
  },
  
  bybit: {
    apiKey: import.meta.env.VITE_BYBIT_API_KEY || '',
    secretKey: import.meta.env.VITE_BYBIT_SECRET_KEY || '',
  },
  
  kucoin: {
    apiKey: import.meta.env.VITE_KUCOIN_API_KEY || '',
    secretKey: import.meta.env.VITE_KUCOIN_SECRET_KEY || '',
    passphrase: import.meta.env.VITE_KUCOIN_PASSPHRASE || '',
  },
  
  alphaVantage: {
    apiKey: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || '',
  },
  
  iexCloud: {
    apiKey: import.meta.env.VITE_IEX_CLOUD_API_KEY || '',
  },
  
  polygon: {
    apiKey: import.meta.env.VITE_POLYGON_API_KEY || '',
  },
  
  finnhub: {
    apiKey: import.meta.env.VITE_FINNHUB_API_KEY || '',
  },
  
  oanda: {
    apiKey: import.meta.env.VITE_OANDA_API_KEY || '',
    accountId: import.meta.env.VITE_OANDA_ACCOUNT_ID || '',
    environment: (import.meta.env.VITE_OANDA_ENVIRONMENT as 'practice' | 'live') || 'practice',
  },
  
  fxcm: {
    apiKey: import.meta.env.VITE_FXCM_API_KEY || '',
    secretKey: import.meta.env.VITE_FXCM_SECRET_KEY || '',
  },
  
  quandl: {
    apiKey: import.meta.env.VITE_QUANDL_API_KEY || '',
  },
  
  marketstack: {
    apiKey: import.meta.env.VITE_MARKETSTACK_API_KEY || '',
  },
  
  coldWallets: {
    btc: import.meta.env.VITE_BTC_COLD_WALLET || '',
    eth: import.meta.env.VITE_ETH_COLD_WALLET || '',
    bsc: import.meta.env.VITE_BSC_COLD_WALLET || '',
    polygon: import.meta.env.VITE_POLYGON_COLD_WALLET || '',
    solana: import.meta.env.VITE_SOLANA_COLD_WALLET || '',
    tron: import.meta.env.VITE_TRON_COLD_WALLET || '',
  },
  
  web3: {
    walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
  },
  
  trading: {
    enableRealTrading: import.meta.env.VITE_ENABLE_REAL_TRADING === 'true',
    maxPositionSize: Number(import.meta.env.VITE_MAX_POSITION_SIZE) || 10000,
    maxDailyLoss: Number(import.meta.env.VITE_MAX_DAILY_LOSS) || 1000,
    enableStopLoss: import.meta.env.VITE_ENABLE_STOP_LOSS !== 'false',
  },
  
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
};

// Validation functions
export const validateApiConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check Supabase configuration
  if (!apiConfig.supabase.url) {
    errors.push('Supabase URL is required');
  }
  if (!apiConfig.supabase.anonKey) {
    errors.push('Supabase anonymous key is required');
  }
  
  // Check Web3 configuration
  if (!apiConfig.web3.walletConnectProjectId) {
    errors.push('WalletConnect Project ID is required for Web3 functionality');
  }
  
  // Check cold wallet addresses
  const requiredWallets = ['btc', 'eth'] as const;
  requiredWallets.forEach(wallet => {
    if (!apiConfig.coldWallets[wallet]) {
      errors.push(`${wallet.toUpperCase()} cold wallet address is required`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to check if an exchange is configured
export const isExchangeConfigured = (exchange: keyof ApiConfig): boolean => {
  const config = apiConfig[exchange];
  if (typeof config === 'object' && 'apiKey' in config) {
    return Boolean(config.apiKey);
  }
  return false;
};

// Helper function to get available exchanges
export const getAvailableExchanges = (): string[] => {
  const exchanges = ['binance', 'coinbase', 'kraken', 'okx', 'bybit', 'kucoin'] as const;
  return exchanges.filter(exchange => isExchangeConfigured(exchange));
};

// Helper function to get available data providers
export const getAvailableDataProviders = (): { 
  crypto: string[]; 
  stocks: string[]; 
  forex: string[]; 
  commodities: string[] 
} => {
  return {
    crypto: getAvailableExchanges(),
    stocks: [
      apiConfig.alphaVantage.apiKey && 'alphaVantage',
      apiConfig.iexCloud.apiKey && 'iexCloud',
      apiConfig.polygon.apiKey && 'polygon',
      apiConfig.finnhub.apiKey && 'finnhub'
    ].filter(Boolean) as string[],
    forex: [
      apiConfig.oanda.apiKey && 'oanda',
      apiConfig.fxcm.apiKey && 'fxcm'
    ].filter(Boolean) as string[],
    commodities: [
      apiConfig.quandl.apiKey && 'quandl',
      apiConfig.marketstack.apiKey && 'marketstack'
    ].filter(Boolean) as string[]
  };
};

export default apiConfig;