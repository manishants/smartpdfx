"use client";

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import ToolSchemaInjector from '@/components/tool-schema-injector';
import ToolRelatedBlogLink from '@/components/tool-related-blog-link';

interface ModernPageLayoutProps {
  title: string;
  description: string;
  icon?: ReactNode;
  badge?: string;
  gradient?: string;
  backgroundVariant?: 'default' | 'home';
  children: ReactNode;
  className?: string;
}

export function ModernPageLayout({
  title,
  description,
  icon,
  badge,
  gradient = "from-blue-600 via-purple-600 to-cyan-500",
  backgroundVariant = 'default',
  children,
  className
}: ModernPageLayoutProps) {
  const pathname = usePathname();
  const slug = useMemo(() => {
    const parts = (pathname || '/').split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  }, [pathname]);
  const [displayTitle, setDisplayTitle] = useState<string>(title);
  const [displayDescription, setDisplayDescription] = useState<string>(description);

  useEffect(() => {
    let cancelled = false;
    const fetchHeading = async () => {
      try {
        if (!slug) return;
        const res = await fetch(`/api/tools/heading/${slug}`, { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        const h = String(json?.heading || '').trim();
        if (!cancelled && h) {
          setDisplayTitle(h);
        }
      } catch {}
    };
    const fetchDescription = async () => {
      try {
        if (!slug) return;
        const res = await fetch(`/api/tools/description/${slug}`, { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        const d = String(json?.description || '').trim();
        if (!cancelled && d) {
          setDisplayDescription(d);
        }
      } catch {}
    };
    fetchHeading();
    fetchDescription();
    return () => { cancelled = true; };
  }, [slug]);

  const heroBadge = badge ?? 'AI-Powered & Secure'

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-background via-background to-background", className)}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        {backgroundVariant === 'home' ? (
          <>
            {/* Match homepage radial glow layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.10),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.10),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,119,198,0.10),transparent_50%)]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-cyan-50/30" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-cyan-400/10 rounded-full blur-3xl" />
          </>
        )}
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            {/* Icon */}
            {icon && (
              <div className={cn(
                "inline-flex p-4 rounded-2xl bg-gradient-to-br shadow-lg",
                gradient.includes('from-') ? `bg-gradient-to-br ${gradient}` : `bg-gradient-to-br ${gradient}`
              )}>
                <div className="text-foreground">
                  {icon}
                </div>
              </div>
            )}
            
            {/* Badge */}
            <div className="flex justify-center">
              <Badge
                variant="secondary"
                className="px-4 py-2 bg-gradient-to-r from-primary/10 to-blue-600/10 border border-primary/20 text-primary font-medium inline-flex items-center justify-center"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {heroBadge}
                </span>
              </Badge>
            </div>
            
            {/* Title */}
            <h1 className={cn(
              "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight",
              "bg-gradient-to-r from-foreground via-primary to-blue-600 bg-clip-text text-transparent"
            )}>
              {displayTitle}
            </h1>
            
            {/* Description */}
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {displayDescription}
            </p>
            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-6 mt-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                {/* Fallback emoji to avoid icon import overhead */}
                <span role="img" aria-label="lightning">⚡</span>
                <span>Lightning Fast</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span role="img" aria-label="shield">🛡️</span>
                <span>Secure by Design</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span role="img" aria-label="star">⭐</span>
                <span>Premium Quality</span>
              </div>
            </div>
            {/* Related Blog Link */}
            <div className="flex justify-center">
              <ToolRelatedBlogLink slug={slug} />
            </div>
          </div>
        </div>
        {/* Inject WebApplication JSON-LD for this tool page */}
        <ToolSchemaInjector slug={slug} />
      </div>
      
      {/* Content */}
      <div className="relative container mx-auto px-4 pb-16">
        {children}
      </div>
    </div>
  );
}