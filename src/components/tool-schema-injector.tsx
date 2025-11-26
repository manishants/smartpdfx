"use client";

import { useEffect, useMemo, useState } from 'react';
import { tools } from '@/lib/data';

interface Props {
  slug: string; // e.g. 'png-to-pdf'
}

export default function ToolSchemaInjector({ slug }: Props) {
  const tool = useMemo(() => {
    const href = `/${slug}`;
    return tools.find(t => t.href === href) || null;
  }, [slug]);

  if (!tool) return null;

  const [overrideName, setOverrideName] = useState<string | null>(null);
  const [overrideDescription, setOverrideDescription] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchOverrides = async () => {
      try {
        const [hRes, dRes] = await Promise.all([
          fetch(`/api/tools/heading/${slug}`, { cache: 'no-store' }),
          fetch(`/api/tools/description/${slug}`, { cache: 'no-store' })
        ]);
        if (hRes.ok) {
          const hj = await hRes.json();
          const h = String(hj?.heading || '').trim();
          if (!cancelled && h) setOverrideName(h);
        }
        if (dRes.ok) {
          const dj = await dRes.json();
          const d = String(dj?.description || '').trim();
          if (!cancelled && d) setOverrideDescription(d);
        }
      } catch {}
    };
    fetchOverrides();
    return () => { cancelled = true; };
  }, [slug]);

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://smartpdfx.com').replace(/\/$/, '');
  const pageUrl = `${siteUrl}${tool.href}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: overrideName || tool.title,
    url: pageUrl,
    description: overrideDescription || tool.description,
    applicationCategory: tool.category,
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: 0,
      priceCurrency: 'USD'
    },
    publisher: {
      '@type': 'Organization',
      name: 'SmartPDFx'
    }
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}