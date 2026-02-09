'use client';

import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: string;
  value: number | string;
  label: string;
  trend?: string;
  className?: string;
}

export function StatsCard({ icon, value, label, trend, className }: StatsCardProps) {
  return (
    <div className={cn(
      "glass-card p-4 space-y-2 hover:scale-105 transition-transform duration-200",
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className="text-xs text-muted-foreground">{trend}</span>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-gradient">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
