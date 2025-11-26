"use client";

import { useEffect, useMemo, useState } from 'react';
import { ModernSection } from '@/components/modern-section';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sparkles } from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import type { ToolFaqItem } from '@/lib/tool-faq';
import { toolFaqFallback } from '@/lib/tool-faq';

interface RendererProps {
  slug: string;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function ToolFaqRenderer({ slug, className, title = "Tool FAQs", subtitle = "Frequently Asked Questions" }: RendererProps) {
  const initial = useMemo(() => {
    const raw = toolFaqFallback[slug] as unknown;
    const arr = Array.isArray(raw) ? raw : [];
    return arr as ToolFaqItem[];
  }, [slug]);

  const [faqs, setFaqs] = useState<ToolFaqItem[]>(initial);

  useEffect(() => {
    let cancelled = false;
    const fetchFaqs = async () => {
      try {
        const res = await fetch(`/api/tools/faq/${slug}`, { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        const arr = Array.isArray(json?.faqs) ? (json.faqs as ToolFaqItem[]) : [];
        if (!cancelled && arr.length > 0) {
          setFaqs(arr);
        }
      } catch {
        // Silent fallback to initial build-time data
      }
    };
    fetchFaqs();
    return () => { cancelled = true; };
  }, [slug]);

  if (!faqs || faqs.length === 0) return null;

  // Build FAQPage JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    }))
  };

  return (
    <ModernSection
      title={title}
      subtitle={subtitle}
      icon={<Sparkles className="h-6 w-6" />}
      className={className}
      contentClassName="w-full"
    >
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, idx) => (
          <AccordionItem key={idx} value={`item-${idx + 1}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(faq.answer) }} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </ModernSection>
  );
}

export default ToolFaqRenderer;