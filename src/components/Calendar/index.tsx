'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { BookingModal } from './BookingModal';
import { DayDetailsModal } from './DayDetailsModal';
import { PinAuthModal } from '../ui/PinAuthModal';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';

interface CalendarProps {
  selectedMonth?: Date;
  onMonthChange?: (date: Date) => void;
  filters?: {
    bookingType: string;
    priceRange: string;
  };
}

export function Calendar({ 
  selectedMonth: propSelectedMonth, 
  onMonthChange, 
  filters 
}: CalendarProps) {
  const [selectedMonth, setSelectedMonth] = useState(propSelectedMonth || new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDayDetails, setShowDayDetails] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const currentMonth = propSelectedMonth || selectedMonth;

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['bookings', format(currentMonth, 'yyyy-MM')],
    queryFn: () => db.bookings.getByDateRange(
      startOfMonth(currentMonth),
      endOfMonth(currentMonth)
    ),
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });

  const handleMonthChange = (newMonth: Date) => {
    if (onMonthChange) {
      onMonthChange(newMonth);
    } else {
      setSelectedMonth(newMonth);
    }
  };

  const handlePrevMonth = () => {
    handleMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    handleMonthChange(addMonths(currentMonth, 1));
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setShowDayDetails(true);
  };

  const handleAddBooking = () => {
    if (!isAuthenticated) {
      setShowPinModal(true);
      return;
    }
    setShowDayDetails(false);
    setShowBookingModal(true);
  };

  const handleCloseModals = () => {
    setSelectedDate(null);
    setShowBookingModal(false);
    setShowDayDetails(false);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowPinModal(false);
    setShowDayDetails(false);
    setShowBookingModal(true);
  };

  // تصفية الحجوزات حسب الفلاتر
  const filteredBookings = bookings.filter(booking => {
    if (filters?.bookingType && filters.bookingType !== 'all') {
      if (booking.booking_type !== filters.bookingType) return false;
    }
    
    if (filters?.priceRange && filters.priceRange !== 'all') {
      const price = booking.price;
      switch (filters.priceRange) {
        case 'low':
          if (price >= 100) return false;
          break;
        case 'medium':
          if (price < 100 || price >= 300) return false;
          break;
        case 'high':
          if (price < 300) return false;
          break;
      }
    }
    
    return true;
  });

  const selectedDateBookings = selectedDate 
    ? filteredBookings.filter(b => b.date === selectedDate)
    : [];

  if (error) {
    return (
      <div className="glass-container text-center py-8">
        <div className="text-red-400 mb-4">
          خطأ في تحميل البيانات
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          إعادة تحميل
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <CalendarHeader
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        isLoading={isLoading}
      />

      {/* Calendar Grid */}
      <CalendarGrid
        currentMonth={currentMonth}
        bookings={filteredBookings}
        onDayClick={handleDayClick}
        isLoading={isLoading}
      />

      {/* Modals */}
      {selectedDate && showDayDetails && (
        <DayDetailsModal
          date={selectedDate}
          bookings={selectedDateBookings}
          onClose={handleCloseModals}
          onAddBooking={handleAddBooking}
        />
      )}

      {selectedDate && showBookingModal && (
        <BookingModal
          date={selectedDate}
          onClose={handleCloseModals}
        />
      )}

      <PinAuthModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handleAuthSuccess}
        title="إضافة حجز جديد"
        description="أدخل كلمة المرور لإضافة حجز جديد"
      />
    </div>
  );
}