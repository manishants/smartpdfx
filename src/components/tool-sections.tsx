"use client";

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  description: string;
  features: Array<{
    icon: LucideIcon;
    text: string;
  }>;
  imagePlaceholder: {
    icon: LucideIcon;
    text: string;
  };
  gradient: string;
  iconColor: string;
  reverse?: boolean;
}

interface ContentSectionProps {
  title: string;
  description: string;
  background?: boolean;
}

export const HeroSection = ({ 
  title, 
  description, 
  features, 
  imagePlaceholder, 
  gradient, 
  iconColor, 
  reverse = false 
}: HeroSectionProps) => {
  const ImagePlaceholder = imagePlaceholder.icon;
  
  return (
    <section className={`py-20 px-4 ${reverse ? 'bg-muted/50' : ''}`}>
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className={`space-y-6 ${reverse ? 'order-1 lg:order-2' : ''}`}>
            <h2 className="text-4xl font-bold text-foreground">
              {title}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {description}
            </p>
            <div className="flex flex-wrap gap-4">
              {features.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-2 text-sm font-medium">
                    <FeatureIcon className={`h-5 w-5 ${iconColor}`} />
                    <span>{feature.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className={`${gradient} rounded-2xl p-8 flex items-center justify-center min-h-[300px] ${reverse ? 'order-2 lg:order-1' : ''}`}>
            <div className="text-center text-muted-foreground">
              <ImagePlaceholder className="h-24 w-24 mx-auto mb-4 opacity-50" />
              <p>{imagePlaceholder.text}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ContentSection = ({ 
  title, 
  description, 
  background = false 
}: ContentSectionProps) => {
  return (
    <section className={`py-16 px-4 ${background ? 'bg-muted/30' : ''}`}>
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold text-foreground mb-6">
          {title}
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
};

interface ToolSectionsProps {
  toolName: string;
  sections: Array<{
    type: 'hero' | 'content';
    title: string;
    description: string;
    features?: Array<{
      icon: LucideIcon;
      text: string;
    }>;
    imagePlaceholder?: {
      icon: LucideIcon;
      text: string;
    };
    gradient?: string;
    iconColor?: string;
  }>;
}

export const ToolSections = ({ toolName, sections }: ToolSectionsProps) => {
  return (
    <div className="bg-background">
      {sections.map((section, index) => {
        if (section.type === 'hero') {
          return (
            <HeroSection
              key={index}
              title={section.title}
              description={section.description}
              features={section.features || []}
              imagePlaceholder={section.imagePlaceholder || { icon: () => null, text: '' }}
              gradient={section.gradient || 'bg-gradient-to-br from-primary/10 to-primary/5'}
              iconColor={section.iconColor || 'text-primary'}
              reverse={index % 4 === 2} // Alternate hero sections (every 2nd hero section is reversed)
            />
          );
        } else {
          return (
            <ContentSection
              key={index}
              title={section.title}
              description={section.description}
              background={index % 4 === 1} // Alternate content sections background
            />
          );
        }
      })}
    </div>
  );
};