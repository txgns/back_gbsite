import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { User, Package, LogOut, ArrowLeft, Settings } from 'lucide-react';

type Order = {
  id: number;
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

const DashboardPage = () => {
  const { user, logout, token, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5001/api/user/orders', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Meu Dashboard</h1>
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
            {isAdmin && (
              <Button 
                onClick={() => navigate('/admin')} 
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Settings className="mr-2 h-4 w-4" />
                Admin
              </Button>
            )}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* User Info Card */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Informações da Conta</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-white">
                <p className="font-medium">{user?.username}</p>
                <p className="text-sm text-gray-300">{user?.email}</p>
                <Badge className={`mt-2 ${user?.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                  {user?.role === 'admin' ? 'Administrador' : 'Consumidor'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Orders Summary */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total de Pedidos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{orders.length}</div>
              <p className="text-xs text-gray-300">
                {orders.filter(o => o.status === 'pending').length} pendentes
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-white">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={() => navigate('/loja')} 
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Ir para a Loja
              </Button>
              <Button 
                onClick={() => navigate('/cart')} 
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Ver Carrinho
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Orders History */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Histórico de Pedidos</CardTitle>
            <CardDescription className="text-gray-300">
              Acompanhe o status dos seus pedidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-white">Carregando pedidos...</div>
            ) : orders.length === 0 ? (
              <div className="text-center text-gray-300">
                <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Você ainda não fez nenhum pedido.</p>
                <Button 
                  onClick={() => navigate('/loja')} 
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                >
                  Fazer Primeiro Pedido
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-white/20 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-white">Pedido #{order.id}</p>
                        <p className="text-sm text-gray-300">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">R$ {order.total_amount.toFixed(2)}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                    </div>
                    <Separator className="my-2 bg-white/20" />
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm text-gray-300">
                          <span>{item.product_name} x{item.quantity}</span>
                          <span>R$ {(item.product_price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;

