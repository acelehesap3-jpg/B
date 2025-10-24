import { useState, useEffect } from 'react';
import { Shield, DollarSign, Users, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Payment {
  id: string;
  user_id: string;
  blockchain: string;
  tx_hash: string | null;
  amount_crypto: number;
  amount_usd: number;
  omni99_amount: number;
  status: string;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalPayments: number;
  pendingPayments: number;
  totalOmni99Issued: number;
}

export const AdminPanel = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPayments: 0,
    pendingPayments: 0,
    totalOmni99Issued: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('crypto_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

      // Fetch stats
      const { data: balancesData } = await supabase
        .from('omni99_balances')
        .select('balance, total_purchased');

      const totalOmni99 = balancesData?.reduce((sum, b) => sum + parseFloat(String(b.total_purchased)), 0) || 0;
      const totalUsers = balancesData?.length || 0;

      setStats({
        totalUsers,
        totalPayments: paymentsData?.length || 0,
        pendingPayments: paymentsData?.filter(p => p.status === 'pending').length || 0,
        totalOmni99Issued: totalOmni99,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Subscribe to realtime updates
    const paymentsChannel = supabase
      .channel('admin_payments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'crypto_payments' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(paymentsChannel);
    };
  }, []);

  const verifyPayment = async (paymentId: string, approve: boolean) => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      if (approve) {
        // Update payment status
        const { error: updateError } = await supabase
          .from('crypto_payments')
          .update({ 
            status: 'approved',
            verified_at: new Date().toISOString(),
          })
          .eq('id', paymentId);

        if (updateError) throw updateError;

        // Add tokens to user balance
        const { error: balanceError } = await supabase.rpc('update_omni99_balance', {
          p_user_id: payment.user_id,
          p_amount: payment.omni99_amount,
          p_transaction_type: 'purchase',
          p_description: `Purchase via ${payment.blockchain} - ${payment.tx_hash || 'N/A'}`,
          p_reference_id: paymentId,
        });

        if (balanceError) throw balanceError;

        toast.success('Payment approved and tokens distributed');
      } else {
        // Reject payment
        const { error } = await supabase
          .from('crypto_payments')
          .update({ 
            status: 'rejected',
            verified_at: new Date().toISOString(),
          })
          .eq('id', paymentId);

        if (error) throw error;
        toast.success('Payment rejected');
      }

      fetchData();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-6 h-6 text-primary animate-pulse" />
          <h2 className="text-2xl font-bold text-foreground">Admin Panel</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-20 bg-muted/30 rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Admin Panel</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-chart-1/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-chart-2/10 to-chart-3/10 border-chart-2/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Payments</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalPayments}</p>
            </div>
            <Activity className="w-8 h-8 text-chart-2 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-warning/10 to-chart-4/10 border-warning/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">{stats.pendingPayments}</p>
            </div>
            <Clock className="w-8 h-8 text-warning opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-success/10 to-chart-5/10 border-success/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">OMNI99 Issued</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalOmni99Issued.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-success opacity-50" />
          </div>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="p-6">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending ({stats.pendingPayments})</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          {['pending', 'approved', 'rejected'].map(status => (
            <TabsContent key={status} value={status} className="space-y-4 mt-4">
              {payments.filter(p => p.status === status).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {status} payments
                </div>
              ) : (
                payments
                  .filter(p => p.status === status)
                  .map(payment => (
                    <Card key={payment.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {getStatusIcon(payment.status)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{payment.blockchain}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(payment.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {payment.amount_crypto} → {payment.omni99_amount} OMNI99
                            </div>
                            {payment.tx_hash && (
                              <div className="text-xs text-muted-foreground font-mono mt-1">
                                TX: {payment.tx_hash.slice(0, 16)}...
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {payment.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => verifyPayment(payment.id, true)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => verifyPayment(payment.id, false)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
};