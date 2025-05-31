'use client';

import { useState } from 'react';
import { Calendar } from '@/components/Calendar';
import { CalendarFilters } from '@/components/Calendar/CalendarFilters';
import { CalendarStats } from '@/components/Calendar/CalendarStats';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'التقويم',
  description: 'عرض وإدارة حجوزات الفيلا في التقويم الشهري',
};

export default function CalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [filters, setFilters] = useState({
    bookingType: 'all',
    priceRange: 'all',
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-lg">التقويم</h1>
            <p className="text-muted">
              عرض وإدارة حجوزات الفيلا
            </p>
          </div>
        </div>
      </header>

      {/* Calendar Filters */}
      <CalendarFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Calendar Stats */}
      <CalendarStats selectedMonth={selectedMonth} />

      {/* Main Calendar */}
      <div className="glass-container">
        <Calendar 
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          filters={filters}
        />
      </div>
    </div>
  );
}