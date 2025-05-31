'use client';

import { useState, useEffect } from 'react';
import { ExpensesSystem } from '@/components/ExpensesSystem';

function PinInput({ onSubmit }: { onSubmit: (pin: string) => void }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    // التنقل التلقائي للمربع التالي
    if (value !== '' && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }

    // التحقق من اكتمال الرمز
    if (index === 3 && value !== '') {
      const fullPin = [...newPin.slice(0, 3), value].join('');
      if (fullPin === '5544') { // يمكنك تغيير كلمة المرور هنا
        onSubmit(fullPin);
      } else {
        setError(true);
        setPin(['', '', '', '']);
        document.getElementById('pin-0')?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && pin[index] === '' && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  useEffect(() => {
    document.getElementById('pin-0')?.focus();
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="bg-white/5 p-8 rounded-2xl backdrop-blur-lg border border-white/10 w-full max-w-md">
        <h2 className="text-xl font-bold text-white text-center mb-6">
          أدخل كلمة المرور للوصول إلى الإحصائيات
        </h2>
        
        <div className="flex justify-center gap-3 mb-4">
          {pin.map((digit, index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`
                w-14 h-14 text-center text-2xl font-bold
                bg-white/10 border border-white/20
                rounded-lg text-white
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-all duration-200
                ${error ? 'border-red-500 ring-1 ring-red-500' : ''}
              `}
            />
          ))}
        </div>
        
        {error && (
          <p className="text-red-400 text-sm text-center">
            كلمة المرور غير صحيحة. حاول مرة أخرى.
          </p>
        )}
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handlePinSubmit = (pin: string) => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <PinInput onSubmit={handlePinSubmit} />;
  }

  return (
    <main className="container mx-auto p-4 max-w-7xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">إدارة المصروفات</h1>
      </header>
      <ExpensesSystem />
    </main>
  );
}