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
    <div className="container mx-auto my-4">
      <Card>
        <CardContent className="p-4 flex justify-center items-center h-24 bg-muted/50">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '100%' }}
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
