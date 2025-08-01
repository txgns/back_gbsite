import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

interface Order {
  id: number;
  items: { product_name: string; quantity: number; price: number }[];
  total_amount: number;
  status: string;
  created_at: string;
}

const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Se for admin, redireciona direto para o painel admin
    if (user?.role === 'admin') {
      navigate('/admin');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user && user.id) {
        try {
          const response = await fetch('/api/orders/', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setOrders(data.orders || []);
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    if (user?.role !== 'admin') {
      fetchOrders();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pendente';
      case 'paid':
        return 'Pago';
      case 'processing':
        return 'Processando';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregue';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  // Show loading if auth is being checked
  if (!isAuthenticated || !user || user.role === 'admin') {
    return (
      <div className="min-h-screen bg-robotics-black flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
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
                className="text-white/80 hover:text-white px-4 py-2 rounded"
              >
                Início
              </Link>
              <Link 
                to="/loja"
                className="text-white/80 hover:text-white px-4 py-2 rounded"
              >
                Loja
              </Link>
              <Link 
                to="/carrinho"
                className="text-white/80 hover:text-white px-4 py-2 rounded"
              >
                Carrinho
              </Link>
              <button 
                onClick={handleLogout}
                className="text-white/80 hover:text-white px-4 py-2 border border-white/20 rounded hover:bg-robotics-black-lighter"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo, {user.username}!</h2>
          <p className="text-white/70">Acompanhe seus pedidos e gerencie sua conta.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Information */}
          <div className="bg-robotics-black-light border border-white/10 rounded-lg p-6">
            <h3 className="text-white text-xl font-bold mb-4">Informações da Conta</h3>
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Cliente
                </span>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <Link 
                to="/profile/edit"
                className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Editar Perfil
              </Link>
              <Link 
                to="/loja"
                className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Continuar Comprando
              </Link>
            </div>
          </div>

          {/* Order History */}
          <div className="lg:col-span-2 bg-robotics-black-light border border-white/10 rounded-lg p-6">
            <h3 className="text-white text-xl font-bold mb-4">Histórico de Pedidos</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="text-white/70">Carregando pedidos...</div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl text-white/20 mb-4">📦</div>
                <p className="text-white/70 mb-4">Você ainda não fez nenhum pedido.</p>
                <Link 
                  to="/loja"
                  className="inline-block px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Fazer Primeiro Pedido
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {orders.map((order) => (
                  <div key={order.id} className="bg-robotics-black border border-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-white text-lg font-semibold">Pedido #{order.id}</h4>
                        <p className="text-white/70 text-sm">
                          {new Date(order.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <h5 className="text-white font-medium text-sm mb-2">Itens:</h5>
                      <ul className="space-y-1">
                        {order.items?.map((item, index) => (
                          <li key={index} className="text-sm text-white/80 flex justify-between">
                            <span>{item.product_name} (x{item.quantity})</span>
                            <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                      <div className="font-bold text-white">
                        Total: R$ {order.total_amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-white/50">
                        {order.status === 'pending' && 'Aguardando pagamento'}
                        {order.status === 'paid' && 'Pagamento confirmado'}
                        {order.status === 'processing' && 'Preparando pedido'}
                        {order.status === 'shipped' && 'Pedido a caminho'}
                        {order.status === 'delivered' && 'Pedido entregue'}
                        {order.status === 'cancelled' && 'Pedido cancelado'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;


