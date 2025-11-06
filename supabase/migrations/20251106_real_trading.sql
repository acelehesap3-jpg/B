-- Drop existing demo-related tables
DROP TABLE IF EXISTS demo_trades;
DROP TABLE IF EXISTS demo_balances;
DROP TABLE IF EXISTS demo_orders;

-- Create real trading tables
CREATE TABLE trading_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    market_type VARCHAR(20) NOT NULL CHECK (market_type IN ('crypto', 'forex', 'stocks', 'indices')),
    symbol VARCHAR(30) NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('market', 'limit', 'stop', 'stop_limit')),
    quantity DECIMAL NOT NULL,
    price DECIMAL,
    trigger_price DECIMAL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'filled', 'cancelled', 'rejected')),
    exchange VARCHAR(50) NOT NULL,
    external_order_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trading_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    market_type VARCHAR(20) NOT NULL CHECK (market_type IN ('crypto', 'forex', 'stocks', 'indices')),
    symbol VARCHAR(30) NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('long', 'short')),
    entry_price DECIMAL NOT NULL,
    current_price DECIMAL NOT NULL,
    quantity DECIMAL NOT NULL,
    pnl DECIMAL NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'closed')),
    exchange VARCHAR(50) NOT NULL,
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    CONSTRAINT unique_open_position UNIQUE (user_id, market_type, symbol, exchange)
);

CREATE TABLE real_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    market_type VARCHAR(20) NOT NULL CHECK (market_type IN ('crypto', 'forex', 'stocks', 'indices')),
    asset VARCHAR(30) NOT NULL,
    free_balance DECIMAL NOT NULL DEFAULT 0,
    locked_balance DECIMAL NOT NULL DEFAULT 0,
    total_balance DECIMAL NOT NULL DEFAULT 0,
    exchange VARCHAR(50) NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_asset_balance UNIQUE (user_id, market_type, asset, exchange)
);

-- Real-time market data
CREATE TABLE market_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    market_type VARCHAR(20) NOT NULL CHECK (market_type IN ('crypto', 'forex', 'stocks', 'indices')),
    symbol VARCHAR(30) NOT NULL,
    price DECIMAL NOT NULL,
    high_24h DECIMAL,
    low_24h DECIMAL,
    volume_24h DECIMAL,
    change_24h DECIMAL,
    exchange VARCHAR(50) NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trading_orders_updated_at
    BEFORE UPDATE ON trading_orders
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();