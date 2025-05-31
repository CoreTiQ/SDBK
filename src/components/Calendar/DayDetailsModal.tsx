'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db, utils } from '@/lib/supabase';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PhoneIcon,
  CalendarIcon,
  BanknotesIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import type { Booking } from '@/lib/supabase';

interface DayDetailsModalProps {
  date: string;
  bookings: Booking[];
  onClose: () => void;
  onAddBooking: () => void;
}

export function DayDetailsModal({ 
  date, 
  bookings, 
  onClose, 
  onAddBooking 
}: DayDetailsModalProps) {
  const [deletingBookingId, setDeletingBookingId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { mutate: deleteBooking } = useMutation({
    mutationFn: (bookingId: number) => db.bookings.delete(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      toast.success('تم حذف الحجز بنجاح');
      setDeletingBookingId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل في حذف الحجز');
      setDeletingBookingId(null);
    },
  });

  const handleDeleteBooking = (bookingId: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
      setDeletingBookingId(bookingId);
      deleteBooking(bookingId);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'EEEE، dd MMMM yyyy', { locale: ar });
    } catch {
      return dateStr;
    }
  };

  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.price, 0);
  const hasFullDay = bookings.some(b => b.booking_type === 'full');
  const hasMorning = bookings.some(b => b.booking_type === 'morning');
  const hasEvening = bookings.some(b => b.booking_type === 'evening');

  // التحقق من إمكانية إضافة حجز جديد
  const canAddBooking = !hasFullDay && (!hasMorning || !hasEvening);

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="modal-overlay" />
      
      <div className="modal-container">
        <Dialog.Panel className="modal-content max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Dialog.Title className="heading-md">
                تفاصيل اليوم
              </Dialog.Title>
              <p className="text-white/80 mt-1">
                {formatDate(date)}
              </p>
            </div>
            
            {canAddBooking && (
              <button
                onClick={onAddBooking}
                className="btn btn-primary"
              >
                <PlusIcon className="w-4 h-4" />
                إضافة حجز
              </button>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-card text-center">
              <CalendarIcon className="w-6 h-6 text-primary-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{bookings.length}</div>
              <div className="text-xs text-white/60">حجوزات</div>
            </div>
            
            <div className="glass-card text-center">
              <BanknotesIcon className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {utils.formatCurrency(totalRevenue)}
              </div>
              <div className="text-xs text-white/60">إجمالي الدخل</div>
            </div>
            
            <div className="glass-card text-center">
              <div className="w-6 h-6 mx-auto mb-2 flex items-center justify-center">
                {hasFullDay ? (
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                ) : (
                  <div className="flex gap-1">
                    {hasMorning && <div className="w-2 h-4 bg-blue-500 rounded"></div>}
                    {hasEvening && <div className="w-2 h-4 bg-orange-500 rounded"></div>}
                    {!hasMorning && !hasEvening && <div className="w-4 h-4 bg-gray-500 rounded-full"></div>}
                  </div>
                )}
              </div>
              <div className="text-sm font-medium text-white">
                {hasFullDay ? 'يوم كامل' : 
                 hasMorning && hasEvening ? 'مُشغل بالكامل' :
                 hasMorning ? 'صباحي فقط' :
                 hasEvening ? 'مسائي فقط' : 'متاح'}
              </div>
              <div className="text-xs text-white/60">حالة اليوم</div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="glass-card hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Client Info */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white text-lg">
                          {booking.client_name}
                        </h3>
                        
                        {/* Booking Type Badge */}
                        <span className={`badge ${
                          booking.booking_type === 'full' ? 'badge-red' :
                          booking.booking_type === 'morning' ? 'badge-blue' :
                          'badge-orange'
                        }`}>
                          {utils.getBookingTypeLabel(booking.booking_type)}
                        </span>
                        
                        {/* Free Badge */}
                        {booking.is_free && (
                          <span className="badge badge-green">مجاني</span>
                        )}
                      </div>

                      {/* Phone */}
                      {booking.phone && (
                        <div className="flex items-center gap-2 text-white/80 mb-2">
                          <PhoneIcon className="w-4 h-4" />
                          <a 
                            href={`tel:${booking.phone}`}
                            className="hover:text-primary-400 transition-colors"
                            dir="ltr"
                          >
                            {booking.phone}
                          </a>
                        </div>
                      )}

                      {/* Notes */}
                      {booking.notes && (
                        <p className="text-white/70 text-sm mb-2">
                          {booking.notes}
                        </p>
                      )}

                      {/* Created Time */}
                      <p className="text-white/50 text-xs">
                        تم الإنشاء: {format(new Date(booking.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                      </p>
                    </div>

                    {/* Price & Actions */}
                    <div className="text-left space-y-3">
                      <div className="text-xl font-bold text-white">
                        {utils.formatCurrency(booking.price)}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost p-2 text-red-400 hover:text-red-300"
                          onClick={() => handleDeleteBooking(booking.id)}
                          disabled={deletingBookingId === booking.id}
                          title="حذف الحجز"
                        >
                          {deletingBookingId === booking.id ? (
                            <div className="spinner w-4 h-4" />
                          ) : (
                            <TrashIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/60 mb-2">
                  لا توجد حجوزات
                </h3>
                <p className="text-white/40 mb-6">
                  هذا اليوم متاح بالكامل للحجز
                </p>
                <button
                  onClick={onAddBooking}
                  className="btn btn-primary"
                >
                  <PlusIcon className="w-4 h-4" />
                  إضافة أول حجز
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-6 border-t border-white/10">
            <div className="text-sm text-white/60">
              {bookings.length} حجز • {utils.formatCurrency(totalRevenue)}
            </div>
            
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              إغلاق
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}