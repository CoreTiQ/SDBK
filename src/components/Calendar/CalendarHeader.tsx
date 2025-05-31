'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface CalendarHeaderProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isLoading?: boolean;
}

export function CalendarHeader({ 
  currentMonth, 
  onPrevMonth, 
  onNextMonth, 
  isLoading 
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={onPrevMonth}
        disabled={isLoading}
        className="btn btn-ghost p-2 hover:bg-white/10 disabled:opacity-50"
        aria-label="الشهر السابق"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>

      <div className="flex-1 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-white">
          {format(currentMonth, 'MMMM yyyy', { locale: ar })}
        </h2>
        <p className="text-sm text-white/60 mt-1">
          {format(currentMonth, 'MMMM', { locale: ar })} {currentMonth.getFullYear()}
        </p>
      </div>

      <button
        onClick={onNextMonth}
        disabled={isLoading}
        className="btn btn-ghost p-2 hover:bg-white/10 disabled:opacity-50"
        aria-label="الشهر التالي"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
    </div>
  );
}