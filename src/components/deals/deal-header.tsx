"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Stage {
  id: string;
  name: string;
  order: number;
}

interface DealHeaderProps {
  currentStageId: string;
  stages: Stage[];
}

export function DealHeader({ currentStageId, stages }: DealHeaderProps) {
  const currentStageIndex = stages.findIndex((s) => s.id === currentStageId);

  return (
    <div className="bg-white border-b overflow-x-auto">
      <div className="flex w-fit md:w-full min-w-max">
        {stages.map((stage, index) => {
          const isCurrent = stage.id === currentStageId;
          const isCompleted = index < currentStageIndex;

          return (
            <div
              key={stage.id}
              className={cn(
                "relative flex-1 flex items-center justify-center py-3 px-6 text-xs font-semibold uppercase tracking-wider transition-all border-r last:border-r-0",
                isCurrent
                  ? "bg-cyan-500 text-white shadow-inner"
                  : isCompleted
                    ? "bg-slate-50 text-slate-500"
                    : "bg-white text-slate-400"
              )}
            >
              <div className="flex items-center gap-2">
                {isCompleted && <Check className="h-3 w-3" />}
                <span>{stage.name}</span>
              </div>

              {/* Active Indicator Arrow-like effect (simplified for now) */}
              {isCurrent && (
                 <div className="absolute -bottom-px left-0 w-full h-1 bg-cyan-600" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
