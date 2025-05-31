'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function Navigation() {
  const pathname = usePathname();

  const getActiveClass = (path: string) => {
    const isActive = pathname === path;
    return `flex flex-col items-center gap-1 p-2 rounded-lg transition
      ${isActive ? 'text-white/90 bg-white/10' : 'text-white/60 hover:text-white/90 hover:bg-white/5'}`;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 py-2 px-4 flex items-center justify-around z-50 safe-bottom">
      <Link href="/" className={getActiveClass('/')}>
        <HomeIcon className="w-6 h-6" />
        <span className="text-xs">الرئيسية</span>
      </Link>

      <Link href="/calendar" className={getActiveClass('/calendar')}>
        <CalendarDaysIcon className="w-6 h-6" />
        <span className="text-xs">التقويم</span>
      </Link>

      <Link href="/expenses" className={getActiveClass('/expenses')}>
        <BanknotesIcon className="w-6 h-6" />
        <span className="text-xs">المصروفات</span>
      </Link>
      
      <Link href="/stats" className={getActiveClass('/stats')}>
        <ChartBarIcon className="w-6 h-6" />
        <span className="text-xs">الإحصائيات</span>
      </Link>
    </nav>
  );
}