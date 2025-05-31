'use client';

import { useEffect } from 'react';
import Calendar from '@/components/Calendar';
import StatsGrid from '@/components/Stats/StatsGrid';

export default function Home() {
  // تسجيل Service Worker لدعم PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <main className="container mx-auto p-4 max-w-7xl">
      {/* <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">نظام حجز الفيلا</h1>
        <p className="text-gray-600">نظام إدارة الحجوزات والمدفوعات</p>
      </header> */}
      
      <Calendar />
      <StatsGrid />
    </main>
  );
}