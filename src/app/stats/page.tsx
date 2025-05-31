'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import { StatsOverview } from '@/components/Stats';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function StatsPage() {
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(subMonths(new Date(), 2)),
    to: endOfMonth(new Date()),
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', dateRange],
    queryFn: () => db.bookings.getByDateRange(dateRange.from, dateRange.to),
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', dateRange],
    queryFn: () => db.expenses.getByDateRange(dateRange.from, dateRange.to),
  });

  const isLoading = bookingsLoading || expensesLoading;

  // حساب الإحصائيات
  const stats = {
    totalRevenue: bookings.reduce((sum, b) => sum + b.price, 0),
    totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
    totalBookings: bookings.length,
    averageBookingValue: bookings.length > 0 
      ? bookings.reduce((sum, b) => sum + b.price, 0) / bookings.length 
      : 0,
    netProfit: bookings.reduce((sum, b) => sum + b.price, 0) - expenses.reduce((sum, e) => sum + e.amount, 0),
  };

  const handleExport = () => {
    const data = {
      dateRange: {
        from: format(dateRange.from, 'yyyy-MM-dd', { locale: ar }),
        to: format(dateRange.to, 'yyyy-MM-dd', { locale: ar }),
      },
      stats,
      bookings,
      expenses,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `villa-stats-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="loading-skeleton h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="loading-skeleton h-32" />
          ))}
        </div>
        <div className="loading-skeleton h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="heading-lg">الإحصائيات والتقارير</h1>
          <p className="text-muted">
            تحليل شامل لأداء الفيلا والدخل
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleExport}
            className="btn btn-secondary"
          >
            تصدير البيانات
          </button>
        </div>
      </header>

      {/* Overview Stats */}
      <StatsOverview 
        bookings={bookings}
        expenses={expenses}
        dateRange={dateRange}
      />

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bookings Table */}
        <div className="glass-container">
          <div className="space-y-4">
            <h3 className="heading-md">سجل الحجوزات</h3>
            
            {bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-right py-3 px-4 text-sm font-medium text-white/80">
                        العميل
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-white/80">
                        المبلغ
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-white/80">
                        التاريخ
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-white/80">
                        النوع
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-white/5">
                        <td className="py-3 px-4 text-white">
                          {booking.client_name}
                        </td>
                        <td className="py-3 px-4 text-white font-medium">
                          {booking.price.toFixed(3)} د.ك
                        </td>
                        <td className="py-3 px-4 text-white/80">
                          {format(new Date(booking.date), 'dd/MM/yyyy', { locale: ar })}
                        </td>
                        <td className="py-3 px-4 text-white/80">
                          {booking.booking_type === 'morning' ? 'صباحي' :
                           booking.booking_type === 'evening' ? 'مسائي' : 'يوم كامل'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                لا توجد حجوزات في هذه الفترة
              </div>
            )}
          </div>
        </div>

        {/* Expenses Table */}
        <div className="glass-container">
          <div className="space-y-4">
            <h3 className="heading-md">سجل المصروفات</h3>
            
            {expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-right py-3 px-4 text-sm font-medium text-white/80">
                        العنوان
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-white/80">
                        المبلغ
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-white/80">
                        التاريخ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-white/5">
                        <td className="py-3 px-4 text-white">
                          {expense.title}
                        </td>
                        <td className="py-3 px-4 text-white font-medium">
                          {expense.amount.toFixed(3)} د.ك
                        </td>
                        <td className="py-3 px-4 text-white/80">
                          {format(new Date(expense.date), 'dd/MM/yyyy', { locale: ar })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                لا توجد مصروفات في هذه الفترة
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}