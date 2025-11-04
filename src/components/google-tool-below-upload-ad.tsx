"use client";

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function GoogleToolBelowUploadAd() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_TOOL_BELOW_UPLOAD_SLOT_ID;

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
    <div className="w-full mx-auto my-4">
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