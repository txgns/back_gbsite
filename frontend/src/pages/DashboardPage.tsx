import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user && user.id) {
        const API_URL = import.meta.env.VITE_API_URL || "";
        try {
          const response = await fetch(`${API_URL}/api/user/orders/${user.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch orders');
          }
          const data = await response.json();
          setOrders(data);
        } catch (error: any) {
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
    return null; // or a loading spinner
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Bem-vindo, {user.username}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>Detalhes do seu perfil.</CardDescription>
          </CardHeader>
          <CardContent>
            <p><strong>Nome de Usuário:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Tipo de Usuário:</strong> {user.role}</p>
            <Button onClick={handleLogout} className="mt-4 w-full">Sair</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Histórico de Pedidos</CardTitle>
            <CardDescription>Seus pedidos recentes.</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p>Você ainda não fez nenhum pedido.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <CardTitle>Pedido #{order.id} - Status: {order.status}</CardTitle>
                      <CardDescription>Data: {new Date(order.created_at).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold mb-2">Itens:</h4>
                      <ul className="list-disc pl-5">
                        {order.items.map((item, index) => (
                          <li key={index}>{item.product_name} (x{item.quantity}) - R${item.price.toFixed(2)}</li>
                        ))}
                      </ul>
                      <p className="mt-2 font-bold">Total: R${order.total_price.toFixed(2)}</p>
                    </CardContent>
                  </Card>
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


