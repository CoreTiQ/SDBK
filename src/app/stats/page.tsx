'use client';

import { useState } from 'react';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import type { ComponentProps } from 'react';
import {
  BanknotesIcon,
  CalculatorIcon,
  UsersIcon,
  ChartBarIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

// مكون البطاقة الإحصائية
function SimpleStatsCard({ 
  title, 
  value, 
  icon: Icon 
}: { 
  title: string;
  value: string;
  icon: (props: ComponentProps<'svg'>) => JSX.Element;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-white/60">{title}</div>
          <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
        </div>
        <div className="p-2 bg-white/10 rounded-lg">
          <Icon className="h-5 w-5 text-white/60" />
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number) {
  return num.toFixed(3);
}

function formatDate(date: string) {
  return moment(date).format('YYYY/MM/DD');
}

function getBookingTypeText(type: string) {
  switch (type) {
    case 'morning': return 'صباحي';
    case 'evening': return 'مسائي';
    case 'full': return 'يوم كامل';
    default: return type;
  }
}

// دالة الطباعة
function handlePrint(bookings: any[], expenses: any[], totalIncome: number, totalExpenses: number, netProfit: number) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html dir="rtl">
      <head>
        <title>تقرير الإحصائيات</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            direction: rtl;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: right;
          }
          th {
            background-color: #f8f9fa;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .stat-card {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 8px;
          }
          .stat-title {
            color: #666;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 20px;
            font-weight: bold;
          }
          .section-title {
            margin: 25px 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #eee;
          }
          .timestamp {
            text-align: left;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير الإحصائيات</h1>
          <p>${formatDate(moment().format('YYYY-MM-DD'))}</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-title">إجمالي الدخل</div>
            <div class="stat-value">${formatNumber(totalIncome)} د</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">المصروفات</div>
            <div class="stat-value">${formatNumber(totalExpenses)} د</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">صافي الربح</div>
            <div class="stat-value">${formatNumber(netProfit)} د</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">عدد الحجوزات</div>
            <div class="stat-value">${bookings.length}</div>
          </div>
        </div>

        <h2 class="section-title">سجل الحجوزات</h2>
        <table>
          <thead>
            <tr>
              <th>العميل</th>
              <th>المبلغ</th>
              <th>التاريخ</th>
              <th>النوع</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.map(booking => `
              <tr>
                <td>${booking.client_name}</td>
                <td>${formatNumber(booking.price)} د</td>
                <td>${formatDate(booking.date)}</td>
                <td>${getBookingTypeText(booking.booking_type)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2 class="section-title">سجل المصروفات</h2>
        <table>
          <thead>
            <tr>
              <th>العنوان</th>
              <th>المبلغ</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(expense => `
              <tr>
                <td>${expense.title}</td>
                <td>${formatNumber(expense.amount)} د</td>
                <td>${formatDate(expense.date)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="timestamp">
          تم إنشاء هذا التقرير في: ${moment().format('YYYY/MM/DD HH:mm:ss')}
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
}

export default function StatsPage() {
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      try {
        return await db.bookings.getAll() ?? [];
      } catch (error) {
        console.error('Error loading bookings:', error);
        return [];
      }
    }
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      try {
        return await db.expenses.getAll() ?? [];
      } catch (error) {
        console.error('Error loading expenses:', error);
        return [];
      }
    }
  });

  if (bookingsLoading || expensesLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-white text-center">جاري التحميل...</div>
      </div>
    );
  }

  const totalIncome = bookings.reduce((sum, booking) => sum + (Number(booking.price) || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">لوحة الإحصائيات</h1>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <SimpleStatsCard
            title="إجمالي الدخل"
            value={`${formatNumber(totalIncome)} د`}
            icon={BanknotesIcon}
          />
          <SimpleStatsCard
            title="المصروفات"
            value={`${formatNumber(totalExpenses)} د`}
            icon={CalculatorIcon}
          />
          <SimpleStatsCard
            title="صافي الربح"
            value={`${formatNumber(netProfit)} د`}
            icon={ChartBarIcon}
          />
          <SimpleStatsCard
            title="عدد الحجوزات"
            value={bookings.length.toString()}
            icon={UsersIcon}
          />
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-white">سجل المصروفات</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-right py-3 px-4">العنوان</th>
                  <th className="text-right py-3 px-4">المبلغ</th>
                  <th className="text-right py-3 px-4">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => (
                  <tr key={index} className="border-b border-white/5 text-white/80">
                    <td className="py-3 px-4">{expense.title}</td>
                    <td className="py-3 px-4">{formatNumber(expense.amount)} د</td>
                    <td className="py-3 px-4">{formatDate(expense.date)}</td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-center text-white/60">
                      لا توجد مصروفات مسجلة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-white">سجل الحجوزات</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-right py-3 px-4">العميل</th>
                  <th className="text-right py-3 px-4">المبلغ</th>
                  <th className="text-right py-3 px-4">التاريخ</th>
                  <th className="text-right py-3 px-4">النوع</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={index} className="border-b border-white/5 text-white/80">
                    <td className="py-3 px-4">{booking.client_name}</td>
                    <td className="py-3 px-4">{formatNumber(booking.price)} د</td>
                    <td className="py-3 px-4">{formatDate(booking.date)}</td>
                    <td className="py-3 px-4">{getBookingTypeText(booking.booking_type)}</td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-3 px-4 text-center text-white/60">
                      لا توجد حجوزات مسجلة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* زر الطباعة */}
        <button
          onClick={() => handlePrint(bookings, expenses, totalIncome, totalExpenses, netProfit)}
          className="fixed bottom-6 left-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-colors"
          title="طباعة التقرير"
        >
          <PrinterIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}