"use client";

import { useState, useEffect } from 'react';
import { HomePageSection } from '@/types/cms';

export interface HomeSectionData {
  id: string;
  type: 'hero' | 'features' | 'stats' | 'cta';
  title: string;
  subtitle?: string;
  description?: string;
  content?: any;
  isActive: boolean;
  order: number;
}

const defaultHomeSections: HomeSectionData[] = [
  {
    id: 'hero-1',
    type: 'hero',
    title: 'Transform Files with SmartPDFx',
    subtitle: 'AI-Powered Tools',
    description: 'The most advanced online toolkit for PDFs, images, and documents. Compress, convert, edit, and enhance with cutting-edge AI technology.',
    content: {
      stats: [
        { label: 'Tools Available', value: '50+' },
        { label: 'Files Processed', value: '1M+' },
        { label: 'Free to Use', value: '100%' }
      ],
      buttons: [
        { text: 'Start Creating', href: '#tools', variant: 'primary' },
        { text: 'Buy a Cup of Coffee for me', action: 'donate', variant: 'outline' }
      ],
      image: '/hero_section_smartpdfx.webp'
    },
    isActive: true,
    order: 1
  },
  {
    id: 'features-1',
    type: 'features',
    title: 'Why Choose SmartPDFx?',
    description: 'Experience the next generation of file processing with our advanced AI-powered tools',
    content: {
      features: [
        {
          icon: 'Zap',
          title: 'Lightning Fast',
          description: 'Process files in seconds with our optimized algorithms',
          color: 'from-yellow-500 to-orange-500'
        },
        {
          icon: 'Sparkles',
          title: 'AI-Powered',
          description: 'Advanced AI technology for superior results',
          color: 'from-purple-500 to-pink-500'
        },
        {
          icon: 'Star',
          title: 'Premium Quality',
          description: 'Professional-grade output for all your needs',
          color: 'from-blue-500 to-cyan-500'
        }
      ]
    },
    isActive: true,
    order: 2
  }
];

export const useHomeSections = () => {
  const [sections, setSections] = useState<HomeSectionData[]>(defaultHomeSections);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHomeSections = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cms/sections?type=home');
      if (!response.ok) {
        throw new Error('Failed to fetch home sections');
      }
      
      const cmsSections: HomePageSection[] = await response.json();
      
      if (cmsSections && cmsSections.length > 0) {
        const convertedSections: HomeSectionData[] = cmsSections.map(section => ({
          id: section.id,
          type: section.sectionType as 'hero' | 'features' | 'stats' | 'cta',
          title: section.title,
          subtitle: section.subtitle,
          description: section.description,
          content: section.content,
          isActive: section.isActive,
          order: section.order
        }));
        
        setSections(convertedSections);
      }
    } catch (err) {
      console.error('Error fetching home sections:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sections');
      // Keep default sections on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeSections();
  }, []);

  const refreshSections = () => {
    fetchHomeSections();
  };

  const getActiveSections = () => {
    return sections.filter(section => section.isActive).sort((a, b) => a.order - b.order);
  };

  const getSectionsByType = (type: HomeSectionData['type']) => {
    return sections.filter(section => section.type === type && section.isActive);
  };

  return {
    sections,
    loading,
    error,
    refreshSections,
    getActiveSections,
    getSectionsByType
  };
};