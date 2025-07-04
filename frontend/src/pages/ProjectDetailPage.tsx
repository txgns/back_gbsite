
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Award, ChevronRight, Image as ImageIcon, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { projects } from '@/data/projects';
import { cn } from '@/lib/utils';
import ProjectCarousel from '@/components/ProjectCarousel';
import ProjectVideo from '@/components/ProjectVideo';
import ContactForm from '@/components/ContactForm';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const projectId = id ? parseInt(id) : 0;
  const project = projects.find(project => project.id === projectId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!project) {
    return (
      <div className="min-h-screen bg-robotics-black text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Projeto não encontrado</h1>
        <Button asChild variant="outline">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Voltar para Home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-robotics-black text-white">
      <Header />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="w-full max-w-6xl mx-auto">
          <div className="mb-8">
            <Button asChild variant="outline" className="mb-6">
              <Link to="/#projects" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Voltar para Projetos
              </Link>
            </Button>
            
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="relative h-48 sm:h-64 md:h-96 overflow-hidden">
                {project.image ? (
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-robotics-purple-dark/30 flex items-center justify-center">
                    {project.icon}
                    <span className="ml-2 text-lg">{project.category}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-robotics-black/90 to-transparent"></div>
              </div>
              
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient mb-2 sm:mb-0">
                    {project.title}
                  </h1>
                  <div className="flex items-center text-white/60 text-sm sm:text-base">
                    <Calendar size={16} className="mr-1 sm:mr-2" />
                    <span>{project.date}</span>
                  </div>
                </div>
                
                <div className="mb-8">
                  <div className="bg-robotics-purple/10 rounded-lg py-2 px-3 inline-flex items-center mb-4">
                    {project.icon}
                    <span className="ml-2 text-robotics-purple-light font-medium">{project.category}</span>
                  </div>
                  <p className="text-white/80 text-lg leading-relaxed">
                    {project.description}
                  </p>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <ImageIcon size={20} className="mr-2 text-robotics-purple-light" />
                    Galeria de Imagens
                  </h2>
                  {project.images && project.images.length > 0 ? (
                    <ProjectCarousel images={project.images} />
                  ) : (
                    <div className="w-full bg-robotics-black-lighter rounded-xl p-8 text-center">
                      <ImageIcon size={40} className="text-robotics-purple-light/50 mx-auto mb-2" />
                      <p className="text-white/50">Nenhuma imagem disponível para este projeto</p>
                    </div>
                  )}
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Film size={20} className="mr-2 text-robotics-purple-light" />
                    Vídeo do Projeto
                  </h2>
                  <ProjectVideo videoUrl={project.video} />
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Award size={20} className="mr-2 text-robotics-purple-light" />
                    Conquistas
                  </h2>
                  <div className="bg-robotics-black-lighter rounded-xl p-6">
                    <ul className="space-y-3">
                      {project.achievements.map((achievement, i) => (
                        <li 
                          key={i} 
                          className={cn(
                            "text-white/80 flex items-start py-2 px-3 rounded-lg",
                            achievement ? "bg-robotics-black-light" : "bg-transparent text-white/40 italic"
                          )}
                        >
                          <ChevronRight size={18} className="mr-2 text-robotics-purple-light shrink-0 mt-0.5" />
                          {achievement || "Nenhuma conquista registrada ainda"}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="purple-gradient-border p-6 rounded-xl bg-robotics-black-lighter/50">
                  <h2 className="text-xl font-semibold mb-3">Saiba Mais</h2>
                  <p className="text-white/70">
                    Estamos sempre aprimorando nossos projetos. Fique ligado para mais atualizações
                    ou entre em contato conosco para saber mais detalhes sobre o projeto {project.title}.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form Section */}
          <ContactForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProjectDetailPage;
