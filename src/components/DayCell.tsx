'use client';

import { Booking } from '@/lib/supabase';
import moment from 'moment';
import { useMemo } from 'react';

interface DayCellProps {
  date: string;
  bookings: Booking[];
  onClick: () => void;
}

export default function DayCell({ date, bookings, onClick }: DayCellProps) {
  const { hasFullDay, hasMorning, hasEvening } = useMemo(() => {
    return {
      hasFullDay: bookings.some(b => b.booking_type === 'full'),
      hasMorning: bookings.some(b => b.booking_type === 'morning'),
      hasEvening: bookings.some(b => b.booking_type === 'evening'),
    };
  }, [bookings]);

  const dayNumber = moment(date).date();
  const isToday = moment(date).isSame(moment(), 'day');
  const totalIncome = bookings.reduce((sum, b) => sum + b.price, 0);

  return (
    <button
      onClick={onClick}
      className={`calendar-day ${isToday ? 'today' : ''} 
        ${hasFullDay ? 'booking-full' : ''}`}
    >
      <span className="day-number">{dayNumber}</span>
      
      <div className="h-full flex flex-col justify-between">
        {bookings.length > 0 ? (
          <div className="space-y-1">
            {(hasMorning || hasEvening) && !hasFullDay && (
              <div className="flex gap-1 flex-wrap mt-6 md:mt-8">
                {hasMorning && <span className="booking-badge booking-badge-morning">صباحي</span>}
                {hasEvening && <span className="booking-badge booking-badge-evening">مسائي</span>}
              </div>
            )}
            {hasFullDay && <span className="booking-badge booking-badge-full">يوم كامل</span>}
          </div>
        ) : (
          <div className="text-sm text-white/40 mt-6 md:mt-8">متاح</div>
        )}

        {totalIncome > 0 && (
          <div className="booking-price text-sm text-white/60 mt-auto">
            {totalIncome.toFixed(3)} د
          </div>
        )}
      </div>
    </button>
  );
}