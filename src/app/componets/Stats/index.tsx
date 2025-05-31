import type { ComponentProps } from 'react';

interface SimpleStatsCardProps {
  title: string;
  value: string;
  icon: (props: ComponentProps<'svg'>) => JSX.Element;
}

export function SimpleStatsCard({ title, value, icon: Icon }: SimpleStatsCardProps) {
  return (
    <div className="rounded-xl bg-white/5 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-white/60">{title}</div>
          <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
        </div>
        <Icon className="h-5 w-5 text-white/60" />
      </div>
    </div>
  );
}