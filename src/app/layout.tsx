import './globals.css';
import { Providers } from '@/components/Providers';
import { Toaster } from 'react-hot-toast';
import localFont from 'next/font/local';
import Navigation from '@/components/Navigation';

const font = localFont({
  src: './fonts/Cairo-Arabic-Variable.ttf',
  variable: '--font-cairo'
});

export const metadata = {
  title: 'نظام حجز الفيلا',
  description: 'نظام إدارة حجوزات وإيجارات الفيلا اليومية',
  manifest: '/manifest.json',
  themeColor: '#0f172a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'نظام حجز الفيلا',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  icons: {
    apple: [
      { url: '/icons/icon-192x192.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={font.className}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="نظام حجز الفيلا" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-gradient pb-[72px] min-h-screen">
        <Providers>
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
          <Navigation />
          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#fff',
                borderRadius: '10px',
                marginBottom: '80px'
              },
              duration: 3000,
            }} 
          />
        </Providers>
      </body>
    </html>
  );
}