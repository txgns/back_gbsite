import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface AdminStats {
  total_users: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
}

interface OrderStats {
  status_counts: Record<string, number>;
  total_revenue: number;
  pending_revenue: number;
}

const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout, token } = useAuth();
  const navigate = useNavigate();
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
      toast({
        title: 'Acesso Negado',
        description: 'Você não tem permissão para acessar esta página.',
        variant: 'destructive',
      });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (isAdmin && token) {
        try {
          // Fetch admin stats
          const adminResponse = await fetch('/api/admin/stats', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (adminResponse.ok) {
            const adminData = await adminResponse.json();
            setAdminStats(adminData);
          }

          // Fetch order stats
          const orderResponse = await fetch('/api/orders/stats', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            setOrderStats(orderData);
          }

        } catch (error: any) {
          console.error('Erro ao carregar estatísticas:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchStats();
  }, [isAdmin, token]);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: 'Logout bem-sucedido!',
      description: 'Você foi desconectado da sua conta.',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Painel de Administração</h1>
            <p className="text-gray-300 mt-2">Bem-vindo, {user?.username}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
                Voltar ao Site
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="destructive">
              Sair
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900/90 border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{adminStats?.total_users || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/90 border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total de Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{adminStats?.total_orders || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/90 border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Pedidos Pendentes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{orderStats?.status_counts?.pending || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/90 border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(orderStats?.total_revenue || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link to="/admin/orders">
            <Card className="bg-gray-900/90 border-purple-500/30 hover:bg-gray-800/90 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2 text-blue-400" />
                  Gestão de Pedidos
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Visualize e gerencie todos os pedidos do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Pedidos pendentes:</span>
                  <span className="text-yellow-400 font-bold">{orderStats?.status_counts?.pending || 0}</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/stock">
            <Card className="bg-gray-900/90 border-purple-500/30 hover:bg-gray-800/90 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Package className="h-5 w-5 mr-2 text-green-400" />
                  Gestão de Estoque
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Controle produtos, estoque e movimentações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Produtos cadastrados</span>
                  <span className="text-green-400 font-bold">-</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-gray-900/90 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
                Relatórios
              </CardTitle>
              <CardDescription className="text-gray-400">
                Análises e relatórios de vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Receita pendente:</span>
                <span className="text-purple-400 font-bold">
                  {formatCurrency(orderStats?.pending_revenue || 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Overview */}
        {orderStats && (
          <Card className="bg-gray-900/90 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Status dos Pedidos</CardTitle>
              <CardDescription className="text-gray-400">
                Distribuição atual dos pedidos por status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(orderStats.status_counts).map(([status, count]) => {
                  const statusLabels: Record<string, string> = {
                    pending: 'Pendente',
                    paid: 'Pago',
                    processing: 'Processando',
                    shipped: 'Enviado',
                    delivered: 'Entregue',
                    cancelled: 'Cancelado'
                  };

                  const statusColors: Record<string, string> = {
                    pending: 'text-yellow-400',
                    paid: 'text-green-400',
                    processing: 'text-blue-400',
                    shipped: 'text-purple-400',
                    delivered: 'text-green-400',
                    cancelled: 'text-red-400'
                  };

                  return (
                    <div key={status} className="text-center">
                      <div className={`text-2xl font-bold ${statusColors[status] || 'text-white'}`}>
                        {count}
                      </div>
                      <div className="text-sm text-gray-400">
                        {statusLabels[status] || status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;

