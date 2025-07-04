
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
  images?: string[];
  video?: string;
};

// Function to create project icons that will be used in components
export const getProjectIcon = (projectId: number) => {
  switch (projectId) {
    case 1:
      return Bot;
    case 2:
      return Bot;
    case 3:
      return Bot;
    case 4:
      return Bot;
    default:
      return CircuitBoard;
  }
};

export const projects: Project[] = [
  {
    id: 1,
    title: 'Hastur',
    category: 'Combate',
    date: 'Projeto em Andamento',
    image: '',
    description: 'Beetle Vertical Spinner ',
    achievements: [
      ''
    ],
    icon: 'Bot',
    link: '/project/1',
    images: [
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
      'https://images.unsplash.com/photo-1518770660439-4636190af475',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1',
      'https://images.unsplash.com/photo-1555255707-c07966088b7b',
      'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5'
    ],
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 2,
    title: 'Cavaleiros da Gambiarra Micro',
    category: 'Hockey',
    date: 'Projeto em Andamento',
    image: '',
    description: 'Time de Hockey Micro ',
    achievements: [
      ''
    ],
    icon: 'Bot',
    link: '/project/2',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475',
      'https://images.unsplash.com/photo-1558137623-ce933996c730',
      'https://images.unsplash.com/photo-1535223289827-42f1e9919769',
      'https://images.unsplash.com/photo-1507668339897-8a035aa9527d',
      'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f'
    ],
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 3,
    title: 'Conceito',
    category: 'Sumô Mini',
    date: 'Projeto em Andamento',
    image: '',
    description: 'Mini Sumo de 500g ',
    achievements: [
      ''
    ],
    icon: 'Bot',
    link: '/project/3',
    images: [
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
      'https://images.unsplash.com/photo-1563770660941-10a69283acdc',
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f'
    ],
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 4,
    title: 'Mitsu',
    category: 'Sumô Lego',
    date: 'Projeto em Andamento',
    image: '',
    description: 'Sumo lego Pro de 1kg ',
    achievements: [
      ''
    ],
    icon: 'Bot',
    link: '/project/4',
    images: [
      'https://images.unsplash.com/photo-1481487196290-c152efe083f5',
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086',
      'https://images.unsplash.com/photo-1535378620166-273708d44e4c',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789',
      'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e'
    ],
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
];
