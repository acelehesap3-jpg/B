-- Market özellikleri için tablolar
CREATE TABLE IF NOT EXISTS watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS watchlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE,
  market_type TEXT NOT NULL CHECK (market_type IN ('crypto', 'forex', 'stocks', 'indices')),
  symbol TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trading_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  market_type TEXT NOT NULL CHECK (market_type IN ('crypto', 'forex', 'stocks', 'indices')),
  symbol TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price', 'percent_change', 'volume', 'technical')),
  condition TEXT NOT NULL CHECK (condition IN ('above', 'below', 'crosses_up', 'crosses_down')),
  value DECIMAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'triggered', 'disabled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  triggered_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS market_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  market_type TEXT NOT NULL CHECK (market_type IN ('crypto', 'forex', 'stocks', 'indices')),
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('technical', 'fundamental', 'sentiment')),
  indicators JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Otomatik güncelleme tetikleyicileri
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_watchlists_updated_at
  BEFORE UPDATE ON watchlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_analysis_updated_at
  BEFORE UPDATE ON market_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();