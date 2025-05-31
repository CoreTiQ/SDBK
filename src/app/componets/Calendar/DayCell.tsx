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
  const { hasFullDay, hasMorning, hasEvening } = useMemo(() => {
    return {
      hasFullDay: bookings.some(b => b.booking_type === 'full'),
      hasMorning: bookings.some(b => b.booking_type === 'morning'),
      hasEvening: bookings.some(b => b.booking_type === 'evening'),
    };
  }, [bookings]);

  const dayNumber = moment(date).date();
  const totalIncome = bookings.reduce((sum, b) => sum + b.price, 0);

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg text-start transition hover:shadow-md
        ${hasFullDay ? 'bg-red-50 border-2 border-red-200' : 'bg-white border border-gray-200'}`}
    >
      <div className="font-bold text-lg mb-2">{dayNumber}</div>
      
      {bookings.length > 0 ? (
        <div className="space-y-2">
          {(hasMorning || hasEvening) && !hasFullDay && (
            <div className="flex gap-1 flex-wrap">
              {hasMorning && <Badge variant="blue">صباحي</Badge>}
              {hasEvening && <Badge variant="orange">مسائي</Badge>}
            </div>
          )}
          {hasFullDay && <Badge variant="red">يوم كامل</Badge>}
          {totalIncome > 0 && (
            <div className="booking-price">
            <div className="text-sm text-gray-600">
              {totalIncome.toFixed(3)} د
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-400">متاح</div>
      )}
    </button>
  );
}