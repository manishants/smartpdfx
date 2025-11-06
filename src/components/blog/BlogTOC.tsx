'use client';

import { useMemo } from 'react';

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

  const onClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav aria-label="Table of Contents" className={`${sticky ? 'md:sticky md:top-24' : ''}`}>
      <h2 className="text-base font-semibold mb-2">Table of Contents</h2>
      <ul className={`space-y-1 ${fontSizeClass}`}>
        {items.map((h) => (
          <li key={h.id}>
            <button
              type="button"
              onClick={() => onClick(h.id)}
              className={`text-muted-foreground ${hoverClass} transition-colors duration-150`}
              style={h.level === 3 ? { marginLeft: h3Indent } : undefined}
              aria-label={`Jump to ${h.text}`}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}