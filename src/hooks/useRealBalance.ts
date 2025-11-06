import { useState, useEffect } from 'react';
import { realExchangeConnector } from '@/lib/realExchangeConnector';

interface Balance {
  total: number;
  available: number;
  locked: number;
  omni99: number;
  assets: Record<string, {
    free: number;
    used: number;
    total: number;
  }>;
}

export const useRealBalance = (userId: string) => {
  const [balance, setBalance] = useState<Balance>({
    total: 0,
    available: 0,
    locked: 0,
    omni99: 0,
    assets: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get balances from all connected exchanges
      const exchanges = await realExchangeConnector.getConnectedExchanges(userId);
      let totalBalance = 0;
      let totalAvailable = 0;
      let totalLocked = 0;
      const allAssets: Record<string, { free: number; used: number; total: number }> = {};

      for (const exchange of exchanges) {
        try {
          const exchangeBalance = await realExchangeConnector.getBalance(exchange.name, userId);
          
          // Aggregate balances
          Object.entries(exchangeBalance).forEach(([asset, data]) => {
            if (typeof data === 'object' && data !== null) {
              const assetData = data as { free: number; used: number; total: number };
              if (!allAssets[asset]) {
                allAssets[asset] = { free: 0, used: 0, total: 0 };
              }
              allAssets[asset].free += assetData.free || 0;
              allAssets[asset].used += assetData.used || 0;
              allAssets[asset].total += assetData.total || 0;
            }
          });

          // Calculate USD values (simplified - in real implementation, use current prices)
          const usdValue = await calculateUSDValue(exchangeBalance);
          totalBalance += usdValue.total;
          totalAvailable += usdValue.available;
          totalLocked += usdValue.locked;
        } catch (exchangeError) {
          console.error(`Error fetching balance from ${exchange.name}:`, exchangeError);
        }
      }

      // Get OMNI99 tokens from database
      const omni99Balance = await getOMNI99Balance(userId);

      setBalance({
        total: totalBalance,
        available: totalAvailable,
        locked: totalLocked,
        omni99: omni99Balance,
        assets: allAssets
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchBalance();
      
      // Set up real-time balance updates
      const interval = setInterval(fetchBalance, 30000); // Update every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [userId]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance
  };
};

// Helper function to calculate USD value of assets
async function calculateUSDValue(balance: any): Promise<{ total: number; available: number; locked: number }> {
  // In a real implementation, this would fetch current prices from CoinGecko or similar
  // For now, using approximate values
  const priceMap: Record<string, number> = {
    'BTC': 67000,
    'ETH': 3400,
    'USDT': 1,
    'USDC': 1,
    'BNB': 600,
    'SOL': 160,
    'ADA': 0.5,
    'DOT': 7,
    'MATIC': 0.8,
    'AVAX': 35
  };

  let total = 0;
  let available = 0;
  let locked = 0;

  Object.entries(balance).forEach(([asset, data]) => {
    if (typeof data === 'object' && data !== null) {
      const assetData = data as { free: number; used: number; total: number };
      const price = priceMap[asset.toUpperCase()] || 0;
      
      total += (assetData.total || 0) * price;
      available += (assetData.free || 0) * price;
      locked += (assetData.used || 0) * price;
    }
  });

  return { total, available, locked };
}

// Helper function to get OMNI99 balance from database
async function getOMNI99Balance(userId: string): Promise<number> {
  try {
    // This would connect to your database to get OMNI99 token balance
    // For now, returning 0 as placeholder
    return 0;
  } catch (error) {
    console.error('Error fetching OMNI99 balance:', error);
    return 0;
  }
}