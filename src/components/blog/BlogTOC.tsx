'use client';

import { useEffect, useMemo, useState } from 'react';

export type TOCHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function BlogTOC({
  headings,
  sticky = false,
  fontSizeClass = 'text-sm',
  h3Indent = 12,
  hoverClass = 'hover:text-primary',
}: {
  headings: TOCHeading[];
  sticky?: boolean;
  fontSizeClass?: string;
  h3Indent?: number;
  hoverClass?: string;
}) {
  const items = useMemo(() => headings, [headings]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const onClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Track which heading is currently in view and highlight it
  useEffect(() => {
    if (!items || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Prefer the entry closest to the top when multiple intersect
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = (visible[0].target as HTMLElement).id;
          setActiveId(id);
          return;
        }

        // Fallback: pick the one nearest to viewport top
        const nearest = entries
          .slice()
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];
        if (nearest) {
          const id = (nearest.target as HTMLElement).id;
          setActiveId(id);
        }
      },
      {
        root: null,
        // Top bias so a section becomes active slightly before it reaches center
        rootMargin: '-30% 0px -60% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    const observed: HTMLElement[] = [];
    for (const h of items) {
      const el = document.getElementById(h.id);
      if (el) {
        observer.observe(el);
        observed.push(el);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [items]);

  return (
    <nav aria-label="Table of Contents" className={`${sticky ? 'md:sticky md:top-24' : ''}`}>
      <h2 className="text-base font-semibold mb-2 text-left">Table of Contents</h2>
      <ul className={`space-y-1 ${fontSizeClass} text-left`}
        role="list"
      >
        {items.map((h) => (
          <li key={h.id}>
            <button
              type="button"
              onClick={() => onClick(h.id)}
              className={`${activeId === h.id ? 'text-primary font-medium' : 'text-muted-foreground'} ${hoverClass} transition-colors duration-150 block w-full text-left`}
              style={h.level === 3 ? { marginLeft: h3Indent } : undefined}
              aria-label={`Jump to ${h.text}`}
              aria-current={activeId === h.id ? 'true' : undefined}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}