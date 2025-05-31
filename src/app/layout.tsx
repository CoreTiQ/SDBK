import './globals.css';
import { Providers } from '@/components/Providers';
import { Navigation } from '@/components/Navigation';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

// استخدام خط Google Fonts بدلاً من الخطوط المحلية
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'نظام حجز الفيلا',
    template: '%s | نظام حجز الفيلا',
  },
  description: 'نظام إدارة حجوزات وإيجارات الفيلا اليومية - تطبيق ويب تقدمي',
  keywords: ['حجز فيلا', 'إدارة حجوزات', 'تأجير يومي', 'نظام إدارة'],
  authors: [{ name: 'Villa Booking System' }],
  creator: 'Villa Booking System',
  publisher: 'Villa Booking System',
  
  manifest: '/manifest.json',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://villa-booking.vercel.app',
    title: 'نظام حجز الفيلا',
    description: 'نظام إدارة حجوزات وإيجارات الفيلا اليومية',
    siteName: 'نظام حجز الفيلا',
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'نظام حجز الفيلا',
    description: 'نظام إدارة حجوزات وإيجارات الفيلا اليومية',
  },

  // PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'نظام حجز الفيلا',
  },

  // Icons
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },

  // Other
  formatDetection: {
    telephone: false,
  },
  
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#0f172a" />
        <meta name="msapplication-TileColor" content="#0f172a" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1 container-app py-6 pb-20">
              {children}
            </main>
            <Navigation />
          </div>
          <ToastProvider />
        </Providers>
      </body>
    </html>
  );
}