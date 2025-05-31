'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, utils } from '@/lib/supabase';
import { ExpenseModal } from './ExpenseModal';
import { ExpenseCard } from './ExpenseCard';
import { ExpenseFilters } from './ExpenseFilters';
import { ExpenseStats } from './ExpenseStats';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  PlusIcon, 
  FunnelIcon,
  DocumentArrowDownIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import type { Expense } from '@/lib/supabase';

export function ExpensesManager() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    sortBy: 'date',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', format(selectedMonth, 'yyyy-MM')],
    queryFn: () => db.expenses.getByDateRange(
      startOfMonth(selectedMonth),
      endOfMonth(selectedMonth)
    ),
  });

  const { mutate: deleteExpense } = useMutation({
    mutationFn: (id: number) => db.expenses.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      toast.success('تم حذف المصروف بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل في حذف المصروف');
    },
  });

  // تصفية وترتيب المصروفات
  const filteredExpenses = expenses
    .filter(expense => {
      // تصفية حسب الفئة
      if (filters.category !== 'all' && expense.category !== filters.category) {
        return false;
      }
      
      // البحث في العنوان والملاحظات
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return expense.title.toLowerCase().includes(searchTerm) ||
               (expense.notes && expense.notes.toLowerCase().includes(searchTerm));
      }
      
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title, 'ar');
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleDeleteExpense = (expense: Expense) => {
    if (window.confirm(`هل أنت متأكد من حذف "${expense.title}"؟`)) {
      deleteExpense(expense.id);
    }
  };

  const handleCloseModal = () => {
    setSelectedExpense(null);
    setIsModalOpen(false);
  };

  const handleExportData = () => {
    try {
      utils.exportData('expenses', {
        from: startOfMonth(selectedMonth),
        to: endOfMonth(selectedMonth),
      });
      toast.success('تم تصدير البيانات بنجاح');
    } catch (error) {
      toast.error('فشل في تصدير البيانات');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="loading-skeleton h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="loading-skeleton h-32" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="loading-skeleton h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* إحصائيات المصروفات */}
      <ExpenseStats 
        expenses={expenses} 
        selectedMonth={selectedMonth} 
      />

      {/* أدوات التحكم */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="w-5 h-5" />
            إضافة مصروف جديد
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
          >
            <FunnelIcon className="w-5 h-5" />
            تصفية
          </button>
          
          <button
            onClick={handleExportData}
            className="btn btn-secondary"
            title="تصدير البيانات"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
          </button>
        </div>

        {/* اختيار الشهر */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedMonth(prev => 
              new Date(prev.getFullYear(), prev.getMonth() - 1)
            )}
            className="btn btn-ghost p-2"
          >
            ←
          </button>
          
          <div className="text-center min-w-[120px]">
            <div className="text-white font-medium">
              {format(selectedMonth, 'MMMM', { locale: ar })}
            </div>
            <div className="text-white/60 text-sm">
              {selectedMonth.getFullYear()}
            </div>
          </div>
          
          <button
            onClick={() => setSelectedMonth(prev => 
              new Date(prev.getFullYear(), prev.getMonth() + 1)
            )}
            className="btn btn-ghost p-2"
          >
            →
          </button>
        </div>
      </div>

      {/* فلاتر البحث */}
      {showFilters && (
        <ExpenseFilters
          filters={filters}
          onFiltersChange={setFilters}
          expenses={expenses}
        />
      )}

      {/* قائمة المصروفات */}
      <div className="space-y-4">
        {filteredExpenses.length > 0 ? (
          <>
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>
                {filteredExpenses.length} من {expenses.length} مصروف
              </span>
              <span>
                المجموع: {utils.formatCurrency(
                  filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
                )}
              </span>
            </div>

            {filteredExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
              />
            ))}
          </>
        ) : (
          <div className="glass-card text-center py-12">
            <div className="text-6xl mb-4">💸</div>
            <h3 className="text-lg font-medium text-white mb-2">
              {filters.search || filters.category !== 'all' 
                ? 'لا توجد مصروفات تطابق البحث'
                : 'لا توجد مصروفات هذا الشهر'
              }
            </h3>
            <p className="text-white/60 mb-6">
              {filters.search || filters.category !== 'all'
                ? 'جرب تغيير معايير البحث أو الفلاتر'
                : 'ابدأ بإضافة أول مصروف لهذا الشهر'
              }
            </p>
            {(!filters.search && filters.category === 'all') && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary"
              >
                <PlusIcon className="w-5 h-5" />
                إضافة مصروف جديد
              </button>
            )}
          </div>
        )}
      </div>

      {/* نافذة إضافة/تعديل المصروف */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        expense={selectedExpense}
      />
    </div>
  );
}