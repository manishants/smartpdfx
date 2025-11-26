"use client";

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function GoogleToolBelowUploadAd() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_TOOL_BELOW_UPLOAD_SLOT_ID;

  // Render a stable placeholder on server and initial client paint
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !client || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, [mounted, client, slot]);

  if (!mounted || !client || !slot) {
    return (
      <div className="w-full mx-auto my-4" suppressHydrationWarning>
        <div style={{ display: 'block', minHeight: '120px' }} />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto my-4" suppressHydrationWarning>
      <ins
        className="adsbygoogle block w-full"
        style={{ display: 'block', minHeight: '120px' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}