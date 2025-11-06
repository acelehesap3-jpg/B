import { useState, useCallback } from 'react';
import { Order, Trade, Position } from '@/types/trading';
import { realExchangeConnector } from '@/lib/realExchangeConnector';
import { toast } from 'sonner';

export interface OrderRequest {
  exchange: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  amount: number;
  price?: number;
}

export const useOrderExecution = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const executeOrder = useCallback(async (request: OrderRequest): Promise<Order | null> => {
    setIsExecuting(true);

    try {
      const exchange = realExchangeConnector.getExchange(request.exchange);
      if (!exchange) {
        toast.error(`Exchange ${request.exchange} not found`);
        return null;
      }

      const price = request.price || await exchange.getPrice(request.symbol);
      
      const cost = request.amount * price;
      if (cost > balance) {
        toast.error(`Insufficient balance. Required: $${cost.toFixed(2)}, Available: $${balance.toFixed(2)}`);
        return null;
      }

      const order = demoTradingEngine.createOrder(
        request.exchange,
        request.symbol,
        request.side,
        request.type,
        request.amount,
        price
      );

      setOrders(prev => [order, ...prev]);

      if (order.status === 'filled') {
        const position = await exchange.getPosition(request.symbol);
        if (position) {
          setPositions(prev => [...prev.filter(p => p.symbol !== position.symbol), position]);
        }
        toast.success(`Order executed: ${request.side.toUpperCase()} ${request.amount} ${request.symbol}`);
      }

      return order;
    } catch (error) {
      console.error('Order execution error:', error);
      toast.error('Failed to execute order');
      return null;
    } finally {
      setIsExecuting(false);
    }
  }, []);

    const closePosition = useCallback(async (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) {
      toast.error('Position not found');
      return;
    }

    try {
      const exchange = realExchangeConnector.getExchange(position.exchange);
      if (!exchange) {
        toast.error('Exchange not found');
        return;
      }
      
      const order = await exchange.createOrder({
        symbol: position.symbol,
        side: position.side === 'long' ? 'short' : 'long',
        type: 'market',
        amount: position.amount
      });

      if (order && order.status === 'filled') {
        setPositions(prev => prev.filter(p => p.id !== positionId));
        toast.success('Position closed successfully');
      } else {
        toast.error('Failed to close position');
      }
    } catch (error) {
      console.error('Failed to close position:', error);
      toast.error('Failed to close position');
    }      const trade: Trade = {
        id: `TRD-${Date.now()}`,
        orderId: positionId,
        exchange: position.exchange,
        symbol: position.symbol,
        side: position.side === 'long' ? 'sell' : 'buy',
        price: currentPrice,
        amount: position.amount,
        fee: returnAmount * 0.001,
        timestamp: new Date(),
      };

      setTrades(prev => [trade, ...prev]);
    } catch (error) {
      console.error('Failed to close position:', error);
      toast.error('Failed to close position');
    }
  }, [positions]);

  const cancelOrder = useCallback(async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      toast.error('Order not found');
      return;
    }

    try {
      const exchange = realExchangeConnector.getExchange(order.exchange);
      if (!exchange) {
        toast.error('Exchange not found');
        return;
      }

      const success = await exchange.cancelOrder(orderId);
      if (success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' as const } : o));
        toast.success('Order cancelled');
      } else {
        toast.error('Failed to cancel order');
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error('Failed to cancel order');
    }
  }, [orders]);

  const updatePositions = useCallback(async () => {
    const updatedPositions = await Promise.all(
      positions.map(async (pos) => {
        try {
          const exchange = realExchangeConnector.getExchange(pos.exchange);
          if (!exchange) return pos;
          
          const currentPosition = await exchange.getPosition(pos.symbol);
          return currentPosition || pos;
        } catch {
          return pos;
        }
      })
    );

    setPositions(updatedPositions);
  }, [positions]);

  const getPositionsValue = useCallback(() => {
    return positions.reduce((sum, pos) => sum + pos.pnl, 0);
  }, [positions]);

  const getTotalPnL = useCallback(() => {
    return positions.reduce((sum, pos) => sum + pos.pnl, 0);
  }, [positions]);

  return {
    orders,
    positions,
    trades,
    isExecuting,
    executeOrder,
    closePosition,
    updatePositions,
    getPositionsValue
  };
};
