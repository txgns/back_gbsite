import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    const result = await register(username, email, password);
    
    if (result.success) {
      navigate('/loja');
    } else {
      setError(result.error || 'Erro ao criar conta');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link to="/loja">
            <Button variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <ArrowLeft size={16} />
              Voltar à Loja
            </Button>
          </Link>
        </div>

        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Criar Conta</CardTitle>
            <CardDescription className="text-gray-300">
              Crie sua conta para salvar seu carrinho e acompanhar pedidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-200 text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <Input
                  type="text"
                  placeholder="Nome de usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <Input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <Input
                  type="password"
                  placeholder="Senha (mínimo 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <Input
                  type="password"
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                <UserPlus size={16} />
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-300 text-sm">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-purple-400 hover:text-purple-300">
                  Faça login aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;

