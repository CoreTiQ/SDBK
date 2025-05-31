'use client';

import { Dialog } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '@/lib/supabase';

interface BookingModalProps {
  date: string;
  onClose: () => void;
}

export default function BookingModal({ date, onClose }: BookingModalProps) {
  const [form, setForm] = useState({
    client_name: '',
    booking_type: 'morning',
    price: '',
    notes: '',
    phone: '',
    is_free: false
  });

  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: db.bookings.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      toast.success('تم إضافة الحجز بنجاح');
      onClose();
    },
    onError: () => {
      toast.error('حدث خطأ أثناء إضافة الحجز');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من توفر الموعد
    const isAvailable = await db.isSlotAvailable(date, form.booking_type as any);
    if (!isAvailable) {
      toast.error('هذا الموعد محجوز مسبقاً');
      return;
    }

    mutate({
      client_name: form.client_name,
      date,
      booking_type: form.booking_type as 'morning' | 'evening' | 'full',
      price: Number(form.price),
      notes: form.notes,
      phone: form.phone,
      is_free: form.is_free
    });
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="modal-overlay" />
      
      <div className="modal-container">
        <Dialog.Panel className="modal-content">
          <Dialog.Title className="modal-header">
            إضافة حجز جديد - {date}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">اسم العميل</label>
              <input
                type="text"
                required
                value={form.client_name}
                onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                placeholder="أدخل اسم العميل"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">رقم الهاتف</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="أدخل رقم الهاتف"
                className="form-input"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">نوع الحجز</label>
              <select
                value={form.booking_type}
                onChange={e => setForm(f => ({ ...f, booking_type: e.target.value }))}
                className="form-select"
              >
                <option value="morning">صباحي</option>
                <option value="evening">مسائي</option>
                <option value="full">يوم كامل</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">السعر (د)</label>
              <input
                type="number"
                step="0.001"
                required={!form.is_free}
                disabled={form.is_free}
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0.000"
                className="form-input"
              />
            </div>

            <div className="switch-container">
              <span className="switch-label">حجز مجاني</span>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, is_free: !f.is_free, price: f.is_free ? '' : '0' }))}
                className="switch-button"
                data-checked={form.is_free}
              >
                <span className="switch-thumb" />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">ملاحظات</label>
              <input
                type="text"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="أضف أي ملاحظات إضافية"
                className="form-input"
              />
            </div>

            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-ghost">
                إلغاء
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'جاري الحفظ...' : 'حفظ الحجز'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}