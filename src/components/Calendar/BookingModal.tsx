'use client';

import { useState, useEffect } from 'react';
import { Dialog, Switch } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

interface BookingModalProps {
  date: string;
  onClose: () => void;
}

interface BookingForm {
  client_name: string;
  phone: string;
  booking_type: 'morning' | 'evening' | 'full';
  price: string;
  notes: string;
  is_free: boolean;
}

export function BookingModal({ date, onClose }: BookingModalProps) {
  const [form, setForm] = useState<BookingForm>({
    client_name: '',
    phone: '',
    booking_type: 'morning',
    price: '',
    notes: '',
    is_free: false,
  });

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(true);

  const queryClient = useQueryClient();

  // التحقق من الفترات المتاحة
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        setIsCheckingAvailability(true);
        const slots = [];
        
        const isMorningAvailable = await db.bookings.isSlotAvailable(date, 'morning');
        const isEveningAvailable = await db.bookings.isSlotAvailable(date, 'evening');
        const isFullDayAvailable = await db.bookings.isSlotAvailable(date, 'full');

        if (isMorningAvailable) slots.push('morning');
        if (isEveningAvailable) slots.push('evening');
        if (isFullDayAvailable) slots.push('full');

        setAvailableSlots(slots);
        
        // تعيين القيمة الافتراضية للنوع
        if (slots.length > 0 && !slots.includes(form.booking_type)) {
          setForm(prev => ({ ...prev, booking_type: slots[0] as any }));
        }
      } catch (error) {
        console.error('Error checking availability:', error);
        toast.error('خطأ في التحقق من الفترات المتاحة');
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [date, form.booking_type]);

  const { mutate: createBooking, isLoading } = useMutation({
    mutationFn: async (bookingData: any) => {
      // التحقق النهائي من التوفر
      const isAvailable = await db.bookings.isSlotAvailable(date, bookingData.booking_type);
      if (!isAvailable) {
        throw new Error('عذراً، هذا الموعد لم يعد متاحاً');
      }

      return db.bookings.create({
        ...bookingData,
        date,
        status: 'confirmed' as const,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      toast.success('تم إنشاء الحجز بنجاح');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء إنشاء الحجز');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من صحة البيانات
    if (!form.client_name.trim()) {
      toast.error('يرجى إدخال اسم العميل');
      return;
    }

    if (!form.is_free && (!form.price || Number(form.price) <= 0)) {
      toast.error('يرجى إدخال سعر صحيح أو تفعيل الحجز المجاني');
      return;
    }

    if (!availableSlots.includes(form.booking_type)) {
      toast.error('الفترة المحددة غير متاحة');
      return;
    }

    const bookingData = {
      client_name: form.client_name.trim(),
      phone: form.phone.trim(),
      booking_type: form.booking_type,
      price: form.is_free ? 0 : Number(form.price),
      notes: form.notes.trim(),
      is_free: form.is_free,
    };

    createBooking(bookingData);
  };

  const updateForm = (updates: Partial<BookingForm>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'EEEE، dd MMMM yyyy', { locale: ar });
    } catch {
      return dateStr;
    }
  };

  const getSlotLabel = (slot: string) => {
    const labels = {
      morning: 'فترة صباحية (6 ص - 6 م)',
      evening: 'فترة مسائية (6 م - 12 ص)',
      full: 'يوم كامل (24 ساعة)',
    };
    return labels[slot as keyof typeof labels] || slot;
  };

  if (isCheckingAvailability) {
    return (
      <Dialog open={true} onClose={onClose} className="relative z-50">
        <div className="modal-overlay" />
        <div className="modal-container">
          <div className="modal-content">
            <div className="text-center py-8">
              <div className="spinner mx-auto mb-4" />
              <p className="text-white">جاري التحقق من الفترات المتاحة...</p>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <Dialog open={true} onClose={onClose} className="relative z-50">
        <div className="modal-overlay" />
        <div className="modal-container">
          <div className="modal-content text-center">
            <h3 className="heading-md text-red-400 mb-4">
              لا توجد فترات متاحة
            </h3>
            <p className="text-white/80 mb-6">
              جميع الفترات محجوزة في هذا اليوم
            </p>
            <button onClick={onClose} className="btn btn-secondary">
              إغلاق
            </button>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="modal-overlay" />
      
      <div className="modal-container">
        <Dialog.Panel className="modal-content">
          <Dialog.Title className="heading-md text-center mb-2">
            حجز جديد
          </Dialog.Title>
          
          <p className="text-center text-white/80 mb-6">
            {formatDate(date)}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* اسم العميل */}
            <div className="form-group">
              <label className="form-label">اسم العميل *</label>
              <input
                type="text"
                value={form.client_name}
                onChange={(e) => updateForm({ client_name: e.target.value })}
                className="form-input"
                placeholder="أدخل اسم العميل"
                required
              />
            </div>

            {/* رقم الهاتف */}
            <div className="form-group">
              <label className="form-label">رقم الهاتف</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateForm({ phone: e.target.value })}
                className="form-input"
                placeholder="اختياري"
                dir="ltr"
              />
            </div>

            {/* نوع الحجز */}
            <div className="form-group">
              <label className="form-label">نوع الحجز *</label>
              <select
                value={form.booking_type}
                onChange={(e) => updateForm({ booking_type: e.target.value as any })}
                className="form-select"
                required
              >
                {availableSlots.map(slot => (
                  <option key={slot} value={slot}>
                    {getSlotLabel(slot)}
                  </option>
                ))}
              </select>
            </div>

            {/* مفتاح الحجز المجاني */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <span className="text-white">حجز مجاني</span>
              <Switch
                checked={form.is_free}
                onChange={(checked) => updateForm({ 
                  is_free: checked, 
                  price: checked ? '0' : form.price 
                })}
                className={`switch ${form.is_free ? 'enabled' : 'disabled'}`}
              >
                <span className="switch-thumb" />
              </Switch>
            </div>

            {/* السعر */}
            {!form.is_free && (
              <div className="form-group">
                <label className="form-label">السعر (د.ك) *</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={form.price}
                  onChange={(e) => updateForm({ price: e.target.value })}
                  className="form-input"
                  placeholder="0.000"
                  required
                />
              </div>
            )}

            {/* الملاحظات */}
            <div className="form-group">
              <label className="form-label">ملاحظات</label>
              <textarea
                value={form.notes}
                onChange={(e) => updateForm({ notes: e.target.value })}
                className="form-textarea"
                placeholder="أضف أي ملاحظات إضافية..."
                rows={3}
              />
            </div>

            {/* أزرار التحكم */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary flex-1"
                disabled={isLoading}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="spinner" />
                    جاري الحفظ...
                  </div>
                ) : (
                  'إنشاء الحجز'
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}