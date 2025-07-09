
import React, { useEffect, useState } from "react";
import { initMercadoPago } from "@mercadopago/sdk-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

// Chave pública do Mercado Pago - em produção, isso deve vir de variáveis de ambiente
const MERCADO_PAGO_PUBLIC_KEY = "APP_USR-5072e427-80b2-4841-81e1-d328a0ef5213";

interface MercadoPagoCheckoutProps {
  amount: number;
  onPaymentSuccess: () => void;
}

const MercadoPagoCheckout: React.FC<MercadoPagoCheckoutProps> = ({
  amount,
  onPaymentSuccess,
}) => {
  const { toast } = useToast();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Inicializa o SDK do Mercado Pago
    initMercadoPago(MERCADO_PAGO_PUBLIC_KEY);
    
    // Em uma aplicação real, você faria uma chamada para o seu backend para obter o preferenceId
    // Este é apenas um exemplo simplificado - em produção isso viria do seu backend
    const fetchPreferenceId = async () => {
      try {
        // Normalmente, você faria uma chamada para seu backend como:
         const response = await fetch('/api/create-preference', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ amount })
         });
          const data = await response.json();
          setPreferenceId("APP_USR-5072e427-80b2-4841-81e1-d328a0ef5213");
        
        // Para este exemplo, continuaremos usando um ID simulado
        // Em produção, substitua esta parte pela chamada real ao seu backend
        // setPreferenceId("APP_USR-5072e427-80b2-4841-81e1-d328a0ef5213");
      } catch (error) {
        console.error("Erro ao obter preferenceId:", error);
        toast({
          title: "Erro",
          description: "Não foi possível inicializar o checkout",
          variant: "destructive",
        });
      }
    };
    
    fetchPreferenceId();
  }, [amount, toast]);

  const handleCheckout = () => {
    if (!preferenceId) {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o pagamento",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Redirecionamento real para o Mercado Pago
    window.location.href = `https://www.mercadopago.com.br/checkout/v1/redirect?preference-id=${preferenceId}`;
    
    // Note: Em uma implementação real, você também precisaria configurar
    // um webhook/callback URL no seu backend para receber atualizações sobre o 
    // status do pagamento e então atualizar o estado do pedido no seu sistema
  };

  return (
    <div className="bg-background rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Pagamento</h3>
      
      {preferenceId ? (
        <>
          <div className="mb-4 p-4 border rounded-md bg-muted">
            <p className="text-sm mb-2">
              <strong>Valor:</strong> R$ {amount.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              Ao clicar em "Pagar com Mercado Pago", você será redirecionado para a plataforma segura de pagamento.
            </p>
          </div>
          
          <Button 
            onClick={handleCheckout} 
            className="w-full bg-[#009ee3] hover:bg-[#007eb5]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecionando...
              </>
            ) : (
              "Pagar com Mercado Pago"
            )}
          </Button>
        </>
      ) : (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

export default MercadoPagoCheckout;
