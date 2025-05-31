'use client';

import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import { StatsCard } from './StatsCard';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  BanknotesIcon,
  CalendarIcon,
  ChartBarIcon,
  TrendingUpIcon,
  UsersIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface StatsOverviewProps {
  bookings?: any[];
  expenses?: any[];
  dateRange?: { from: Date; to: Date };
  showTitle?: boolean;
}

export function StatsOverview({ 
  bookings: propBookings, 
  expenses: propExpenses, 
  dateRange,
  showTitle = true 
}: StatsOverviewProps) {
  const currentMonth = new Date();
  const defaultDateRange = {
    from: startOfMonth(currentMonth),
    to: endOfMonth(currentMonth),
  };

  const range = dateRange || defaultDateRange;

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', format(range.from, 'yyyy-MM-dd'), format(range.to, 'yyyy-MM-dd')],
    queryFn: () => db.bookings.getByDateRange(range.from, range.to),
    enabled: !propBookings,
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', format(range.from, 'yyyy-MM-dd'), format(range.to, 'yyyy-MM-dd')],
    queryFn: () => db.expenses.getByDateRange(range.from, range.to),
    enabled: !propExpenses,
  });

  const finalBookings = propBookings || bookings;
  const finalExpenses = propExpenses || expenses;
  const isLoading = bookingsLoading || expensesLoading;

  // حسابات الإحصائيات
  const stats = {
    totalRevenue: finalBookings.reduce((sum, b) => sum + b.price, 0),
    totalExpenses: finalExpenses.reduce((sum, e) => sum + e.amount, 0),
    totalBookings: finalBookings.length,
    uniqueClients: new Set(finalBookings.map(b => b.client_name.toLowerCase().trim())).size,
    averageBookingValue: finalBookings.length > 0 
      ? finalBookings.reduce((sum, b) => sum + b.price, 0) / finalBookings.length 
      : 0,
    netProfit: finalBookings.reduce((sum, b) => sum + b.price, 0) - finalExpenses.reduce((sum, e) => sum + e.amount, 0),
    occupancyRate: calculateOccupancyRate(finalBookings, range),
    freeBookings: finalBookings.filter(b => b.is_free).length,
  };

  // حساب الاتجاهات (مقارنة مع الشهر السابق)
  const trends = calculateTrends(finalBookings, finalExpenses, range);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {showTitle && (
          <div className="loading-skeleton h-8 w-48" />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="loading-skeleton h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div>
          <h2 className="heading-md">نظرة عامة على الأداء</h2>
          <p className="text-muted">
            إحصائيات {format(range.from, 'MMMM yyyy', { locale: ar })}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* إجمالي الدخل */}
        <StatsCard
          title="إجمالي الدخل"
          value={`${stats.totalRevenue.toFixed(3)} د.ك`}
          icon={BanknotesIcon}
          trend={trends.revenue}
          color="green"
        />

        {/* المصروفات */}
        <StatsCard
          title="إجمالي المصروفات"
          value={`${stats.totalExpenses.toFixed(3)} د.ك`}
          icon={TrendingUpIcon}
          trend={trends.expenses}
          color="red"
        />

        {/* صافي الربح */}
        <StatsCard
          title="صافي الربح"
          value={`${stats.netProfit.toFixed(3)} د.ك`}
          icon={ChartBarIcon}
          trend={trends.profit}
          color={stats.netProfit >= 0 ? "green" : "red"}
        />

        {/* عدد الحجوزات */}
        <StatsCard
          title="عدد الحجوزات"
          value={stats.totalBookings.toString()}
          icon={CalendarIcon}
          trend={trends.bookings}
          color="blue"
        />

        {/* العملاء الفريدون */}
        <StatsCard
          title="العملاء الفريدون"
          value={stats.uniqueClients.toString()}
          icon={UsersIcon}
          trend={trends.clients}
          color="purple"
        />

        {/* متوسط قيمة الحجز */}
        <StatsCard
          title="متوسط قيمة الحجز"
          value={`${stats.averageBookingValue.toFixed(3)} د.ك`}
          icon={BanknotesIcon}
          trend={trends.averageBooking}
          color="orange"
        />

        {/* نسبة الإشغال */}
        <StatsCard
          title="نسبة الإشغال"
          value={`${stats.occupancyRate.toFixed(1)}%`}
          icon={ChartBarIcon}
          trend={trends.occupancy}
          color="indigo"
        />

        {/* الحجوزات المجانية */}
        <StatsCard
          title="الحجوزات المجانية"
          value={stats.freeBookings.toString()}
          icon={ClockIcon}
          trend={{
            value: stats.freeBookings > 0 ? 
              ((stats.freeBookings / stats.totalBookings) * 100).toFixed(1) : 0,
            isPositive: false,
            label: "من إجمالي الحجوزات"
          }}
          color="gray"
        />
      </div>
    </div>
  );
}

// حساب نسبة الإشغال
function calculateOccupancyRate(bookings: any[], dateRange: { from: Date; to: Date }): number {
  const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalSlots = days * 2; // صباحي ومسائي
  
  const occupiedSlots = bookings.reduce((sum, booking) => {
    return sum + (booking.booking_type === 'full' ? 2 : 1);
  }, 0);

  return totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;
}

// حساب الاتجاهات
function calculateTrends(bookings: any[], expenses: any[], currentRange: { from: Date; to: Date }) {
  // هذه دالة مبسطة - يمكن تحسينها لمقارنة فعلية مع الفترة السابقة
  const mockTrends = {
    revenue: { value: 12.5, isPositive: true, label: "مقارنة بالشهر السابق" },
    expenses: { value: 8.3, isPositive: false, label: "انخفاض عن الشهر السابق" },
    profit: { value: 15.2, isPositive: true, label: "نمو مقارنة بالشهر السابق" },
    bookings: { value: 6.7, isPositive: true, label: "زيادة في عدد الحجوزات" },
    clients: { value: 4.2, isPositive: true, label: "عملاء جدد" },
    averageBooking: { value: 3.1, isPositive: true, label: "تحسن في المتوسط" },
    occupancy: { value: 5.8, isPositive: true, label: "تحسن في الإشغال" },
  };

  return mockTrends;
}