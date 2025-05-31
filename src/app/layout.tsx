import './globals.css';
import { Providers } from '@/components/Providers';
import { Navigation } from '@/components/Navigation';
import { ToastProvider } from '@/components/ui/ToastProvider';
import localFont from 'next/font/local';
import type { Metadata, Viewport } from 'next';

// تحميل خط القاهرة العربي
const cairo = localFont({
  src: [
    {
      path: './fonts/Cairo-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/Cairo-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Cairo-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Cairo-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/Cairo-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-cairo',
  display: 'swap',
  preload: true,
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
    url: 'https://villa-booking.app',
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
    startupImage: [
      {
        url: '/icons/apple-splash-2048-2732.png',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/apple-splash-1668-2388.png',
        media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/apple-splash-1536-2048.png',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icons/apple-splash-1284-2778.png',
        media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/icons/apple-splash-1170-2532.png',
        media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/icons/apple-splash-1125-2436.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },

  // Icons
  icons: {
    icon: [
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
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
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${cairo.className} antialiased`}>
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