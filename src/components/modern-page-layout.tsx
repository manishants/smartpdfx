"use client";

import { ReactNode } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

interface ModernPageLayoutProps {
  title: string;
  description: string;
  icon?: ReactNode;
  badge?: string;
  gradient?: string;
  children: ReactNode;
  className?: string;
}

export function ModernPageLayout({
  title,
  description,
  icon,
  badge,
  gradient = "from-blue-600 via-purple-600 to-cyan-500",
  children,
  className
}: ModernPageLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-background via-background to-muted/20", className)}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-cyan-50/30" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-cyan-400/10 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            {/* Icon */}
            {icon && (
              <div className={cn(
                "inline-flex p-4 rounded-2xl bg-gradient-to-br shadow-lg",
                gradient.includes('from-') ? `bg-gradient-to-br ${gradient}` : `bg-gradient-to-br ${gradient}`
              )}>
                <div className="text-white">
                  {icon}
                </div>
              </div>
            )}
            
            {/* Badge */}
            {badge && (
              <div className="flex justify-center">
                <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-white/80 backdrop-blur-sm">
                  {badge}
                </Badge>
              </div>
            )}
            
            {/* Title */}
            <h1 className={cn(
              "text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
              gradient.includes('from-') ? `bg-gradient-to-r ${gradient}` : `bg-gradient-to-r ${gradient}`
            )}>
              {title}
            </h1>
            
            {/* Description */}
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative container mx-auto px-4 pb-16">
        {children}
      </div>
    </div>
  );
}