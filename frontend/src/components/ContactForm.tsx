
import React, { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Send } from 'lucide-react';
import { useToast } from './ui/use-toast';

const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        description: "Agradecemos seu contato. Retornaremos em breve.",
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
    }, 1500);
  };

  return (
    <div id="contact-form" className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6">
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gradient mb-6">Entre em Contato</h2>
          <p className="text-white/70 mb-8">
            Tem interesse em nossos projetos ou gostaria de saber mais informações? Preencha o formulário abaixo e entraremos em contato o mais breve possível.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Nome
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  required
                  className="bg-robotics-black-lighter border-robotics-black-light text-white placeholder:text-white/40"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu.email@exemplo.com"
                  required
                  className="bg-robotics-black-lighter border-robotics-black-light text-white placeholder:text-white/40"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-white">
                Assunto
              </Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Assunto da mensagem"
                required
                className="bg-robotics-black-lighter border-robotics-black-light text-white placeholder:text-white/40"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message" className="text-white">
                Mensagem
              </Label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Digite sua mensagem aqui..."
                required
                rows={5}
                className="w-full rounded-md border border-robotics-black-light bg-robotics-black-lighter px-3 py-2 text-base text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full md:w-auto bg-robotics-purple hover:bg-robotics-purple-light text-white px-8 py-2"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
              <Send size={16} className="ml-2" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
