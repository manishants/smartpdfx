"use client";

import { useEffect, useMemo, useState } from 'react';
import { ModernSection } from '@/components/modern-section';
import type { ToolHowtoData, ToolHowtoStep } from '@/lib/tool-howto';
import { toolHowtoFallback } from '@/lib/tool-howto';
import { ListOrdered, Sparkles } from 'lucide-react';

interface RendererProps {
  slug: string;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function ToolHowtoRenderer({ slug, className, title = "How to Use", subtitle = "Step-by-step guide" }: RendererProps) {
  const initial = useMemo(() => {
    const raw = toolHowtoFallback[slug] as unknown;
    return (raw || null) as ToolHowtoData | null;
  }, [slug]);

  const [howto, setHowto] = useState<ToolHowtoData | null>(initial);

  useEffect(() => {
    let cancelled = false;
    const fetchHowto = async () => {
      try {
        const res = await fetch(`/api/tools/howto/${slug}`, { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        const data = json?.howto as ToolHowtoData | null;
        if (!cancelled && data) {
          setHowto(data);
        }
      } catch {
        // Silent fallback
      }
    };
    fetchHowto();
    return () => { cancelled = true; };
  }, [slug]);

  if (!howto || !howto.steps || howto.steps.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howto.name || title,
    description: howto.description || subtitle,
    step: howto.steps.map((s: ToolHowtoStep, idx: number) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: s.title,
      text: s.text,
      ...(s.imageUrl
        ? (
          s.imageAlt
            ? { image: { '@type': 'ImageObject', url: s.imageUrl, caption: s.imageAlt } }
            : { image: s.imageUrl }
        )
        : {})
    }))
  };

  return (
    <ModernSection
      title={title}
      subtitle={subtitle}
      icon={<ListOrdered className="h-6 w-6" />}
      className={className}
      contentClassName="w-full"
    >
      <ol className="space-y-4 list-decimal pl-5">
        {howto.steps.map((step, idx) => (
          <li key={idx} className="space-y-2">
            <div className="font-semibold">{step.title}</div>
            <p className="text-muted-foreground">{step.text}</p>
            {step.imageUrl && (
              <img src={step.imageUrl} alt={step.imageAlt || step.title} className="rounded-md border" />
            )}
          </li>
        ))}
      </ol>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </ModernSection>
  );
}

export default ToolHowtoRenderer;