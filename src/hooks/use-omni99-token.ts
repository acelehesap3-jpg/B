import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { OMNI99_TOKEN } from '@/lib/config/trading';
import { toast } from 'sonner';

interface OMNI99Balance {
  balance: string;
  stakedBalance: string;
  rewardsEarned: string;
  lastUpdate: string;
}

interface OMNI99Transaction {
  id: string;
  userId: string;
  type: 'EARN' | 'SPEND' | 'STAKE' | 'UNSTAKE' | 'REWARD';
  amount: string;
  timestamp: string;
  details: string;
}

export const useOMNI99Token = (userId: string) => {
  const [balance, setBalance] = useState<OMNI99Balance | null>(null);
  const [transactions, setTransactions] = useState<OMNI99Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bakiye ve işlem geçmişini getir
  const fetchBalanceAndTransactions = async () => {
    try {
      const [balanceResponse, transactionsResponse] = await Promise.all([
        supabase
          .from('omni99_balances')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('omni99_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false })
      ]);

      if (balanceResponse.error) throw balanceResponse.error;
      if (transactionsResponse.error) throw transactionsResponse.error;

      setBalance(balanceResponse.data);
      setTransactions(transactionsResponse.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OMNI99 token verisi alınamadı';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // İşlem komisyonunu OMNI99 token olarak kazan
  const earnFromTrade = async (tradeVolume: number) => {
    try {
      const tokenAmount = tradeVolume * OMNI99_TOKEN.commission;
      
      const { error: updateError } = await supabase.rpc('add_omni99_tokens', {
        p_user_id: userId,
        p_amount: tokenAmount.toString(),
        p_type: 'EARN',
        p_details: `Trade commission reward: ${tokenAmount} OMNI99`
      });

      if (updateError) throw updateError;

      await fetchBalanceAndTransactions();
      toast.success(`${tokenAmount} OMNI99 token kazanıldı!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Token kazanma işlemi başarısız';
      setError(message);
      toast.error(message);
    }
  };

  // Tokenleri stakele
  const stakeTokens = async (amount: string) => {
    try {
      const { error } = await supabase.rpc('stake_omni99_tokens', {
        p_user_id: userId,
        p_amount: amount
      });

      if (error) throw error;

      await fetchBalanceAndTransactions();
      toast.success(`${amount} OMNI99 token başarıyla stakelendi!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stake işlemi başarısız';
      setError(message);
      toast.error(message);
    }
  };

  // Stakelenen tokenleri çek
  const unstakeTokens = async (amount: string) => {
    try {
      const { error } = await supabase.rpc('unstake_omni99_tokens', {
        p_user_id: userId,
        p_amount: amount
      });

      if (error) throw error;

      await fetchBalanceAndTransactions();
      toast.success(`${amount} OMNI99 token başarıyla unstake edildi!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unstake işlemi başarısız';
      setError(message);
      toast.error(message);
    }
  };

  // Stake ödüllerini topla
  const claimRewards = async () => {
    try {
      const { error } = await supabase.rpc('claim_omni99_rewards', {
        p_user_id: userId
      });

      if (error) throw error;

      await fetchBalanceAndTransactions();
      toast.success('Stake ödülleri başarıyla toplandı!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ödül toplama işlemi başarısız';
      setError(message);
      toast.error(message);
    }
  };

  // Başlangıçta ve userId değiştiğinde verileri getir
  useEffect(() => {
    if (userId) {
      fetchBalanceAndTransactions();
    }
  }, [userId]);

  // Real-time güncellemeleri dinle
  useEffect(() => {
    if (!userId) return;

    const balanceSubscription = supabase
      .channel('omni99_balance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'omni99_balances',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchBalanceAndTransactions();
        }
      )
      .subscribe();

    return () => {
      balanceSubscription.unsubscribe();
    };
  }, [userId]);

  return {
    balance,
    transactions,
    loading,
    error,
    earnFromTrade,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    refresh: fetchBalanceAndTransactions
  };
};

export type { OMNI99Balance, OMNI99Transaction };