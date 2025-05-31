'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { LockClosedIcon } from '@heroicons/react/24/outline';

interface PinAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
  correctPin?: string;
}

export function PinAuthModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title = "المصادقة مطلوبة",
  description = "أدخل كلمة المرور للمتابعة",
  correctPin = "5544"
}: PinAuthModalProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // إعادة تعيين النموذج عند الفتح
  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setError(false);
      setIsLoading(false);
      // التركيز على أول حقل
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handlePinChange = (index: number, value: string) => {
    // السماح بالأرقام فقط
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    // الانتقال للحقل التالي تلقائياً
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // التحقق من اكتمال الرمز
    if (index === 3 && value) {
      const fullPin = [...newPin.slice(0, 3), value].join('');
      verifyPin(fullPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // مسح الحقل الحالي عند الضغط على Backspace
    if (e.key === 'Backspace') {
      if (pin[index]) {
        const newPin = [...pin];
        newPin[index] = '';
        setPin(newPin);
        setError(false);
      } else if (index > 0) {
        // الانتقال للحقل السابق إذا كان الحقل الحالي فارغ
        inputRefs.current[index - 1]?.focus();
      }
    }
    
    // منع إدخال أي شيء غير الأرقام
    if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Enter' && !/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const verifyPin = async (enteredPin: string) => {
    setIsLoading(true);
    
    // محاكاة التحقق (يمكن استبدالها بطلب API)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (enteredPin === correctPin) {
      onSuccess();
    } else {
      setError(true);
      setPin(['', '', '', '']);
      setIsLoading(false);
      // التركيز على أول حقل
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPin = pin.join('');
    if (fullPin.length === 4) {
      verifyPin(fullPin);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="modal-overlay" />
      
      <div className="modal-container">
        <Dialog.Panel className="modal-content max-w-sm">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mb-4">
              <LockClosedIcon className="w-8 h-8 text-primary-400" />
            </div>
            
            <Dialog.Title className="heading-md mb-2">
              {title}
            </Dialog.Title>
            
            <p className="text-white/70 text-sm">
              {description}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* حقول إدخال الرمز */}
            <div className="flex justify-center gap-3">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => inputRefs.current[index] = el}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`
                    w-14 h-14 text-center text-2xl font-bold
                    bg-white/10 border border-white/20 rounded-xl
                    text-white placeholder:text-white/30
                    focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                    transition-all duration-200
                    ${error ? 'border-red-500 ring-2 ring-red-500/20 animate-pulse' : ''}
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={isLoading}
                  autoComplete="off"
                />
              ))}
            </div>

            {/* رسالة الخطأ */}
            {error && (
              <div className="text-center">
                <p className="text-red-400 text-sm animate-slide-up">
                  كلمة المرور غير صحيحة. حاول مرة أخرى.
                </p>
              </div>
            )}

            {/* حالة التحميل */}
            {isLoading && (
              <div className="text-center">
                <div className="spinner mx-auto mb-2" />
                <p className="text-white/60 text-sm">
                  جاري التحقق...
                </p>
              </div>
            )}

            {/* إرشادات */}
            <div className="text-center text-xs text-white/50">
              أدخل الرمز المكون من 4 أرقام
            </div>

            {/* زر الإلغاء */}
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary w-full"
              disabled={isLoading}
            >
              إلغاء
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}