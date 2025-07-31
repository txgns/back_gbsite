
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, User, LogIn } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRemoveFromCart = async (itemId: number) => {
    await removeFromCart(itemId);
  };

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateQuantity(itemId, quantity);
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await clearCart();
        toast({
          title: 'Pedido realizado com sucesso!',
          description: 'Seu pedido foi processado e será enviado em breve.',
        });
        navigate('/dashboard');
      } else {
        throw new Error('Erro ao processar o pedido');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Erro no checkout',
        description: 'Não foi possível processar seu pedido. Tente novamente.',
        variant: 'destructive',
      });
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
                  {cart.map((item) => (
                    <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center">
                      {/* Product image */}
                      <div className="flex-shrink-0 w-full sm:w-20 h-20 bg-robotics-black-lighter rounded-md mb-4 sm:mb-0 mr-6 flex items-center justify-center">
                        <img 
                          src="/placeholder-product.jpg" 
                          alt={item.product_name}
                          className="max-w-full max-h-full object-contain p-2"
                        />
                      </div>
                      
                      {/* Product details */}
                      <div className="flex-grow">
                        <div className="text-white font-medium">
                          {item.product_name}
                        </div>
                        <div className="text-sm text-robotics-purple-light">Produto</div>
                        <div className="text-white mt-1">R$ {item.product_price.toFixed(2)}</div>
                      </div>
                      
                      {/* Quantity controls */}
                      <div className="flex items-center mt-4 sm:mt-0 sm:ml-6">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-white/70 hover:text-white"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus size={16} />
                        </button>
                        <div className="w-8 text-center text-white">{item.quantity}</div>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-white/70 hover:text-white"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      {/* Item total price */}
                      <div className="mt-4 sm:mt-0 sm:ml-6 text-white font-medium">
                        R$ {(item.product_price * item.quantity).toFixed(2)}
                      </div>
                      
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="mt-4 sm:mt-0 sm:ml-4 p-2 text-white/50 hover:text-white/80"
                        aria-label="Remover item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
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
                      <Button 
                        onClick={handleCheckout}
                        className="w-full py-2 border border-white/20 text-white bg-transparent hover:bg-robotics-black-lighter transition-colors text-sm"
                      >
                        Finalizar sem login
                      </Button>
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
