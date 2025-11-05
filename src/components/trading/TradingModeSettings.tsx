import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Settings,
  Shield,
  ToggleLeft,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTradingStore } from '@/lib/stores';
import { ExchangeCredentialsPanel } from './ExchangeCredentialsPanel';
import { DepositWithdrawPanel } from './DepositWithdrawPanel';
import { toast } from 'sonner';

export const TradingModeSettings = () => {
  const { mode, setMode } = useTradingStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleModeToggle = () => {
    if (mode === 'demo') {
      setShowConfirm(true);
    } else {
      setMode('demo');
      toast.success('Switched to Demo mode');
    }
  };

  const confirmRealMode = () => {
    setMode('real');
    setShowConfirm(false);
    toast.success('Switched to Real Trading mode');
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-background to-primary/5 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold">Trading Settings</h3>
      </div>

      <Tabs defaultValue="mode" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mode">Mode</TabsTrigger>
          <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
          <TabsTrigger value="funds">Funds</TabsTrigger>
        </TabsList>

        <TabsContent value="mode" className="space-y-4 mt-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${mode === 'demo' ? 'bg-warning animate-pulse' : 'bg-success animate-pulse'}`} />
              <div>
                <Label className="text-sm font-semibold">
                  {mode === 'demo' ? 'Demo Mode' : 'Real Trading Mode'}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {mode === 'demo' 
                    ? 'Practice trading with simulated funds'
                    : 'Live trading with real funds'}
                </p>
              </div>
            </div>
            <Switch
              checked={mode === 'real'}
              onCheckedChange={handleModeToggle}
            />
          </div>

          {showConfirm && (
            <Card className="p-4 border-destructive/50 bg-destructive/5">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-2">Enable Real Trading?</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    You are about to switch to real trading mode. This will execute actual trades with real funds on connected exchanges.
                  </p>
                  <ul className="space-y-1 text-xs text-muted-foreground mb-3">
                    <li>• Real money will be at risk</li>
                    <li>• All trades are final and cannot be reversed</li>
                    <li>• Exchange fees will apply</li>
                    <li>• API keys must be properly configured</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={confirmRealMode}
                  variant="destructive"
                  className="flex-1"
                  size="sm"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  I Understand, Enable Real Trading
                </Button>
                <Button
                  onClick={() => setShowConfirm(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          <Card className="p-4 bg-muted/30">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Safety Features
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order confirmation</span>
                <Badge variant="outline" className="text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Balance checks</span>
                <Badge variant="outline" className="text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">SSL encryption</span>
                <Badge variant="outline" className="text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
              </div>
            </div>
          </Card>

          <div className="text-xs text-muted-foreground p-3 bg-muted/20 rounded">
            <p className="mb-1"><strong>Demo Mode:</strong> Uses simulated funds and demo orders. Perfect for testing strategies.</p>
            <p><strong>Real Mode:</strong> Connects to live exchanges with real API credentials and executes real trades.</p>
          </div>
        </TabsContent>

        <TabsContent value="exchanges" className="mt-4">
          <ScrollArea className="h-[500px] pr-4">
            <ExchangeCredentialsPanel />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="funds" className="mt-4">
          <ScrollArea className="h-[500px] pr-4">
            <DepositWithdrawPanel />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
