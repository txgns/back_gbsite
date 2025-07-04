import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { Users, Package, DollarSign, Clock, Settings, LogOut, ArrowLeft } from 'lucide-react';

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
};

type Order = {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: Array<{
    id: number;
    product_name: string;
    product_price: number;
    quantity: number;
  }>;
};

type Stats = {
  total_users: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
};

const AdminDashboardPage = () => {
  const { user, logout, token, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ total_users: 0, total_orders: 0, pending_orders: 0, total_revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'orders'>('stats');

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchData = async () => {
    if (!token) return;

    try {
      // Fetch stats
      const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch users
      const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }

      // Fetch orders
      const ordersResponse = await fetch('http://localhost:5000/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh orders
        fetchData();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const updateUserRole = async (userId: number, newRole: string) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        // Refresh users
        fetchData();
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard Administrativo</h1>
            <p className="text-gray-300">Bem-vindo, {user?.username}!</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Site
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')} 
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Dashboard Usuário
            </Button>
            <Button 
              onClick={handleLogout} 
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          <Button 
            onClick={() => setActiveTab('stats')}
            variant={activeTab === 'stats' ? 'default' : 'outline'}
            className={activeTab === 'stats' ? '' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
          >
            Estatísticas
          </Button>
          <Button 
            onClick={() => setActiveTab('users')}
            variant={activeTab === 'users' ? 'default' : 'outline'}
            className={activeTab === 'users' ? '' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
          >
            Usuários
          </Button>
          <Button 
            onClick={() => setActiveTab('orders')}
            variant={activeTab === 'orders' ? 'default' : 'outline'}
            className={activeTab === 'orders' ? '' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
          >
            Pedidos
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-white">Carregando...</div>
        ) : (
          <>
            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_users}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total_orders}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pending_orders}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {stats.total_revenue.toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Usuários</CardTitle>
                  <CardDescription>Lista de todos os usuários registrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            Membro desde: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={user.role}
                            onValueChange={(value) => updateUserRole(user.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="consumer">Consumidor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Pedidos</CardTitle>
                  <CardDescription>Lista de todos os pedidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">Pedido #{order.id}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">R$ {order.total_amount.toFixed(2)}</p>
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-32 mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="processing">Processando</SelectItem>
                                <SelectItem value="shipped">Enviado</SelectItem>
                                <SelectItem value="delivered">Entregue</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Separator className="my-2" />
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.product_name} x{item.quantity}</span>
                              <span>R$ {(item.product_price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;

