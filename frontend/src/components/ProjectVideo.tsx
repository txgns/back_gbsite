
import React from 'react';
import { Film } from 'lucide-react';

interface ProjectVideoProps {
  videoUrl?: string;
}

const ProjectVideo = ({ videoUrl }: ProjectVideoProps) => {
  if (!videoUrl) {
    return (
      <div className="w-full h-80 bg-robotics-black-lighter flex flex-col items-center justify-center rounded-xl">
        <Film size={40} className="text-robotics-purple-light/50 mb-2" />
        <p className="text-white/50">Nenhum vídeo disponível</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl overflow-hidden bg-robotics-black-lighter">
      <div className="aspect-video"> {/* Mudando para aspect-video para uma proporção 16:9 melhor */}
        <iframe
          src={videoUrl}
          title="Project Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
    </div>
  );
};

export default ProjectVideo;
