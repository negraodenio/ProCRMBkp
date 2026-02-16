"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIToolGroupProps {
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  children: React.ReactNode;
}

export function AIToolGroup({ title, subtitle, icon, accentColor, children }: AIToolGroupProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="space-y-4">
      <div
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider ml-10">
            {subtitle}
          </p>
        </div>
        <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          {isCollapsed ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronUp className="h-5 w-5 text-slate-400" />}
        </button>
      </div>

      <div className={cn(
        "relative",
        isCollapsed ? "hidden" : "block"
      )}>
        <div className={cn("absolute -left-4 top-0 bottom-0 w-1 rounded-full", accentColor)} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      </div>
    </div>
  );
}
