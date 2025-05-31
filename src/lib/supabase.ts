import { createClient } from '@supabase/supabase-js';
import { format, parseISO, isWithinInterval } from 'date-fns';

// إعدادات Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://evkkplkpcyhihstzdrcl.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2a2twbGtwY3loaWhzdHpkcmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MTYzODUsImV4cCI6MjA2NDI5MjM4NX0.qdWPJ_bA5kJNfGqGKGqfKqVBDASMu7uJZMol99EmwOg';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

// أنواع البيانات
export interface Booking {
  id: number;
  client_name: string;
  date: string;
  booking_type: 'morning' | 'evening' | 'full';
  price: number;
  notes?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
  is_free: boolean;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: 'maintenance' | 'utilities' | 'cleaning' | 'supplies' | 'insurance' | 'other';
  date: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  receipt_url?: string;
}

export interface BookingStats {
  totalRevenue: number;
  totalBookings: number;
  occupancyRate: number;
  averageBookingValue: number;
  monthlyGrowth: number;
}

export interface ExpenseStats {
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  monthlyGrowth: number;
}

// قاعدة البيانات
export const db = {
  // إدارة الحجوزات
  bookings: {
    async getAll(): Promise<Booking[]> {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching bookings:', error);
        throw new Error('فشل في تحميل الحجوزات');
      }

      return data || [];
    },

    async getByDate(date: string): Promise<Booking[]> {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('date', date)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching bookings by date:', error);
        throw new Error('فشل في تحميل حجوزات اليوم');
      }

      return data || [];
    },

    async getByDateRange(from: Date, to: Date): Promise<Booking[]> {
      const fromStr = format(from, 'yyyy-MM-dd');
      const toStr = format(to, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .gte('date', fromStr)
        .lte('date', toStr)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching bookings by date range:', error);
        throw new Error('فشل في تحميل الحجوزات للفترة المحددة');
      }

      return data || [];
    },

    async create(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking> {
      // التحقق من توفر الموعد
      const isAvailable = await this.isSlotAvailable(booking.date, booking.booking_type);
      if (!isAvailable) {
        throw new Error('هذا الموعد محجوز مسبقاً');
      }

      const bookingData = {
        ...booking,
        price: booking.is_free ? 0 : booking.price,
        status: 'confirmed' as const,
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        throw new Error('فشل في إنشاء الحجز');
      }

      return data;
    },

    async update(id: number, updates: Partial<Booking>): Promise<Booking> {
      const { data, error } = await supabase
        .from('bookings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating booking:', error);
        throw new Error('فشل في تحديث الحجز');
      }

      return data;
    },

    async delete(id: number): Promise<void> {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting booking:', error);
        throw new Error('فشل في حذف الحجز');
      }
    },

    async isSlotAvailable(date: string, type: 'morning' | 'evening' | 'full'): Promise<boolean> {
      const { data, error } = await supabase
        .from('bookings')
        .select('booking_type')
        .eq('date', date)
        .neq('status', 'cancelled');

      if (error) {
        console.error('Error checking slot availability:', error);
        return false;
      }

      if (!data || data.length === 0) return true;

      const hasFullDay = data.some(b => b.booking_type === 'full');
      const hasMorning = data.some(b => b.booking_type === 'morning');
      const hasEvening = data.some(b => b.booking_type === 'evening');

      if (hasFullDay) return false;
      if (type === 'full') return !hasMorning && !hasEvening;
      if (type === 'morning') return !hasMorning;
      if (type === 'evening') return !hasEvening;

      return false;
    },

    async getStats(from?: Date, to?: Date): Promise<BookingStats> {
      let query = supabase
        .from('bookings')
        .select('price, booking_type, date');

      if (from && to) {
        const fromStr = format(from, 'yyyy-MM-dd');
        const toStr = format(to, 'yyyy-MM-dd');
        query = query.gte('date', fromStr).lte('date', toStr);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching booking stats:', error);
        throw new Error('فشل في تحميل إحصائيات الحجوزات');
      }

      const bookings = data || [];
      const totalRevenue = bookings.reduce((sum, b) => sum + b.price, 0);
      const totalBookings = bookings.length;
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // حساب نسبة الإشغال (افتراضياً لشهر واحد)
      const daysInPeriod = to && from 
        ? Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
        : 30;
      
      const totalSlots = daysInPeriod * 2; // صباحي ومسائي
      const occupiedSlots = bookings.reduce((sum, b) => 
        sum + (b.booking_type === 'full' ? 2 : 1), 0
      );
      const occupancyRate = (occupiedSlots / totalSlots) * 100;

      return {
        totalRevenue,
        totalBookings,
        occupancyRate,
        averageBookingValue,
        monthlyGrowth: 0, // يمكن حسابها لاحقاً
      };
    },
  },

  // إدارة المصروفات
  expenses: {
    async getAll(): Promise<Expense[]> {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        throw new Error('فشل في تحميل المصروفات');
      }

      return data || [];
    },

    async getByDateRange(from: Date, to: Date): Promise<Expense[]> {
      const fromStr = format(from, 'yyyy-MM-dd');
      const toStr = format(to, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', fromStr)
        .lte('date', toStr)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching expenses by date range:', error);
        throw new Error('فشل في تحميل المصروفات للفترة المحددة');
      }

      return data || [];
    },

    async create(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> {
      const { data, error } = await supabase
        .from('expenses')
        .insert([expense])
        .select()
        .single();

      if (error) {
        console.error('Error creating expense:', error);
        throw new Error('فشل في إنشاء المصروف');
      }

      return data;
    },

    async update(id: number, updates: Partial<Expense>): Promise<Expense> {
      const { data, error } = await supabase
        .from('expenses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating expense:', error);
        throw new Error('فشل في تحديث المصروف');
      }

      return data;
    },

    async delete(id: number): Promise<void> {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting expense:', error);
        throw new Error('فشل في حذف المصروف');
      }
    },

    async getStats(from?: Date, to?: Date): Promise<ExpenseStats> {
      let query = supabase
        .from('expenses')
        .select('amount, category');

      if (from && to) {
        const fromStr = format(from, 'yyyy-MM-dd');
        const toStr = format(to, 'yyyy-MM-dd');
        query = query.gte('date', fromStr).lte('date', toStr);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching expense stats:', error);
        throw new Error('فشل في تحميل إحصائيات المصروفات');
      }

      const expenses = data || [];
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      
      const expensesByCategory = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalExpenses,
        expensesByCategory,
        monthlyGrowth: 0, // يمكن حسابها لاحقاً
      };
    },
  },
};

// دوال مساعدة
export const utils = {
  getBookingTypeLabel(type: 'morning' | 'evening' | 'full'): string {
    const labels = {
      morning: 'صباحي',
      evening: 'مسائي',
      full: 'يوم كامل',
    };
    return labels[type];
  },

  getExpenseCategoryLabel(category: string): string {
    const labels = {
      maintenance: 'صيانة',
      utilities: 'مرافق',
      cleaning: 'تنظيف',
      supplies: 'مستلزمات',
      insurance: 'تأمين',
      other: 'أخرى',
    };
    return labels[category as keyof typeof labels] || category;
  },

  formatCurrency(amount: number): string {
    return `${amount.toFixed(3)} د.ك`;
  },

  calculateOccupancyRate(bookings: Booking[], date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const monthBookings = bookings.filter(b => {
      const bookingDate = parseISO(b.date);
      return bookingDate.getFullYear() === year && bookingDate.getMonth() === month;
    });

    const totalSlots = daysInMonth * 2; // صباحي ومسائي
    const occupiedSlots = monthBookings.reduce((sum, booking) => 
      sum + (booking.booking_type === 'full' ? 2 : 1), 0
    );

    return Math.round((occupiedSlots / totalSlots) * 100);
  },

  async exportData(type: 'bookings' | 'expenses' | 'all', dateRange?: { from: Date; to: Date }) {
    try {
      let data: any = {};

      if (type === 'bookings' || type === 'all') {
        data.bookings = dateRange 
          ? await db.bookings.getByDateRange(dateRange.from, dateRange.to)
          : await db.bookings.getAll();
      }

      if (type === 'expenses' || type === 'all') {
        data.expenses = dateRange
          ? await db.expenses.getByDateRange(dateRange.from, dateRange.to)
          : await db.expenses.getAll();
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `villa-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      throw new Error('فشل في تصدير البيانات');
    }
  },
};