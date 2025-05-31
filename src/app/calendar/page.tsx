'use client';

import { useState } from 'react';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

function DayCell({ date, bookings }: { date: string; bookings: any[] }) {
  const hasFullDay = bookings.some(b => b.booking_type === 'full');
  const hasMorning = bookings.some(b => b.booking_type === 'morning');
  const hasEvening = bookings.some(b => b.booking_type === 'evening');
  const dayNumber = moment(date).date();
  const isToday = moment(date).isSame(moment(), 'day');
  const isPast = moment(date).isBefore(moment(), 'day');

  return (
    <div className={`
      relative aspect-square
      ${isToday ? 'ring-1 ring-blue-500' : ''}
      ${isPast ? 'opacity-60' : ''}
      flex flex-col items-center
      rounded-lg overflow-hidden
      bg-slate-800/40
      hover:bg-slate-700/40
      transition-colors
    `}>
      {/* رقم اليوم */}
      <div className="p-1.5 text-center">
        <span className="text-sm text-white/80">{dayNumber}</span>
      </div>

      {/* نقاط الحجز */}
      {bookings.length > 0 && (
        <div className="absolute bottom-2">
          {hasFullDay ? (
            // نقطة حمراء للحجز الكامل
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
          ) : (
            <div className="flex gap-1">
              {hasMorning && (
                // نقطة زرقاء للحجز الصباحي
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
              )}
              {hasEvening && (
                // نقطة برتقالية للحجز المسائي
                <div className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(moment());
  const shortDays = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => db.bookings.getAll()
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-white/60">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-2 py-4">
      <div className="bg-slate-900/95 rounded-2xl p-3 border border-white/10">
        {/* راس التقويم */}
        <div className="flex items-center justify-between mb-4 px-2">
          <button onClick={() => setCurrentDate(prev => moment(prev).subtract(1, 'month'))}>
            <ChevronRightIcon className="w-5 h-5 text-white/70" />
          </button>
          <h2 className="text-lg font-semibold text-white">
            {currentDate.format('MMMM YYYY')}
          </h2>
          <button onClick={() => setCurrentDate(prev => moment(prev).add(1, 'month'))}>
            <ChevronLeftIcon className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* دليل الرموز */}
        <div className="flex items-center justify-center gap-3 mb-4 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-red-400">يوم كامل</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-blue-400">صباحي</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-orange-400">مسائي</span>
          </div>
        </div>

        {/* ايام الاسبوع */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {shortDays.map(day => (
            <div key={day} className="text-center text-[10px] font-medium text-white/70 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* خلايا التقويم */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: moment(currentDate).startOf('month').day() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {Array.from({ length: currentDate.daysInMonth() }).map((_, i) => {
            const date = moment(currentDate).date(i + 1).format('YYYY-MM-DD');
            const dayBookings = bookings.filter(b => b.date === date);

            return (
              <DayCell
                key={date}
                date={date}
                bookings={dayBookings}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}