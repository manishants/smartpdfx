"use client";

import { useEffect, useState } from 'react';

type Props = {
  slug: string;
  className?: string;
  label?: string;
};

function isSafeUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  // Allow internal blog links and absolute http(s) links only
  if (trimmed.startsWith('/blog/')) return true;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
  return false;
}

export default function ToolRelatedBlogLink({ slug, className, label }: Props) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const resp = await fetch(`/api/tools/related-blog/${slug}`);
        if (!resp.ok) return;
        const json = await resp.json();
        const candidate = String(json?.relatedBlogUrl || '').trim();
        if (!cancelled && isSafeUrl(candidate)) {
          setUrl(candidate);
        }
      } catch {
        // ignore
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!url) return null;

  return (
    <div className={className || 'mt-2 text-sm'}>
      <span className="text-muted-foreground">Related Blog:</span>{' '}
      <a
        href={url}
        target={url.startsWith('http') ? '_blank' : undefined}
        rel={url.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="text-primary hover:underline font-medium"
        aria-label={label || 'Related blog article'}
      >
        {label || 'Read the article'}
      </a>
    </div>
  );
}