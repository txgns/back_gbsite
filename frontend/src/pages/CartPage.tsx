
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, User, LogIn } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useCartAPI } from '@/hooks/useCartAPI';
import { Button } from '@/components/ui/button';

const CartPage = () => {
  const { cart: localCart, removeFromCart: removeFromLocalCart, updateQuantity: updateLocalQuantity, totalItems: localTotalItems, totalPrice: localTotalPrice } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { cart: apiCart, removeFromCart: removeFromAPICart, updateCartItem, checkout } = useCartAPI();
  const navigate = useNavigate();

  // Use API cart if authenticated, otherwise use local cart
  const cart = isAuthenticated ? apiCart.cart_items : localCart;
  const totalItems = isAuthenticated ? apiCart.total_items : localTotalItems;
  const totalPrice = isAuthenticated ? apiCart.total_amount : localTotalPrice;

  const handleRemoveFromCart = async (itemId: number | string) => {
    if (isAuthenticated) {
      await removeFromAPICart(Number(itemId));
    } else {
      removeFromLocalCart(Number(itemId));
    }
  };

  const handleUpdateQuantity = async (itemId: number | string, quantity: number) => {
    if (isAuthenticated) {
      await updateCartItem(Number(itemId), quantity);
    } else {
      updateLocalQuantity(Number(itemId), quantity);
    }
  };

  const handleCheckout = async () => {
    if (isAuthenticated) {
      const result = await checkout();
      if (result.success) {
        navigate('/dashboard');
      }
    } else {
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-robotics-black">
        <Header />
        <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
          <div className="text-center">
            <ShoppingCart size={64} className="text-white/30 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Seu carrinho está vazio</h1>
            <p className="text-white/70 mb-8">Adicione produtos ao seu carrinho para continuar.</p>
            <Link 
              to="/loja"
              className="inline-flex items-center gap-2 px-6 py-3 bg-robotics-purple text-white rounded-md hover:bg-robotics-purple-light transition-colors"
            >
              <span>Ir para a loja</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-robotics-black">
      <Header />
      
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <button 
            onClick={() => navigate('/loja')}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Continuar comprando</span>
          </button>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              <span className="text-gradient">Seu Carrinho</span>
            </h1>
            <p className="text-white/70 mt-2">{totalItems} {totalItems === 1 ? 'item' : 'itens'} no seu carrinho</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="col-span-2">
              <div className="glass-card rounded-lg overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-white/10">
                  <h2 className="text-xl font-medium text-white">Itens do Carrinho</h2>
                </div>
                
                {/* Cart item list */}
                <div className="divide-y divide-white/10">
                  {cart.map((item) => {
                    // Handle both local cart items and API cart items
                    const itemId = isAuthenticated ? item.id : item.id;
                    const itemName = isAuthenticated ? item.product_name : item.name;
                    const itemPrice = isAuthenticated ? item.product_price : item.price;
                    const itemImage = isAuthenticated ? '/placeholder-product.jpg' : item.image;
                    const itemCategory = isAuthenticated ? 'Produto' : item.category;
                    
                    return (
                    <div key={itemId} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center">
                      {/* Product image */}
                      <div className="flex-shrink-0 w-full sm:w-20 h-20 bg-robotics-black-lighter rounded-md mb-4 sm:mb-0 mr-6 flex items-center justify-center">
                        <img 
                          src={itemImage} 
                          alt={itemName}
                          className="max-w-full max-h-full object-contain p-2"
                        />
                      </div>
                      
                      {/* Product details */}
                      <div className="flex-grow">
                        <div className="text-white font-medium">
                          {itemName}
                        </div>
                        <div className="text-sm text-robotics-purple-light">{itemCategory}</div>
                        <div className="text-white mt-1">R$ {itemPrice.toFixed(2)}</div>
                      </div>
                      
                      {/* Quantity controls */}
                      <div className="flex items-center mt-4 sm:mt-0 sm:ml-6">
                        <button
                          onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}
                          className="p-1 text-white/70 hover:text-white"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus size={16} />
                        </button>
                        <div className="w-8 text-center text-white">{item.quantity}</div>
                        <button
                          onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                          className="p-1 text-white/70 hover:text-white"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      {/* Item total price */}
                      <div className="mt-4 sm:mt-0 sm:ml-6 text-white font-medium">
                        R$ {(itemPrice * item.quantity).toFixed(2)}
                      </div>
                      
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveFromCart(itemId)}
                        className="mt-4 sm:mt-0 sm:ml-4 p-2 text-white/50 hover:text-white/80"
                        aria-label="Remover item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Order summary */}
            <div>
              <div className="glass-card rounded-lg overflow-hidden sticky top-24">
                <div className="p-4 sm:p-6 border-b border-white/10">
                  <h2 className="text-xl font-medium text-white">Resumo do Pedido</h2>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-white/70">Subtotal</span>
                      <span className="text-white">R$ {totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Frete</span>
                      <span className="text-robotics-purple-light">Grátis</span>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex justify-between font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-white">R$ {totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {isAuthenticated ? (
                    <Button 
                      onClick={handleCheckout}
                      className="mt-6 w-full py-3 bg-robotics-purple text-white rounded-md hover:bg-robotics-purple-light transition-colors"
                    >
                      Finalizar Compra
                    </Button>
                  ) : (
                    <div className="mt-6 space-y-3">
                      <div className="text-center text-white/70 text-sm">
                        Faça login para finalizar a compra e salvar seu carrinho
                      </div>
                      <div className="flex gap-2">
                        <Link to="/login" className="flex-1">
                          <Button variant="outline" className="w-full gap-2 text-white/80 hover:bg-robotics-black-lighter hover:text-white border-white/10">
                            <LogIn size={16} />
                            Login
                          </Button>
                        </Link>
                        <Link to="/register" className="flex-1">
                          <Button className="w-full gap-2 bg-robotics-purple hover:bg-robotics-purple/80">
                            <User size={16} />
                            Registrar
                          </Button>
                        </Link>
                      </div>
                      <Link 
                        to="/checkout"
                        className="block w-full py-2 border border-white/20 text-white text-center rounded-md hover:bg-robotics-black-lighter transition-colors text-sm"
                      >
                        Continuar sem login
                      </Link>
                    </div>
                  )}
                  
                  <Link 
                    to="/loja"
                    className="mt-4 block w-full py-2 border border-white/20 text-white text-center rounded-md hover:bg-robotics-black-lighter transition-colors"
                  >
                    Continuar Comprando
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CartPage;
