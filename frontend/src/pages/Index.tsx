
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import TeamSection from '@/components/TeamSection';
import ProjectsSection from '@/components/ProjectsSection';
import SponsorsSection from '@/components/SponsorsSection';
import Footer from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    // Initialize animations based on scroll position
    const handleScroll = () => {
      const elements = document.querySelectorAll('.stagger-animation > *, .animate-fade-in');
      
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8;
        
        if (isVisible) {
          el.classList.add('animate-fade-in');
        }
      });
    };

    // Initial check
    setTimeout(handleScroll, 100);
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-robotics-black text-white overflow-x-hidden">
      <Header />
      <Hero />
      <TeamSection />
      <ProjectsSection />
      <SponsorsSection />
      <Footer />
    </div>
  );
};

export default Index;
