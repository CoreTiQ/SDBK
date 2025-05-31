'use client';

import { DayCell } from './DayCell';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  format,
  addDays,
  subDays
} from 'date-fns';
import { ar } from 'date-fns/locale';
import type { Booking } from '@/lib/supabase';

interface CalendarGridProps {
  currentMonth: Date;
  bookings: Booking[];
  onDayClick: (date: string) => void;
  isLoading?: boolean;
}

const weekDays = [
  'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
];

export function CalendarGrid({ 
  currentMonth, 
  bookings, 
  onDayClick, 
  isLoading 
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // الحصول على أيام الشهر
  const monthDays = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  // إضافة الأيام الفارغة في بداية الشهر
  const startDay = getDay(monthStart);
  const leadingDays = startDay === 0 ? 0 : startDay;
  const leadingEmptyDays = Array.from({ length: leadingDays }, (_, i) => 
    subDays(monthStart, leadingDays - i)
  );

  // إضافة الأيام الفارغة في نهاية الشهر لإكمال الشبكة
  const totalCells = 42; // 6 أسابيع × 7 أيام
  const usedCells = leadingEmptyDays.length + monthDays.length;
  const trailingDays = totalCells - usedCells;
  const trailingEmptyDays = Array.from({ length: trailingDays }, (_, i) => 
    addDays(monthEnd, i + 1)
  );

  const allDays = [...leadingEmptyDays, ...monthDays, ...trailingEmptyDays];

  if (isLoading) {
    return (
      <div className="glass-container">
        {/* Week Headers */}
        <div className="calendar-grid mb-4">
          {weekDays.map(day => (
            <div key={day} className="calendar-header">
              {day}
            </div>
          ))}
        </div>

        {/* Loading Skeleton */}
        <div className="calendar-grid">
          {Array.from({ length: 42 }).map((_, index) => (
            <div
              key={index}
              className="loading-skeleton aspect-square rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-container">
      {/* Week Day Headers */}
      <div className="calendar-grid mb-4">
        {weekDays.map(day => (
          <div key={day} className="calendar-header">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="calendar-grid">
        {allDays.map((day, index) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayBookings = bookings.filter(b => b.date === dateStr);
          const isCurrentMonth = day >= monthStart && day <= monthEnd;

          return (
            <DayCell
              key={index}
              date={day}
              bookings={dayBookings}
              onClick={() => onDayClick(dateStr)}
              isCurrentMonth={isCurrentMonth}
              disabled={!isCurrentMonth}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
          <span className="text-white/80">يوم كامل</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-blue-500/50"></div>
          <span className="text-white/80">صباحي</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-orange-500/50"></div>
          <span className="text-white/80">مسائي</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          <span className="text-white/80">مجاني</span>
        </div>
      </div>
    </div>
  );
}