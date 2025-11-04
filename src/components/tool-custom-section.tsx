"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ModernSection } from '@/components/modern-section';
import { cn } from '@/lib/utils';
import { isExternalUrl, toolCustomSections, type ToolCustomSectionData } from '@/lib/tool-custom-sections';

interface RendererProps {
  slug: string;
  className?: string;
}

export function ToolCustomSectionRenderer({ slug, className }: RendererProps) {
  const raw = toolCustomSections[slug] as unknown;
  const sections = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
      ? [raw as any]
      : [];
  if (sections.length === 0) return null;

  const renderButtons = (buttons?: ToolCustomSectionData['buttons']) => {
    if (!buttons || buttons.length === 0) return null;
    return (
      <div className="mt-6 flex flex-wrap gap-3">
        {buttons.slice(0, 2).map((btn, idx) => {
          const external = isExternalUrl(btn.href);
          if (external) {
            return (
              <Button key={idx} asChild>
                <a href={btn.href} target="_blank" rel="noopener noreferrer">{btn.text}</a>
              </Button>
            );
          }
          return (
            <Button key={idx} asChild variant={idx === 0 ? 'default' : 'outline'}>
              <Link href={btn.href}>{btn.text}</Link>
            </Button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn('mt-12 mb-12 space-y-12', className)}>
      {sections.map((section, idx) => {
        const ImageEl = (
          <div className="w-full">
            {/* Use standard img for maximum compatibility; Next/Image for local images when allowed */}
            {section.image.src.startsWith('/') ? (
              <Image src={section.image.src} alt={section.image.alt} width={800} height={600} className="w-full h-auto rounded-xl shadow-sm" />
            ) : (
              <img src={section.image.src} alt={section.image.alt} className="w-full h-auto rounded-xl shadow-sm" />
            )}
          </div>
        );

        const TextEl = (
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{section.heading}</h2>
            <p className="text-muted-foreground text-base leading-relaxed">{section.paragraph}</p>
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