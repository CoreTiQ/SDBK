'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowDownTrayIcon, 
  XMarkIcon,
  DevicePhoneMobileIcon 
} from '@heroicons/react/24/outline';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // التحقق من حالة التثبيت
    const checkInstallation = () => {
      if (typeof window === 'undefined') return;
      
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebApp = 'standalone' in window.navigator && (window.navigator as any).standalone;
      const isInstallPromptDismissed = localStorage.getItem('pwa-install-dismissed');
      
      setIsInstalled(isStandalone || isInWebApp);
      
      // إخفاء الإشعار إذا تم تثبيت التطبيق أو رفض المستخدم سابقاً
      if (isStandalone || isInWebApp || isInstallPromptDismissed) {
        setIsVisible(false);
      }
    };

    checkInstallation();

    // الاستماع لحدث beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // إظهار الإشعار بعد 3 ثوانٍ إذا لم يكن مثبتاً
      setTimeout(() => {
        if (!isInstalled && typeof window !== 'undefined' && !localStorage.getItem('pwa-install-dismissed')) {
          setIsVisible(true);
        }
      }, 3000);
    };

    // الاستماع لحدث التثبيت
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pwa-install-dismissed');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.addEventListener('appinstalled', handleAppInstalled);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
        window.removeEventListener('appinstalled', handleAppInstalled);
      }
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
        if (typeof window !== 'undefined') {
          localStorage.setItem('pwa-install-dismissed', 'true');
        }
      }
      
      setDeferredPrompt(null);
      setIsVisible(false);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  // عدم إظهار الإشعار إذا كان التطبيق مثبتاً أو غير مرئي
  if (!isVisible || isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <div className="glass-card animate-slide-up border border-primary-500/30 bg-gradient-to-r from-primary-500/10 to-purple-500/10">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
            <DevicePhoneMobileIcon className="w-6 h-6 text-primary-400" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-2">
            تثبيت التطبيق
          </h3>
          <p className="text-white/80 text-sm mb-4 leading-relaxed">
            احصل على تجربة أفضل! ثبت تطبيق نظام حجز الفيلا على جهازك للوصول السريع والعمل بدون اتصال.
          </p>

          {/* مميزات التثبيت */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              وصول سريع
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              يعمل بدون اتصال
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              إشعارات فورية
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              تجربة أصلية
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleInstallClick}
              className="btn btn-primary flex-1 text-sm"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              تثبيت الآن
            </button>
            
            <button
              onClick={handleDismiss}
              className="btn btn-ghost p-2"
              title="إخفاء"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}