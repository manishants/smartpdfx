"use client";

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function GoogleHeaderAd() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_PAGE_BELOW_HEADER_SLOT_ID;

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
    <div className="w-full max-w-full my-4">
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
          ></ins>
        </CardContent>
      </Card>
    </div>
  );
}