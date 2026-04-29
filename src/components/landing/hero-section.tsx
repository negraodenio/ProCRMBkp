"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, Target, Brain, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const IA_ACTION_EXAMPLES = [
  {
    title: "Market Strategy (GTM)",
    icon: Target,
    content: "Estratégia gerada para Patente Bio-Polímero: Foco em Indústria de Embalagens (ROI 280%). Pricing sugerido: Licenciamento com 3% Royalties.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100"
  },
  {
    title: "IA Priority Scoring",
    icon: Sparkles,
    content: "Tecnologia 'Sensor IoT' atingiu Score 92/100. Alta aderência com o roadmap da Siemens detected via análise semântica.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100"
  },
  {
    title: "Reverse Lattes Match",
    icon: Brain,
    content: "Empresa XPTO busca expertise em Grafeno. Pesquisador ideal identificado: Prof. Dr. Ricardo (Lattes Sync 98%).",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100"
  }
];

export function HeroSection() {
  const [exampleIndex, setExampleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setExampleIndex((prev) => (prev + 1) % IA_ACTION_EXAMPLES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const currentExample = IA_ACTION_EXAMPLES[exampleIndex];

  return (
    <section className="container mx-auto px-4 py-20 lg:py-32 overflow-hidden">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-sm font-bold text-indigo-700">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>Suite IA 5-Tools — Especializada para NITs e Universidades</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-slate-900">
            Acelerando a <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Inovação Acadêmica
            </span>
          </h1>

          <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
            A plataforma de inteligência artificial pioneira em **University Partner Intelligence**. 
            Encontre parceiros corporativos, identifique TRL e gere estratégias GTM em segundos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg h-14 px-10 shadow-xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95 font-bold">
                Acessar Mission Control
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg h-14 px-10 border-slate-200 hover:bg-slate-50 font-medium" asChild>
              <a href="#compliance">LGPD & NIST Compliant ↓</a>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>14 dias grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Sem cartão</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Cancele quando quiser</span>
            </div>
          </div>

          <div className="pt-4 text-sm font-medium text-slate-500 border-t border-slate-100 flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-ping" />
                90% mais barato que Salesforce
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md">
                10x mais inteligente que HubSpot
            </div>
          </div>
        </div>

        <div className="relative animate-in fade-in slide-in-from-right duration-1000">
          <div className="absolute -inset-10 bg-gradient-to-tr from-primary/20 to-purple-600/20 rounded-full blur-[100px] opacity-60 animate-pulse"></div>

          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-8 md:p-12 overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
               <div className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full tracking-wider">PREVIEW REAL</div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-amber-100 rounded-lg">
                    <Sparkles className="h-5 w-5 text-amber-600" />
                 </div>
                 <h3 className="text-lg font-extrabold text-slate-900">IA Tools em Ação</h3>
              </div>

              {/* Animated Demonstration Card */}
              <div key={exampleIndex} className={cn(
                "p-6 rounded-xl border transition-all duration-700 animate-in fade-in zoom-in-95",
                currentExample.bg,
                currentExample.border
              )}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("p-2 rounded-lg bg-white shadow-sm", currentExample.color)}>
                    <currentExample.icon className="h-5 w-5" />
                  </div>
                  <span className={cn("font-bold text-sm", currentExample.color)}>
                    {currentExample.title}:
                  </span>
                </div>
                <p className="text-slate-800 font-medium leading-relaxed italic">
                  "{currentExample.content}"
                </p>
                <div className="mt-6 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      <div className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-pulse" />
                      PROCESSAMENTO SEGURO
                   </div>
                   <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500">
                      <span className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-primary animate-spin" />
                      2.1s
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                 {[0, 1, 2].map((i) => (
                   <div key={i} className={cn(
                     "h-1 rounded-full transition-all duration-500",
                     i === exampleIndex ? "bg-primary w-full" : "bg-slate-100 w-full"
                   )} />
                 ))}
              </div>

              <Button variant="ghost" className="w-full text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-primary" asChild>
                <a href="#tools">Ver todas as 11 ferramentas</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
