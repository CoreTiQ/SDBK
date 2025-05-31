'use client';

import { Booking } from '@/lib/supabase';
import moment from 'moment';
import { useMemo } from 'react';
import { Badge } from '../ui/Badge';

interface DayCellProps {
  date: string;
  bookings: Booking[];
  onClick: () => void;
}

export default function DayCell({ date, bookings, onClick }: DayCellProps) {
  const { hasFullDay, hasMorning, hasEvening } = useMemo(() => ({
    hasFullDay: bookings.some(b => b.booking_type === 'full'),
    hasMorning: bookings.some(b => b.booking_type === 'morning'),
    hasEvening: bookings.some(b => b.booking_type === 'evening'),
  }), [bookings]);

  const dayNumber = moment(date).date();
  const totalIncome = bookings.reduce((sum, b) => sum + b.price, 0);
  const isToday = moment(date).isSame(moment(), 'day');

  return (
    <button
      onClick={onClick}
      className={`
        calendar-day relative
        ${hasFullDay ? 'booking-full' : ''}
        ${hasMorning && !hasFullDay ? 'booking-morning' : ''}
        ${hasEvening && !hasFullDay ? 'booking-evening' : ''}
        ${isToday ? 'ring-2 ring-blue-500/50' : ''}
      `}
    >
      {/* رقم اليوم */}
      <div className="day-number">
        {dayNumber}
      </div>

      {/* عرض للشاشات الكبيرة */}
      <div className="hidden md:block">
        {bookings.length > 0 ? (
          <div className="mt-6 space-y-2">
            {/* نوع الحجز */}
            {hasFullDay ? (
              <Badge variant="red">يوم كامل</Badge>
            ) : (
              <div className="flex flex-wrap gap-1">
                {hasMorning && <Badge variant="blue">صباحي</Badge>}
                {hasEvening && <Badge variant="orange">مسائي</Badge>}
              </div>
            )}
            {/* السعر */}
            {totalIncome > 0 && (
              
              <div className="text-sm text-white/70 mt-1">
                {totalIncome.toFixed(3)} د
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-white/40">
            متاح
          </div>
        )}
      </div>

      {/* عرض للموبايل */}
      <div className="block md:hidden">
        {bookings.length > 0 ? (
          <div className="mobile-badge">
 {/* نوع الحجز */}
 <span className="booking-type">
   {hasFullDay ? 'يوم كامل' : 
    hasMorning && hasEvening ? 'ص/م' :
    hasMorning ? 'صباحي' : 
    hasEvening ? 'مسائي' : ''}
 </span>

 {/* السعر - يظهر فقط في الشاشات المتوسطة والكبيرة */}
 {totalIncome > 0 && (
   <span className="hidden sm:inline-block text-[10px] mr-2">
     {totalIncome.toFixed(3)} د.ك
   </span>
 )}
</div>
        ) : (
          <div className="mobile-badge opacity-50">
            متاح
          </div>
        )}
      </div>

      {/* مؤشر للحجوزات المتعددة */}
      {bookings.length > 1 && (
        <div className="absolute top-1 left-1 w-2 h-2 bg-white/50 rounded-full" />
      )}
    </button>
  );
}