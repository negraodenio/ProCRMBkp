"use client";

import { XCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PAIN_POINTS = [
  { text: "Mapear parceiros: semanas", icon: "⌛" },
  { text: "Identificar TRL: manual", icon: "📑" },
  { text: "Tradução Técnica: complexo", icon: "🗣️" },
  { text: "Lattes Sync: inexistente", icon: "🔍" },
  { text: "Pitch de Patente: 3 dias", icon: "📄" },
  { text: "Market Teasers: 4 horas", icon: "📊" },
];

const SOLUTIONS = [
  { text: "Match Semântico: 2 seg", icon: "⚡" },
  { text: "TRL Predictor: automático", icon: "✅" },
  { text: "Technical-to-Market: 5 seg", icon: "🎯" },
  { text: "Lattes Sync: Tempo Real", icon: "🔗" },
  { text: "Patent-to-Pitch: 1 clique", icon: "🔥" },
  { text: "Market Teasers: Instantâneo", icon: "💎" },
];

export function ProblemSolution() {
  return (
    <section className="container mx-auto px-4 py-32">
      <div className="text-center max-w-4xl mx-auto mb-20 space-y-6">
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter">
          O "Vale da Morte" da Inovação <br />
          <span className="text-indigo-600 italic">Termina Aqui.</span>
        </h2>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          A Nexum elimina os gargalos que impedem a ciência de virar riqueza industrial.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto items-stretch">
        {/* Without Nexum */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-slate-100 rounded-2xl text-slate-400">
              <XCircle className="h-7 w-7" />
            </div>
            <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Processo Tradicional</div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cenário Arcaico</h3>
            </div>
          </div>

          <div className="space-y-6 mb-12">
            {PAIN_POINTS.map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-slate-500 font-bold group-hover:translate-x-1 transition-transform">
                <span className="text-xl grayscale opacity-50">{item.icon}</span>
                <span className="text-lg">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-100">
            <p className="text-slate-400 font-bold flex items-center gap-2">
              <span className="text-3xl italic text-slate-300">Total:</span> Semanas de burocracia técnica
            </p>
          </div>
        </div>

        {/* With Nexum */}
        <div className="bg-slate-950 rounded-[2.5rem] p-10 md:p-14 shadow-[0_40px_80px_-20px_rgba(79,70,229,0.3)] relative overflow-hidden group border border-white/10">
          <div className="absolute top-0 right-0 p-8">
            <div className="px-3 py-1 bg-indigo-600 text-[10px] font-black text-white rounded-full tracking-widest uppercase">Padrão Funarbe</div>
          </div>
          
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-indigo-600/20 rounded-2xl text-indigo-400 border border-indigo-500/20">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Processo Automatizado</div>
                <h3 className="text-2xl font-black text-white tracking-tight">Intelligence Layer</h3>
            </div>
          </div>

          <div className="space-y-6 mb-12">
            {SOLUTIONS.map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-slate-300 font-bold group-hover:translate-x-1 transition-transform">
                <span className="text-xl">{item.icon}</span>
                <span className="text-lg">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/5">
            <p className="text-indigo-400 font-bold flex items-center gap-2">
              <span className="text-3xl italic text-white/90">Total:</span> Decisões estratégicas em segundos
            </p>
          </div>

          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-600/10 rounded-full blur-[100px]" />
        </div>
      </div>

      <div className="mt-16 text-center">
         <p className="text-slate-400 text-sm font-bold flex items-center justify-center gap-3">
            A Nexum orquestra o fluxo de inovação, do laboratório ao mercado.
            <ArrowRight className="h-4 w-4 text-indigo-500" />
         </p>
      </div>
    </section>
  );
}
