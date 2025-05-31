'use client';

import { useMemo } from 'react';
import { format, isToday, isPast } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { Booking } from '@/lib/supabase';

interface DayCellProps {
  date: Date;
  bookings: Booking[];
  onClick: () => void;
  isCurrentMonth: boolean;
  disabled?: boolean;
}

export function DayCell({ 
  date, 
  bookings, 
  onClick, 
  isCurrentMonth, 
  disabled 
}: DayCellProps) {
  const dayNumber = date.getDate();
  const isCurrentDay = isToday(date);
  const isPastDay = isPast(date) && !isCurrentDay;

  const bookingStats = useMemo(() => {
    const hasFullDay = bookings.some(b => b.booking_type === 'full');
    const hasMorning = bookings.some(b => b.booking_type === 'morning');
    const hasEvening = bookings.some(b => b.booking_type === 'evening');
    const hasFreeBookings = bookings.some(b => b.is_free);
    const totalRevenue = bookings.reduce((sum, b) => sum + b.price, 0);
    
    return {
      hasFullDay,
      hasMorning,
      hasEvening,
      hasFreeBookings,
      totalRevenue,
      bookingCount: bookings.length,
    };
  }, [bookings]);

  const getCellClassName = () => {
    let className = 'calendar-day';
    
    if (isCurrentDay) className += ' today';
    if (isPastDay) className += ' past';
    if (!isCurrentMonth) className += ' opacity-30';
    if (disabled) className += ' cursor-not-allowed';
    
    if (bookingStats.hasFullDay) {
      className += ' booked-full';
    } else if (bookingStats.hasMorning && bookingStats.hasEvening) {
      className += ' booked-partial';
    }
    
    return className;
  };

  const getBookingIndicators = () => {
    if (bookings.length === 0) {
      return (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="text-xs text-white/40 text-center hidden md:block">
            متاح
          </div>
        </div>
      );
    }

    return (
      <div className="absolute bottom-1 left-1 right-1 space-y-1">
        {/* Desktop View */}
        <div className="hidden md:block space-y-1">
          {/* Booking Type Indicators */}
          <div className="flex flex-wrap gap-1 justify-center">
            {bookingStats.hasFullDay && (
              <span className="badge badge-red text-xs">يوم كامل</span>
            )}
            {!bookingStats.hasFullDay && bookingStats.hasMorning && (
              <span className="badge badge-blue text-xs">صباحي</span>
            )}
            {!bookingStats.hasFullDay && bookingStats.hasEvening && (
              <span className="badge badge-orange text-xs">مسائي</span>
            )}
            {bookingStats.hasFreeBookings && (
              <span className="badge badge-green text-xs">مجاني</span>
            )}
          </div>
          
          {/* Revenue */}
          {bookingStats.totalRevenue > 0 && (
            <div className="text-xs text-white/80 text-center font-medium">
              {bookingStats.totalRevenue.toFixed(3)} د.ك
            </div>
          )}
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex items-center justify-center">
          <div className="flex items-center gap-1">
            {/* Booking Type Dots */}
            {bookingStats.hasFullDay && (
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
            )}
            {!bookingStats.hasFullDay && bookingStats.hasMorning && (
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            )}
            {!bookingStats.hasFullDay && bookingStats.hasEvening && (
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            )}
            {bookingStats.hasFreeBookings && (
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            )}
            
            {/* Booking Count */}
            {bookings.length > 1 && (
              <span className="text-xs text-white/80 font-medium">
                {bookings.length}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={getCellClassName()}
      title={isCurrentMonth ? format(date, 'EEEE، dd MMMM yyyy', { locale: ar }) : undefined}
    >
      {/* Day Number */}
      <div className="day-number">
        {dayNumber}
      </div>

      {/* Booking Status */}
      {isCurrentMonth && getBookingIndicators()}

      {/* Multiple Bookings Indicator */}
      {isCurrentMonth && bookings.length > 1 && (
        <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-full"></div>
      )}

      {/* Today Indicator */}
      {isCurrentDay && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-primary-500 pointer-events-none"></div>
      )}
    </button>
  );
}