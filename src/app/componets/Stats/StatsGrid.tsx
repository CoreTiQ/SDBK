'use client';

import { useQuery } from '@tanstack/react-query';
import { getBookings, Expense } from '@/lib/supabase';
import moment from 'moment';
import StatsCard from './StatsCard';
import { calculateStats } from '@/lib/utils';
import {
  BanknotesIcon,
  CalendarIcon,
  ChartBarIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline';

interface StatsGridProps {
  expenses?: Expense[];
}

export default function StatsGrid({ expenses = [] }: StatsGridProps) {
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: getBookings
  });

  const currentMonth = moment().format('MM-YYYY');
  const monthBookings = bookings.filter(
    booking => moment(booking.date).format('MM-YYYY') === currentMonth
  );

  const stats = calculateStats(monthBookings, expenses);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
      <StatsCard
        title="إجمالي الدخل"
        value={`${stats.totalIncome.toFixed(3)} د`}
        icon={BanknotesIcon}
        trend={stats.incomeTrend}
      />
      <StatsCard
        title="المصروفات"
        value={`${stats.totalExpenses.toFixed(3)} د`}
        icon={TrendingDownIcon}
        trend={stats.expensesTrend}
      />
      <StatsCard
        title="عدد الحجوزات"
        value={String(stats.totalBookings)}
        icon={CalendarIcon}
        trend={stats.bookingsTrend}
      />
      <StatsCard
        title="صافي الربح"
        value={`${stats.netProfit.toFixed(3)} د`}
        icon={ChartBarIcon}
        trend={{ 
          value: ((stats.totalIncome - stats.totalExpenses) / stats.totalIncome * 100).toFixed(1),
          isPositive: stats.totalIncome > stats.totalExpenses
        }}
      />
    </div>
  );
}