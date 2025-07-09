
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Cpu, Wrench, Zap, CircuitBoard, 
  Twitter, Instagram, Linkedin, Github 
} from 'lucide-react';

type TeamMember = {
  id: number;
  name: string;
  role: string;
  image: string;
  description: string;
  social: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
};

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Caio Souza, aka Caioso',
    role: 'Capitão',
    image: '/members/Caioso.jpeg',
    description: 'batata',
    social: {
      linkedin: 'https://www.linkedin.com/in/caioovitoor/',
      instagram: 'https://www.instagram.com/caiooso/',
    },
  }
];

const TeamSection = () => {
  return (
    <section id="team" className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 bg-robotics-black">
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 stagger-animation">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
            <span className="text-gradient">Membros da equipe</span>
          </h2>
          <p className="text-white/70 max-w-xs sm:max-w-md md:max-w-2xl mx-auto text-sm sm:text-base">
            Conheçam os malucos e malucas que fazem parte dessa equipe.
          </p>
        </div>
        {/* Team Members */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {teamMembers.map((member, index) => (
            <div 
              key={member.id} 
              className={cn(
                "relative overflow-hidden rounded-xl hover-scale",
                "opacity-0 animate-fade-in"
              )}
              style={{ animationDelay: `${index * 0.15 + 0.3}s` }}
            >
              <div className="glass-card h-full">
                <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden rounded-t-lg">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-robotics-black to-transparent"></div>
                </div>
                
                <div className="p-3 sm:p-4 md:p-5">
                  <div className="mb-1 inline-block px-2 sm:px-3 py-1 text-xs rounded-full bg-robotics-purple/20 text-robotics-purple-light">
                    {member.role}
                  </div>
                  <h3 className="text-white text-lg sm:text-xl font-medium mb-1 sm:mb-2">{member.name}</h3>
                  <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4">{member.description}</p>
                  
                  <div className="flex items-center space-x-3">
                    {member.social.twitter && (
                      <a href={member.social.twitter} target="_blank" className="text-white/60 hover:text-robotics-purple transition-colors" aria-label="Twitter">
                        <Twitter size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </a>
                    )}
                    {member.social.instagram && (
                      <a href={member.social.instagram} target="_blank" className="text-white/60 hover:text-robotics-purple transition-colors" aria-label="Instagram">
                        <Instagram size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </a>
                    )}
                    {member.social.linkedin && (
                      <a href={member.social.linkedin} target="_blank" className="text-white/60 hover:text-robotics-purple transition-colors" aria-label="LinkedIn">
                        <Linkedin size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </a>
                    )}
                    {member.social.github && (
                      <a href={member.social.github} target="_blank" className="text-white/60 hover:text-robotics-purple transition-colors" aria-label="GitHub">
                        <Github size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </a>
                    )}
                    
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
