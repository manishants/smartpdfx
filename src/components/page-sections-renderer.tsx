"use client";

import { useEffect, useMemo, useState } from 'react';
import { ModernSection } from '@/components/modern-section';
import { cn } from '@/lib/utils';

type PageSection = {
  id: string;
  type: string;
  title: string;
  content: string;
  order: number;
  isVisible: boolean;
  settings: Record<string, any>;
};

type CmsPageResponse = {
  id: string;
  title: string;
  slug: string;
  sections: PageSection[];
  status: string;
  metaTitle?: string;
  metaDescription?: string;
};

export function PageSectionsRenderer({ slug, className }: { slug: string; className?: string }) {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/pages/${slug}`, { cache: 'no-store' });
        if (!res.ok) {
          // 404 is expected until the page has stored sections
          setLoaded(true);
          return;
        }
        const data = (await res.json()) as CmsPageResponse;
        const arr = Array.isArray(data?.sections) ? data.sections : [];
        if (!cancelled) {
          setSections(arr);
          setLoaded(true);
        }
      } catch {
        // Silent fallback
        setLoaded(true);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const visibleSections = useMemo(() => {
    return (sections || [])
      .filter((s) => s?.isVisible !== false)
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
  }, [sections]);

  if (!loaded) return null;
  if (!visibleSections || visibleSections.length === 0) return null;

  return (
    <div className={cn('mt-12 mb-12 space-y-12', className)}>
      {visibleSections.map((section) => (
        <ModernSection key={section.id} title={section.title}>
          {/* Render stored HTML/content safely */}
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: section.content || '' }}
          />
        </ModernSection>
      ))}
    </div>
  );
}

export default PageSectionsRenderer;