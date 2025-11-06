import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from 'wagmi';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { config, projectId } from './lib/web3-config';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import ModernLoginScreen from '@/components/ModernLoginScreen';
import ModernTradingInterface from '@/components/ModernTradingInterface';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { toast } from 'sonner';

const queryClient = new QueryClient();

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': 'hsl(187 100% 50%)',
    '--w3m-border-radius-master': '12px',
  }
});

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>('');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoginLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setLoginLoading(true);
    setLoginError('');

    try {
      // Demo login
      if (email === 'demo@omni.com' && password === 'demo123') {
        // Create a mock user for demo
        const mockUser = {
          id: 'demo-user',
          email: 'demo@omni.com',
          user_metadata: { name: 'Demo User' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: 'authenticated'
        } as User;
        
        setUser(mockUser);
        toast.success('Welcome to OMNI Terminal Demo!');
        setLoginLoading(false);
        return;
      }

      // Real Supabase login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoginError(error.message);
        toast.error(error.message);
      } else if (data.user) {
        toast.success('Welcome back to OMNI Terminal!');
      }
    } catch (error) {
      setLoginError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    }
    
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    if (user?.email === 'demo@omni.com') {
      // Demo logout
      setUser(null);
      toast.success('Logged out successfully');
      return;
    }

    // Real logout
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged out successfully');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-white text-lg font-medium">Loading OMNI Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="omni-ui-theme">
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <div className="min-h-screen">
              {!user ? (
                <ModernLoginScreen 
                  onLogin={handleLogin}
                  isLoading={loginLoading}
                  error={loginError}
                />
              ) : (
                <ModernTradingInterface 
                  user={user}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </TooltipProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};

export default App;
