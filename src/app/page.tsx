'use client';

import { useEffect } from 'react';
import { Calendar } from '@/components/Calendar';
import { StatsOverview } from '@/components/Stats';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

export default function HomePage() {
  // تسجيل Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="text-center space-y-4">
        <h1 className="heading-xl text-gradient">
          نظام حجز الفيلا
        </h1>
        <p className="text-muted text-lg">
          إدارة الحجوزات والمدفوعات بسهولة
        </p>
      </header>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Main Calendar */}
      <section>
        <Calendar />
      </section>

      {/* Statistics Overview */}
      <section>
        <StatsOverview />
      </section>
    </div>
  );
}