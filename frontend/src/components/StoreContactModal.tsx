
import React from 'react';
import { X, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';

interface StoreContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StoreContactModal = ({ open, onOpenChange }: StoreContactModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Mensagem enviada!",
        description: "Agradecemos seu contato sobre nossa loja. Retornaremos em breve.",
        duration: 5000,
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      setIsSubmitting(false);
      onOpenChange(false); // Close modal after submission
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-robotics-black-lighter border-robotics-black-light text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gradient">Contato - Loja Gambiarra</DialogTitle>
          <DialogDescription className="text-white/70">
            Dúvidas sobre produtos, pedidos ou entregas? Envie sua mensagem e nossa equipe responderá o mais breve possível.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="store-name" className="text-white">
                Nome
              </Label>
              <Input
                id="store-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                required
                className="bg-robotics-black border-robotics-black-light text-white placeholder:text-white/40"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="store-email" className="text-white">
                Email
              </Label>
              <Input
                id="store-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu.email@exemplo.com"
                required
                className="bg-robotics-black border-robotics-black-light text-white placeholder:text-white/40"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="store-subject" className="text-white">
              Assunto
            </Label>
            <Input
              id="store-subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Assunto da mensagem"
              required
              className="bg-robotics-black border-robotics-black-light text-white placeholder:text-white/40"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="store-message" className="text-white">
              Mensagem
            </Label>
            <textarea
              id="store-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Digite sua mensagem aqui..."
              required
              rows={4}
              className="w-full rounded-md border border-robotics-black-light bg-robotics-black px-3 py-2 text-base text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-robotics-purple hover:bg-robotics-purple-light text-white"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
              <Send size={16} className="ml-2" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StoreContactModal;
