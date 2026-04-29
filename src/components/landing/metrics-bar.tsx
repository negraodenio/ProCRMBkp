"use client";

import { cn } from "@/lib/utils";

const METRICS = [
  {
    label: "Protocolos de IA — Soberania Tecnológica",
    value: "5",
    color: "text-indigo-400"
  },
  {
    label: "Acurácia Preditiva — Matching Semântico",
    value: "87%",
    color: "text-emerald-400"
  },
  {
    label: "Ativos Monitorados — Ecossistema Universitário",
    value: "R$ 2.4B",
    color: "text-blue-400"
  },
  {
    label: "Efficiency Index — Aceleração de TRL",
    value: "12x",
    color: "text-purple-400"
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
                <span className="text-white font-bold text-xs tracking-wider uppercase mt-3 px-4">
                  {metric.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
