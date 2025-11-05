import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TradingState {
  mode: 'demo' | 'real';
  connectedExchanges: Set<string>;
  activeOrders: any[];
  positions: any[];
  balances: Record<string, Record<string, number>>;
  
  setMode: (mode: 'demo' | 'real') => void;
  addConnectedExchange: (exchange: string) => void;
  removeConnectedExchange: (exchange: string) => void;
  updateBalances: (balances: Record<string, Record<string, number>>) => void;
  updateOrders: (orders: any[]) => void;
  updatePositions: (positions: any[]) => void;
  clearAll: () => void;
}

export const useTradingStore = create<TradingState>()(
  persist(
    (set) => ({
      mode: 'demo',
      connectedExchanges: new Set(),
      activeOrders: [],
      positions: [],
      balances: {},

      setMode: (mode) => set({ mode }),
      
      addConnectedExchange: (exchange) =>
        set((state) => ({
          connectedExchanges: new Set(state.connectedExchanges).add(exchange),
        })),
      
      removeConnectedExchange: (exchange) =>
        set((state) => {
          const exchanges = new Set(state.connectedExchanges);
          exchanges.delete(exchange);
          return { connectedExchanges: exchanges };
        }),
      
      updateBalances: (balances) => set({ balances }),
      
      updateOrders: (orders) => set({ activeOrders: orders }),
      
      updatePositions: (positions) => set({ positions }),
      
      clearAll: () =>
        set({
          connectedExchanges: new Set(),
          activeOrders: [],
          positions: [],
          balances: {},
        }),
    }),
    {
      name: 'omni-trading-store',
      partialize: (state) => ({
        mode: state.mode,
        connectedExchanges: Array.from(state.connectedExchanges),
      }),
    }
  )
);

interface UIState {
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
  activeTab: string;
  chartLayout: 'single' | 'dual' | 'quad';
  
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setActiveTab: (tab: string) => void;
  setChartLayout: (layout: 'single' | 'dual' | 'quad') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      leftSidebarCollapsed: false,
      rightSidebarCollapsed: false,
      activeTab: 'chart',
      chartLayout: 'single',

      toggleLeftSidebar: () =>
        set((state) => ({ leftSidebarCollapsed: !state.leftSidebarCollapsed })),
      
      toggleRightSidebar: () =>
        set((state) => ({ rightSidebarCollapsed: !state.rightSidebarCollapsed })),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      setChartLayout: (layout) => set({ chartLayout: layout }),
    }),
    {
      name: 'omni-ui-store',
    }
  )
);

interface MarketDataCache {
  prices: Map<string, { price: number; timestamp: number }>;
  candles: Map<string, any[]>;
  orderBooks: Map<string, any>;
  
  updatePrice: (symbol: string, price: number) => void;
  getPrice: (symbol: string) => number | null;
  updateCandles: (symbol: string, candles: any[]) => void;
  getCandles: (symbol: string) => any[];
  updateOrderBook: (symbol: string, orderBook: any) => void;
  clearCache: () => void;
}

export const useMarketDataCache = create<MarketDataCache>((set, get) => ({
  prices: new Map(),
  candles: new Map(),
  orderBooks: new Map(),

  updatePrice: (symbol, price) =>
    set((state) => {
      const prices = new Map(state.prices);
      prices.set(symbol, { price, timestamp: Date.now() });
      return { prices };
    }),

  getPrice: (symbol) => {
    const data = get().prices.get(symbol);
    if (!data) return null;
    if (Date.now() - data.timestamp > 60000) return null;
    return data.price;
  },

  updateCandles: (symbol, candles) =>
    set((state) => {
      const newCandles = new Map(state.candles);
      newCandles.set(symbol, candles);
      return { candles: newCandles };
    }),

  getCandles: (symbol) => get().candles.get(symbol) || [],

  updateOrderBook: (symbol, orderBook) =>
    set((state) => {
      const orderBooks = new Map(state.orderBooks);
      orderBooks.set(symbol, orderBook);
      return { orderBooks };
    }),

  clearCache: () =>
    set({
      prices: new Map(),
      candles: new Map(),
      orderBooks: new Map(),
    }),
}));
