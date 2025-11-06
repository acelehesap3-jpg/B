import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      token_purchases: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          price: number;
          total: number;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          price: number;
          total: number;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          price?: number;
          total?: number;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
      };
      watchlists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      watchlist_items: {
        Row: {
          id: string;
          watchlist_id: string;
          market_type: 'crypto' | 'forex' | 'stocks' | 'indices';
          symbol: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          watchlist_id: string;
          market_type: 'crypto' | 'forex' | 'stocks' | 'indices';
          symbol: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          watchlist_id?: string;
          market_type?: 'crypto' | 'forex' | 'stocks' | 'indices';
          symbol?: string;
          created_at?: string;
        };
      };
      trading_alerts: {
        Row: {
          id: string;
          user_id: string;
          market_type: 'crypto' | 'forex' | 'stocks' | 'indices';
          symbol: string;
          alert_type: 'price' | 'percent_change' | 'volume' | 'technical';
          condition: 'above' | 'below' | 'crosses_up' | 'crosses_down';
          value: number;
          status: 'active' | 'triggered' | 'disabled';
          created_at: string;
          triggered_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          market_type: 'crypto' | 'forex' | 'stocks' | 'indices';
          symbol: string;
          alert_type: 'price' | 'percent_change' | 'volume' | 'technical';
          condition: 'above' | 'below' | 'crosses_up' | 'crosses_down';
          value: number;
          status?: 'active' | 'triggered' | 'disabled';
          created_at?: string;
          triggered_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          market_type?: 'crypto' | 'forex' | 'stocks' | 'indices';
          symbol?: string;
          alert_type?: 'price' | 'percent_change' | 'volume' | 'technical';
          condition?: 'above' | 'below' | 'crosses_up' | 'crosses_down';
          value?: number;
          status?: 'active' | 'triggered' | 'disabled';
          created_at?: string;
          triggered_at?: string;
        };
      };
      market_analysis: {
        Row: {
          id: string;
          user_id: string;
          market_type: 'crypto' | 'forex' | 'stocks' | 'indices';
          symbol: string;
          timeframe: string;
          analysis_type: 'technical' | 'fundamental' | 'sentiment';
          indicators?: Record<string, any>;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          market_type: 'crypto' | 'forex' | 'stocks' | 'indices';
          symbol: string;
          timeframe: string;
          analysis_type: 'technical' | 'fundamental' | 'sentiment';
          indicators?: Record<string, any>;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          market_type?: 'crypto' | 'forex' | 'stocks' | 'indices';
          symbol?: string;
          timeframe?: string;
          analysis_type?: 'technical' | 'fundamental' | 'sentiment';
          indicators?: Record<string, any>;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};