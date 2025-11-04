import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { MainLayout } from '@/components/main-layout';
import { ThemeProvider } from '@/components/theme-provider';
import { SwRegister } from '@/components/sw-register';
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
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
        {/* Explicit favicon link for broad browser support */}
        <link rel="icon" type="image/png" href="/favion.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/favicon-192x192.png" />
        {/* AdSense: load script and verification meta only when client ID is configured */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <>
            <meta name="google-adsense-account" content={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID} />
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
              crossOrigin="anonymous"
            />
          </>
        )}
      </head>
      <body className="font-body antialiased bg-background text-foreground">
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
