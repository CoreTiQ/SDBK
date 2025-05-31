'use client';

import { Dialog } from '@headlessui/react';
import { Booking } from '@/lib/supabase';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import moment from 'moment';

interface DayDetailsModalProps {
  date: string;
  bookings: Booking[];
  onClose: () => void;
  onAddBooking: () => void;
}

export default function DayDetailsModal({ date, bookings, onClose, onAddBooking }: DayDetailsModalProps) {
  const hasFullDay = bookings.some(b => b.booking_type === 'full');
  const hasMorning = bookings.some(b => b.booking_type === 'morning');
  const hasEvening = bookings.some(b => b.booking_type === 'evening');

  const formattedDate = moment(date).format('dddd, DD MMMM YYYY');
  const totalIncome = bookings.reduce((sum, b) => sum + b.price, 0);

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="modal-content w-full max-w-xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <Dialog.Title className="text-xl font-bold text-white mb-1">
                {formattedDate}
              </Dialog.Title>
              <div className="flex gap-2">
                {hasFullDay && <Badge variant="red">يوم كامل</Badge>}
                {hasMorning && <Badge variant="blue">صباحي</Badge>}
                {hasEvening && <Badge variant="orange">مسائي</Badge>}
              </div>
            </div>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg text-white">
                        {booking.client_name}
                      </h3>
                      <div className="text-white/70 text-sm">
                        {booking.booking_type === 'morning' ? 'حجز صباحي' :
                         booking.booking_type === 'evening' ? 'حجز مسائي' : 
                         'يوم كامل'}
                      </div>
                      {booking.notes && (
                        <p className="text-white/60 text-sm mt-2">{booking.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{booking.price.toFixed(3)} د</div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t border-white/10 mt-4 pt-4">
                <div className="flex justify-between text-lg">
                  <span>الإجمالي</span>
                  <span className="font-bold text-white">{totalIncome.toFixed(3)} د</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              لا توجد حجوزات في هذا اليوم
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/10">
            {!hasFullDay && (!hasMorning || !hasEvening) && (
              <Button onClick={onAddBooking}>
                إضافة حجز {hasMorning ? 'مسائي' : hasEvening ? 'صباحي' : ''}
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              إغلاق
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}