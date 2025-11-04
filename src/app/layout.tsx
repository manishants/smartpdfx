import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { MainLayout } from '@/components/main-layout';
import { ThemeProvider } from '@/components/theme-provider';
export const metadata: Metadata = {
  title: {
    default: 'SmartPDFx - Free PDF & Image Tools',
    template: '%s | SmartPDFx',
  },
  description: 'A free online suite of tools to compress, convert, edit, and secure your PDF and image files. Fast, private, and easy to use.',
  keywords: ['PDF tools', 'image compressor', 'PDF converter', 'e-sign PDF', 'mask aadhar', 'online tools', 'free'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? 'https://smartpdfx.com'),
  icons: {
    icon: [
      { url: '/favion.png', sizes: '32x32', type: 'image/png' },
      { url: '/favion.png', sizes: '48x48', type: 'image/png' },
      { url: '/favion.png', sizes: '72x72', type: 'image/png' },
      { url: '/favion.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favion.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/favion.png', sizes: '180x180' },
    ],
    shortcut: '/favion.png',
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
        <link rel="apple-touch-icon" href="/favion.png" />
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_CLIENT_ID"
          crossOrigin="anonymous"
        ></script>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
