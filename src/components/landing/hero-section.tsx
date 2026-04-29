"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, Target, Brain, MessageSquare, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const IA_ACTION_EXAMPLES = [
  {
    title: "Market Strategy (GTM)",
    icon: Target,
    content: "Estratégia gerada para Patente Bio-Polí­mero: Foco em Indústria de Embalagens (ROI 280%). Pricing sugerido: Licenciamento com 3% Royalties.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100"
  },
  {
    title: "IA Priority Scoring",
    icon: Sparkles,
    content: "Tecnologia 'Sensor IoT' atingiu Score 92/100. Alta aderência com o roadmap da Siemens detected via análise semí¢ntica.",
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
    <section className="relative bg-slate-950 pt-24 pb-32 lg:pt-36 lg:pb-48 overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-10 animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-xs font-black text-indigo-300 uppercase tracking-[0.2em]">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>Plataforma de Inteligência em Transferência Tecnológica</span>
            </div>

            <h1 className="text-5xl lg:text-8xl font-black leading-[0.95] tracking-tighter text-white">
              Soberania do <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Conhecimento.
              </span>
            </h1>

            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl font-medium">
              O motor de inteligência artificial desenhado para **Universidades e NITs** que buscam liderança global. 
              Transforme ativos de pesquisa em inovaçío industrial com precisío absoluta e conformidade NIST/LGPD.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/login">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white text-lg h-16 px-12 rounded-2xl shadow-2xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 font-black uppercase tracking-wider">
                  Acessar Mission Control
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg h-16 px-12 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 backdrop-blur-md font-bold" asChild>
                <a href="#compliance">Ver Memorial Técnico</a>
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-6 border-t border-white/5">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                           U{i}
                        </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-slate-950 bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                        +12
                    </div>
                </div>
                <p className="text-sm text-slate-500 font-medium italic">
                    Conectando os principais centros de excelência do paí­s.
                </p>
            </div>
          </div>

          <div className="lg:col-span-5 relative animate-in fade-in slide-in-from-right duration-1000">
            {/* Elegant Mockup View */}
            <div className="relative p-1 bg-gradient-to-tr from-white/20 to-transparent rounded-[2.5rem] shadow-2xl shadow-black">
                <div className="relative bg-slate-900 border border-white/5 rounded-[2.3rem] p-8 md:p-10 overflow-hidden">
                    <div className="absolute top-0 right-0 p-6">
                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">IA Engine 4.0</span>
                        </div>
                    </div>

                    <div className="space-y-10 mt-6">
                        <div className="space-y-2">
                            <h3 className="text-white text-2xl font-black">Intelligence Report</h3>
                            <div className="h-1 w-12 bg-indigo-500 rounded-full" />
                        </div>

                        {/* Animated Demonstration Card */}
                        <div key={exampleIndex} className={cn(
                            "p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl transition-all duration-700 animate-in fade-in zoom-in-95",
                        )}>
                            <div className="flex items-center gap-4 mb-6">
                            <div className={cn("p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20")}>
                                <currentExample.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1">Análise Sugerida</span>
                                <span className="font-bold text-white text-lg">
                                    {currentExample.title}
                                </span>
                            </div>
                            </div>
                            <p className="text-slate-300 font-medium leading-relaxed italic text-sm border-l-2 border-indigo-500/30 pl-4 py-1">
                            "{currentExample.content}"
                            </p>
                            
                            <div className="mt-10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-8 bg-indigo-500 rounded-full" />
                                <div className="h-1 w-4 bg-slate-700 rounded-full" />
                                <div className="h-1 w-4 bg-slate-700 rounded-full" />
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                <Shield className="h-3 w-3" />
                                HMAC-SHA256 SECURED
                            </div>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-slate-500 uppercase">Aderência Industrial</span>
                                <span className="text-indigo-400 font-black text-xs">98.2%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[98%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
