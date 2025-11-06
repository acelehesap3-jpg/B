import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ccxt from 'ccxt';

interface ExchangeConfig {
  id: string;
  name: string;
  apiKey?: string;
  secret?: string;
  additional?: Record<string, string>;
  testnet?: boolean;
}

interface ExchangeBalance {
  total: number;
  free: number;
  used: number;
  assets: Record<string, {
    total: number;
    free: number;
    used: number;
    usdValue: number;
  }>;
}

export const useExchanges = (userId: string) => {
  const [exchanges, setExchanges] = useState<ExchangeConfig[]>([]);
  const [balances, setBalances] = useState<Record<string, ExchangeBalance>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bağlı borsaları getir
  const fetchConnectedExchanges = async () => {
    try {
      const { data, error } = await supabase
        .from('exchange_connections')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      setExchanges(data.map(connection => ({
        id: connection.exchange_id,
        name: connection.exchange_name,
        apiKey: connection.api_key,
        secret: connection.api_secret,
        additional: connection.additional_params,
        testnet: connection.is_testnet
      })));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch connected exchanges';
      setError(message);
      return [];
    }
  };

  // Borsa bağlantısı ekle
  const addExchange = async (config: Omit<ExchangeConfig, 'id'>) => {
    try {
      // API anahtarlarını test et
      const exchange = new ccxt[config.name.toLowerCase()]({
        apiKey: config.apiKey,
        secret: config.secret,
        ...config.additional,
        options: {
          defaultType: 'spot',
          adjustForTimeDifference: true,
          ...(config.testnet ? { testnet: true } : {})
        }
      });

      await exchange.loadMarkets();
      await exchange.fetchBalance();

      // Başarılı test sonrası veritabanına kaydet
      const { data, error } = await supabase
        .from('exchange_connections')
        .insert([
          {
            user_id: userId,
            exchange_name: config.name,
            api_key: config.apiKey,
            api_secret: config.secret,
            additional_params: config.additional,
            is_testnet: config.testnet
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setExchanges(prev => [...prev, { ...config, id: data.id }]);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add exchange';
      setError(message);
      throw new Error(message);
    }
  };

  // Borsa bağlantısını kaldır
  const removeExchange = async (exchangeId: string) => {
    try {
      const { error } = await supabase
        .from('exchange_connections')
        .delete()
        .eq('id', exchangeId);

      if (error) throw error;

      setExchanges(prev => prev.filter(ex => ex.id !== exchangeId));
      setBalances(prev => {
        const newBalances = { ...prev };
        delete newBalances[exchangeId];
        return newBalances;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove exchange';
      setError(message);
      throw new Error(message);
    }
  };

  // Tüm borsalardan bakiyeleri getir
  const fetchAllBalances = async () => {
    setLoading(true);
    const newBalances: Record<string, ExchangeBalance> = {};

    for (const config of exchanges) {
      try {
        const exchange = new ccxt[config.name.toLowerCase()]({
          apiKey: config.apiKey,
          secret: config.secret,
          ...config.additional,
          options: {
            defaultType: 'spot',
            adjustForTimeDifference: true,
            ...(config.testnet ? { testnet: true } : {})
          }
        });

        const balance = await exchange.fetchBalance();
        const assets: Record<string, any> = {};
        let total = 0;
        let free = 0;
        let used = 0;

        // Her bir varlık için USD değerini hesapla
        for (const [asset, amounts] of Object.entries(balance.total)) {
          if (amounts > 0) {
            let usdValue = 0;
            try {
              if (asset !== 'USD' && asset !== 'USDT') {
                const ticker = await exchange.fetchTicker(`${asset}/USDT`);
                usdValue = amounts * ticker.last;
              } else {
                usdValue = amounts;
              }
            } catch {
              // Fiyat bulunamazsa 0 olarak bırak
            }

            assets[asset] = {
              total: balance.total[asset] || 0,
              free: balance.free[asset] || 0,
              used: balance.used[asset] || 0,
              usdValue
            };

            total += usdValue;
            free += assets[asset].free * (usdValue / amounts);
            used += assets[asset].used * (usdValue / amounts);
          }
        }

        newBalances[config.id] = {
          total,
          free,
          used,
          assets
        };
      } catch (err) {
        console.error(`Failed to fetch balance for ${config.name}:`, err);
      }
    }

    setBalances(newBalances);
    setLoading(false);
  };

  // Başlangıçta ve userId değiştiğinde borsaları getir
  useEffect(() => {
    if (userId) {
      fetchConnectedExchanges().then(() => {
        fetchAllBalances();
      });
    }
  }, [userId]);

  // Her 30 saniyede bir bakiyeleri güncelle
  useEffect(() => {
    if (exchanges.length > 0) {
      const interval = setInterval(fetchAllBalances, 30000);
      return () => clearInterval(interval);
    }
  }, [exchanges]);

  return {
    exchanges,
    balances,
    loading,
    error,
    addExchange,
    removeExchange,
    refreshBalances: fetchAllBalances
  };
};

export type { ExchangeConfig, ExchangeBalance };