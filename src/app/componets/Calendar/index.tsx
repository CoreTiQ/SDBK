'use client';

import { useState } from 'react';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import DayCell from './DayCell';
import BookingModal from './BookingModal';
import { Button } from '../ui/Button';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => db.bookings.getAll()
  });

  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const startOfMonth = moment(currentDate).startOf('month');
  const daysInMonth = currentDate.daysInMonth();

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          onClick={() => setCurrentDate(prev => moment(prev).subtract(1, 'month'))}
          className="flex items-center gap-2"
        >
          الشهر السابق
        </Button>

        <h2 className="text-2xl font-bold text-gray-900">
          {currentDate.format('MMMM YYYY')}
        </h2>

        <Button
          onClick={() => setCurrentDate(prev => moment(prev).add(1, 'month'))}
          className="flex items-center gap-2"
        >
          الشهر التالي
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {days.map(day => (
          <div key={day} className="text-center font-bold bg-gray-100 p-3 rounded-lg">
            {day}
          </div>
        ))}

        {Array.from({ length: startOfMonth.day() }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-50 rounded-lg" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = moment(currentDate).date(i + 1).format('YYYY-MM-DD');
          const dayBookings = bookings.filter(b => b.date === date);

          return (
            <DayCell
              key={date}
              date={date}
              bookings={dayBookings}
              onClick={() => setSelectedDate(date)}
            />
          );
        })}
      </div>

      {selectedDate && (
        <BookingModal
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}