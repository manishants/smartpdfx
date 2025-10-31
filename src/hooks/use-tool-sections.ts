"use client";

import { useState, useEffect } from 'react';
import { getCustomToolSections } from '@/lib/tool-sections-config';

interface ToolSection {
  type: 'hero' | 'content';
  title: string;
  description: string;
  features?: Array<{
    icon: any;
    text: string;
  }>;
  imagePlaceholder?: {
    icon: any;
    text: string;
  };
  gradient?: string;
  iconColor?: string;
}

export const useToolSections = (toolName: string) => {
  const [sections, setSections] = useState<ToolSection[]>(() => 
    getCustomToolSections(toolName)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCMSSections = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/cms/sections?type=tool&toolName=${encodeURIComponent(toolName)}&active=true`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch CMS sections');
        }

        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
          // Convert CMS sections to component format
          const convertedSections = result.data
            .sort((a: any, b: any) => a.order - b.order)
            .map((cmsSection: any) => convertCMSSection(cmsSection));
          
          setSections(convertedSections);
        }
        // If no CMS sections, keep the default sections already set
      } catch (err) {
        console.warn('Failed to load CMS sections, using defaults:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Keep default sections on error
      } finally {
        setLoading(false);
      }
    };

    loadCMSSections();
  }, [toolName]);

  return { sections, loading, error };
};

// Helper function to convert CMS section format to component format
const convertCMSSection = (cmsSection: any): ToolSection => {
  // Import icons dynamically - this is a simplified version
  // In a real implementation, you might want to use a more robust icon mapping
  const getIcon = (iconName: string) => {
    // Return a placeholder function for now
    // You could implement dynamic icon loading here
    return () => null;
  };

  if (cmsSection.type === 'hero') {
    return {
      type: 'hero' as const,
      title: cmsSection.title,
      description: cmsSection.description,
      features: cmsSection.content.features?.map((feature: any) => ({
        icon: getIcon(feature.icon),
        text: feature.text
      })) || [],
      imagePlaceholder: {
        icon: getIcon(cmsSection.content.imagePlaceholder?.icon),
        text: cmsSection.content.imagePlaceholder?.text || 'Preview'
      },
      gradient: cmsSection.content.gradient || 'bg-gradient-to-br from-blue-500/10 to-blue-500/5',
      iconColor: cmsSection.content.iconColor || 'text-blue-500'
    };
  } else {
    return {
      type: 'content' as const,
      title: cmsSection.title,
      description: cmsSection.description
    };
  }
};