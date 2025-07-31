
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X, ShoppingCart, User, LogOut, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import StoreContactModal from './StoreContactModal';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [storeContactModalOpen, setStoreContactModalOpen] = useState(false);

  // Determine page types once on component mount or when location changes
  const isProjectDetailPage = location.pathname.includes('/project/');
  const isStorePage = location.pathname.includes('/loja') || 
                    location.pathname.includes('/product') || 
                    location.pathname.includes('/cart') ||
                    location.pathname.includes('/checkout');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  // Conditionally show navigation items based on whether we're on a store or project page
  const navigationItems = isProjectDetailPage
    ? [] // Empty array for project detail pages - show only store and cart
    : isStorePage 
      ? [] // Empty array for store pages
      : [
          { name: 'Início', link: isStorePage ? '/#home' : '#home' },
          { name: 'Equipe', link: isStorePage ? '/#team' : '#team' },
          { name: 'Projetos', link: isStorePage ? '/#projects' : '#projects' },
          { name: 'Patrocinadores', link: isStorePage ? '/#sponsors' : '#sponsors' }
        ];

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 w-full py-4 px-6 md:px-12 z-50 transition-all duration-300",
        isScrolled ? "bg-robotics-black/90 backdrop-blur-md shadow-md" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/">
              <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot">
                <path d="M12 8V4H8"/>
                <rect width="16" height="12" x="4" y="8" rx="2"/>
                <path d="M2 14h2"/>
                <path d="M20 14h2"/>
                <path d="M15 13v2"/>
                <path d="M9 13v2"/>
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gradient"> GAMBIARRA ROBOTICS</h1>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <a 
                key={item.name} 
                href={item.link} 
                className="nav-link text-white/90 hover:text-white text-sm font-medium tracking-wide transition-colors"
              >
                {item.name}
              </a>
            ))}
            {/* Always show the store link */}
            <Link 
              to="/loja" 
              className="nav-link text-white/90 hover:text-white text-sm font-medium tracking-wide transition-colors"
            >
              Loja
            </Link>
            
            {/* Cart Icon */}
            <Link to="/cart" className="relative">
              <ShoppingCart className="text-white hover:text-robotics-purple-light transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-robotics-purple text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth Section */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors"
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
                  <span className="text-sm font-medium">{user.username}</span>
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

                    {user.role === 'admin' && (
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
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-white/90 hover:text-white text-sm font-medium tracking-wide transition-colors"
                >
                  Entrar
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-sm bg-gradient-to-r from-robotics-purple to-robotics-purple-light text-white rounded-md hover:from-robotics-purple-light hover:to-robotics-purple transition-all"
                >
                  Registrar
                </Link>
              </div>
            )}
          </nav>

          <div className="md:hidden flex items-center gap-4">
            <Link to="/cart" className="relative">
              <ShoppingCart className="text-white hover:text-robotics-purple-light transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-robotics-purple text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
            <button 
              className="text-white p-2" 
              onClick={toggleMobileMenu}
              aria-label="Alternar menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[72px] bg-robotics-black/95 backdrop-blur-md z-40 flex flex-col items-center pt-12">
            <div className="flex flex-col items-center space-y-8">
              {navigationItems.map((item) => (
                <a 
                  key={item.name} 
                  href={item.link} 
                  className="text-white text-2xl font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <Link 
                to="/loja" 
                className="text-white text-2xl font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Loja
              </Link>
              
              {/* Mobile Auth Section */}
              {isAuthenticated && user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-white text-2xl font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="text-robotics-purple text-2xl font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Painel Admin
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-red-400 text-2xl font-medium"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-white text-2xl font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-white text-2xl font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registrar
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      
      {/* Overlay for dropdown */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        ></div>
      )}
      
      {/* Store Contact Modal */}
      <StoreContactModal 
        open={storeContactModalOpen} 
        onOpenChange={setStoreContactModalOpen} 
      />
    </>
  );
};

export default Header;
