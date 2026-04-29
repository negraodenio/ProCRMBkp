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
  MessageCircle
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
o atacará diretamente o contorno de objeções de preço e fechamento tático.\n\nO investimento do projeto se paga convertendo apenas 1 dia das vendas perdidas. Vamos avançar e blindar a equipe comercial?"
  }
];

export function AIToolsShowcase() {
  const [selectedTool, setSelectedTool] = useState<ToolCard | null>(null);

  const renderGroup = (groupId: "qualification" | "communication" | "closing", title: string, subtitle: string, accentColor: string) => {
    const tools = TOOLS.filter(t => t.group === groupId);
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
               {groupId === "qualification" && "📥"}
               {groupId === "communication" && "💬"}
               {groupId === "closing" && "🎯"}
               {title}
            </h3>
            <p className="text-slate-500 font-medium">{subtitle}</p>
          </div>
          <div className={cn("h-1.5 w-full md:w-32 rounded-full", accentColor)} />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map(tool => (
            <div
              key={tool.id}
              className="bg-white border hover:border-slate-300 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl group flex flex-col justify-between"
            >
              <div>
                <div className={cn("p-3 rounded-xl bg-slate-50 w-fit mb-4 group-hover:scale-110 transition-transform duration-300", tool.color)}>
                  <tool.icon className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-2">{tool.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{tool.description}</p>
                <Badge variant="outline" className="mb-6 font-bold text-[10px] bg-slate-50 text-slate-500 border-none">
                  {tool.badge}
                </Badge>

                <div className="bg-slate-50 rounded-lg p-3 text-[11px] font-medium text-slate-400 font-mono mb-6 italic">
                   "{tool.preview}"
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-between text-primary font-bold hover:bg-primary/5 group/btn"
                onClick={() => setSelectedTool(tool)}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Ver Exemplo</span>
                </div>
                <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section id="tools" className="container mx-auto px-4 py-24 bg-slate-50/50 rounded-3xl border border-slate-100">
      <div className="text-center max-w-4xl mx-auto mb-20 space-y-6">
        <Badge className="bg-primary text-white font-black px-4 py-1">⚡ ÚNICO NO MERCADO</Badge>
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1]">
          8 Ferramentas de IA Que Só a <span className="text-primary italic">IA4ALL</span> Tem
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Cada ferramenta resolve um problema real de vendas.
          Integradas no CRM, funcionam com 1 clique para transformar qualquer vendedor em um expert.
        </p>
      </div>

      <div className="space-y-24">
        {renderGroup("qualification", "Qualificação & Análise", "Entenda o potencial do seu lead em segundos", "bg-blue-500")}
        {renderGroup("communication", "Comunicação & Relacionamento", "Comunique com impacto e inteligência emocional", "bg-purple-500")}
        {renderGroup("closing", "Negociação & Fechamento", "Feche mais negócios com estratégia e preparação", "bg-emerald-500")}
      </div>

      {/* Example Modal */}
      <Dialog open={!!selectedTool} onOpenChange={(open) => !open && setSelectedTool(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
               <div className={cn("p-2 rounded-lg bg-slate-50", selectedTool?.color)}>
                  {selectedTool && <selectedTool.icon className="h-5 w-5" />}
               </div>
               <DialogTitle className="text-xl font-black">{selectedTool?.title} — Exemplo</DialogTitle>
            </div>
            <DialogDescription>
              Demonstração real do output gerado pela inteligência artificial.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="bg-slate-900 rounded-2xl p-8 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
                     IA ENGINE: GPT-4o
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1.5">
                     <TrendingUp className="h-3 w-3" />
                     2.8s
                  </div>
               </div>
               <div className="prose prose-invert prose-sm">
                  <pre className="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed italic border-l-2 border-primary/30 pl-4 py-1">
                    {selectedTool?.fullExample}
                  </pre>
               </div>

               <div className="mt-8 flex items-center justify-between text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-2">
                     <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px]">GROUNDED</Badge>
                     <Badge className="bg-blue-500/10 text-blue-500 border-none text-[8px]">DATA CONTEXT: ON</Badge>
                  </div>
               </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
               Pronto para uso imediato
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setSelectedTool(null)} className="font-bold">Fechar</Button>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90 font-bold px-6">Começar Agora</Button>
              </Link>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
