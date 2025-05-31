'use client';

import { Dialog, Switch } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import moment from 'moment';

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
    isFree: false
  });

  const [availableTypes, setAvailableTypes] = useState([
    { value: 'morning', label: 'صباحي' },
    { value: 'evening', label: 'مسائي' },
    { value: 'full', label: 'يوم كامل' }
  ]);

  const queryClient = useQueryClient();

  const getAvailableBookingTypes = async () => {
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('date', date);

    const allTypes = [
      { value: 'morning', label: 'صباحي' },
      { value: 'evening', label: 'مسائي' },
      { value: 'full', label: 'يوم كامل' }
    ];

    if (!existingBookings || existingBookings.length === 0) {
      return allTypes;
    }

    const hasFullDay = existingBookings.some(b => b.booking_type === 'full');
    const hasMorning = existingBookings.some(b => b.booking_type === 'morning');
    const hasEvening = existingBookings.some(b => b.booking_type === 'evening');

    if (hasFullDay) {
      return [];
    }

    if (hasMorning) {
      return [{ value: 'evening', label: 'مسائي' }];
    }

    if (hasEvening) {
      return [{ value: 'morning', label: 'صباحي' }];
    }

    return allTypes;
  };

  useEffect(() => {
    const loadAvailableTypes = async () => {
      const types = await getAvailableBookingTypes();
      setAvailableTypes(types);
      if (types.length === 1) {
        setForm(f => ({ ...f, booking_type: types[0].value }));
      }
    };

    loadAvailableTypes();
  }, [date]);

  const checkExistingBookings = async () => {
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('date', date);

    if (existingBookings && existingBookings.length > 0) {
      const hasFullDay = existingBookings.some(b => b.booking_type === 'full');
      const morningBooking = existingBookings.find(b => b.booking_type === 'morning');
      const eveningBooking = existingBookings.find(b => b.booking_type === 'evening');

      if (hasFullDay) {
        throw new Error('هذا اليوم محجوز بالكامل');
      }

      if (form.booking_type === 'full' && (morningBooking || eveningBooking)) {
        throw new Error('لا يمكن إضافة حجز يوم كامل، يوجد حجوزات جزئية');
      }

      if (form.booking_type === 'morning' && morningBooking) {
        throw new Error('الفترة الصباحية محجوزة مسبقاً');
      }

      if (form.booking_type === 'evening' && eveningBooking) {
        throw new Error('الفترة المسائية محجوزة مسبقاً');
      }
    }

    return true;
  };

  const { mutate, isLoading } = useMutation({
    mutationFn: async () => {
      await checkExistingBookings();
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          client_name: form.client_name,
          date,
          booking_type: form.booking_type,
          price: form.isFree ? 0 : Number(form.price),
          notes: form.notes,
          is_free: form.isFree
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      toast.success('تم إضافة الحجز بنجاح');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء إضافة الحجز');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.client_name.trim()) {
      toast.error('الرجاء إدخال اسم العميل');
      return;
    }

    if (!form.isFree && (!form.price || Number(form.price) <= 0)) {
      toast.error('الرجاء إدخال سعر صحيح');
      return;
    }

    mutate();
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="modal-content w-full max-w-md">
          <Dialog.Title className="text-xl font-bold text-white mb-6 text-center">
            إضافة حجز جديد
            <div className="text-lg font-normal text-white/80 mt-2">
              {moment(date).format('YYYY-MM-DD')}
            </div>
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                اسم العميل
              </label>
              <Input
                type="text"
                value={form.client_name}
                onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                placeholder="أدخل اسم العميل"
                required
                className="text-right"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                نوع الحجز
              </label>
              <Select
                value={form.booking_type}
                onChange={e => setForm(f => ({ ...f, booking_type: e.target.value }))}
                options={availableTypes}
                disabled={availableTypes.length === 1}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="text-sm font-medium text-white/80">
              
              </label>
              <div className="switch-container">
  <span className="switch-label">
    حجز مجاني
  </span>
  <Switch
    checked={form.isFree}
    onChange={(checked) => {
      setForm(f => ({ 
        ...f, 
        isFree: checked,
        price: checked ? '0' : f.price
      }));
    }}
    className="switch-button"
    data-checked={form.isFree}
  >
    <span className="switch-thumb" />
  </Switch>
</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                السعر (د)
              </label>
              <Input
                type="number"
                step="0.001"
                min="0"
                value={form.isFree ? '0' : form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0.000"
                required
                className="text-right"
                disabled={form.isFree}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                ملاحظات
              </label>
              <Input
                type="text"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="أضف أي ملاحظات إضافية"
                className="text-right"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/10">
              <Button variant="ghost" onClick={onClose}>
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