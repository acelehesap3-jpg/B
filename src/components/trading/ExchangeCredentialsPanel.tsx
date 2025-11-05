import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Key, 
  Lock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Wallet
} from 'lucide-react';
import { useRealOrderExecution } from '@/hooks/useRealOrderExecution';
import { EXCHANGE_CONFIGS } from '@/lib/realExchangeConnector';
import { toast } from 'sonner';

export const ExchangeCredentialsPanel = () => {
  const { connectExchange, disconnectExchange, balances } = useRealOrderExecution();
  const [selectedExchange, setSelectedExchange] = useState<string>('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [testnet, setTestnet] = useState(true);
  const [connectedExchanges, setConnectedExchanges] = useState<Set<string>>(new Set());

  const cryptoExchanges = Object.values(EXCHANGE_CONFIGS).filter(e => e.type === 'crypto' && e.ccxtId);

  const handleConnect = async () => {
    if (!selectedExchange || !apiKey || !apiSecret) {
      toast.error('Please fill all fields');
      return;
    }

    await connectExchange(selectedExchange, apiKey, apiSecret, testnet);
    setConnectedExchanges(prev => new Set(prev).add(selectedExchange));
    setApiKey('');
    setApiSecret('');
    setSelectedExchange('');
  };

  const handleDisconnect = (exchangeId: string) => {
    disconnectExchange(exchangeId);
    setConnectedExchanges(prev => {
      const next = new Set(prev);
      next.delete(exchangeId);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-br from-primary/5 to-background border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Exchange Connections</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {cryptoExchanges.map(exchange => {
              const isConnected = connectedExchanges.has(exchange.id);
              const balance = balances[exchange.id];

              return (
                <Card 
                  key={exchange.id} 
                  className={`p-3 ${isConnected ? 'border-success bg-success/5' : 'border-muted'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{exchange.name}</h4>
                        {isConnected && <CheckCircle2 className="w-4 h-4 text-success" />}
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {exchange.type}
                      </Badge>
                    </div>
                    {isConnected && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(exchange.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    )}
                  </div>

                  {isConnected && balance && (
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">USDT:</span>
                        <span className="font-mono font-semibold">
                          {balance.USDT?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  )}

                  {!isConnected && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => setSelectedExchange(exchange.id)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Connect
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>

          {selectedExchange && (
            <Card className="p-4 border-primary/30 bg-primary/5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">
                    Connect to {EXCHANGE_CONFIGS[selectedExchange]?.name}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedExchange('')}
                  >
                    Cancel
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-xs flex items-center gap-1">
                    <Key className="w-3 h-3" />
                    API Key
                  </Label>
                  <Input
                    id="apiKey"
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API key"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiSecret" className="text-xs flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    API Secret
                  </Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="Enter API secret"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="testnet" className="text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Testnet Mode
                  </Label>
                  <Switch
                    id="testnet"
                    checked={testnet}
                    onCheckedChange={setTestnet}
                  />
                </div>

                <Button
                  onClick={handleConnect}
                  className="w-full"
                  size="sm"
                >
                  <Wallet className="w-3 h-3 mr-1" />
                  Connect Exchange
                </Button>

                <p className="text-xs text-muted-foreground">
                  Your API keys are encrypted and stored securely. We recommend using API keys with trading permissions only.
                </p>
              </div>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
};
