"use client";

import { cn } from "@/lib/utils";

const METRICS = [
  {
    label: "IA Tools Integradas",
    value: "9",
    description: "Único no mercado",
    color: "text-primary"
  },
  {
    label: "Precisão Preditiva",
    value: "87%",
    description: "Score de conversão",
    color: "text-emerald-500"
  },
  {
    label: "Tempo Economizado",
    value: "4h/dia",
    description: "Foco no que importa",
    color: "text-blue-500"
  },
  {
    label: "Mais barato que Salesforce",
    value: "90%",
    description: "ROI imediato",
    color: "text-purple-500"
  }
];

export function MetricsBar() {
  return (
    <section className="bg-slate-900 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
          {METRICS.map((metric, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col items-center text-center space-y-2",
                index !== METRICS.length - 1 && "md:border-r border-slate-800"
              )}
            >
              <div className="flex flex-col">
                <span className={cn("text-4xl md:text-5xl font-black tracking-tighter", metric.color)}>
                  {metric.value}
                </span>
                <span className="text-white font-bold text-sm tracking-wide uppercase mt-1">
                  {metric.label}
                </span>
                <span className="text-slate-500 text-[10px] font-medium uppercase tracking-widest mt-1">
                  {metric.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
