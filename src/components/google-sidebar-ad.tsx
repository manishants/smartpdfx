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
    <div className="w-full h-full">
        <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-YOUR_CLIENT_ID" // IMPORTANT: Replace with your Google AdSense Client ID
            data-ad-slot="YOUR_SIDEBAR_AD_SLOT_ID" // IMPORTANT: Replace with your new Sidebar Ad Slot ID
            data-ad-format="auto"
            data-full-width-responsive="true"
        ></ins>
    </div>
  );
}
