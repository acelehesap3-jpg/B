export const SUPPORTED_COLD_WALLETS = {
  BTC: 'bc1pzmdep9lzgzswy0nmepvwmexj286kufcfwjfy4fd6dwuedzltntxse9xmz8',
  SOL: 'Gp4itYBqqkNRNYtC22QAPdThPB6Kzx8M1yy2rpXBGxbc',
  TRX: 'THbevzbdxMmUNaN3XFWPkaJe8oSq2C2739',
  ETH: '0x163c9a2fa9eaf8ebc5bb5b8f8e916eb8f24230a1'
};

export const INITIAL_ADMIN = {
  email: 'berkecansuskun1998@gmail.com',
  password: '7892858a',
  role: 'admin'
};

export const OMNI99_TOKEN = {
  name: 'OMNI99',
  symbol: 'OMNI',
  decimals: 18,
  totalSupply: '100000000000000000000000000', // 100M tokens
  commission: 0.001 // 0.1% commission on all trades
};

export const SUPPORTED_MARKETS = {
  crypto: [
    'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'ADA/USDT', 
    'XRP/USDT', 'DOT/USDT', 'DOGE/USDT', 'AVAX/USDT', 'MATIC/USDT'
  ],
  stocks: [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'AMD', 'INTC', 'NFLX'
  ],
  indices: [
    'SPX500', 'NASDAQ', 'DJ30', 'DAX40', 'FTSE100', 'CAC40', 'ASX200', 'NIKKEI', 'HSI'
  ],
  forex: [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 
    'USD/CAD', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY'
  ],
  commodities: [
    'XAUUSD', 'XAGUSD', 'WTIUSD', 'BCOUSD', 'NATGAS'
  ]
};