"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModernSection } from '@/components/modern-section';
import { cn } from '@/lib/utils';
import { isExternalUrl, toolCustomSections, type ToolCustomSectionData } from '@/lib/tool-custom-sections';
import { useEffect, useMemo, useState } from 'react';

interface RendererProps {
  slug: string;
  className?: string;
}

export function ToolCustomSectionRenderer({ slug, className }: RendererProps) {
  // Initial sections from build-time JSON as a fallback
  const initial = useMemo(() => {
    const raw = toolCustomSections[slug] as unknown;
    const arr = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object'
        ? [raw as any]
        : [];
    return arr as ToolCustomSectionData[];
  }, [slug]);

  const [sections, setSections] = useState<ToolCustomSectionData[]>(initial);

  // Fetch latest sections at runtime to avoid stale build-time content
  useEffect(() => {
    let cancelled = false;
    const fetchSections = async () => {
      try {
        const res = await fetch(`/api/tools/custom-section/${slug}`, { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        const arr = Array.isArray(json?.sections) ? (json.sections as ToolCustomSectionData[]) : [];
        if (!cancelled && arr.length > 0) {
          setSections(arr);
        }
      } catch {
        // Silent fallback to initial build-time data
      }
    };
    fetchSections();
    return () => { cancelled = true; };
  }, [slug]);

  if (!sections || sections.length === 0) return null;

  const sanitizeParagraph = (html: string) => {
    try {
      // Run only in the browser
      if (typeof window === 'undefined') return html;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      // Remove risky elements
      doc.querySelectorAll('script, iframe, object, embed, style').forEach(el => el.remove());
      // Clean attributes
      doc.querySelectorAll('*').forEach(el => {
        for (const attr of Array.from(el.attributes)) {
          if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
          if (attr.name === 'href') {
            const val = attr.value || '';
            if (!/^(https?:|mailto:|tel:|\/)/i.test(val)) el.removeAttribute(attr.name);
          }
          if (attr.name === 'target' || attr.name === 'rel') {
            el.removeAttribute(attr.name);
          }
        }
      });
      return doc.body.innerHTML;
    } catch {
      return html;
    }
  };

  const renderButtons = (buttons?: ToolCustomSectionData['buttons']) => {
    if (!buttons || buttons.length === 0) return null;
    return (
      <div className="mt-6 flex flex-wrap gap-3">
        {buttons.slice(0, 2).map((btn, idx) => {
          const external = isExternalUrl(btn.href);
          if (external) {
            return (
              <Button
                key={idx}
                asChild
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl"
              >
                <a href={btn.href} target="_blank" rel="noopener noreferrer">{btn.text}</a>
              </Button>
            );
          }
          return (
            idx === 0 ? (
              <Button
                key={idx}
                asChild
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl"
              >
                <Link href={btn.href}>{btn.text}</Link>
              </Button>
            ) : (
              <Button
                key={idx}
                asChild
                variant="outline"
                className="border-primary/20 hover:border-primary/40 hover:bg-primary/5"
              >
                <Link href={btn.href}>{btn.text}</Link>
              </Button>
            )
          );
        })}
      </div>
    );
  };

  // Image with extension fallback logic
  const ImageWithFallback = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
    const hasExtension = (s: string) => /\.[a-zA-Z0-9]+$/.test(s);
    const normalizedAlt = (alt || '').trim();
    const buildPath = (ext: string) => (normalizedAlt ? `/page/${normalizedAlt}.${ext}` : '');

    const initialSrc = hasExtension(src) ? src : (buildPath('webp') || src);
    const [currentSrc, setCurrentSrc] = useState<string>(initialSrc);
    const [attempt, setAttempt] = useState<number>(0);

    const handleError = () => {
      // Try png -> jpg -> jpeg as fallbacks
      const next = attempt === 0 ? buildPath('png')
        : attempt === 1 ? buildPath('jpg')
        : attempt === 2 ? buildPath('jpeg')
        : '';
      if (next) {
        setAttempt((a) => a + 1);
        setCurrentSrc(next);
      }
    };

    if (!currentSrc) {
      return (
        <div className="w-full h-48 bg-muted rounded-xl" />
      );
    }

    return (
      <img src={currentSrc} alt={alt} className={className} onError={handleError} />
    );
  };

  return (
    <div className={cn('mt-12 mb-12 space-y-12', className)}>
      {sections.map((section, idx) => {
        const ImageEl = (
          <div className="w-full">
            {/* Use standard <img> with robust src fallback for maximum cross-environment compatibility */}
            <ImageWithFallback src={section.image.src} alt={section.image.alt} className="w-full h-auto rounded-xl shadow-sm" />
          </div>
        );

        const TextEl = (
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{section.heading}</h2>
            <p
              className="text-muted-foreground text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeParagraph(section.paragraph) }}
            />
            {renderButtons(section.buttons)}
          </div>
        );

        const content = section.type === 'A' ? (
          // Hero Left-Text / Right-Image
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>{TextEl}</div>
            <div>{ImageEl}</div>
          </div>
        ) : (
          // Image Left / Right Text
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>{ImageEl}</div>
            <div>{TextEl}</div>
          </div>
        );

        return (
          <ModernSection key={idx}>
            {content}
          </ModernSection>
        );
      })}
    </div>
  );
}

export default ToolCustomSectionRenderer;