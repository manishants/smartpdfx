import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { MainLayout } from '@/components/main-layout';
import { ThemeProvider } from '@/components/theme-provider';
import CookieConsent from '@/components/cookie-consent';
import { SwRegister } from '@/components/sw-register';
import { Inter } from 'next/font/google';
import Script from 'next/script';
export const metadata: Metadata = {
  title: {
    default: 'SmartPDFx - Free PDF & Image Tools',
    template: '%s | SmartPDFx',
  },
  description: 'A free online suite of tools to compress, convert, edit, and secure your PDF and image files. Fast, private, and easy to use.',
  keywords: ['PDF tools', 'image compressor', 'PDF converter', 'e-sign PDF', 'online tools', 'free'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? 'https://smartpdfx.com'),
  // Use PNG icons from /public for consistent favicon across routes
  icons: {
    icon: [
      { url: '/favion.png', type: 'image/png' },
      { url: '/favicon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/favicon512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/favicon-192x192.png',
  },
};

// Self-host Inter to avoid render-blocking external font requests
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// AdSense client ID: use env if set, otherwise default to provided ID
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? 'ca-pub-9014719958396297';
const IS_PROD = process.env.NODE_ENV === 'production';
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Fonts loaded via next/font for better FCP and LCP */}
        {/* Explicit favicon link for broad browser support */}
        <link rel="icon" type="image/png" href="/favion.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/favicon-192x192.png" />
        {/* Google AdSense: only load in production to avoid noisy dev logs */}
        {IS_PROD && (
          <>
            <meta name="google-adsense-account" content={ADSENSE_CLIENT_ID} />
            {/* Preconnect to AdSense domain without blocking rendering */}
            <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
            <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
            {/* Google AdSense script in <head>; loads after hydration */}
            <Script
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
              strategy="afterInteractive"
              async
              crossOrigin="anonymous"
            />
          </>
        )}
        {/* Removed Google Translate: using local dictionary-based i18n */}
      </head>
      <body className={`${inter.className} font-body antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Cookie Consent */}
          <CookieConsent />
          <MainLayout>{children}</MainLayout>
          {/* Cookie consent removed per request */}
          <Toaster />
          {/* Register Service Worker for PWA functionality */}
          <SwRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
