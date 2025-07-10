import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface Order {
  id: number;
  user_id: number;
  username: string;
  total_price: number;
  status: string;
  created_at: string;
}

const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

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
    const fetchData = async () => {
      if (isAdmin) {
        try {
          const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          const usersData = await usersResponse.json();
          setUsers(usersData);

          const ordersResponse = await fetch('http://localhost:5000/api/admin/orders', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          const ordersData = await ordersResponse.json();
          setOrders(ordersData);

        } catch (error: any) {
          toast({
            title: 'Erro ao carregar dados',
            description: error.message || 'Não foi possível carregar os dados do painel de administração.',
            variant: 'destructive',
          });
        }
      }
    };
    fetchData();
  }, [isAdmin]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Erro ao atualizar a função do usuário');
      }

      setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
      toast({
        title: 'Função do usuário atualizada',
        description: `A função do usuário ${userId} foi alterada para ${newRole}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar função',
        description: error.message || 'Ocorreu um erro ao atualizar a função do usuário.',
        variant: 'destructive',
      });
    }
  };

  const handleOrderStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Erro ao atualizar o status do pedido');
      }

      setOrders(orders.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));
      toast({
        title: 'Status do pedido atualizado',
        description: `O status do pedido ${orderId} foi alterado para ${newStatus}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar status do pedido',
        description: error.message || 'Ocorreu um erro ao atualizar o status do pedido.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: 'Logout bem-sucedido!',
      description: 'Você foi desconectado da sua conta.',
    });
  };

  if (!isAuthenticated || !isAdmin) {
    return null; // or a loading spinner
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Painel de Administração</h1>
      <Button onClick={handleLogout} className="mb-6">Sair</Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>Visualize e gerencie os usuários do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome de Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>
                    <Select onValueChange={(value) => handleRoleChange(u.id, value)} defaultValue={u.role}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Alterar Função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="consumer">Consumidor</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Pedidos</CardTitle>
          <CardDescription>Visualize e atualize o status dos pedidos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID do Pedido</TableHead>
                <TableHead>ID do Usuário</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{o.id}</TableCell>
                  <TableCell>{o.user_id}</TableCell>
                  <TableCell>{o.username}</TableCell>
                  <TableCell>R${o.total_price.toFixed(2)}</TableCell>
                  <TableCell>{o.status}</TableCell>
                  <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Select onValueChange={(value) => handleOrderStatusChange(o.id, value)} defaultValue={o.status}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Alterar Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="processing">Processando</SelectItem>
                        <SelectItem value="shipped">Enviado</SelectItem>
                        <SelectItem value="delivered">Entregue</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;


