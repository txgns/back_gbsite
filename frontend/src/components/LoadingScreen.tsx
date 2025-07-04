
import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-robotics-black flex flex-col items-center justify-center z-50">
      <div className="text-center glass-card p-8 rounded-xl shadow-neon animate-scale-in">
        <div className="mb-6 relative">
          <div className="w-28 h-28 rounded-full bg-robotics-purple/20 animate-pulse-subtle flex items-center justify-center overflow-hidden">
            <Bot size={64} className="text-robotics-purple animate-bounce" />
          </div>
          
          <Sparkles className="absolute top-0 right-0 text-robotics-purple-light animate-pulse" size={18} />
          <Sparkles className="absolute bottom-2 left-2 text-robotics-purple-light animate-pulse" size={14} />
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gradient">
          GAMBIARRA ROBOTICS
        </h2>
        
        <p className="text-white/70 max-w-md mx-auto mb-4">
          Carregando nossa loja...
        </p>
        
        <div className="w-48 h-1.5 bg-robotics-black-lighter rounded-full mx-auto overflow-hidden">
        <div className="h-full bg-gradient-to-r from-robotics-purple to-robotics-purple-light animate-[slide-in-left_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
