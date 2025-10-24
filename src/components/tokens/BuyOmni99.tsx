import { useState, useEffect } from 'react';
import { Coins, Copy, Check, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentAddress {
  blockchain: string;
  address: string;
}

const EXCHANGE_RATES = {
  BTC: 67890,
  ETH: 3456,
  SOL: 145,
  TRX: 0.15,
  AVAX: 38.5,
  ARB: 3456,
};

const OMNI99_RATE = 0.01; // 1 OMNI99 = $0.01

export const BuyOmni99 = () => {
  const [addresses, setAddresses] = useState<PaymentAddress[]>([]);
  const [selectedChain, setSelectedChain] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPaymentAddresses();
    fetchBalance();
  }, []);

  const fetchPaymentAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_addresses')
        .select('blockchain, address')
        .eq('active', true);

      if (error) throw error;
      setAddresses(data || []);
      if (data && data.length > 0) {
        setSelectedChain(data[0].blockchain);
      }
    } catch (error) {
      console.error('Error fetching payment addresses:', error);
      toast.error('Failed to load payment addresses');
    }
  };

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('omni99_balances')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setBalance(parseFloat(String(data?.balance || 0)));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const selectedAddress = addresses.find(a => a.blockchain === selectedChain);
  const cryptoAmount = parseFloat(amount) || 0;
  const usdValue = cryptoAmount * (EXCHANGE_RATES[selectedChain as keyof typeof EXCHANGE_RATES] || 0);
  const omni99Amount = usdValue / OMNI99_RATE;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPayment = async () => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to continue');
        return;
      }

      const { error } = await supabase
        .from('crypto_payments')
        .insert({
          user_id: user.id,
          blockchain: selectedChain,
          tx_hash: txHash || null,
          amount_crypto: cryptoAmount,
          amount_usd: usdValue,
          omni99_amount: omni99Amount,
          status: 'pending',
        });

      if (error) throw error;

      toast.success('Payment submitted! Waiting for admin verification.');
      setAmount('');
      setTxHash('');
      
      // Subscribe to payment status updates
      const channel = supabase
        .channel(`payment_updates_${user.id}`)
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'crypto_payments',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new.status === 'approved') {
              toast.success(`${payload.new.omni99_amount} OMNI99 tokens added to your account!`);
              fetchBalance();
            }
          }
        )
        .subscribe();

      setTimeout(() => supabase.removeChannel(channel), 300000); // Cleanup after 5 minutes
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-gradient-to-br from-primary/5 via-background to-chart-1/5 border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Buy OMNI99 Tokens</h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Your Balance</div>
          <div className="text-lg font-bold text-primary">{balance.toFixed(2)} OMNI99</div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-xs text-foreground">
            Send crypto to the address below, then submit this form with your transaction hash. 
            Admin will verify and credit your OMNI99 tokens.
          </div>
        </div>
      </div>

      {/* Blockchain Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Select Blockchain</label>
        <Select value={selectedChain} onValueChange={setSelectedChain}>
          <SelectTrigger>
            <SelectValue placeholder="Choose blockchain" />
          </SelectTrigger>
          <SelectContent>
            {addresses.map(addr => (
              <SelectItem key={addr.blockchain} value={addr.blockchain}>
                {addr.blockchain}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Payment Address */}
      {selectedAddress && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Payment Address</label>
          <div className="flex gap-2">
            <Input
              value={selectedAddress.address}
              readOnly
              className="font-mono text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(selectedAddress.address)}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Amount Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Amount ({selectedChain})</label>
        <Input
          type="number"
          step="0.00000001"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="text-right font-semibold text-lg"
        />
        {cryptoAmount > 0 && (
          <div className="text-sm space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>USD Value:</span>
              <span className="font-semibold">${usdValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-primary">
              <span>You will receive:</span>
              <span className="font-bold">{omni99Amount.toFixed(2)} OMNI99</span>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Hash */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Transaction Hash (Optional)</label>
        <Input
          type="text"
          placeholder="Enter transaction hash after sending"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          className="font-mono text-xs"
        />
      </div>

      <Button
        onClick={handleSubmitPayment}
        disabled={loading || !amount || parseFloat(amount) <= 0}
        className="w-full"
        size="lg"
      >
        {loading ? 'Submitting...' : 'Submit Payment'}
      </Button>

      <div className="text-xs text-center text-muted-foreground">
        Rate: 1 OMNI99 = ${OMNI99_RATE} USD
      </div>
    </Card>
  );
};