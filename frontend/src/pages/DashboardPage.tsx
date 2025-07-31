import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Store, Home, User, Package, LogOut, Settings } from 'lucide-react';

interface Order {
  id: number;
  items: { product_name: string; quantity: number; price: number }[];
  total_price: number;
  status: string;
  created_at: string;
}

const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const { totalItems, totalPrice } = useCart();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user && user.id) {
        try {
          const response = await fetch('/api/orders/', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch orders');
          }
          const data = await response.json();
          setOrders(data.orders || []);
        } catch (error: any) {
          console.error('Error fetching orders:', error);
          toast({
            title: 'Erro ao carregar pedidos',
            description: error.message || 'Não foi possível carregar o histórico de pedidos.',
            variant: 'destructive',
          });
        }
      }
    };
    fetchOrders();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: 'Logout bem-sucedido!',
      description: 'Você foi desconectado da sua conta.',
    });
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-robotics-black">
      {/* Header Navigation */}
      <div className="bg-robotics-black-light border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <div className="flex items-center gap-4">
              <Link 
                to="/"
                className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-robotics-black-lighter rounded-lg transition-colors"
              >
                <Home size={18} />
                <span>Início</span>
              </Link>
              <Link 
                to="/loja"
                className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-robotics-black-lighter rounded-lg transition-colors"
              >
                <Store size={18} />
                <span>Loja</span>
              </Link>
              <Link 
                to="/carrinho"
                className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-robotics-black-lighter rounded-lg transition-colors relative"
              >
                <ShoppingCart size={18} />
                <span>Carrinho</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-robotics-purple text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              {user.role === 'admin' && (
                <Link 
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-robotics-purple/20 rounded-lg transition-colors"
                >
                  <Settings size={18} />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo, {user.username}!</h2>
          <p className="text-white/70">Gerencie sua conta e acompanhe seus pedidos.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-robotics-black-light border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-robotics-purple/20 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-robotics-purple" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/70">Itens no Carrinho</p>
                  <p className="text-2xl font-bold text-white">{totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-robotics-black-light border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Package className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/70">Total de Pedidos</p>
                  <p className="text-2xl font-bold text-white">{orders.length}</p>
                </div>
              </div>
            </Card>
          </Card>

          <Card className="bg-robotics-black-light border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <span className="text-yellow-500 font-bold text-xl">R$</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white/70">Valor do Carrinho</p>
                  <p className="text-2xl font-bold text-white">R$ {totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Information */}
          <Card className="bg-robotics-black-light border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User size={20} />
                Informações da Conta
              </CardTitle>
              <CardDescription className="text-white/70">Detalhes do seu perfil.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-white/70">Nome de Usuário</p>
                  <p className="text-white font-medium">{user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Email</p>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Tipo de Usuário</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-robotics-purple/20 text-robotics-purple' : 'bg-green-500/20 text-green-500'
                  }`}>
                    {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </span>
                </div>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="mt-6 w-full gap-2 text-white/80 hover:text-white border-white/20 hover:bg-robotics-black-lighter"
              >
                <LogOut size={16} />
                Sair
              </Button>
            </CardContent>
          </Card>

          {/* Order History */}
          <Card className="lg:col-span-2 bg-robotics-black-light border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package size={20} />
                Histórico de Pedidos
              </CardTitle>
              <CardDescription className="text-white/70">Seus pedidos recentes.</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package size={48} className="mx-auto text-white/30 mb-4" />
                  <p className="text-white/70 mb-4">Você ainda não fez nenhum pedido.</p>
                  <Link to="/loja">
                    <Button className="bg-robotics-purple hover:bg-robotics-purple-light">
                      Ir para a Loja
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {orders.map((order) => (
                    <Card key={order.id} className="bg-robotics-black border-white/10">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-white text-lg">Pedido #{order.id}</CardTitle>
                            <CardDescription className="text-white/70">
                              {new Date(order.created_at).toLocaleDateString('pt-BR')}
                            </CardDescription>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                            order.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                            'bg-blue-500/20 text-blue-500'
                          }`}>
                            {order.status === 'pending' ? 'Pendente' : 
                             order.status === 'paid' ? 'Pago' : order.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-white text-sm">Itens:</h4>
                          <ul className="space-y-1">
                            {order.items.map((item, index) => (
                              <li key={index} className="text-sm text-white/80 flex justify-between">
                                <span>{item.product_name} (x{item.quantity})</span>
                                <span>R$ {item.price.toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-white">
                            <span>Total:</span>
                            <span>R$ {order.total_price.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;


