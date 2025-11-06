import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  BellRing, 
  Volume2, 
  VolumeX, 
  Mail, 
  MessageSquare, 
  Smartphone,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  DollarSign,
  Clock,
  Settings,
  Plus,
  Trash2,
  Edit,
  Check,
  X
} from 'lucide-react';

interface PriceAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below' | 'change';
  value: number;
  currentPrice: number;
  isActive: boolean;
  triggered: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

interface Notification {
  id: string;
  type: 'price' | 'trade' | 'risk' | 'news' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'price',
      title: 'BTC Fiyat Uyarısı',
      message: 'Bitcoin $45,000 seviyesini aştı!',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'trade',
      title: 'İşlem Tamamlandı',
      message: 'ETH/USDT alım emriniz $2,650 fiyatından gerçekleşti',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'risk',
      title: 'Risk Uyarısı',
      message: 'Portföy riski %15 seviyesine ulaştı',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
      priority: 'high'
    },
    {
      id: '4',
      type: 'news',
      title: 'Piyasa Haberi',
      message: 'Fed faiz kararı açıklandı - %0.25 artış',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: true,
      priority: 'medium'
    }
  ]);

  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([
    {
      id: '1',
      symbol: 'BTC/USDT',
      condition: 'above',
      value: 45000,
      currentPrice: 44200,
      isActive: true,
      triggered: false,
      createdAt: new Date()
    },
    {
      id: '2',
      symbol: 'ETH/USDT',
      condition: 'below',
      value: 2500,
      currentPrice: 2650,
      isActive: true,
      triggered: false,
      createdAt: new Date()
    },
    {
      id: '3',
      symbol: 'ADA/USDT',
      condition: 'change',
      value: 5,
      currentPrice: 0.42,
      isActive: true,
      triggered: true,
      createdAt: new Date(),
      triggeredAt: new Date(Date.now() - 30 * 60 * 1000)
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    priceAlerts: true,
    tradeNotifications: true,
    riskWarnings: true,
    newsUpdates: true,
    systemAlerts: true,
    soundEnabled: true,
    emailEnabled: false,
    pushEnabled: true,
    telegramEnabled: false
  });

  const [newAlert, setNewAlert] = useState({
    symbol: '',
    condition: 'above' as 'above' | 'below' | 'change',
    value: ''
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const createPriceAlert = () => {
    if (!newAlert.symbol || !newAlert.value) return;

    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol,
      condition: newAlert.condition,
      value: parseFloat(newAlert.value),
      currentPrice: Math.random() * 50000, // Simulated current price
      isActive: true,
      triggered: false,
      createdAt: new Date()
    };

    setPriceAlerts(prev => [...prev, alert]);
    setNewAlert({ symbol: '', condition: 'above', value: '' });
  };

  const toggleAlert = (id: string) => {
    setPriceAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
      )
    );
  };

  const deleteAlert = (id: string) => {
    setPriceAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'price': return <TrendingUp className="h-4 w-4" />;
      case 'trade': return <Target className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      case 'news': return <MessageSquare className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} gün önce`;
    if (hours > 0) return `${hours} saat önce`;
    if (minutes > 0) return `${minutes} dakika önce`;
    return 'Az önce';
  };

  return (
    <div className="space-y-6">
      {/* Notification Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-6 w-6 text-blue-500" />
            Bildirim Sistemi
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} yeni
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Fiyat uyarıları, işlem bildirimleri ve piyasa haberleri
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="alerts">Fiyat Uyarıları</TabsTrigger>
          <TabsTrigger value="settings">Ayarlar</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Son Bildirimler</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-1" />
                Tümünü Okundu İşaretle
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card key={notification.id} className={`${!notification.read ? 'border-blue-200 bg-blue-50/30' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">{formatTimestamp(notification.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Price Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {/* Create New Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Yeni Fiyat Uyarısı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Sembol</Label>
                  <Select value={newAlert.symbol} onValueChange={(value) => setNewAlert(prev => ({ ...prev, symbol: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                      <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                      <SelectItem value="ADA/USDT">ADA/USDT</SelectItem>
                      <SelectItem value="DOT/USDT">DOT/USDT</SelectItem>
                      <SelectItem value="LINK/USDT">LINK/USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Koşul</Label>
                  <Select value={newAlert.condition} onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, condition: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Üstünde</SelectItem>
                      <SelectItem value="below">Altında</SelectItem>
                      <SelectItem value="change">% Değişim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Değer</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newAlert.value}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, value: e.target.value }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={createPriceAlert} className="w-full">
                    <Plus className="h-4 w-4 mr-1" />
                    Oluştur
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Aktif Uyarılar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {priceAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{alert.symbol.split('/')[0]}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{alert.symbol}</h4>
                        <p className="text-sm text-gray-600">
                          {alert.condition === 'above' ? 'Üstünde' : 
                           alert.condition === 'below' ? 'Altında' : '% Değişim'} {alert.value}
                          {alert.condition === 'change' ? '%' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm">
                        <p className="font-semibold">${alert.currentPrice.toLocaleString()}</p>
                        <p className="text-gray-500">Mevcut fiyat</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {alert.triggered && (
                          <Badge variant="destructive" className="text-xs">
                            Tetiklendi
                          </Badge>
                        )}
                        <Badge variant={alert.isActive ? 'default' : 'secondary'} className="text-xs">
                          {alert.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAlert(alert.id)}
                        >
                          {alert.isActive ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAlert(alert.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Türleri</CardTitle>
              <CardDescription>
                Hangi tür bildirimleri almak istediğinizi seçin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <Label>Fiyat Uyarıları</Label>
                </div>
                <Switch
                  checked={notificationSettings.priceAlerts}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, priceAlerts: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <Label>İşlem Bildirimleri</Label>
                </div>
                <Switch
                  checked={notificationSettings.tradeNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, tradeNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <Label>Risk Uyarıları</Label>
                </div>
                <Switch
                  checked={notificationSettings.riskWarnings}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, riskWarnings: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                  <Label>Piyasa Haberleri</Label>
                </div>
                <Switch
                  checked={notificationSettings.newsUpdates}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, newsUpdates: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-gray-500" />
                  <Label>Sistem Bildirimleri</Label>
                </div>
                <Switch
                  checked={notificationSettings.systemAlerts}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bildirim Kanalları</CardTitle>
              <CardDescription>
                Bildirimleri nasıl almak istediğinizi seçin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-green-500" />
                  <Label>Ses Bildirimleri</Label>
                </div>
                <Switch
                  checked={notificationSettings.soundEnabled}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, soundEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-blue-500" />
                  <Label>Push Bildirimleri</Label>
                </div>
                <Switch
                  checked={notificationSettings.pushEnabled}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-red-500" />
                  <Label>E-posta Bildirimleri</Label>
                </div>
                <Switch
                  checked={notificationSettings.emailEnabled}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  <Label>Telegram Bildirimleri</Label>
                </div>
                <Switch
                  checked={notificationSettings.telegramEnabled}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, telegramEnabled: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationSystem;