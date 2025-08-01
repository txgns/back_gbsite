import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Show loading if auth is being checked
  if (!isAuthenticated || !user) {
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
          <p className="text-white/70">Gerencie sua conta e acompanhe seus pedidos.</p>
        </div>

        {/* Simple Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                }`}>
                  {user.role === 'admin' ? 'Administrador' : 'Cliente'}
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
              {user.role === 'admin' && (
                <Link 
                  to="/admin"
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Painel Admin
                </Link>
              )}
            </div>
          </div>

          <div className="bg-robotics-black-light border border-white/10 rounded-lg p-6">
            <h3 className="text-white text-xl font-bold mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <Link 
                to="/loja"
                className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Ir para a Loja
              </Link>
              <Link 
                to="/carrinho"
                className="block w-full text-center px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Ver Carrinho
              </Link>
              <Link 
                to="/checkout"
                className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Finalizar Compra
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;


