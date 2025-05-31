'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import {
  BanknotesIcon,
  CalendarIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import moment from 'moment';

export function ExpensesSystem() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => db.expenses.getAll()
  });

  const currentMonth = moment().format('YYYY-MM');
  const monthlyExpenses = expenses.filter(exp => 
    moment(exp.date).format('YYYY-MM') === currentMonth
  );

  const totalExpenses = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const queryClient = useQueryClient();

  const { mutate: deleteExpense } = useMutation({
    mutationFn: (id: number) => db.expenses.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      toast.success('تم حذف المصروف بنجاح');
    }
  });

  if (isLoading) {
    return (
      <div className="glass-container">
        <div className="text-center py-8 text-white">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* إحصائيات المصروفات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-container">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-white/60 mb-1">إجمالي المصروفات</p>
              <h3 className="text-2xl font-bold text-white">{totalExpenses.toFixed(3)} د</h3>
            </div>
            <div className="p-2 bg-white/5 rounded-lg">
              <BanknotesIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-container">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-white/60 mb-1">عدد المصروفات</p>
              <h3 className="text-2xl font-bold text-white">{monthlyExpenses.length}</h3>
            </div>
            <div className="p-2 bg-white/5 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* قائمة المصروفات */}
      <div className="glass-container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">سجل المصروفات</h2>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            إضافة مصروف جديد
          </Button>
        </div>

        <div className="space-y-4">
          {monthlyExpenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-white">{expense.title}</h3>
                  <p className="text-sm text-white/60">{expense.notes}</p>
                  <p className="text-sm text-white/60">
                    {moment(expense.date).format('DD/MM/YYYY')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-lg font-medium text-white">
                    {expense.amount.toFixed(3)} د
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedExpense(expense);
                        setIsModalOpen(true);
                      }}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <PencilSquareIcon className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
                          deleteExpense(expense.id);
                        }
                      }}
                      className="p-1 hover:bg-white/10 rounded text-red-400"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* نافذة إضافة/تعديل المصروف */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
      />
    </div>
  );
}

function ExpenseModal({ isOpen, onClose, expense = null }) {
  const [form, setForm] = useState({
    title: expense?.title || '',
    amount: expense?.amount || '',
    category: expense?.category || 'maintenance',
    date: expense?.date || new Date().toISOString().split('T')[0],
    notes: expense?.notes || ''
  });

  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: async (data) => {
      if (expense) {
        return await db.expenses.update(expense.id, data);
      } else {
        return await db.expenses.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      toast.success(expense ? 'تم تحديث المصروف بنجاح' : 'تم إضافة المصروف بنجاح');
      onClose();
    },
    onError: () => {
      toast.error('حدث خطأ في العملية');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      ...form,
      amount: Number(form.amount)
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <Dialog.Title className="text-xl font-bold text-white mb-6 text-center">
            {expense ? 'تعديل المصروف' : 'إضافة مصروف جديد'}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm text-white/80">عنوان المصروف</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="form-input"
                placeholder="أدخل عنوان المصروف"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm text-white/80">المبلغ (د)</label>
              <input
                type="number"
                step="0.001"
                required
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="form-input"
                placeholder="0.000"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm text-white/80">التاريخ</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="form-input"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm text-white/80">ملاحظات</label>
              <input
                type="text"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="form-input"
                placeholder="أضف أي ملاحظات إضافية"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/10">
              <Button variant="ghost" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {expense ? 'تحديث المصروف' : 'حفظ المصروف'}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}