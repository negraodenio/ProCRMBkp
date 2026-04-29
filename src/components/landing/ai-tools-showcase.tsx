"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  FileText,
  TrendingUp,
  Tag,
  Briefcase,
  ChevronRight,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  preview: string;
  fullExample: string;
  color: string;
}

const TOOLS: ToolCard[] = [
  {
    id: "teaser",
    title: "Science Teaser",
    description: "Transforma pesquisas complexas em resumos executivos de 3 parágrafos focados em valor de mercado.",
    icon: Sparkles,
    badge: "MAIS USADO",
    preview: "Resumo Gerado: 'Esta tecnologia reduz o tempo de análise em 40%...'",
    color: "text-violet-600",
    fullExample: "Output Science Teaser:\n\nTECNOLOGIA: Polí­mero Bio-degradável\nVALOR: Reduçío de 30% no custo de produçío de embalagens.\nMERCADO: Indústria de cosméticos premium e higiene pessoal.\nSOLUí‡íƒO: Substitui plásticos petroquí­micos com 100% de decomposiçío em 90 dias."
  },
  {
    id: "pitch",
    title: "Pitch de Patente",
    description: "Estrutura uma proposta de valor comercial completa a partir dos dados técnicos de uma patente.",
    icon: Briefcase,
    badge: "IP & LICENCIAMENTO",
    preview: "Pitch: 'Investimento com payback estimado em 14 meses...'",
    color: "text-orange-600",
    fullExample: "Output Pitch de Patente:\n\nOPORTUNIDADE: Licenciamento com exclusividade.\nVANTAGEM COMPETITIVA: íšnica tecnologia nacional com patente INPI aprovada para X.\nROI ESTIMADO: 15% sobre faturamento lí­quido no primeiro ano.\nPRí“XIMOS PASSOS: Agendar demonstraçío técnica da prova de conceito."
  },
  {
    id: "markets",
    title: "Novos Mercados",
    description: "Identifica novos setores e aplicações potenciais para uma tecnologia usando análise vetorial global.",
    icon: TrendingUp,
    badge: "EXPANSíƒO",
    preview: "Setores Encontrados: Agronegócio, Defesa, Aeroespacial.",
    color: "text-emerald-600",
    fullExample: "Output Novos Mercados:\n\nSETOR 1: Aeroespacial (Revestimentos leves)\nSETOR 2: Dispositivos Médicos (Bio-implantes)\nSETOR 3: Energia (Sensores de monitoramento remoto)\nCOMPETIDORES: BASF, Dupont, 3M."
  },
  {
    id: "business-case",
    title: "Business Case",
    description: "Gera relatórios de viabilidade técnica e financeira para convencer diretores de P&D.",
    icon: FileText,
    badge: "ESTRATí‰GICO",
    preview: "Análise: Fit tecnológico de 94% com a planta industrial atual.",
    color: "text-blue-600",
    fullExample: "Output Business Case:\n\nCAPEX ESTIMADO: Baixo (reuso de maquinário existente).\nRISCO: Mí­nimo (tecnologia já validada em TRL 6).\nPARCERIA: Possibilidade de co-desenvolvimento via Embrapii.\nCONCLUSíƒO: Recomenda-se a aquisiçío para defesa de mercado."
  },
  {
    id: "scoring",
    title: "Scoring de Lead",
    description: "Pontua automaticamente cada empresa e decisor baseado no fit com o portfólio do NIT.",
    icon: Tag,
    badge: "CRM INTEL",
    preview: "Score: 92/100 (Lead Quente para Transferência).",
    color: "text-rose-600",
    fullExample: "Output Lead Scoring:\n\nEMPRESA: Natura &Co\nMATCH SCORE: 92\nPOR QUE: Histórico de investimentos em bio-polí­meros e sustentabilidade.\nCONTATO PRIORITíRIO: Diretor de P&D (Dr. Ricardo Almeida).\nAí‡íƒO SUGERIDA: Enviar Science Teaser via Nexum Outreach."
  }
];

export function AIToolsShowcase() {
  const [selectedTool, setSelectedTool] = useState<ToolCard | null>(null);

  return (
    <section id="tools" className="container mx-auto px-4 py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-50/50 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="text-center max-w-5xl mx-auto mb-24 space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
           Nexum Neural Engine
        </div>
        <h2 className="text-4xl md:text-7xl font-black text-slate-900 leading-[1] tracking-tighter">
          5 Ferramentas de IA <br />
          <span className="text-indigo-600 italic">Para Transferência de Tecnologia</span>
        </h2>
        <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium">
          O Nexum automatiza a análise estratégica, permitindo que os gestores de inovaçío foquem no fechamento de parcerias e licenciamentos.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {TOOLS.map(tool => (
          <div
            key={tool.id}
            className="group relative bg-white border border-slate-100 rounded-[2rem] p-8 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] hover:-translate-y-2 flex flex-col justify-between"
          >
            <div className="relative z-10">
              <div className={cn("p-4 rounded-2xl bg-slate-50 w-fit mb-8 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500", tool.color)}>
                <tool.icon className="h-7 w-7" />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{tool.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">{tool.description}</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest mb-8">
                {tool.badge}
              </div>

              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 text-[10px] font-bold text-slate-400 font-mono mb-8 italic">
                 "{tool.preview}"
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full justify-between text-indigo-600 font-black uppercase tracking-widest text-[10px] hover:bg-indigo-50 group/btn"
              onClick={() => setSelectedTool(tool)}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                <span>Ver Exemplo de Output</span>
              </div>
              <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        ))}
      </div>

      {/* Example Modal */}
      <Dialog open={!!selectedTool} onOpenChange={(open) => !open && setSelectedTool(null)}>
        <DialogContent className="sm:max-w-[700px] bg-slate-950 text-white border-white/10 rounded-[2.5rem] p-0 overflow-hidden">
          <div className="p-8 md:p-12">
            <DialogHeader className="mb-10">
                <div className="flex items-center gap-4 mb-4">
                <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/10 text-indigo-400")}>
                    {selectedTool && <selectedTool.icon className="h-6 w-6" />}
                </div>
                <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Nexum Neural Engine</div>
                    <DialogTitle className="text-3xl font-black">{selectedTool?.title}</DialogTitle>
                </div>
                </div>
                <DialogDescription className="text-slate-400 text-lg font-medium leading-relaxed">
                Demonstraçío de inteligência artificial aplicada í  transferência de tecnologia.
                </DialogDescription>
            </DialogHeader>

            <div className="relative">
                <div className="absolute -inset-4 bg-indigo-600/20 blur-3xl opacity-50" />
                <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocolo: Nexum-IA-2026</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-600">
                            Latency: 1.24s
                        </div>
                    </div>
                    <div className="prose prose-invert prose-sm">
                        <pre className="whitespace-pre-wrap font-mono text-indigo-300 leading-relaxed text-sm bg-transparent p-0">
                            {selectedTool?.fullExample}
                        </pre>
                    </div>
                </div>
            </div>

            <DialogFooter className="mt-10 sm:justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-full">
                        <Shield className="h-4 w-4 text-slate-500" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dados protegidos por criptografia HMAC-SHA256</span>
                </div>
                <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setSelectedTool(null)} className="text-white hover:bg-white/5 font-bold px-6 h-12 rounded-xl">Fechar</Button>
                <Link href="/login">
                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 h-12 rounded-xl shadow-xl shadow-indigo-600/20 uppercase tracking-wider text-xs">Acessar CRM</Button>
                </Link>
                </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
