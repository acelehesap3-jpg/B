import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  Coins, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  BarChart3,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Bell,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  CreditCard,
  Wallet,
  Activity,
  Globe,
  Server,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AdvancedAdminPanelProps {
  user: any;
}

const AdvancedAdminPanel: React.FC<AdvancedAdminPanelProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([
    { id: 1, email: 'user1@example.com', status: 'active', balance: 15420.50, tokens: 150, joinDate: '2024-10-15', lastActive: '2024-11-06' },
    { id: 2, email: 'user2@example.com', status: 'suspended', balance: 8930.25, tokens: 89, joinDate: '2024-09-22', lastActive: '2024-11-05' },
    { id: 3, email: 'user3@example.com', status: 'pending', balance: 0, tokens: 0, joinDate: '2024-11-06', lastActive: '2024-11-06' }
  ]);

  const [tokenRequests, setTokenRequests] = useState([
    { id: 1, userId: 1, email: 'user1@example.com', amount: 500, price: 0.10, total: 50.00, status: 'pending', date: '2024-11-06' },
    { id: 2, userId: 2, email: 'user2@example.com', amount: 1000, price: 0.10, total: 100.00, status: 'pending', date: '2024-11-06' },
    { id: 3, userId: 3, email: 'user3@example.com', amount: 250, price: 0.10, total: 25.00, status: 'approved', date: '2024-11-05' }
  ]);

  const [systemStats, setSystemStats] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    totalVolume: 15420000,
    totalTokens: 125000,
    pendingRequests: 23,
    systemUptime: 99.9,
    serverLoad: 45,
    databaseSize: 2.4
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleApproveToken = (requestId: number) => {
    setTokenRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' }
          : req
      )
    );
    toast.success('Token purchase approved!');
  };

  const handleRejectToken = (requestId: number) => {
    setTokenRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' }
          : req
      )
    );
    toast.success('Token purchase rejected!');
  };

  const handleUserStatusChange = (userId: number, newStatus: string) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus }
          : user
      )
    );
    toast.success(`User status updated to ${newStatus}!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'suspended': return 'text-red-400 bg-red-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'approved': return 'text-green-400 bg-green-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'suspended': return XCircle;
      case 'pending': return Clock;
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredRequests = tokenRequests.filter(req => {
    const matchesSearch = req.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Admin Panel</h2>
          <p className="text-gray-400">Comprehensive system management and oversight</p>
        </div>
        <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
          <Shield className="h-4 w-4 mr-1" />
          Administrator
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Users', value: systemStats.totalUsers.toLocaleString(), change: '+12%', icon: Users, color: 'from-blue-500 to-cyan-500' },
          { title: 'Active Users', value: systemStats.activeUsers.toLocaleString(), change: '+8%', icon: UserCheck, color: 'from-green-500 to-emerald-500' },
          { title: 'Trading Volume', value: `$${(systemStats.totalVolume / 1000000).toFixed(1)}M`, change: '+23%', icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
          { title: 'Pending Requests', value: systemStats.pendingRequests.toString(), change: '+5', icon: Clock, color: 'from-orange-500 to-red-500' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-black/30 border-white/20 hover:bg-black/40 transition-all duration-200">
              <CardContent className="p-6">
                <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-r mb-4 flex items-center justify-center", stat.color)}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-green-400">{stat.change}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-black/30 border border-white/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-white/20">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="tokens" className="data-[state=active]:bg-white/20">
            <Coins className="h-4 w-4 mr-2" />
            Token Requests
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-white/20">
            <Server className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white/20">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card className="bg-black/30 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-400" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Uptime</span>
                  <span className="text-green-400 font-semibold">{systemStats.systemUptime}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Server Load</span>
                  <span className="text-yellow-400 font-semibold">{systemStats.serverLoad}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Database Size</span>
                  <span className="text-blue-400 font-semibold">{systemStats.databaseSize} GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Active Connections</span>
                  <span className="text-purple-400 font-semibold">1,247</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-black/30 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-orange-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: 'New user registration', user: 'user@example.com', time: '2 min ago', type: 'user' },
                    { action: 'Token purchase approved', user: 'trader@example.com', time: '5 min ago', type: 'token' },
                    { action: 'Large trade executed', user: 'whale@example.com', time: '8 min ago', type: 'trade' },
                    { action: 'System backup completed', user: 'System', time: '15 min ago', type: 'system' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        activity.type === 'user' ? 'bg-blue-400' :
                        activity.type === 'token' ? 'bg-orange-400' :
                        activity.type === 'trade' ? 'bg-green-400' : 'bg-purple-400'
                      )} />
                      <div className="flex-1">
                        <p className="text-sm text-white">{activity.action}</p>
                        <p className="text-xs text-gray-400">{activity.user} • {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* Search and Filter */}
          <Card className="bg-black/30 border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="bg-black/30 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredUsers.map((user) => {
                  const StatusIcon = getStatusIcon(user.status);
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.email}</p>
                          <p className="text-sm text-gray-400">
                            Joined {user.joinDate} • Last active {user.lastActive}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-white">${user.balance.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">{user.tokens} OMNI99</p>
                        </div>
                        
                        <Badge className={cn("px-2 py-1", getStatusColor(user.status))}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {user.status}
                        </Badge>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            {user.status === 'active' ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Token Requests Tab */}
        <TabsContent value="tokens" className="space-y-6">
          <Card className="bg-black/30 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Token Purchase Requests</CardTitle>
              <p className="text-gray-400">Review and approve OMNI99 token purchases</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredRequests.map((request) => {
                  const StatusIcon = getStatusIcon(request.status);
                  return (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                          <Coins className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{request.email}</p>
                          <p className="text-sm text-gray-400">
                            {request.amount} tokens • ${request.total.toFixed(2)} • {request.date}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Badge className={cn("px-2 py-1", getStatusColor(request.status))}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {request.status}
                        </Badge>
                        
                        {request.status === 'pending' && (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveToken(request.id)}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectToken(request.id)}
                              className="border-red-500 text-red-400 hover:bg-red-500/20"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/30 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">System Monitoring</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-gray-400">
                  <Server className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>System monitoring dashboard</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Database Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-gray-400">
                  <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Database administration tools</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-black/30 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-400 mt-20">
                <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>System configuration panel</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAdminPanel;