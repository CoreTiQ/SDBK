import { Booking, Expense } from './supabase';
import moment from 'moment';

export function calculateStats(bookings: Booking[], expenses: Expense[] = []) {
  // حسابات الحجوزات
  const totalIncome = bookings.reduce((sum, booking) => sum + booking.price, 0);
  const totalBookings = bookings.length;
  
  const daysInMonth = moment().daysInMonth();
  const totalSlots = daysInMonth * 2; // morning and evening slots
  const occupiedSlots = bookings.reduce(
    (sum, booking) => sum + (booking.booking_type === 'full' ? 2 : 1),
    0
  );
  const occupancyRate = (occupiedSlots / totalSlots) * 100;

  // حسابات المصروفات
  const currentMonth = moment().format('YYYY-MM');
  const lastMonth = moment().subtract(1, 'month').format('YYYY-MM');

  const monthlyExpenses = expenses.filter(exp => 
    moment(exp.date).format('YYYY-MM') === currentMonth
  );
  const lastMonthExpenses = expenses.filter(exp => 
    moment(exp.date).format('YYYY-MM') === lastMonth
  );

  const totalExpenses = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const lastMonthTotalExpenses = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // حساب صافي الربح
  const netProfit = totalIncome - totalExpenses;

  // حساب نسبة تغير المصروفات
  const expensesTrend = lastMonthTotalExpenses ? 
    ((totalExpenses - lastMonthTotalExpenses) / lastMonthTotalExpenses) * 100 : 0;

  // تصنيف المصروفات حسب النوع
  const expensesByCategory = monthlyExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate trends (mock data - you can implement real comparison)
  const trends = {
    incomeTrend: { value: 12.5, isPositive: true },
    bookingsTrend: { value: 8.3, isPositive: true },
    occupancyTrend: { value: 5.2, isPositive: true },
    expensesTrend: { 
      value: Math.abs(expensesTrend),
      isPositive: expensesTrend < 0 
    }
  };

  return {
    // إحصائيات الحجوزات
    totalIncome,
    totalBookings,
    occupancyRate,

    // إحصائيات المصروفات
    totalExpenses,
    expensesByCategory,
    netProfit,

    // الاتجاهات
    ...trends
  };
}

// دوال مساعدة لتنسيق البيانات
export function formatDate(date: string) {
  return moment(date).format('DD/MM/YYYY');
}

export function formatCurrency(amount: number) {
  return amount.toFixed(3) + ' د';
}

export function getExpenseCategoryLabel(category: string) {
  const categories: Record<string, string> = {
    maintenance: 'صيانة',
    utilities: 'مرافق',
    cleaning: 'تنظيف',
    other: 'أخرى'
  };
  return categories[category] || category;
}

// دالة لحساب إحصائيات الشهر
export function getCurrentMonthStats(items: (Booking | Expense)[], type: 'bookings' | 'expenses') {
  const currentMonth = moment().format('YYYY-MM');
  const monthItems = items.filter(item => 
    moment(type === 'bookings' ? item.date : (item as Expense).date).format('YYYY-MM') === currentMonth
  );

  const total = monthItems.reduce((sum, item) => 
    sum + (type === 'bookings' ? (item as Booking).price : (item as Expense).amount), 
    0
  );

  return {
    items: monthItems,
    total,
    count: monthItems.length,
    dailyAverage: total / moment().daysInMonth()
  };
}