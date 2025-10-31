"use client";

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function GoogleSidebarAd() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

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
            data-ad-client="ca-pub-YOUR_CLIENT_ID" // IMPORTANT: Replace with your Google AdSense Client ID
            data-ad-slot="YOUR_SIDEBAR_AD_SLOT_ID" // IMPORTANT: Replace with your new Sidebar Ad Slot ID
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </CardContent>
      </Card>
    </div>
  );
}
