"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Sparkles } from "lucide-react";

type ConsentState = "accepted" | "rejected" | "unset";

function getConsentFromCookie(): ConsentState {
  if (typeof document === "undefined") return "unset";
  const match = document.cookie.match(/(?:^|; )cookie_consent=([^;]+)/);
  const value = match ? decodeURIComponent(match[1]) : null;
  return (value === "accepted" || value === "rejected") ? (value as ConsentState) : "unset";
}

function setConsentCookie(value: ConsentState) {
  const days = 365;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `cookie_consent=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>("unset");
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const isProd = process.env.NODE_ENV === 'production';

  useEffect(() => {
    setConsent(getConsentFromCookie());
  }, []);

  const acceptAll = () => {
    setConsent("accepted");
    setConsentCookie("accepted");
  };

  const rejectAll = () => {
    setConsent("rejected");
    setConsentCookie("rejected");
  };

  const acceptSelected = () => {
    // Currently only analytics is optional; necessary cookies are always on
    if (analyticsEnabled) {
      setConsent("accepted");
      setConsentCookie("accepted");
    } else {
      setConsent("rejected");
      setConsentCookie("rejected");
    }
  };

  // Hidden if consent was already given/denied
  const hidden = consent !== "unset";

  return (
    <>
      {/* Load GA only in production when consent is accepted and GA ID is present */}
      {isProd && consent === "accepted" && GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);} 
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {hidden ? null : (
        <div className="fixed bottom-4 left-4 z-50">
          <Card className="border border-primary/20 shadow-lg bg-gradient-to-br from-background via-background/95 to-muted/40 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-gradient-to-br from-primary/10 to-blue-600/10 border border-primary/20">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold">Cookie Preferences</h2>
                  <p className="text-xs text-muted-foreground">
                    We use necessary cookies for site functionality and optional analytics cookies to improve performance. You can accept or decline in line with your country’s regulations.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Checkbox id="analytics-consent" checked={analyticsEnabled} onCheckedChange={(v) => setAnalyticsEnabled(Boolean(v))} />
                    <label htmlFor="analytics-consent" className="text-xs">
                      Enable analytics (Google Analytics)
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button size="sm" className="bg-gradient-to-r from-primary to-blue-600" onClick={acceptAll}>Accept All</Button>
                    <Button size="sm" variant="outline" onClick={rejectAll}>Decline</Button>
                    <Button size="sm" variant="ghost" onClick={acceptSelected}>Save Preferences</Button>
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    See our <Link href="/privacy-policy" className="text-primary underline">Privacy Policy</Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}