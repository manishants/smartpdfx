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
  // Avoid header flicker: defer rendering until we know if CMS overrides exist
  const [displayTitle, setDisplayTitle] = useState<string>('');
  const [displayDescription, setDisplayDescription] = useState<string>('');
  const [pendingHero, setPendingHero] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setPendingHero(true);
    // If no slug, just use provided content immediately
    if (!slug) {
      setDisplayTitle(title);
      setDisplayDescription(description);
      setPendingHero(false);
      return;
    }
    const load = async () => {
      try {
        const [hRes, dRes] = await Promise.all([
          fetch(`/api/tools/heading/${slug}`, { cache: 'no-store' }).catch(() => undefined),
          fetch(`/api/tools/description/${slug}`, { cache: 'no-store' }).catch(() => undefined),
        ]);
        let h = '';
        let d = '';
        try {
          if (hRes && hRes.ok) {
            const json = await hRes.json();
            h = String(json?.heading || '').trim();
          }
        } catch {}
        try {
          if (dRes && dRes.ok) {
            const json = await dRes.json();
            d = String(json?.description || '').trim();
          }
        } catch {}
        if (!cancelled) {
          setDisplayTitle(h || title);
          setDisplayDescription(d || description);
          setPendingHero(false);
        }
      } catch {
        if (!cancelled) {
          setDisplayTitle(title);
          setDisplayDescription(description);
          setPendingHero(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [slug, title, description]);

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
            {/* Header icon removed to unify clean hero across all pages */}
            
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
            
            {/* Title: keep consistent tag to avoid hydration mismatches */}
            <h1 className={cn(
              "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight",
              "bg-gradient-to-r from-foreground via-primary to-blue-600 bg-clip-text text-transparent"
            )}>
              {pendingHero ? (
                <span className="inline-block h-10 md:h-12 lg:h-14 w-3/4 rounded-md bg-muted/40 animate-pulse" />
              ) : (
                displayTitle
              )}
            </h1>
            
            {/* Description: consistent tag during hydration */}
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {pendingHero ? (
                <span className="block h-4 w-full rounded bg-muted/30 animate-pulse" />
              ) : (
                displayDescription
              )}
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