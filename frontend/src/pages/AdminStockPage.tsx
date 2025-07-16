import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Package, Plus, Edit, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface StockMovement {
  id: number;
  product_id: string;
  movement_type: string;
  quantity: number;
  reason: string;
  reference_id: string;
  created_at: string;
  created_by_user?: string;
}

const AdminStockPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showStockUpdate, setShowStockUpdate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { token } = useAuth();
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: '',
    image_url: ''
  });

  const [stockUpdate, setStockUpdate] = useState({
    quantity: '',
    reason: 'adjustment'
  });

  useEffect(() => {
    fetchProducts();
    fetchLowStockProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products?page=${currentPage}&per_page=10&active_only=false`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar produtos');
      }

      const data = await response.json();
      setProducts(data.products);
      setTotalPages(data.pages);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const response = await fetch('/api/products/low-stock?threshold=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar produtos com estoque baixo');
      }

      const data = await response.json();
      setLowStockProducts(data.products);
    } catch (error: any) {
      console.error('Erro ao carregar produtos com estoque baixo:', error);
    }
  };

  const fetchStockMovements = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}/stock/movements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar movimentações de estoque');
      }

      const data = await response.json();
      setStockMovements(data.movements);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const createProduct = async () => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock_quantity: parseInt(newProduct.stock_quantity)
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar produto');
      }

      toast({
        title: 'Sucesso',
        description: 'Produto criado com sucesso'
      });

      setShowAddProduct(false);
      setNewProduct({
        id: '',
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category: '',
        image_url: ''
      });
      fetchProducts();
      fetchLowStockProducts();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const updateStock = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}/stock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity: parseInt(stockUpdate.quantity),
          reason: stockUpdate.reason
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar estoque');
      }

      toast({
        title: 'Sucesso',
        description: 'Estoque atualizado com sucesso'
      });

      setShowStockUpdate(false);
      setStockUpdate({ quantity: '', reason: 'adjustment' });
      fetchProducts();
      fetchLowStockProducts();
      if (selectedProduct) {
        fetchStockMovements(selectedProduct.id);
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Sem Estoque', color: 'bg-red-100 text-red-800' };
    if (quantity <= 10) return { label: 'Estoque Baixo', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Em Estoque', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Gestão de Estoque</h1>
          <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-purple-500/30 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Adicionar Novo Produto</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-id" className="text-green-400">ID do Produto</Label>
                  <Input
                    id="product-id"
                    value={newProduct.id}
                    onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
                    className="bg-gray-800 border-purple-500/30 text-white"
                    placeholder="ex: robot-kit-advanced"
                  />
                </div>
                <div>
                  <Label htmlFor="product-name" className="text-green-400">Nome</Label>
                  <Input
                    id="product-name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="bg-gray-800 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="product-price" className="text-green-400">Preço</Label>
                  <Input
                    id="product-price"
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="bg-gray-800 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="product-stock" className="text-green-400">Estoque Inicial</Label>
                  <Input
                    id="product-stock"
                    type="number"
                    value={newProduct.stock_quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                    className="bg-gray-800 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="product-category" className="text-green-400">Categoria</Label>
                  <Input
                    id="product-category"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="bg-gray-800 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="product-image" className="text-green-400">URL da Imagem</Label>
                  <Input
                    id="product-image"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                    className="bg-gray-800 border-purple-500/30 text-white"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="product-description" className="text-green-400">Descrição</Label>
                  <Textarea
                    id="product-description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="bg-gray-800 border-purple-500/30 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddProduct(false)}
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                >
                  Cancelar
                </Button>
                <Button onClick={createProduct} className="bg-green-600 hover:bg-green-700">
                  Criar Produto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alertas de Estoque Baixo */}
        {lowStockProducts.length > 0 && (
          <Card className="bg-red-900/20 border-red-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Produtos com Estoque Baixo ({lowStockProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="bg-gray-800/50 p-4 rounded border border-red-500/30">
                    <h4 className="text-white font-medium">{product.name}</h4>
                    <p className="text-red-400">Estoque: {product.stock_quantity} unidades</p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowStockUpdate(true);
                      }}
                      className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Reabastecer
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Produtos */}
        <Card className="bg-gray-900/90 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-purple-500/30">
                  <TableHead className="text-gray-300">ID</TableHead>
                  <TableHead className="text-gray-300">Nome</TableHead>
                  <TableHead className="text-gray-300">Categoria</TableHead>
                  <TableHead className="text-gray-300">Preço</TableHead>
                  <TableHead className="text-gray-300">Estoque</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock_quantity);
                  return (
                    <TableRow key={product.id} className="border-purple-500/30">
                      <TableCell className="text-white font-mono text-sm">{product.id}</TableCell>
                      <TableCell className="text-white font-medium">{product.name}</TableCell>
                      <TableCell className="text-white">{product.category}</TableCell>
                      <TableCell className="text-white">{formatCurrency(product.price)}</TableCell>
                      <TableCell className="text-white">{product.stock_quantity}</TableCell>
                      <TableCell>
                        <Badge className={stockStatus.color}>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProduct(product);
                              fetchStockMovements(product.id);
                            }}
                            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowStockUpdate(true);
                            }}
                            className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Paginação */}
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
              >
                Anterior
              </Button>
              <span className="text-white">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
              >
                Próxima
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Atualização de Estoque */}
        <Dialog open={showStockUpdate} onOpenChange={setShowStockUpdate}>
          <DialogContent className="bg-gray-900 border-purple-500/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                Atualizar Estoque - {selectedProduct?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="stock-quantity" className="text-green-400">
                  Quantidade (use + para adicionar, - para remover)
                </Label>
                <Input
                  id="stock-quantity"
                  type="number"
                  value={stockUpdate.quantity}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: e.target.value })}
                  className="bg-gray-800 border-purple-500/30 text-white"
                  placeholder="ex: +50 ou -10"
                />
              </div>
              <div>
                <Label htmlFor="stock-reason" className="text-green-400">Motivo</Label>
                <select
                  id="stock-reason"
                  value={stockUpdate.reason}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, reason: e.target.value })}
                  className="w-full p-2 bg-gray-800 border border-purple-500/30 rounded text-white"
                >
                  <option value="adjustment">Ajuste</option>
                  <option value="restock">Reabastecimento</option>
                  <option value="return">Devolução</option>
                  <option value="damage">Produto Danificado</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowStockUpdate(false)}
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                >
                  Cancelar
                </Button>
                <Button onClick={updateStock} className="bg-green-600 hover:bg-green-700">
                  Atualizar Estoque
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Movimentações de Estoque */}
        {selectedProduct && stockMovements.length > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="bg-gray-900/95 border-purple-500/30 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-white">
                  Histórico de Movimentações - {selectedProduct.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-purple-500/30">
                      <TableHead className="text-gray-300">Data</TableHead>
                      <TableHead className="text-gray-300">Tipo</TableHead>
                      <TableHead className="text-gray-300">Quantidade</TableHead>
                      <TableHead className="text-gray-300">Motivo</TableHead>
                      <TableHead className="text-gray-300">Usuário</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockMovements.map((movement) => (
                      <TableRow key={movement.id} className="border-purple-500/30">
                        <TableCell className="text-white">{formatDate(movement.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {movement.movement_type === 'in' ? (
                              <TrendingUp className="h-4 w-4 text-green-400 mr-2" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-400 mr-2" />
                            )}
                            <span className={movement.movement_type === 'in' ? 'text-green-400' : 'text-red-400'}>
                              {movement.movement_type === 'in' ? 'Entrada' : 'Saída'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-white">{movement.quantity}</TableCell>
                        <TableCell className="text-white">{movement.reason}</TableCell>
                        <TableCell className="text-white">{movement.created_by_user || 'Sistema'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedProduct(null);
                      setStockMovements([]);
                    }}
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                  >
                    Fechar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStockPage;

