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
  // Unify favicon sitewide to use the default app/favicon.ico
  // Removing per-page icon overrides prevents favicon from changing across routes
  icons: {
    icon: '/favicon.ico',
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
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/favicon-192x192.png" />
        {/* Load AdSense script only when client ID is configured */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
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
