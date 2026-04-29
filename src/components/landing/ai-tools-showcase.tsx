"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Sparkles,
  FileText,
  TrendingUp,
  Tag,
  Mail,
  Heart,
  ArrowRight,
  ShieldAlert,
  Mic,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Flame,
  LineChart,
  MessageCircle,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  group: "qualification" | "communication" | "closing";
}

const TOOLS: ToolCard[] = [
  // QUALIFICATION
  {
    id: "scoring",
    title: "IA Priority Scoring",
    description: "Pontua automaticamente cada ativo do portfólio baseado no interesse corporativo e fit estratégico.",
    icon: Tag,
    badge: "BENCHMARK SUPERIOR",
    preview: "Tecnologia Qualificada: 92/100. Prioridade: Máxima.",
    group: "qualification",
    color: "text-purple-600",
    fullExample: "Análise de Scoring:\n\nPatente: Bio-Polímero V2\nSetor: Química Fina\nInteresse Detectado: 4 empresas do setor químico visualizaram o teaser.\nScore Final: 92\nRecomendação: Iniciar prospecção ativa imediata para licenciamento."
  },
  {
    id: "trl-id",
    title: "Identificação de TRL",
    description: "Analisa o texto da pesquisa e identifica o nível de maturidade tecnológica (TRL 1-9) automaticamente.",
    icon: TrendingUp,
    badge: "EXCLUSIVO ⭐",
    preview: "TRL Identificado: Nível 4 (Protótipo em Laboratório).",
    group: "qualification",
    color: "text-emerald-600",
    fullExample: "Análise de Maturidade:\n\nCom base na descrição dos testes experimentais e validação em ambiente controlado, a IA classificou esta tecnologia como TRL 4.\nStatus: Pronto para validação em ambiente relevante."
  },
  {
    id: "gtm-report",
    title: "Market Strategy (GTM)",
    description: "Gera relatórios Go-To-Market completos com análise de mercado e sugestão de precificação.",
    icon: FileText,
    badge: "NOVIDADE 🔥",
    preview: "GTM Gerado: ROI estimado de 280% para o licenciado.",
    group: "qualification",
    color: "text-blue-600",
    fullExample: "Plano Go-To-Market:\n\nSetor Alvo: Cosméticos Sustentáveis\nTAM: R$ 4.2 Bilhões\nEstratégia: Licenciamento com exclusividade geográfica.\nRoyalty Sugerido: 3.5% a 5.0% sobre faturamento líquido."
  },
  // COMMUNICATION
  {
    id: "lattes-sync",
    title: "Lattes Sync (Reverse Match)",
    description: "Identifica o pesquisador ideal para cada demanda de empresa cruzando dados do Currículo Lattes.",
    icon: Mic,
    badge: "ÚNICO NO BRASIL",
    preview: "Match Lattes: Prof. Dr. Carlos (98% aderência).",
    group: "communication",
    color: "text-indigo-600",
    fullExample: "Reverse Match Intel:\n\nDemanda Empresa: Desenvolvimento de ligas metálicas leves.\nExpertise Lattes: Encontrado Prof. Dr. Carlos Silva (UFV). Possui 4 publicações e 2 patentes na área exata da demanda."
  },
  {
    id: "outreach",
    title: "Sugestão de Abordagem IA",
    description: "Cria o script de abordagem perfeito para cada decisor de empresa baseado no perfil psicológico.",
    icon: Mail,
    badge: "HIGH CONVERSION",
    preview: "Script Gerado: Foco em Inovação Aberta e redução de custos.",
    group: "communication",
    color: "text-rose-600",
    fullExample: "Abordagem Gerada:\n\nPara: Diretor de P&D (Indústria Química)\nAssunto: Parceria de PD&I em Polímeros Sustentáveis\nArgumento: 'Identificamos que sua empresa busca reduzir custos em X. A tecnologia Y da UFV resolve exatamente este gargalo com redução de 20% no desperdício...'"
  },
  {
    id: "whatsapp-screening",
    title: "Auto-Screening WhatsApp",
    description: "IA que qualifica o interesse da empresa via WhatsApp antes do contato humano do NIT.",
    icon: MessageCircle,
    badge: "OMNICHANNEL",
    preview: "IA: 'Olá! Você tem interesse em licenciamento ou pesquisa?'",
    group: "communication",
    color: "text-green-600",
    fullExample: "Conversa via Bot:\n\nEmpresa: 'Vi a patente de polímeros no site.'\nBot IA: 'Olá! Perfeito. Você busca uma parceria para co-desenvolvimento ou licenciamento direto para produção?'\nEmpresa: 'Licenciamento.'\nBot IA: 'Entendido. Vou agendar uma call com nosso gestor de inovação.'"
  },
  // SECURITY & GOVERNANCE
  {
    id: "audit-hmac",
    title: "Auditoria HMAC-SHA256",
    description: "Garante a imutabilidade absoluta de todos os registros de auditoria para órgãos de controle.",
    icon: ShieldAlert,
    badge: "COMPLIANCE TCU",
    preview: "Registro Assinado: e3b0c44... (Verificado).",
    group: "closing",
    color: "text-slate-900",
    fullExample: "Protocolo de Segurança:\n\nCada ação gera um hash HMAC assinado com chave secreta corporativa. Isso impede qualquer alteração retroativa no banco de dados, garantindo transparência absoluta para o TCU e CGU."
  },
  {
    id: "iso-compliance",
    title: "ISO 27001 & LGPD",
    description: "Controles rígidos de privacidade e segurança da informação integrados nativamente.",
    icon: Briefcase,
    badge: "SOC 2 READY",
    preview: "Status: LGPD Mascaramento PII Ativo.",
    group: "closing",
    color: "text-cyan-600",
    fullExample: "Governança de Dados:\n\nTodos os dados de pesquisadores e contatos são processados sob o framework Privacy by Design, com isolamento multi-tenant e criptografia AES-256."
  }
];

export function AIToolsShowcase() {
  const [selectedTool, setSelectedTool] = useState<ToolCard | null>(null);

  const renderGroup = (groupId: "qualification" | "communication" | "closing", title: string, subtitle: string, accentColor: string) => {
    const tools = TOOLS.filter(t => t.group === groupId);
    return (
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               <div className={cn("w-2 h-8 rounded-full", accentColor)} />
               {title}
            </h3>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{subtitle}</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tools.map(tool => (
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
                  <span>Analisar Protocolo</span>
                </div>
                <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section id="tools" className="container mx-auto px-4 py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-50/50 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="text-center max-w-5xl mx-auto mb-24 space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
           Módulos de Inteligência Avançada
        </div>
        <h2 className="text-4xl md:text-7xl font-black text-slate-900 leading-[1] tracking-tighter">
          Engenharia de Inovação <br />
          <span className="text-indigo-600 italic">Orientada por Dados</span>
        </h2>
        <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium">
          A IA4ALL automatiza a burocracia técnica e estratégica, permitindo que os gestores de inovação foquem no que realmente importa: a transferência de conhecimento.
        </p>
      </div>

      <div className="space-y-32">
        {renderGroup("qualification", "Sinalização & Scoring", "QUALIFICAÇÃO TÉCNICA DE ATIVOS", "bg-indigo-600")}
        {renderGroup("communication", "Engajamento Estratégico", "RELAÇÕES UNIVERSIDADE-EMPRESA", "bg-purple-600")}
        {renderGroup("closing", "Governança & Segurança", "CONFORMIDADE E PROTEÇÃO DE DADOS", "bg-slate-900")}
      </div>

      {/* Example Modal (Enhanced) */}
      <Dialog open={!!selectedTool} onOpenChange={(open) => !open && setSelectedTool(null)}>
        <DialogContent className="sm:max-w-[700px] bg-slate-950 text-white border-white/10 rounded-[2.5rem] p-0 overflow-hidden">
          <div className="p-8 md:p-12">
            <DialogHeader className="mb-10">
                <div className="flex items-center gap-4 mb-4">
                <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/10 text-indigo-400")}>
                    {selectedTool && <selectedTool.icon className="h-6 w-6" />}
                </div>
                <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Análise Técnica</div>
                    <DialogTitle className="text-3xl font-black">{selectedTool?.title}</DialogTitle>
                </div>
                </div>
                <DialogDescription className="text-slate-400 text-lg font-medium leading-relaxed">
                Demonstração de output gerado pelo motor de inteligência artificial em ambiente seguro.
                </DialogDescription>
            </DialogHeader>

            <div className="relative">
                <div className="absolute -inset-4 bg-indigo-600/20 blur-3xl opacity-50" />
                <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocolo: IA-OFFICIAL-2026</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-600">
                            Latency: 1.84s
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
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dados protegidos por criptografia de ponta</span>
                </div>
                <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setSelectedTool(null)} className="text-white hover:bg-white/5 font-bold px-6 h-12 rounded-xl">Fechar</Button>
                <Link href="/login">
                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 h-12 rounded-xl shadow-xl shadow-indigo-600/20 uppercase tracking-wider text-xs">Acessar Sistema</Button>
                </Link>
                </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
