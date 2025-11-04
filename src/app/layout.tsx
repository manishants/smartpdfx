import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { MainLayout } from '@/components/main-layout';
import { ThemeProvider } from '@/components/theme-provider';
import { SwRegister } from '@/components/sw-register';
import { Inter } from 'next/font/google';
export const metadata: Metadata = {
  title: {
    default: 'SmartPDFx - Free PDF & Image Tools',
    template: '%s | SmartPDFx',
  },
  description: 'A free online suite of tools to compress, convert, edit, and secure your PDF and image files. Fast, private, and easy to use.',
  keywords: ['PDF tools', 'image compressor', 'PDF converter', 'e-sign PDF', 'mask aadhar', 'online tools', 'free'],
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
        {/* Google AdSense */}
        <meta name="google-adsense-account" content={ADSENSE_CLIENT_ID} />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} font-body antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MainLayout>{children}</MainLayout>
          <Toaster />
          {/* Register Service Worker for PWA functionality */}
          <SwRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
