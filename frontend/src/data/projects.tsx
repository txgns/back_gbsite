
import React from 'react';
import { Bot, Cpu, Zap, CircuitBoard } from 'lucide-react';

export type Project = {
  id: number;
  title: string;
  category: string;
  date: string;
  image: string;
  description: string;
  achievements: string[];
  icon: string;
  link?: string;
};

// Function to create project icons that will be used in components
export const getProjectIcon = (projectId: number) => {
  switch (projectId) {
    case 1:
      return <Bot size={20} />;
    case 2:
      return <Bot size={20} />;
    case 3:
      return <Bot size={20} />;
    case 4:
      return <Bot size={20} />;
    default:
      return <CircuitBoard size={20} />;
  }
};

export const projects: Project[] = [
  {
    id: 1,
    title: 'Hastur',
    category: 'Combate',
    date: 'Projeto em Andamento',
    image: '',
    description: 'Beetle Vertical Spinner - um robô de combate projetado para competições, com um disco vertical giratório de alta rotação capaz de causar danos significativos aos oponentes. Sua estrutura compacta e resistente permite movimentos ágeis na arena, enquanto seu sistema de arma gera forças destrutivas através da energia cinética.',
    achievements: [
      'Na Busca'

    ],
    icon: 'Bot',
    link: '/project/1',
  },
  {
    id: 2,
    title: 'Cavaleiros da Gambiarra Micro',
    category: 'Hockey',
    date: 'Projeto em Andamento',
    image: '',
    description: 'Time de Hockey Micro ',
    achievements: [
      'Na Busca'
  
    ],
    icon: 'Bot',
    link: '/project/2',
  },
  {
    id: 3,
    title: 'Conceito',
    category: 'Sumô Mini',
    date: 'Projeto em Andamento',
    image: '',
    description: 'Mini Sumo de 500g',
    achievements: [
      'Na Busca'
    ],
    icon: 'Bot',
    link: '/project/3',
  },
  {
    id: 4,
    title: 'Mitsu',
    category: 'Sumô Lego',
    date: 'Projeto em Andamento',
    image: '',
    description: 'Sumo lego Pro de 1kg',
    achievements: [
      'Na Busca'
    ],
    icon: 'Bot',
    link: '/project/4',
  },
];
