'use client';

import { useState } from 'react';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import DayCell from './DayCell';
import DayDetailsModal from './DayDetailsModal';
import BookingModal from './BookingModal';
import { Button } from '../ui/Button';

// تهيئة اللغة العربية
moment.locale('ar', {
  months: [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ],
  weekdays: [
    'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
  ]
});

// مكون شاشة كلمة المرور
function PinScreen({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    if (value && index < 3) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }

    if (index === 3 && value) {
      const fullPin = [...newPin.slice(0, 3), value].join('');
      if (fullPin === '5544') {
        onSuccess();
      } else {
        setError(true);
        setPin(['', '', '', '']);
        document.getElementById('pin-0')?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="glass-container min-h-[60vh] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full mx-auto space-y-6">
        <h2 className="text-xl font-bold text-white text-center">
          أدخل كلمة المرور للوصول إلى التقويم
        </h2>
        
        <div className="flex justify-center gap-3">
          {pin.map((digit, index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`
                w-14 h-14 text-center text-2xl font-bold
                bg-white/10 border border-white/20
                rounded-lg text-white
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-all duration-200
                ${error ? 'border-red-500 ring-1 ring-red-500' : ''}
              `}
            />
          ))}
        </div>
        
        {error && (
          <p className="text-red-400 text-sm text-center">
            كلمة المرور غير صحيحة. حاول مرة أخرى.
          </p>
        )}
      </div>
    </div>
  );
}

export default function Calendar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => db.bookings.getAll(),
    refetchInterval: 30000,
  });

  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const startOfMonth = moment(currentDate).startOf('month');
  const daysInMonth = currentDate.daysInMonth();
  
  const selectedDateBookings = selectedDate 
    ? bookings.filter(b => b.date === selectedDate)
    : [];

  const calculateOccupancyRate = () => {
    const monthBookings = bookings.filter(b => 
      moment(b.date).format('MM-YYYY') === currentDate.format('MM-YYYY')
    );
    const totalSlots = daysInMonth * 2;
    const occupiedSlots = monthBookings.reduce((sum, booking) => 
      sum + (booking.booking_type === 'full' ? 2 : 1), 0
    );
    return Math.round((occupiedSlots / totalSlots) * 100);
  };

  const calculateTotalIncome = () => {
    return bookings
      .filter(b => moment(b.date).format('MM-YYYY') === currentDate.format('MM-YYYY'))
      .reduce((sum, b) => sum + b.price, 0)
      .toFixed(3);
  };

  if (!isAuthenticated) {
    return <PinScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  if (isLoading) {
    return (
      <div className="glass-container animate-pulse">
        <div className="h-8 bg-white/10 rounded w-48 mx-auto mb-8"></div>
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-container">
      {/* رأس التقويم */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost"
          onClick={() => setCurrentDate(prev => moment(prev).subtract(1, 'month'))}
          className="sm:p-2"
        >
          <span className="hidden sm:inline">الشهر السابق</span>
          <span className="sm:hidden">السابق</span>
        </Button>

        <h2 className="title-large text-center">
          {currentDate.format('MMMM YYYY')}
        </h2>

        <Button
          variant="ghost"
          onClick={() => setCurrentDate(prev => moment(prev).add(1, 'month'))}
          className="sm:p-2"
        >
          <span className="hidden sm:inline">الشهر التالي</span>
          <span className="sm:hidden">التالي</span>
        </Button>
      </div>

      {/* أيام الأسبوع */}
      <div className="calendar-grid mb-4">
        {days.map(day => (
          <div key={day} className="calendar-header text-[6.5px] sm:text-xs">
            {day}
          </div>
        ))}
      </div>

      {/* شبكة التقويم */}
      <div className="calendar-grid">
        {Array.from({ length: startOfMonth.day() }).map((_, i) => (
          <div key={`empty-start-${i}`} className="calendar-day opacity-50" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = moment(currentDate).date(i + 1).format('YYYY-MM-DD');
          const dayBookings = bookings.filter(b => b.date === date);

          return (
            <DayCell
              key={date}
              date={date}
              bookings={dayBookings}
              onClick={() => {
                setSelectedDate(date);
                setIsBookingModalOpen(false);
              }}
            />
          );
        })}

        {Array.from({ 
          length: (42 - (startOfMonth.day() + daysInMonth)) 
        }).map((_, i) => (
          <div key={`empty-end-${i}`} className="calendar-day opacity-50" />
        ))}
      </div>

      {/* الإحصائيات */}
      <div className="stats-grid mt-6">
        <div className="glass-card">
          <div className="text-white/60 text-xs sm:text-sm">الحجوزات</div>
          <div className="stats-value">
            {bookings.filter(b => 
              moment(b.date).format('MM-YYYY') === currentDate.format('MM-YYYY')
            ).length}
          </div>
        </div>
        
        <div className="glass-card">
          <div className="text-white/60 text-xs sm:text-sm">الدخل</div>
          <div className="stats-value">
            {calculateTotalIncome()} د
          </div>
        </div>

        <div className="glass-card">
          <div className="text-white/60 text-xs sm:text-sm">نسبة الإشغال</div>
          <div className="stats-value">
            {calculateOccupancyRate()}%
          </div>
        </div>
      </div>

      {/* النوافذ المنبثقة */}
      {selectedDate && !isBookingModalOpen && (
        <DayDetailsModal
          date={selectedDate}
          bookings={selectedDateBookings}
          onClose={() => setSelectedDate(null)}
          onAddBooking={() => setIsBookingModalOpen(true)}
        />
      )}

      {selectedDate && isBookingModalOpen && (
        <BookingModal
          date={selectedDate}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
}