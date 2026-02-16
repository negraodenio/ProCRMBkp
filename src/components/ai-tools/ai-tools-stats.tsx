"use client";

import { BarChart3, Edit3, Target, Timer, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatItemProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  trend?: string;
  trendColor?: string;
  isLast?: boolean;
}

function StatItem({ icon: Icon, value, label, trend, trendColor, isLast }: StatItemProps) {
  return (
    <div className={cn(
      "flex flex-col items-center text-center px-4 md:px-8",
      !isLast && "md:border-r border-slate-100"
    )}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-slate-400" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {trend && (
          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5", trendColor)}>
            <TrendingUp className="h-2 w-2" />
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

export function AIToolsStats() {
  return (
    <Card className="border-slate-200 shadow-sm mb-8 overflow-hidden bg-white/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-0">
          <StatItem
            icon={BarChart3}
            value="47"
            label="Análises"
            trend="+12%"
            trendColor="bg-green-100 text-green-700"
          />
          <StatItem
            icon={Edit3}
            value="12"
            label="Business Cases"
            trend="+23%"
            trendColor="bg-blue-100 text-blue-700"
          />
          <StatItem
            icon={Target}
            value="89%"
            label="Accuracy"
            trend="High"
            trendColor="bg-purple-100 text-purple-700"
          />
          <StatItem
            icon={Timer}
            value="2.3s"
            label="Latência"
            isLast
          />
        </div>
      </CardContent>
    </Card>
  );
}
