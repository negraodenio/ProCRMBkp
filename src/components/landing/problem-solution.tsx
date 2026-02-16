"use client";

import { XCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PAIN_POINTS = [
  { text: "Preparar reunião: 45 min", icon: "😤" },
  { text: "Escrever follow-up: 20 min", icon: "😤" },
  { text: "Avaliar lead quente: intuição", icon: "😤" },
  { text: "Criar proposta: 30 min", icon: "😤" },
  { text: "Decidir próximo passo: achismo", icon: "😤" },
  { text: "Tratar objeção: improviso", icon: "😤" },
];

const SOLUTIONS = [
  { text: "Dossiê Pré-Reunião: 3 segundos", icon: "🚀" },
  { text: "Comunicação Persuasiva: 2 seg", icon: "🚀" },
  { text: "Scoring Automático: instantâneo", icon: "🚀" },
  { text: "Propostas Digitais: 5 minutos", icon: "🚀" },
  { text: "Next Best Action: 1 clique", icon: "🚀" },
  { text: "Coach de Negociação: tempo real", icon: "🚀" },
];

export function ProblemSolution() {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
          Seus Vendedores Perdem 67% do Tempo em Tarefas que a IA Pode Fazer
        </h2>
        <p className="text-slate-500 font-medium">
          A diferença entre fechar negócios por sorte ou fechar por inteligência.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
        {/* Without CRMia */}
        <div className="bg-white border-2 border-red-50 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-100" />
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-red-900 uppercase tracking-tight">Sem CRMia</h3>
          </div>

          <div className="space-y-4 mb-10">
            {PAIN_POINTS.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-600 font-medium group-hover:translate-x-1 transition-transform">
                <span className="text-lg">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-red-50">
            <p className="text-red-700 font-bold flex items-center gap-2">
              <span className="text-2xl italic">Total:</span> 3h+ por dia desperdiçadas
            </p>
          </div>
        </div>

        {/* With CRMia */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group border-2 border-primary/20">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Com CRMia</h3>
            </div>
            <div className="px-2 py-1 bg-primary text-[10px] font-black text-white rounded">RECOMENDADO</div>
          </div>

          <div className="space-y-4 mb-10">
            {SOLUTIONS.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300 font-medium group-hover:translate-x-1 transition-transform">
                <span className="text-lg">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-800">
            <p className="text-primary font-bold flex items-center gap-2">
              <span className="text-2xl italic text-white/90">Total:</span> 4h/dia economizadas
            </p>
          </div>

          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        </div>
      </div>

      <div className="mt-12 text-center">
         <p className="text-slate-400 text-sm font-bold flex items-center justify-center gap-2">
            CRMia automatiza o trabalho braçal para você focar em fechar.
            <ArrowRight className="h-4 w-4" />
         </p>
      </div>
    </section>
  );
}
