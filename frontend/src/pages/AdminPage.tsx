import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  ArrowLeft, 
  Search, 
  Trash2, 
  Edit, 
  Plus,
  BarChart3,
  DollarSign,
  TrendingUp
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

interface Order {
  id: number;
  user_id: number;
  user_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  category: string;
  is_active: boolean;
  description: string;
}

interface AdminStats {
  total_users: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
}

type ActiveTab = 'dashboard' | 'users' | 'orders' | 'products';

const AdminPage: React.FC = () => {
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // States
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_orders: 0,
    pending_orders: 0,
    total_revenue: 0
  });
  
  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  
  // Loading states
  const [loading, setLoading] = useState(false);

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'admin') {
      toast({
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar esta página.',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, user, navigate, toast]);

  // Fetch data functions
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pedidos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products?per_page=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os produtos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin') {
      switch (activeTab) {
        case 'users':
          fetchUsers();
          break;
        case 'orders':
          fetchOrders();
          break;
        case 'products':
          fetchProducts();
          break;
      }
    }
  }, [activeTab, user]);

  // Handle actions
  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast({
          title: 'Role atualizada',
          description: 'Role do usuário foi atualizada com sucesso.',
        });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a role do usuário.',
        variant: 'destructive',
      });
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast({
          title: 'Status atualizado',
          description: 'Status do pedido foi atualizado com sucesso.',
        });
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do pedido.',
        variant: 'destructive',
      });
    }
  };

  const updateProductStock = async (productId: string, stockQuantity: number) => {
    try {
      const response = await fetch(`/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock_quantity: stockQuantity }),
      });

      if (response.ok) {
        toast({
          title: 'Estoque atualizado',
          description: 'Quantidade em estoque foi atualizada com sucesso.',
        });
        fetchProducts();
      }
    } catch (error) {
      console.error('Error updating product stock:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o estoque.',
        variant: 'destructive',
      });
    }
  };

  // Filter functions
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(orderSearch) ||
    order.user_email?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.status.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-robotics-black">
      {/* Header */}
      <div className="bg-robotics-black-light border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard"
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Voltar</span>
              </Link>
              <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'users', label: 'Usuários', icon: Users },
            { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
            { id: 'products', label: 'Estoque', icon: Package },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as ActiveTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-robotics-purple text-white'
                  : 'bg-robotics-black-light text-white/80 hover:text-white hover:bg-robotics-black-lighter'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-robotics-black-light border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white/70">Total de Usuários</p>
                      <p className="text-2xl font-bold text-white">{stats.total_users}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-robotics-black-light border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <ShoppingBag className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white/70">Total de Pedidos</p>
                      <p className="text-2xl font-bold text-white">{stats.total_orders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-robotics-black-light border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Package className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white/70">Pedidos Pendentes</p>
                      <p className="text-2xl font-bold text-white">{stats.pending_orders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-robotics-black-light border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-robotics-purple/20 rounded-lg">
                      <DollarSign className="h-6 w-6 text-robotics-purple" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white/70">Receita Total</p>
                      <p className="text-2xl font-bold text-white">R$ {stats.total_revenue.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Gerenciar Usuários</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                  <Input
                    placeholder="Buscar usuários..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10 bg-robotics-black-light border-white/20 text-white placeholder-white/50"
                  />
                </div>
              </div>
            </div>

            <Card className="bg-robotics-black-light border-white/10">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/10">
                      <tr>
                        <th className="text-left p-4 text-white/70 font-medium">ID</th>
                        <th className="text-left p-4 text-white/70 font-medium">Nome</th>
                        <th className="text-left p-4 text-white/70 font-medium">Email</th>
                        <th className="text-left p-4 text-white/70 font-medium">Função</th>
                        <th className="text-left p-4 text-white/70 font-medium">Data de Criação</th>
                        <th className="text-left p-4 text-white/70 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="text-center p-8 text-white/70">
                            Carregando usuários...
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center p-8 text-white/70">
                            Nenhum usuário encontrado.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-white/5 hover:bg-robotics-black/50">
                            <td className="p-4 text-white">{user.id}</td>
                            <td className="p-4 text-white font-medium">{user.username}</td>
                            <td className="p-4 text-white/80">{user.email}</td>
                            <td className="p-4">
                              <Badge 
                                variant={user.role === 'admin' ? 'default' : 'secondary'}
                                className={user.role === 'admin' ? 'bg-robotics-purple' : 'bg-green-500/20 text-green-500'}
                              >
                                {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                              </Badge>
                            </td>
                            <td className="p-4 text-white/70">
                              {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Gerenciar Pedidos</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                <Input
                  placeholder="Buscar pedidos..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-10 bg-robotics-black-light border-white/20 text-white placeholder-white/50"
                />
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <Card className="bg-robotics-black-light border-white/10">
                  <CardContent className="p-8 text-center text-white/70">
                    Carregando pedidos...
                  </CardContent>
                </Card>
              ) : filteredOrders.length === 0 ? (
                <Card className="bg-robotics-black-light border-white/10">
                  <CardContent className="p-8 text-center text-white/70">
                    Nenhum pedido encontrado.
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order.id} className="bg-robotics-black-light border-white/10">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white">Pedido #{order.id}</CardTitle>
                          <CardDescription className="text-white/70">
                            Cliente: {order.user_email} • {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              order.status === 'pending' ? 'secondary' :
                              order.status === 'paid' ? 'default' : 'outline'
                            }
                            className={
                              order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                              order.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                              'bg-blue-500/20 text-blue-500'
                            }
                          >
                            {order.status === 'pending' ? 'Pendente' : 
                             order.status === 'paid' ? 'Pago' : order.status}
                          </Badge>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="bg-robotics-black border border-white/20 text-white rounded px-2 py-1 text-sm"
                          >
                            <option value="pending">Pendente</option>
                            <option value="paid">Pago</option>
                            <option value="processing">Processando</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregue</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-white mb-2">Itens do Pedido:</h4>
                          <ul className="space-y-1">
                            {order.items?.map((item, index) => (
                              <li key={index} className="text-sm text-white/80 flex justify-between">
                                <span>{item.product_name} (x{item.quantity})</span>
                                <span>R$ {item.price.toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-white">
                          <span>Total:</span>
                          <span>R$ {order.total_amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Gerenciar Estoque</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                <Input
                  placeholder="Buscar produtos..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-10 bg-robotics-black-light border-white/20 text-white placeholder-white/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <Card className="bg-robotics-black-light border-white/10 col-span-full">
                  <CardContent className="p-8 text-center text-white/70">
                    Carregando produtos...
                  </CardContent>
                </Card>
              ) : filteredProducts.length === 0 ? (
                <Card className="bg-robotics-black-light border-white/10 col-span-full">
                  <CardContent className="p-8 text-center text-white/70">
                    Nenhum produto encontrado.
                  </CardContent>
                </Card>
              ) : (
                filteredProducts.map((product) => (
                  <Card key={product.id} className="bg-robotics-black-light border-white/10">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white text-lg">{product.name}</CardTitle>
                          <CardDescription className="text-white/70">{product.category}</CardDescription>
                        </div>
                        <Badge 
                          variant={product.is_active ? 'default' : 'secondary'}
                          className={product.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}
                        >
                          {product.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-white/70">Preço:</span>
                        <span className="text-white font-medium">R$ {product.price.toFixed(2)}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Estoque:</span>
                          <Badge 
                            variant={product.stock_quantity > 10 ? 'default' : product.stock_quantity > 0 ? 'secondary' : 'destructive'}
                            className={
                              product.stock_quantity > 10 ? 'bg-green-500/20 text-green-500' :
                              product.stock_quantity > 0 ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-red-500/20 text-red-500'
                            }
                          >
                            {product.stock_quantity} unidades
                          </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Nova quantidade"
                            min="0"
                            className="bg-robotics-black border-white/20 text-white flex-1"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                const newStock = parseInt(input.value);
                                if (!isNaN(newStock) && newStock >= 0) {
                                  updateProductStock(product.id, newStock);
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <Button 
                            size="sm"
                            onClick={(e) => {
                              const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                              const newStock = parseInt(input.value);
                              if (!isNaN(newStock) && newStock >= 0) {
                                updateProductStock(product.id, newStock);
                                input.value = '';
                              }
                            }}
                            className="bg-robotics-purple hover:bg-robotics-purple-light"
                          >
                            Atualizar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;