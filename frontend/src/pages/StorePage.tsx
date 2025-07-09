import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, ShoppingCart, Search, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';
import { useCart, Product } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import products from '@/data/products';

const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

const StorePage = () => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let result = products;
    
    if (selectedCategory !== 'Todos') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
      );
    }
    
    result = result.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, priceRange]);

  const handleSliderChange = (value: number[]) => {
    const min = value[0];
    const max = value[1];
    setPriceRange([min, max]);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-robotics-black">
      <Header />
      
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <Link to="/">
              <Button variant="outline" className="gap-2 text-white/80 hover:bg-robotics-black-lighter hover:text-white border-white/10">
                <ArrowLeft size={16} />
                <span>Voltar ao Início</span>
              </Button>
            </Link>
          </div>
          
          <div className="text-center mb-12 stagger-animation">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Gambiarra Store</span>
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              Produtos oficiais da nossa equipe de robótica.
            </p>
          </div>
          
          <div className="mb-8 glass-card p-4 rounded-lg">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full pl-10 pr-4 py-2 rounded-md bg-robotics-black-light border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-robotics-purple"
                />
              </div>
              
              <div className="md:hidden">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-robotics-black-lighter border border-white/10 rounded-md text-white"
                >
                  <Filter size={18} />
                  <span>Filtros</span>
                </button>
              </div>
              
              <div className="hidden md:flex items-center gap-4">
                <div className="text-white text-sm">Filtrar por:</div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedCategory === category
                          ? 'bg-robotics-purple text-white'
                          : 'bg-robotics-black-lighter text-white/70 hover:bg-robotics-black-light'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {isFilterOpen && (
              <div className="mt-4 pt-4 border-t border-white/10 md:hidden">
                <h3 className="text-white font-medium mb-2">Categorias</h3>
                <div className="flex gap-2 flex-wrap mb-4">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedCategory === category
                          ? 'bg-robotics-purple text-white'
                          : 'bg-robotics-black-lighter text-white/70 hover:bg-robotics-black-light'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                <h3 className="text-white font-medium mb-2">Preço</h3>
                <div className="px-2 space-y-4">
                  <div className="pt-2">
                    <Slider 
                      value={[priceRange[0], priceRange[1]]} 
                      max={200} 
                      step={1} 
                      minStepsBetweenThumbs={1}
                      onValueChange={handleSliderChange}
                      className="mb-4"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-1/2 space-y-2">
                      <Label htmlFor="min-price" className="text-white text-xs">Min</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 text-xs">R$</span>
                        <div className="pl-8 py-2 h-8 bg-robotics-black-lighter border border-white/10 rounded-md text-white text-sm flex items-center">
                          {priceRange[0]}
                        </div>
                      </div>
                    </div>
                    <div className="w-1/2 space-y-2">
                      <Label htmlFor="max-price" className="text-white text-xs">Max</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 text-xs">R$</span>
                        <div className="pl-8 py-2 h-8 bg-robotics-black-lighter border border-white/10 rounded-md text-white text-sm flex items-center">
                          {priceRange[1]}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="hidden md:block mt-4">
              <div className="flex items-end gap-4">
                <div className="w-56">
                  <h3 className="text-white text-sm font-medium mb-3">Preço:</h3>
                  <div className="space-y-4">
                    <div className="px-2 pt-2">
                      <Slider 
                        value={[priceRange[0], priceRange[1]]}
                        max={200} 
                        step={1} 
                        minStepsBetweenThumbs={1}
                        onValueChange={handleSliderChange}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="w-1/2 space-y-1">
                        <Label htmlFor="desktop-min-price" className="text-white text-xs">Min</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 text-xs">R$</span>
                          <div className="pl-8 py-2 h-8 bg-robotics-black-lighter border border-white/10 rounded-md text-white text-sm flex items-center">
                            {priceRange[0]}
                          </div>
                        </div>
                      </div>
                      <div className="w-1/2 space-y-1">
                        <Label htmlFor="desktop-max-price" className="text-white text-xs">Max</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 text-xs">R$</span>
                          <div className="pl-8 py-2 h-8 bg-robotics-black-lighter border border-white/10 rounded-md text-white text-sm flex items-center">
                            {priceRange[1]}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id}
                  className="glass-card rounded-lg overflow-hidden hover-scale transition-all duration-300"
                >
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="aspect-square bg-robotics-black-lighter relative">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-contain p-4"
                      />
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link to={`/product/${product.id}`} className="block">
                      <h3 className="text-white font-medium mb-1 hover:text-robotics-purple-light transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="text-xs text-robotics-purple-light mb-2">{product.category}</div>
                    <div className="flex justify-between items-center">
                      <div className="text-white font-bold">R$ {product.price.toFixed(2)}</div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="p-2 bg-robotics-purple rounded-full hover:bg-robotics-purple-light transition-colors"
                        aria-label="Adicionar ao carrinho"
                      >
                        <ShoppingCart size={16} className="text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-white/70 mb-2">Nenhum produto encontrado</div>
              <button
                onClick={() => {
                  setSelectedCategory('Todos');
                  setSearchQuery('');
                  setPriceRange([0, 200]);
                }}
                className="text-robotics-purple hover:text-robotics-purple-light"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StorePage;
