'use client';

import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import StatsCard from './StatsCard';

export default function StatsGrid() {
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => db.bookings.getAll()
  });

  // احتساب الإحصائيات
  const stats = {
    income: {
      value: bookings.reduce((sum, b) => sum + b.price, 0).toFixed(3),
      comparison: {
        value: 12.5,
        text: 'مقارنة بالشهر السابق'
      }
    },
    bookings: {
      value: bookings.length,
      comparison: {
        value: 8.3,
        text: 'مقارنة بالشهر السابق'
      }
    },
    occupancy: {
      value: `${Math.round((bookings.length / (30 * 2)) * 100)}%`,
      comparison: {
        value: 5.2,
        text: 'مقارنة بالشهر السابق'
      }
    }
  };

  return (
    <div className="stats-grid">
      <StatsCard
        title="إجمالي الدخل"
        value={`${stats.income.value} د`}
        comparison={stats.income.comparison}
      />
      <StatsCard
        title="عدد الحجوزات"
        value={stats.bookings.value}
        comparison={stats.bookings.comparison}
      />
      <StatsCard
        title="نسبة الإشغال"
        value={stats.occupancy.value}
        comparison={stats.occupancy.comparison}
      />
    </div>
  );
}