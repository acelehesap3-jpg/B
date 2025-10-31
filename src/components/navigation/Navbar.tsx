import { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, LogIn, LogOut, Menu, X, TrendingUp, Wallet, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { WalletButton } from '@/components/web3/WalletButton';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';

interface NavbarProps {
  onAdminClick?: () => void;
  isAdmin?: boolean;
}

export const Navbar = memo(({ onAdminClick, isAdmin }: NavbarProps) => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Oturumunuz sonlandırıldı');
    navigate('/auth');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-card/80 backdrop-blur-2xl border-b border-primary/30 shadow-xl shadow-primary/10'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-2xl shadow-primary/30 ring-2 ring-primary/30 backdrop-blur-xl transition-all duration-300 group-hover:ring-primary/60 group-hover:shadow-primary/50">
              <TrendingUp className="h-6 w-6 text-primary animate-pulse" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-primary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-2xl font-black tracking-tighter text-transparent drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]">
                OMNI TERMINAL
              </h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Pro Trading Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {isConnected && <WalletButton />}

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                  <div className="h-2 w-2 rounded-full bg-success animate-breathe" />
                  <span className="text-sm font-bold text-foreground">
                    {user.email?.split('@')[0]}
                  </span>
                </div>

                {isAdmin && onAdminClick && (
                  <Button
                    onClick={onAdminClick}
                    variant="outline"
                    size="sm"
                    className="border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                )}

                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="border-destructive/30 bg-gradient-to-r from-destructive/10 to-destructive/5 hover:from-destructive/20 hover:to-destructive/10 hover:border-destructive/50 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary to-chart-2 hover:from-primary-dark hover:to-chart-2 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Giriş Yap
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all duration-300"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-primary" />
            ) : (
              <Menu className="h-6 w-6 text-primary" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 animate-fade-in">
            {isConnected && (
              <div className="flex justify-center">
                <WalletButton />
              </div>
            )}

            {user ? (
              <>
                <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                  <div className="h-2 w-2 rounded-full bg-success animate-breathe" />
                  <span className="text-sm font-bold text-foreground">
                    {user.email?.split('@')[0]}
                  </span>
                </div>

                {isAdmin && onAdminClick && (
                  <Button
                    onClick={() => {
                      onAdminClick();
                      setMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                )}

                <Button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full border-destructive/30 bg-gradient-to-r from-destructive/10 to-destructive/5"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış Yap
                </Button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  className="w-full bg-gradient-to-r from-primary to-chart-2 shadow-lg shadow-primary/30"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Giriş Yap
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';
