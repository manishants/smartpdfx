"use client";

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function GoogleAd() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <div className="w-full max-w-full mx-auto my-4 px-2 sm:px-4">
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
            data-ad-client="ca-pub-YOUR_CLIENT_ID" // IMPORTANT: Replace with your Google AdSense Client ID
            data-ad-slot="YOUR_AD_SLOT_ID"       // IMPORTANT: Replace with your Ad Slot ID
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </CardContent>
      </Card>
    </div>
  );
}
