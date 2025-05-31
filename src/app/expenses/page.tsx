'use client';

import { useState, useEffect } from 'react';
import { ExpensesManager } from '@/components/Expenses';
import { PinAuthModal } from '@/components/ui/PinAuthModal';

export default function ExpensesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPinModal, setShowPinModal] = useState(true);

  // التحقق من المصادقة المحفوظة
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = localStorage.getItem('expenses-auth');
      if (savedAuth) {
        const { timestamp, authenticated } = JSON.parse(savedAuth);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000; // ساعة واحدة
        
        if (authenticated && (now - timestamp) < oneHour) {
          setIsAuthenticated(true);
          setShowPinModal(false);
        } else {
          localStorage.removeItem('expenses-auth');
        }
      }
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowPinModal(false);
    
    // حفظ المصادقة لمدة ساعة
    if (typeof window !== 'undefined') {
      localStorage.setItem('expenses-auth', JSON.stringify({
        authenticated: true,
        timestamp: Date.now(),
      }));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowPinModal(true);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('expenses-auth');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <PinAuthModal
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onSuccess={handleAuthSuccess}
          title="الوصول إلى المصروفات"
          description="أدخل كلمة المرور للوصول إلى إدارة المصروفات"
        />
        
        {!showPinModal && (
          <div className="glass-container text-center space-y-4">
            <h2 className="heading-md">مطلوب مصادقة</h2>
            <p className="text-muted">
              يجب إدخال كلمة المرور للوصول إلى هذه الصفحة
            </p>
            <button
              onClick={() => setShowPinModal(true)}
              className="btn btn-primary"
            >
              إدخال كلمة المرور
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="heading-lg">إدارة المصروفات</h1>
          <p className="text-muted">
            تتبع وإدارة جميع مصروفات الفيلا
          </p>
        </div>
        
        <button
          onClick={handleLogout}
          className="btn btn-ghost text-sm"
        >
          تسجيل الخروج
        </button>
      </header>

      {/* Expenses Manager */}
      <ExpensesManager />
    </div>
  );
}