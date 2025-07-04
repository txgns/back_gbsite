
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import products from '@/data/products';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  
  const productId = parseInt(id || '0');
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-robotics-black">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center px-4">
          <h1 className="text-3xl font-bold text-white mb-4">Produto não encontrado</h1>
          <button 
            onClick={() => navigate('/loja')}
            className="flex items-center gap-2 text-robotics-purple hover:text-robotics-purple-light"
          >
            <ArrowLeft size={20} />
            <span>Voltar para a loja</span>
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    // Add product multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    
    toast({
      title: "Produto adicionado!",
      description: `${quantity}x ${product.name} foi adicionado ao carrinho.`,
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

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
            <span>Voltar para a loja</span>
          </button>
          
          {/* Product detail */}
          <div className="glass-card p-4 sm:p-6 md:p-8 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product image */}
              <div className="bg-robotics-black-lighter rounded-lg p-8 flex items-center justify-center">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="max-w-full max-h-96 object-contain"
                />
              </div>
              
              {/* Product info */}
              <div>
                <div className="mb-2">
                  <span className="text-sm text-robotics-purple-light">{product.category}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">{product.name}</h1>
                <div className="text-2xl font-bold text-white mb-6">
                  R$ {product.price.toFixed(2)}
                </div>
                
                <p className="text-white/70 mb-8">{product.description}</p>
                
                {/* Quantity selector */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-white">Quantidade:</div>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="p-2 bg-robotics-black-lighter rounded-l-md border border-white/10 text-white/70 hover:text-white transition-colors"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="w-12 text-center py-2 bg-robotics-black-light border-t border-b border-white/10 text-white">
                      {quantity}
                    </div>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="p-2 bg-robotics-black-lighter rounded-r-md border border-white/10 text-white/70 hover:text-white transition-colors"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Add to cart button */}
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-robotics-purple text-white rounded-md hover:bg-robotics-purple-light transition-colors"
                >
                  <ShoppingCart size={20} />
                  <span>Adicionar ao Carrinho</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
