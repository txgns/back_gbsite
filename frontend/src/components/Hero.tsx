
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Bot, Users } from 'lucide-react';
import { Button } from './ui/button';
import ContactModal from './ContactModal';

const Hero = () => {
  // Define a specific date for the competition (May 1, 2025)
  const competitionDate = new Date('2025-05-01T08:00:00');
  
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [contactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const difference = competitionDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        // The competition has already started
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeRemaining({ days, hours, minutes, seconds });
    };
    
    calculateTimeRemaining();
    
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const scrollToTeam = () => {
    const teamSection = document.getElementById('team');
    if (teamSection) {
      teamSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-12 py-16 sm:py-20 lg:py-0 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #121212 0%, #5C1D91 100%)',
      }}
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-robotics-purple/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-48 sm:w-96 h-48 sm:h-96 bg-robotics-purple/10 rounded-full filter blur-3xl"></div>

        {/* Circuit pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000')] bg-no-repeat bg-cover opacity-5"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center">
        <span className="text-xs sm:text-sm md:text-base uppercase tracking-widest text-robotics-purple-light animate-fade-in">
          Improvisar sempre, desistir jamais!
        </span>
        <h1 className="mt-2 sm:mt-4 text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold stagger-animation">
          <span className="block">GAMBIARRA</span>
          <span className="block text-gradient mt-1 sm:mt-2">ROBOTICS</span>
        </h1>
        <p className="mt-4 sm:mt-6 max-w-sm sm:max-w-lg text-sm sm:text-base md:text-lg text-white/80 animate-fade-in px-4">
          A equipe onde o objetivo é participar de toda e qualquer
          competição maluca que existir, e claro sempre se divertir!
        </p>

        <div className="mt-6 sm:mt-10 flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-10">
          {[
            { icon: <Bot size={20} className="sm:w-6 sm:h-6" />, title: "Combate" },
            { icon: <Bot size={20} className="sm:w-6 sm:h-6" />, title: "Sumô" },
            { icon: <Bot size={20} className="sm:w-6 sm:h-6" />, title: "Hockey" },
          ].map((item, index) => (
            <div 
              key={index}
              className="glass-card p-2 sm:p-4 rounded-lg flex items-center space-x-2 sm:space-x-3 text-white/90 hover-scale"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="text-robotics-purple-light">
                {item.icon}
              </div>
              <span className="text-xs sm:text-sm md:text-base">{item.title}</span>
            </div>
          ))}
        </div>

        {/* Countdown Timer */}
        <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-8">
          {[
            { label: 'Dias', value: timeRemaining.days },
            { label: 'Horas', value: timeRemaining.hours },
            { label: 'Minutos', value: timeRemaining.minutes },
            { label: 'Segundos', value: timeRemaining.seconds }
          ].map((item) => (
            <div key={item.label} className="countdown-item">
              <div className={cn(
                "flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28",
                "glass-card rounded-xl text-white purple-glow"
              )}>
                <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">{item.value}</span>
                <span className="text-[10px] sm:text-xs md:text-sm text-white/70">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
        
        <p className="mt-4 sm:mt-6 text-3xl sm:text-4xl md:text-6xl lg:text-2xl font-bold stagger-animation">
          Até a próxima competição de robótica
        </p>

        <button 
          onClick={scrollToTeam}
          className="mt-8 sm:mt-12 animate-pulse-subtle"
          aria-label="Rolar para a seção da equipe"
        >
          <ChevronDown size={24} className="sm:w-8 sm:h-8 text-white/70" />
        </button>
      </div>

      {/* Contact Modal */}
      <ContactModal
        open={contactModalOpen}
        onOpenChange={setContactModalOpen}
      />
    </section>
  );
};

export default Hero;
