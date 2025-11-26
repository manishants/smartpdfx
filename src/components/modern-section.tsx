"use client";

import { ReactNode } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface ModernSectionProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'transparent';
  contentClassName?: string;
}

export function ModernSection({
  title,
  subtitle,
  icon,
  children,
  className,
  variant = 'default',
  contentClassName
}: ModernSectionProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return "bg-white/50 backdrop-blur-sm border-0 shadow-xl";
      case 'gradient':
        return "bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border-0 shadow-xl";
      case 'transparent':
        return "bg-transparent border-0 shadow-none";
      default:
        return "bg-background border shadow-sm";
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      {(title || subtitle || icon) && (
        <div className="text-center space-y-4">
          {icon && (
            <div className="flex justify-center">
              <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                {icon}
              </div>
            </div>
          )}
          
          {title && (
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {title}
            </h2>
          )}
          
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      {/* Content */}
      <Card className={getVariantClasses()}>
        <CardContent className={cn("p-6 md:p-8", contentClassName)}>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}