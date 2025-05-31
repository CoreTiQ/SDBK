'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  BanknotesIcon as BanknotesIconSolid,
  ChartBarIcon as ChartBarIconSolid
} from '@heroicons/react/24/solid';

const navItems = [
  {
    href: '/',
    label: 'الرئيسية',
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    href: '/calendar',
    label: 'التقويم',
    icon: CalendarDaysIcon,
    activeIcon: CalendarDaysIconSolid,
  },
  {
    href: '/expenses',
    label: 'المصروفات',
    icon: BanknotesIcon,
    activeIcon: BanknotesIconSolid,
  },
  {
    href: '/stats',
    label: 'الإحصائيات',
    icon: ChartBarIcon,
    activeIcon: ChartBarIconSolid,
  },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav safe-area-bottom">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = isActive ? item.activeIcon : item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium truncate">
              {item.label}
            </span>
            {isActive && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-400 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}