'use client';

import { 
  ArrowUpIcon, 
  ArrowDownIcon 
} from '@heroicons/react/24/outline';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  trend?: {
    value: number | string;
    isPositive: boolean;
    label: string;
  };
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'indigo' | 'gray';
}

const colorClasses = {
  blue: {
    icon: 'text-blue-400 bg-blue-500/20',
    trend: 'text-blue-400',
  },
  green: {
    icon: 'text-green-400 bg-green-500/20',
    trend: 'text-green-400',
  },
  red: {
    icon: 'text-red-400 bg-red-500/20',
    trend: 'text-red-400',
  },
  orange: {
    icon: 'text-orange-400 bg-orange-500/20',
    trend: 'text-orange-400',
  },
  purple: {
    icon: 'text-purple-400 bg-purple-500/20',
    trend: 'text-purple-400',
  },
  indigo: {
    icon: 'text-indigo-400 bg-indigo-500/20',
    trend: 'text-indigo-400',
  },
  gray: {
    icon: 'text-gray-400 bg-gray-500/20',
    trend: 'text-gray-400',
  },
};

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue' 
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="glass-card hover:bg-white/10 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-white/70 mb-1 font-medium">
            {title}
          </p>
          <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            {value}
          </h3>
        </div>
        
        <div className={`p-3 rounded-xl ${colors.icon} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-2 pt-3 border-t border-white/10">
          <div className={`flex items-center gap-1 ${
            trend.isPositive 
              ? 'text-green-400' 
              : 'text-red-400'
          }`}>
            {trend.isPositive ? (
              <ArrowUpIcon className="w-4 h-4" />
            ) : (
              <ArrowDownIcon className="w-4 h-4" />
            )}
            <span className="text-sm font-semibold">
              {typeof trend.value === 'number' ? `${trend.value}%` : trend.value}
            </span>
          </div>
          
          <span className="text-xs text-white/60 truncate">
            {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}