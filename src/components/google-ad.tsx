"use client";

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function GoogleAd() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_AD_SLOT_ID;
  const isProd = process.env.NODE_ENV === 'production';
  const insRef = useRef<HTMLElement | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !client || !slot || !isProd) return;
    const el = insRef.current as HTMLElement | null;
    if (!el) return;

    const push = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    };

    const tryPush = () => {
      const w = el.offsetWidth;
      if (w && w > 0) {
        push();
        return true;
      }
      return false;
    };

    if (tryPush()) return;

    const ro = new ResizeObserver(() => {
      if (tryPush()) ro.disconnect();
    });
    ro.observe(el);
    const id = setTimeout(() => tryPush(), 1500);
    return () => {
      ro.disconnect();
      clearTimeout(id);
    };
  }, [mounted, client, slot]);

  if (!mounted || !client || !slot || !isProd) {
    // Stable placeholder to prevent hydration mismatch and preserve layout
    return (
      <div className="w-full max-w-full my-4" suppressHydrationWarning>
        <Card className="overflow-hidden">
          <CardContent className="p-2 sm:p-4 flex justify-center items-center min-h-[100px] sm:min-h-[120px] bg-muted/50">
            <div style={{ display: 'block', minWidth: '280px', minHeight: '100px', maxWidth: '100%' }} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full my-4" suppressHydrationWarning>
      <Card className="overflow-hidden">
        <CardContent className="p-2 sm:p-4 flex justify-center items-center min-h-[100px] sm:min-h-[120px] bg-muted/50">
          <ins
            className="adsbygoogle block w-full h-full"
            style={{ 
              display: 'block', 
              minWidth: '280px',
              minHeight: '100px',
              maxWidth: '100%'
            }}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
            ref={insRef}
          ></ins>
        </CardContent>
      </Card>
    </div>
  );
}
