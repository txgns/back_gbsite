
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShoppingCart } from "lucide-react";

const CheckoutPage = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { isAuthenticated, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    // Validate form
    const requiredFields = ['name', 'email', 'address', 'city', 'postalCode'];
    const missingFields = requiredFields.filter(field => !formState[field as keyof typeof formState]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a compra.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipping_address: `${formState.address}, ${formState.city}, ${formState.postalCode}`,
          phone: formState.phone
        }),
      });

      if (response.ok) {
        await clearCart();
        toast({
          title: 'Pedido realizado com sucesso!',
          description: 'Seu pedido foi processado e será enviado em breve.',
        });
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao processar o pedido');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Erro no checkout',
        description: error.message || 'Não foi possível processar seu pedido. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-robotics-black flex items-center justify-center">
        <Card className="bg-robotics-black-light border-white/10 max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-white text-center">Login Necessário</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-white/70 mb-4">Você precisa estar logado para finalizar a compra.</p>
            <div className="flex gap-2">
              <Link to="/login" className="flex-1">
                <Button className="w-full bg-robotics-purple hover:bg-robotics-purple-light">
                  Fazer Login
                </Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-robotics-black-lighter">
                  Voltar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-robotics-black">
      {/* Header */}
      <div className="bg-robotics-black-light border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/carrinho"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Voltar ao Carrinho</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">Finalizar Compra</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <Card className="bg-robotics-black-light border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Informações de Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white/70">Nome Completo *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formState.name}
                    onChange={handleInputChange}
                    className="bg-robotics-black border-white/20 text-white placeholder-white/50"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-white/70">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleInputChange}
                    className="bg-robotics-black border-white/20 text-white placeholder-white/50"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white/70">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formState.phone}
                    onChange={handleInputChange}
                    className="bg-robotics-black border-white/20 text-white placeholder-white/50"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-white/70">Endereço *</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={formState.address}
                    onChange={handleInputChange}
                    className="bg-robotics-black border-white/20 text-white placeholder-white/50"
                    placeholder="Rua, número, complemento"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-white/70">Cidade *</Label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      value={formState.city}
                      onChange={handleInputChange}
                      className="bg-robotics-black border-white/20 text-white placeholder-white/50"
                      placeholder="Sua cidade"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode" className="text-white/70">CEP *</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      value={formState.postalCode}
                      onChange={handleInputChange}
                      className="bg-robotics-black border-white/20 text-white placeholder-white/50"
                      placeholder="00000-000"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || cart.length === 0}
                  className="w-full bg-robotics-purple hover:bg-robotics-purple-light text-white font-medium py-3 mt-6"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Processando...
                    </div>
                  ) : (
                    `Finalizar Pedido - R$ ${totalPrice.toFixed(2)}`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="bg-robotics-black-light border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShoppingCart size={20} />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart size={48} className="mx-auto text-white/30 mb-4" />
                  <p className="text-white/70 mb-4">Seu carrinho está vazio</p>
                  <Link to="/loja">
                    <Button className="bg-robotics-purple hover:bg-robotics-purple-light">
                      Ir para a Loja
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/10">
                      <div>
                        <h4 className="text-white font-medium">{item.product_name}</h4>
                        <p className="text-sm text-white/70">Quantidade: {item.quantity}</p>
                      </div>
                      <p className="text-white font-medium">
                        R$ {(item.product_price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center text-lg font-bold text-white">
                      <span>Total:</span>
                      <span>R$ {totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
      title: "Pedido realizado com sucesso!",
      description: `Total: R$ ${totalPrice.toFixed(2)}`,
    });
    
    clearCart();
    navigate("/");
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 h-screen flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Seu carrinho está vazio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Adicione alguns produtos antes de finalizar a compra.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/loja")} className="w-full">
              Ir para a loja
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Finalizar compra</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{step === "details" ? "Dados para entrega" : "Pagamento"}</CardTitle>
            </CardHeader>
            <CardContent>
              {step === "details" ? (
                <form onSubmit={handleDetailsSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={formState.name} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={formState.email} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input 
                      id="address" 
                      name="address" 
                      value={formState.address} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input 
                        id="city" 
                        name="city" 
                        value={formState.city} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">CEP</Label>
                      <Input 
                        id="postalCode" 
                        name="postalCode" 
                        value={formState.postalCode} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button type="submit" className="w-full">
                      Continuar para pagamento
                    </Button>
                  </div>
                </form>
              ) : (
                <MercadoPagoCheckout 
                  amount={totalPrice}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              )}
            </CardContent>
            {step === "payment" && (
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setStep("details")}
                  className="w-full"
                >
                  Voltar para dados de entrega
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumo do pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
