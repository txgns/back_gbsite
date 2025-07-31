import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Save, Eye, EyeOff } from 'lucide-react';

const EditProfilePage: React.FC = () => {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate password fields if user wants to change password
      if (formData.newPassword || formData.confirmPassword) {
        if (!formData.currentPassword) {
          throw new Error('Senha atual é obrigatória para alterar a senha');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Nova senha e confirmação não conferem');
        }
        if (formData.newPassword.length < 6) {
          throw new Error('Nova senha deve ter pelo menos 6 caracteres');
        }
      }

      const updateData: any = {
        username: formData.username,
        email: formData.email
      };

      if (formData.newPassword) {
        updateData.current_password = formData.currentPassword;
        updateData.new_password = formData.newPassword;
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao atualizar perfil');
      }

      const updatedUser = await response.json();
      
      // Update user data in context
      login(token!, updatedUser.user);

      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram atualizadas com sucesso.',
      });

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message || 'Não foi possível atualizar o perfil.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-robotics-black">
      {/* Header */}
      <div className="bg-robotics-black-light border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Voltar ao Dashboard</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">Editar Perfil</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-robotics-black-light border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User size={20} />
                Informações do Perfil
              </CardTitle>
              <CardDescription className="text-white/70">
                Atualize suas informações pessoais e senha.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Informações Básicas</h3>
                  
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-white/70 mb-2">
                      Nome de Usuário
                    </label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="bg-robotics-black border-white/20 text-white placeholder-white/50"
                      required
                      minLength={3}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-robotics-black border-white/20 text-white placeholder-white/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Tipo de Usuário
                    </label>
                    <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                      user.role === 'admin' ? 'bg-robotics-purple/20 text-robotics-purple' : 'bg-green-500/20 text-green-500'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                    </div>
                  </div>
                </div>

                {/* Password Change */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <h3 className="text-lg font-medium text-white">Alterar Senha</h3>
                  <p className="text-sm text-white/60">Deixe em branco se não quiser alterar a senha.</p>
                  
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-white/70 mb-2">
                      Senha Atual
                    </label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="bg-robotics-black border-white/20 text-white placeholder-white/50 pr-10"
                        placeholder="Digite sua senha atual"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white/80"
                      >
                        {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-white/70 mb-2">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="bg-robotics-black border-white/20 text-white placeholder-white/50 pr-10"
                        placeholder="Digite a nova senha"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white/80"
                      >
                        {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70 mb-2">
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="bg-robotics-black border-white/20 text-white placeholder-white/50 pr-10"
                        placeholder="Confirme a nova senha"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white/80"
                      >
                        {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-robotics-purple hover:bg-robotics-purple-light text-white font-medium py-3 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    <span>{isLoading ? 'Salvando...' : 'Salvar Alterações'}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;