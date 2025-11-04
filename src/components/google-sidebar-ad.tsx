"use client";

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function GoogleSidebarAd() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT_ID;

  useEffect(() => {
    if (!client || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  if (!client || !slot) {
    return null;
  }

  return (
    <div className="w-full h-full min-h-[250px] max-w-full">
      <Card className="h-full overflow-hidden">
        <CardContent className="p-2 sm:p-3 h-full flex items-center justify-center bg-muted/30">
          <ins
            className="adsbygoogle block w-full h-full"
            style={{ 
              display: 'block',
              minWidth: '160px',
              minHeight: '250px',
              maxWidth: '100%',
              width: '100%',
              height: '100%'
            }}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </CardContent>
      </Card>
    </div>
  );
}
