-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create OMNI99 token balances table
CREATE TABLE public.omni99_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    balance DECIMAL(20, 8) NOT NULL DEFAULT 0,
    total_purchased DECIMAL(20, 8) NOT NULL DEFAULT 0,
    total_spent DECIMAL(20, 8) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.omni99_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own balance"
ON public.omni99_balances FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all balances"
ON public.omni99_balances FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create payment addresses table
CREATE TABLE public.payment_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blockchain VARCHAR(50) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active payment addresses"
ON public.payment_addresses FOR SELECT
TO authenticated
USING (active = true);

CREATE POLICY "Admins can manage payment addresses"
ON public.payment_addresses FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert payment addresses
INSERT INTO public.payment_addresses (blockchain, address) VALUES
('BTC', 'bc1pzmdep9lzgzswy0nmepvwmexj286kufcfwjfy4fd6dwuedzltntxse9xmz8'),
('ETH', '0x163c9a2fa9eaf8ebc5bb5b8f8e916eb8f24230a1'),
('SOL', 'Gp4itYBqqkNRNYtC22QAPdThPB6Kzx8M1yy2rpXBGxbc'),
('TRX', 'THbevzbdxMmUNaN3XFWPkaJe8oSq2C2739'),
('AVAX', '0x163c9a2fa9eaf8ebc5bb5b8f8e916eb8f24230a1'),
('ARB', '0x163c9a2fa9eaf8ebc5bb5b8f8e916eb8f24230a1');

-- Create crypto_payments table
CREATE TABLE public.crypto_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    blockchain VARCHAR(50) NOT NULL,
    tx_hash TEXT,
    amount_crypto DECIMAL(20, 8) NOT NULL,
    amount_usd DECIMAL(20, 2) NOT NULL,
    omni99_amount DECIMAL(20, 8) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.crypto_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
ON public.crypto_payments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments"
ON public.crypto_payments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
ON public.crypto_payments FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage payments"
ON public.crypto_payments FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create token_transactions table for all OMNI99 movements
CREATE TABLE public.token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    description TEXT,
    reference_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
ON public.token_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
ON public.token_transactions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create transactions"
ON public.token_transactions FOR INSERT
TO authenticated
WITH CHECK (true);

-- Function to update balance and create transaction
CREATE OR REPLACE FUNCTION public.update_omni99_balance(
    p_user_id UUID,
    p_amount DECIMAL,
    p_transaction_type VARCHAR,
    p_description TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert or update balance
    INSERT INTO public.omni99_balances (user_id, balance, total_purchased, updated_at)
    VALUES (p_user_id, p_amount, CASE WHEN p_amount > 0 THEN p_amount ELSE 0 END, now())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        balance = omni99_balances.balance + p_amount,
        total_purchased = CASE 
            WHEN p_amount > 0 THEN omni99_balances.total_purchased + p_amount 
            ELSE omni99_balances.total_purchased 
        END,
        total_spent = CASE 
            WHEN p_amount < 0 THEN omni99_balances.total_spent + ABS(p_amount)
            ELSE omni99_balances.total_spent
        END,
        updated_at = now();
    
    -- Create transaction record
    INSERT INTO public.token_transactions (user_id, amount, transaction_type, description, reference_id)
    VALUES (p_user_id, p_amount, p_transaction_type, p_description, p_reference_id);
END;
$$;

-- Trigger to update updated_at on omni99_balances
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_omni99_balances_updated_at
BEFORE UPDATE ON public.omni99_balances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crypto_payments_updated_at
BEFORE UPDATE ON public.crypto_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();