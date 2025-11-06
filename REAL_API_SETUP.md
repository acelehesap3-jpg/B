# 🚀 OMNI TRADING TERMINAL - REAL API SETUP GUIDE

Bu rehber, Omni Trading Terminal'inin gerçek API entegrasyonlarını nasıl kuracağınızı gösterir.

## 📋 İçindekiler

1. [Genel Kurulum](#genel-kurulum)
2. [Kripto Para Borsaları](#kripto-para-borsaları)
3. [Hisse Senedi API'leri](#hisse-senedi-apileri)
4. [Forex API'leri](#forex-apileri)
5. [Soğuk Cüzdan Kurulumu](#soğuk-cüzdan-kurulumu)
6. [Güvenlik Ayarları](#güvenlik-ayarları)
7. [Test ve Doğrulama](#test-ve-doğrulama)

## 🔧 Genel Kurulum

### 1. Environment Dosyasını Oluşturun

```bash
cp .env.example .env
```

### 2. Supabase Kurulumu (Zorunlu)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. WalletConnect Kurulumu (Web3 için zorunlu)

```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

[WalletConnect Cloud](https://cloud.walletconnect.com/) üzerinden proje oluşturun.

## 💰 Kripto Para Borsaları

### Binance API Kurulumu

1. [Binance API Management](https://www.binance.com/en/my/settings/api-management) sayfasına gidin
2. Yeni API Key oluşturun
3. IP kısıtlaması ekleyin (güvenlik için)
4. Spot Trading iznini aktifleştirin

```env
VITE_BINANCE_API_KEY=your_api_key
VITE_BINANCE_SECRET_KEY=your_secret_key
VITE_BINANCE_TESTNET=true  # Test için true, canlı için false
```

### Coinbase Pro API Kurulumu

1. [Coinbase Pro API](https://pro.coinbase.com/profile/api) sayfasına gidin
2. Yeni API Key oluşturun
3. View ve Trade izinlerini verin

```env
VITE_COINBASE_API_KEY=your_api_key
VITE_COINBASE_SECRET_KEY=your_secret_key
VITE_COINBASE_PASSPHRASE=your_passphrase
VITE_COINBASE_SANDBOX=true  # Test için true
```

### Diğer Borsalar

**Kraken:**
```env
VITE_KRAKEN_API_KEY=your_api_key
VITE_KRAKEN_SECRET_KEY=your_secret_key
```

**OKX:**
```env
VITE_OKX_API_KEY=your_api_key
VITE_OKX_SECRET_KEY=your_secret_key
VITE_OKX_PASSPHRASE=your_passphrase
```

## 📈 Hisse Senedi API'leri

### Alpha Vantage (Ücretsiz)

1. [Alpha Vantage](https://www.alphavantage.co/support/#api-key) üzerinden ücretsiz API key alın
2. Günlük 500 istek limiti vardır

```env
VITE_ALPHA_VANTAGE_API_KEY=your_api_key
```

### Polygon.io (Ücretli)

1. [Polygon.io](https://polygon.io/) üzerinden hesap oluşturun
2. Aylık plan seçin (başlangıç $99/ay)

```env
VITE_POLYGON_API_KEY=your_api_key
```

### Finnhub (Freemium)

1. [Finnhub](https://finnhub.io/) üzerinden ücretsiz hesap oluşturun
2. Günlük 60 istek limiti vardır

```env
VITE_FINNHUB_API_KEY=your_api_key
```

## 💱 Forex API'leri

### OANDA API Kurulumu

1. [OANDA](https://www.oanda.com/account/tpa/personal_token) üzerinden hesap oluşturun
2. Practice hesabı ile başlayın (ücretsiz)
3. Personal Access Token oluşturun

```env
VITE_OANDA_API_KEY=your_api_key
VITE_OANDA_ACCOUNT_ID=your_account_id
VITE_OANDA_ENVIRONMENT=practice  # practice veya live
```

## 🔐 Soğuk Cüzdan Kurulumu

### Bitcoin Cüzdanı

```env
VITE_BTC_COLD_WALLET=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
```

### Ethereum ve ERC-20 Tokenlar

```env
VITE_ETH_COLD_WALLET=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
```

### Binance Smart Chain

```env
VITE_BSC_COLD_WALLET=0x8894E0a0c962CB723c1976a4421c95949bE2D4E3
```

### Polygon

```env
VITE_POLYGON_COLD_WALLET=0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed
```

### Solana

```env
VITE_SOLANA_COLD_WALLET=9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
```

## ⚙️ Trading Konfigürasyonu

### Güvenlik Ayarları

```env
# Gerçek trading'i aktifleştir (dikkatli olun!)
VITE_ENABLE_REAL_TRADING=false

# Risk yönetimi
VITE_MAX_POSITION_SIZE=10000  # Maksimum pozisyon büyüklüğü ($)
VITE_MAX_DAILY_LOSS=1000      # Maksimum günlük zarar ($)
VITE_ENABLE_STOP_LOSS=true    # Stop loss aktif
```

## 🗄️ Supabase Veritabanı Tabloları

Aşağıdaki tabloları Supabase'de oluşturun:

### 1. token_purchase_requests

```sql
CREATE TABLE token_purchase_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT NOT NULL,
  blockchain TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT NOT NULL,
  tx_hash TEXT,
  wallet_address TEXT NOT NULL,
  omni_tokens_requested DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  completed_at TIMESTAMP,
  approved_by UUID
);
```

### 2. user_token_balances

```sql
CREATE TABLE user_token_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  omni_balance DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. orders

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  exchange TEXT NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  type TEXT NOT NULL,
  price DECIMAL NOT NULL,
  amount DECIMAL NOT NULL,
  filled DECIMAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  external_order_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. balances

```sql
CREATE TABLE balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  exchange TEXT NOT NULL,
  asset TEXT NOT NULL,
  amount DECIMAL DEFAULT 0,
  free DECIMAL DEFAULT 0,
  locked DECIMAL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, exchange, asset)
);
```

### 5. cold_wallets

```sql
CREATE TABLE cold_wallets (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  address TEXT NOT NULL,
  chain TEXT NOT NULL,
  currency TEXT NOT NULL,
  min_amount DECIMAL NOT NULL,
  enabled BOOLEAN DEFAULT true,
  label TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 6. micro_payments

```sql
CREATE TABLE micro_payments (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  order_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT NOT NULL,
  chain TEXT NOT NULL,
  tx_hash TEXT,
  status TEXT DEFAULT 'pending',
  fee_amount DECIMAL DEFAULT 0,
  exchange_fee DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

## 🧪 Test ve Doğrulama

### 1. API Bağlantılarını Test Edin

```bash
npm run dev
```

Tarayıcıda konsolu açın ve API bağlantılarını kontrol edin.

### 2. Test Trading

1. `VITE_ENABLE_REAL_TRADING=false` olarak ayarlayın
2. Testnet/sandbox modlarını kullanın
3. Küçük miktarlarla test yapın

### 3. Güvenlik Kontrolleri

- [ ] API keyler doğru izinlere sahip
- [ ] IP kısıtlamaları aktif
- [ ] Testnet modları aktif
- [ ] Stop loss limitleri ayarlanmış
- [ ] Soğuk cüzdan adresleri doğru

## 🚨 Güvenlik Uyarıları

⚠️ **DİKKAT:** Gerçek trading büyük finansal riskler içerir!

1. **Küçük başlayın:** İlk işlemlerinizi küçük miktarlarla yapın
2. **Test edin:** Tüm fonksiyonları testnet'te test edin
3. **API güvenliği:** API keylerini güvenli tutun
4. **Risk yönetimi:** Stop loss ve pozisyon limitleri kullanın
5. **Monitoring:** İşlemlerinizi sürekli takip edin

## 📞 Destek

Sorunlarınız için:

1. GitHub Issues açın
2. Dokümantasyonu kontrol edin
3. API sağlayıcılarının dokümantasyonlarını okuyun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**⚠️ YASAL UYARI:** Bu yazılım eğitim amaçlıdır. Gerçek trading yapmadan önce finansal danışmanınıza danışın. Yazılım geliştiricileri finansal kayıplardan sorumlu değildir.