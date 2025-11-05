import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Copy,
  CheckCircle2,
  Clock,
  Wallet,
  QrCode
} from 'lucide-react';
import { useRealOrderExecution } from '@/hooks/useRealOrderExecution';
import { realExchangeConnector } from '@/lib/realExchangeConnector';
import { toast } from 'sonner';

export const DepositWithdrawPanel = () => {
  const { balances, refreshBalances } = useRealOrderExecution();
  const [selectedExchange, setSelectedExchange] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<string>('USDT');
  const [depositAddress, setDepositAddress] = useState<string>('');
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [addressTag, setAddressTag] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const connectedExchanges = Object.keys(balances);

  const handleGetDepositAddress = async () => {
    if (!selectedExchange || !selectedAsset) {
      toast.error('Please select exchange and asset');
      return;
    }

    setIsLoading(true);
    try {
      const addressData = await realExchangeConnector.fetchDepositAddress(
        selectedExchange,
        selectedAsset
      );
      setDepositAddress(addressData.address);
      if (addressData.tag) {
        setAddressTag(addressData.tag);
      }
      toast.success('Deposit address retrieved');
    } catch (error: any) {
      console.error('Failed to get deposit address:', error);
      toast.error(`Failed to get deposit address: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedExchange || !selectedAsset || !withdrawAddress || !withdrawAmount) {
      toast.error('Please fill all required fields');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    setIsLoading(true);
    try {
      await realExchangeConnector.withdraw(
        selectedExchange,
        selectedAsset,
        amount,
        withdrawAddress,
        addressTag || undefined
      );
      toast.success(`Withdrawal of ${amount} ${selectedAsset} initiated`);
      setWithdrawAddress('');
      setWithdrawAmount('');
      setAddressTag('');
      await refreshBalances();
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      toast.error(`Withdrawal failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-background to-primary/5 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold">Deposit & Withdraw</h3>
      </div>

      {connectedExchanges.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No exchanges connected</p>
          <p className="text-xs">Connect an exchange to manage deposits and withdrawals</p>
        </div>
      ) : (
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit">
              <ArrowDownToLine className="w-4 h-4 mr-1" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw">
              <ArrowUpFromLine className="w-4 h-4 mr-1" />
              Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="deposit-exchange" className="text-xs">Exchange</Label>
                <select
                  id="deposit-exchange"
                  value={selectedExchange}
                  onChange={(e) => setSelectedExchange(e.target.value)}
                  className="w-full h-8 px-2 text-xs rounded-md border bg-background"
                >
                  <option value="">Select exchange</option>
                  {connectedExchanges.map(ex => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit-asset" className="text-xs">Asset</Label>
                <Input
                  id="deposit-asset"
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value.toUpperCase())}
                  placeholder="e.g., USDT"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <Button
              onClick={handleGetDepositAddress}
              disabled={isLoading || !selectedExchange || !selectedAsset}
              className="w-full"
            >
              {isLoading ? 'Loading...' : 'Get Deposit Address'}
            </Button>

            {depositAddress && (
              <Card className="p-4 bg-success/5 border-success/30">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Deposit Address</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(depositAddress)}
                      className="h-6 px-2"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="p-2 bg-background rounded font-mono text-xs break-all">
                    {depositAddress}
                  </div>
                  {addressTag && (
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Memo/Tag</Label>
                      <div className="p-2 bg-background rounded font-mono text-xs break-all">
                        {addressTag}
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-xs text-warning">
                    <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Deposits typically take 10-30 minutes to confirm. Make sure to send only {selectedAsset} to this address.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="withdraw-exchange" className="text-xs">Exchange</Label>
                <select
                  id="withdraw-exchange"
                  value={selectedExchange}
                  onChange={(e) => setSelectedExchange(e.target.value)}
                  className="w-full h-8 px-2 text-xs rounded-md border bg-background"
                >
                  <option value="">Select exchange</option>
                  {connectedExchanges.map(ex => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdraw-asset" className="text-xs">Asset</Label>
                <Input
                  id="withdraw-asset"
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value.toUpperCase())}
                  placeholder="e.g., USDT"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {selectedExchange && (
              <div className="p-2 bg-muted rounded text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Available:</span>
                  <span className="font-semibold font-mono">
                    {balances[selectedExchange]?.[selectedAsset]?.toFixed(4) || '0.0000'} {selectedAsset}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="withdraw-address" className="text-xs">Withdrawal Address</Label>
              <Input
                id="withdraw-address"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder="Enter destination address"
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-tag" className="text-xs">Memo/Tag (optional)</Label>
              <Input
                id="withdraw-tag"
                value={addressTag}
                onChange={(e) => setAddressTag(e.target.value)}
                placeholder="If required by destination"
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-amount" className="text-xs">Amount</Label>
              <Input
                id="withdraw-amount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                className="h-8 text-xs"
              />
            </div>

            <Button
              onClick={handleWithdraw}
              disabled={isLoading || !selectedExchange || !withdrawAddress || !withdrawAmount}
              className="w-full"
              variant="destructive"
            >
              {isLoading ? 'Processing...' : 'Withdraw'}
            </Button>

            <div className="flex items-start gap-2 text-xs text-warning p-2 bg-warning/10 rounded">
              <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Double-check the address before withdrawing. Transactions cannot be reversed.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </Card>
  );
};
