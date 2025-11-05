import { useState, useCallback, useEffect } from 'react';
import { realTradingEngine, RealOrder, RealTrade } from '@/lib/realTrading';
import { realExchangeConnector } from '@/lib/realExchangeConnector';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface RealPosition {
  id: string;
  exchange: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  amount: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  leverage: number;
  timestamp: Date;
}

export const useRealOrderExecution = () => {
  const [orders, setOrders] = useState<RealOrder[]>([]);
  const [positions, setPositions] = useState<RealPosition[]>([]);
  const [trades, setTrades] = useState<RealTrade[]>([]);
  const [balances, setBalances] = useState<Record<string, Record<string, number>>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeEngine = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await realTradingEngine.initialize(session.user.id);
        setIsInitialized(true);
        await refreshOrders();
        await refreshBalances();
      }
    };

    initializeEngine();
  }, []);

  const connectExchange = useCallback(async (
    exchangeId: string,
    apiKey: string,
    apiSecret: string,
    testnet: boolean = true
  ) => {
    try {
      await realTradingEngine.saveCredentials(exchangeId, apiKey, apiSecret, testnet);
      realExchangeConnector.createExchange(exchangeId, apiKey, apiSecret, testnet);
      toast.success(`Connected to ${exchangeId}`);
      await refreshBalances();
    } catch (error: any) {
      console.error('Failed to connect exchange:', error);
      toast.error(`Failed to connect to ${exchangeId}: ${error.message}`);
    }
  }, []);

  const disconnectExchange = useCallback((exchangeId: string) => {
    realExchangeConnector.disconnectExchange(exchangeId);
    toast.success(`Disconnected from ${exchangeId}`);
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!isInitialized) return;

    try {
      const { data: credentials } = await supabase
        .from('exchange_credentials')
        .select('exchange');

      if (!credentials) return;

      const newBalances: Record<string, Record<string, number>> = {};

      for (const cred of credentials) {
        try {
          const balance = await realExchangeConnector.fetchBalance(cred.exchange);
          newBalances[cred.exchange] = balance.free || {};
        } catch (error) {
          console.error(`Failed to fetch balance for ${cred.exchange}:`, error);
        }
      }

      setBalances(newBalances);
    } catch (error) {
      console.error('Failed to refresh balances:', error);
    }
  }, [isInitialized]);

  const executeOrder = useCallback(async (
    exchange: string,
    symbol: string,
    side: 'buy' | 'sell',
    type: 'market' | 'limit' | 'stop',
    amount: number,
    price?: number
  ): Promise<RealOrder | null> => {
    if (!isInitialized) {
      toast.error('Trading engine not initialized');
      return null;
    }

    setIsExecuting(true);

    try {
      const ccxtOrder = await realExchangeConnector.createOrder(
        exchange,
        symbol,
        type,
        side,
        amount,
        price
      );

      const order = await realTradingEngine.executeOrder(
        exchange,
        symbol,
        side,
        type,
        amount,
        price || ccxtOrder.price
      );

      setOrders(prev => [order, ...prev]);
      toast.success(`Order executed: ${side.toUpperCase()} ${amount} ${symbol} @ $${(price || ccxtOrder.price).toFixed(2)}`);

      await refreshBalances();
      await refreshOrders();

      return order;
    } catch (error: any) {
      console.error('Order execution error:', error);
      toast.error(`Failed to execute order: ${error.message}`);
      return null;
    } finally {
      setIsExecuting(false);
    }
  }, [isInitialized]);

  const cancelOrder = useCallback(async (exchange: string, orderId: string, symbol?: string) => {
    try {
      await realExchangeConnector.cancelOrder(exchange, orderId, symbol);
      await realTradingEngine.cancelOrder(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' as const } : o));
      toast.success('Order cancelled');
      await refreshOrders();
    } catch (error: any) {
      console.error('Failed to cancel order:', error);
      toast.error(`Failed to cancel order: ${error.message}`);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!isInitialized) return;

    try {
      const orders = await realTradingEngine.getOrders();
      setOrders(orders);
    } catch (error) {
      console.error('Failed to refresh orders:', error);
    }
  }, [isInitialized]);

  const getBalance = useCallback((exchange: string, asset: string = 'USDT'): number => {
    return balances[exchange]?.[asset] || 0;
  }, [balances]);

  const getTotalBalance = useCallback((asset: string = 'USDT'): number => {
    let total = 0;
    Object.values(balances).forEach(exchangeBalance => {
      total += exchangeBalance[asset] || 0;
    });
    return total;
  }, [balances]);

  return {
    orders,
    positions,
    trades,
    balances,
    isExecuting,
    isInitialized,
    connectExchange,
    disconnectExchange,
    executeOrder,
    cancelOrder,
    refreshOrders,
    refreshBalances,
    getBalance,
    getTotalBalance,
  };
};
