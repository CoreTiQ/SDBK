'use client';

import { Dialog } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBooking } from '@/lib/supabase';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { toast } from 'react-hot-toast';

interface BookingModalProps {
  date: string;
  onClose: () => void;
}

export default function BookingModal({ date, onClose }: BookingModalProps) {
  const [form, setForm] = useState({
    client_name: '',
    booking_type: 'morning',
    price: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      toast.success('تم إضافة الحجز بنجاح');
      onClose();
    },
    onError: () => {
      toast.error('حدث خطأ أثناء إضافة الحجز');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    mutate({
      client_name: form.client_name,
      date,
      booking_type: form.booking_type as 'morning' | 'evening' | 'full',
      price: Number(form.price),
      notes: form.notes
    });
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-xl shadow-lg p-6">
          <Dialog.Title className="text-xl font-bold mb-4">
            إضافة حجز جديد - {date}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم العميل</label>
              <Input
                type="text"
                required
                value={form.client_name}
                onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                placeholder="أدخل اسم العميل"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">نوع الحجز</label>
              <Select
                value={form.booking_type}
                onChange={e => setForm(f => ({ ...f, booking_type: e.target.value }))}
                options={[
                  { value: 'morning', label: 'صباحي' },
                  { value: 'evening', label: 'مسائي' },
                  { value: 'full', label: 'يوم كامل' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">السعر (د)</label>
              <Input
                type="number"
                step="0.001"
                required
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0.000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ملاحظات</label>
              <Input
                type="text"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="أضف أي ملاحظات إضافية"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit" isLoading={isLoading}>
                حفظ الحجز
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}