
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-robotics-black/95 backdrop-blur-sm border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-robotics-purple to-robotics-purple-light rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-white font-bold text-xl">GBSite</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">
              Início
            </Link>
            <Link to="/loja" className="text-white/80 hover:text-white transition-colors">
              Loja
            </Link>
            <Link to="/sobre" className="text-white/80 hover:text-white transition-colors">
              Sobre
            </Link>
            <Link to="/contato" className="text-white/80 hover:text-white transition-colors">
              Contato
            </Link>
          </div>

          {/* Auth & Cart */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="relative p-2 text-white/80 hover:text-white transition-colors">
                  <ShoppingCart size={20} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-robotics-purple text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </Link>

                {/* User Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-white/80 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-robotics-purple to-robotics-purple-light rounded-full flex items-center justify-center">
                      {user?.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {user?.username}
                    </span>
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-robotics-black-light border border-white/10 rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-robotics-black-lighter transition-colors"
                      >
                        <User size={16} className="mr-2" />
                        Dashboard
                      </Link>

                      <Link
                        to="/cart"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-robotics-black-lighter transition-colors"
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        Carrinho
                      </Link>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-robotics-purple hover:text-robotics-purple-light hover:bg-robotics-black-lighter transition-colors"
                        >
                          <Settings size={16} className="mr-2" />
                          Painel Admin
                        </Link>
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
              </>
            ) : (
              <>
                <Link to="/login" className="text-white/80 hover:text-white transition-colors">
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm bg-gradient-to-r from-robotics-purple to-robotics-purple-light text-white rounded-md hover:from-robotics-purple-light hover:to-robotics-purple transition-all"
                >
                  Registrar
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-white/80 hover:text-white transition-colors">
                Início
              </Link>
              <Link to="/loja" className="text-white/80 hover:text-white transition-colors">
                Loja
              </Link>
              <Link to="/sobre" className="text-white/80 hover:text-white transition-colors">
                Sobre
              </Link>
              <Link to="/contato" className="text-white/80 hover:text-white transition-colors">
                Contato
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/cart" className="text-white/80 hover:text-white transition-colors">
                    Carrinho ({totalItems})
                  </Link>
                  <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="text-robotics-purple hover:text-robotics-purple-light transition-colors">
                      Painel Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-left text-red-400 hover:text-red-300 transition-colors"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-white/80 hover:text-white transition-colors">
                    Entrar
                  </Link>
                  <Link to="/register" className="text-white/80 hover:text-white transition-colors">
                    Registrar
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Overlay for dropdown */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;
