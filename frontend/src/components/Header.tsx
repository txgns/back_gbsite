
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, Settings, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
    setIsMenuOpen(false);
  };

  const isHomePage = location.pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-robotics-black/95 backdrop-blur-sm border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-robotics-purple to-robotics-purple-light rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-white font-bold text-xl">GBSite</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-white/80 hover:text-white transition-colors ${isHomePage ? 'text-robotics-purple' : ''}`}
            >
              Início
            </Link>
            <Link 
              to="/loja" 
              className={`text-white/80 hover:text-white transition-colors ${location.pathname === '/loja' ? 'text-robotics-purple' : ''}`}
            >
              Loja
            </Link>
            <Link 
              to="/sobre" 
              className="text-white/80 hover:text-white transition-colors"
            >
              Sobre
            </Link>
            <Link 
              to="/contato" 
              className="text-white/80 hover:text-white transition-colors"
            >
              Contato
            </Link>
          </div>

          {/* Right side - Auth + Cart */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon with Counter */}
            {isAuthenticated && (
              <Link to="/cart" className="relative p-2 text-white/80 hover:text-white transition-colors">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-robotics-purple text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu or Login Button */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-white/80 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-robotics-purple to-robotics-purple-light rounded-full flex items-center justify-center">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user.username}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-robotics-black-light border border-white/10 rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-sm font-medium text-white">{user.username}</p>
                      <p className="text-xs text-white/60">{user.email}</p>
                      <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${
                        user.role === 'admin' 
                          ? 'bg-robotics-purple text-white' 
                          : 'bg-gray-600 text-white'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                      </span>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-robotics-black-lighter transition-colors"
                    >
                      <User size={16} className="mr-2" />
                      Meu Perfil
                    </Link>

                    <Link
                      to="/cart"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-robotics-black-lighter transition-colors"
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      Meu Carrinho ({totalItems})
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-robotics-black-lighter transition-colors"
                    >
                      <Package size={16} className="mr-2" />
                      Meus Pedidos
                    </Link>

                    {user.role === 'admin' && (
                      <>
                        <div className="border-t border-white/10 my-1"></div>
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-robotics-purple hover:text-robotics-purple-light hover:bg-robotics-black-lighter transition-colors"
                        >
                          <Settings size={16} className="mr-2" />
                          Painel Admin
                        </Link>
                      </>
                    )}

                    <div className="border-t border-white/10 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-robotics-black-lighter transition-colors"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  size="sm"
                  className="text-white/80 hover:text-white border-white/20 hover:bg-white/10"
                >
                  Entrar
                </Button>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-robotics-purple to-robotics-purple-light hover:from-robotics-purple-light hover:to-robotics-purple"
                  >
                    Registrar
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                onClick={() => setIsMenuOpen(false)}
                className={`text-white/80 hover:text-white transition-colors ${isHomePage ? 'text-robotics-purple' : ''}`}
              >
                Início
              </Link>
              <Link 
                to="/loja" 
                onClick={() => setIsMenuOpen(false)}
                className={`text-white/80 hover:text-white transition-colors ${location.pathname === '/loja' ? 'text-robotics-purple' : ''}`}
              >
                Loja
              </Link>
              <Link 
                to="/sobre" 
                onClick={() => setIsMenuOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                Sobre
              </Link>
              <Link 
                to="/contato" 
                onClick={() => setIsMenuOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                Contato
              </Link>
              
              {isAuthenticated && (
                <>
                  <div className="border-t border-white/10 my-2"></div>
                  <Link 
                    to="/cart" 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Carrinho ({totalItems})
                  </Link>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Meu Perfil
                  </Link>
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setIsMenuOpen(false)}
                      className="text-robotics-purple hover:text-robotics-purple-light transition-colors"
                    >
                      Painel Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Overlay for dropdown menus */}
      {(isUserMenuOpen || isMenuOpen) && (
        <div 
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsMenuOpen(false);
          }}
        ></div>
      )}
    </header>
  );
};

export default Header;
