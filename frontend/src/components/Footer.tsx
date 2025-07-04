
import React, { useState } from 'react';
import { Twitter, Instagram, Twitch, Youtube, Mail, MapPin, Phone, FileText } from 'lucide-react';
import PolicyModal from './PolicyModal';
import { privacyPolicyContent, termsOfServiceContent, cookiePolicyContent } from '@/data/policies';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [openModal, setOpenModal] = useState<'privacy' | 'terms' | 'cookies' | null>(null);

  return (
    <footer id="contact" className="bg-esports-black-light px-6 md:px-12 pt-16 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand Column */}
          <div>
            <h2 className="text-2xl font-bold text-gradient mb-4">GAMBIARRA ROBOTICS</h2>
            <p className="text-white/70 mb-6 max-w-xs">
              Elevando a robótica através de habilidade, estratégia e dedicação incansável à excelência.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: <Instagram size={18} />, href: 'https://www.instagram.com/gambiarra.robotics/', label: 'Instagram' },
                { icon: <Youtube size={18} />, href: '#', label: 'YouTube' },
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.href}
                  className="w-9 h-9 rounded-full bg-esports-black flex items-center justify-center text-white/70 hover:text-esports-purple-light hover:bg-esports-black-lighter transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          <div></div>
          {/* Contact */}
          <div>
            <h3 className="text-white text-lg font-medium mb-4">Contate-nos</h3>
            <ul className="space-y-4">
              {[
                { icon: <Mail size={18} />, text: 'contato@gambiarrarobotics.com' },
                { icon: <MapPin size={18} />, text: 'Sorocaba, SP, Brasil' },
                { icon: <Phone size={18} />, text: '' },
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-esports-purple-light mr-3 mt-0.5">
                    {item.icon}
                  </span>
                  <span className="text-white/70 text-sm">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 text-sm mb-4 md:mb-0">
            © {currentYear} GAMBIARRA ROBOTICS. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6">
            {[
              { title: 'Política de Privacidade', modalType: 'privacy' as const },
              { title: 'Termos de Serviço', modalType: 'terms' as const },
              { title: 'Política de Cookies', modalType: 'cookies' as const }
            ].map((item, i) => (
              <button 
                key={i}
                onClick={() => setOpenModal(item.modalType)}
                className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1"
              >
                <FileText size={14} />
                {item.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Policy Modals */}
      <PolicyModal
        open={openModal === 'privacy'}
        onOpenChange={(open) => !open && setOpenModal(null)}
        title="Política de Privacidade"
        content={privacyPolicyContent}
      />
      <PolicyModal
        open={openModal === 'terms'}
        onOpenChange={(open) => !open && setOpenModal(null)}
        title="Termos de Serviço"
        content={termsOfServiceContent}
      />
      <PolicyModal
        open={openModal === 'cookies'}
        onOpenChange={(open) => !open && setOpenModal(null)}
        title="Política de Cookies"
        content={cookiePolicyContent}
      />
    </footer>
  );
};

export default Footer;
