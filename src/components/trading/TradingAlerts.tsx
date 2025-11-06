import React from 'react';
import { Bell, Check } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface TradingAlertsProps {
  marketType: 'crypto' | 'forex' | 'stocks' | 'indices';
  symbol: string;
}

export const TradingAlerts: React.FC<TradingAlertsProps> = ({ marketType, symbol }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newAlert, setNewAlert] = React.useState({
    alert_type: 'price',
    condition: 'above',
    value: ''
  });
  const [dialogOpen, setDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user, symbol]);

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_alerts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('market_type', marketType)
        .eq('symbol', symbol)
        .eq('status', 'active');

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async () => {
    try {
      const { error } = await supabase
        .from('trading_alerts')
        .insert([
          {
            user_id: user?.id,
            market_type: marketType,
            symbol,
            alert_type: newAlert.alert_type,
            condition: newAlert.condition,
            value: parseFloat(newAlert.value)
          }
        ]);

      if (error) throw error;
      setDialogOpen(false);
      await loadAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const disableAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('trading_alerts')
        .update({ status: 'disabled' })
        .eq('id', alertId);

      if (error) throw error;
      await loadAlerts();
    } catch (error) {
      console.error('Error disabling alert:', error);
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Fiyat Alarmları</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Alarm Ekle</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Select
                onValueChange={(value) => setNewAlert({ ...newAlert, alert_type: value })}
                defaultValue={newAlert.alert_type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alarm tipi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Fiyat</SelectItem>
                  <SelectItem value="percent_change">Yüzde Değişim</SelectItem>
                  <SelectItem value="volume">Hacim</SelectItem>
                  <SelectItem value="technical">Teknik İndikatör</SelectItem>
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) => setNewAlert({ ...newAlert, condition: value })}
                defaultValue={newAlert.condition}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Koşul" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">Üzerine Çıktığında</SelectItem>
                  <SelectItem value="below">Altına Düştüğünde</SelectItem>
                  <SelectItem value="crosses_up">Yukarı Kırdığında</SelectItem>
                  <SelectItem value="crosses_down">Aşağı Kırdığında</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Değer"
                value={newAlert.value}
                onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
              />

              <Button onClick={createAlert}>Alarm Ekle</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between mb-2">
              <div>
                <div className="font-medium">
                  {alert.alert_type === 'price' && 'Fiyat'}
                  {alert.alert_type === 'percent_change' && 'Yüzde Değişim'}
                  {alert.alert_type === 'volume' && 'Hacim'}
                  {alert.alert_type === 'technical' && 'Teknik'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {alert.condition === 'above' && 'Üzerine Çıktığında'}
                  {alert.condition === 'below' && 'Altına Düştüğünde'}
                  {alert.condition === 'crosses_up' && 'Yukarı Kırdığında'}
                  {alert.condition === 'crosses_down' && 'Aşağı Kırdığında'}
                  {' '}{alert.value}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => disableAlert(alert.id)}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};