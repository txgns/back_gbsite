import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Erro ao registrar usuário');
      }

      const data = await response.json();
      login(data.access_token);
      toast({
        title: 'Registro bem-sucedido!',
        description: 'Sua conta foi criada com sucesso.',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Erro de Registro',
        description: error.message || 'Ocorreu um erro. Por favor, tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20"></div>
      <Card className="w-full max-w-md relative z-10 bg-gray-900/90 border-purple-500/30 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-black">G</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Registrar</CardTitle>
          <CardDescription className="text-gray-300">
            Crie uma nova conta para acessar a loja.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-green-400 font-medium">Nome de Usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="Seu nome de usuário"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-green-400 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-green-400 font-medium">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring-green-400"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200"
            >
              Registrar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-400">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-medium text-green-400 hover:text-green-300 hover:underline transition-colors">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;

