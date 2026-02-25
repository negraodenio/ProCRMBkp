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
  LineChart
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
    title: "Scoring & Qualificação",
    description: "Pontua e prioriza leads automaticamente sem trabalho manual.",
    icon: Tag,
    badge: "Nenhum CRM tem isto grátis",
    preview: "Lead Qualificado: 92/100. Prioridade: Alta.",
    group: "qualification",
    color: "text-purple-600",
    fullExample: "Análise de Scoring:\n\nNome: João Silva\nInteresse: CRM Pro\nComportamento: Visitou preços 4x, baixou whitepaper.\nScore Final: 92\nRecomendação: Atribuição imediata ao Key Account."
  },
  {
    id: "business-case",
    title: "Business Case Estratégico",
    description: "Gera um caso de negócio personalizado para cada lead em 3 segundos.",
    icon: FileText,
    badge: "EXCLUSIVO ⭐",
    preview: "ROI estimado: 340% em 12 meses para Empresa ABC.",
    group: "qualification",
    color: "text-blue-600",
    fullExample: "Business Case Gerado:\n\nA Empresa ABC gasta atualmente €4.200/mês em processos manuais de vendas.\nCom o CRMia, estimamos uma redução de 35%, equivalente a €1.470/mês.\n\nROI estimado: 340% em 12 meses.\nPayback: 2.3 meses.\n\nProposta de valor recomendada: Posicionar como solução de produtividade e redução de headcount operacional."
  },
  {
    id: "propensity",
    title: "Propensão de Fechamento",
    description: "Prevê com 87% de precisão quando o seu lead vai fechar o negócio.",
    icon: TrendingUp,
    badge: "Salesforce cobra $300/user",
    preview: "Probabilidade: 87%. Previsão: 2 a 5 dias.",
    group: "qualification",
    color: "text-emerald-600",
    fullExample: "Análise Preditiva:\n\nLead: Carlos Innovate\nFase: Negociação\nSinais: Abriu proposta hoje, respondeu WhatsApp em < 5min.\nProbabilidade: 87%\nStatus: Hot. Movimentação detectada para assinatura digital."
  },
  {
    id: "lead-temperature",
    title: "Lead Temperature",
    description: "Termômetro visual automático que indica esfriamento ou aquecimento de oportunidades no funil.",
    icon: Flame,
    badge: "NOVIDADE 🔥",
    preview: "Status: Quente. Última interação há 2H.",
    group: "qualification",
    color: "text-orange-500",
    fullExample: "Análise de Recência (Lead Temperature):\n\nA IA monitora a proximidade da última interação (WhatsApp, E-mail, Proposta Enviada). Se o contato ocorreu nas últimas 48h, a oportunidade recebe o selo estratégico 🔥 QUENTE direto no Kanban.\nSempre saiba onde focar a energia do seu dia para não perder o timing da venda."
  },
  // COMMUNICATION
  {
    id: "persuasion",
    title: "Comunicação Persuasiva",
    description: "Copywriting de follow-up personalizado para converter qualquer lead.",
    icon: Mail,
    badge: "Powered by GPT-4",
    preview: "Gerando e-mail de follow-up focado em urgência...",
    group: "communication",
    color: "text-indigo-600",
    fullExample: "Comunicação Gerada:\n\nAssunto: [IMPORTANTE] Redução de custos na Empresa ABC\n\nOlá João,\n\nVi que analisou o Business Case que enviei. Com base nos seus dados atuais, cada dia sem automação custa à ABC cerca de €70.\n\nPodemos falar amanhã às 10h sobre como estancar essa perda?\n\nAbs,"
  },
  {
    id: "behavioral",
    title: "Inteligência Comportamental",
    description: "Analisa o humor, o tom e a real intenção de compra do seu contacto.",
    icon: Heart,
    badge: "EXCLUSIVO ⭐",
    preview: "Tom: Urgente. Humor: Positivo. Intenção: Alta.",
    group: "communication",
    color: "text-rose-600",
    fullExample: "Análise Comportamental:\n\nÚltimas 3 interações:\n1. E-mail: 'Preciso disso para ontem' (Tom: Urgência)\n2. WhatsApp: 'Gostei do demo' (Humor: Entusiasmo)\n3. Chamada: 'Preço é problema?' (Objeção: Financeiro)\n\nSentimento Geral: Muito Positivo. O lead está 'comprado' mas precisa de uma condição especial de pagamento."
  },
  {
    id: "framework",
    title: "Framework de Conversa",
    description: "Roteiro estratégico de vendas para cada situação e tipo de lead.",
    icon: Mic,
    badge: "EXCLUSIVO ⭐",
    preview: "Roteiro sugerido: Spin Selling para SaaS B2B.",
    group: "communication",
    color: "text-slate-700",
    fullExample: "Roteiro Sugerido:\n\nContexto: Primeira chamada de descoberta.\nPergunta de Situação: 'Como vocês gerenciam leads hoje?'\nPergunta de Problema: 'Qual o custo de perder um lead por demora no follow-up?'\nPergunta de Implicação: 'Se isso continuar, qual o impacto no budget do Q3?'\nPergunta de Necessidade: 'Quanto valor geraria saber exatamente qual lead ligar primeiro?'"
  },
  // CLOSING
  {
    id: "nba",
    title: "Next Best Action",
    description: "Sugere a ação de maior impacto no momento certo do funil.",
    icon: ArrowRight,
    badge: "Salesforce cobra $$$",
    preview: "Ação sugerida: Enviar convite para demo técnica.",
    group: "closing",
    color: "text-amber-600",
    fullExample: "Recomendação Estratégica:\n\nPróximo Passo: Chamada de Vídeo de 15 min.\nPorquê: O lead solicitou detalhes técnicos que só um demo visual resolve.\nScript: 'João, vi sua dúvida sobre a API. Vamos fazer um quick call de 15 min amanhã para eu te mostrar como isso funciona na prática?'"
  },
  {
    id: "negotiation",
    title: "Consultoria de Negociação",
    description: "Coach de IA para tratar objeções com argumentos comprovados.",
    icon: ShieldAlert,
    badge: "EXCLUSIVO ⭐",
    preview: "Objeção: 'Tá caro'. Resposta: Posicionamento Value-first.",
    group: "closing",
    color: "text-red-600",
    fullExample: "Coach de Negociação:\n\nObjeção Detectada: 'Não temos budget este trimestre'.\nArgumento de Retorno: 'Entendo perfeitamente. Contudo, se esperarmos 3 meses, o desperdício acumulado será de €4.400. Se começarmos hoje, o CRMia se paga em 2 meses. Podemos parcelar a primeira etapa?'"
  },
  {
    id: "dossier",
    title: "Dossiê Pré-Reunião",
    description: "Briefing executivo automático com pauta, riscos e objetivos.",
    icon: Briefcase,
    badge: "EXCLUSIVO ⭐",
    preview: "Compilando dossiê estratégico para reunião de amanhã...",
    group: "closing",
    color: "text-cyan-600",
    fullExample: "Dossiê Estratégico:\n\nLead: Pedro Costa (CEO)\nEmpresa: StartupXYZ\nDores: Escalabilidade e Gestão de Equipe.\nRiscos: O lead usa um sistema caseiro e teme migração.\nObjetivo Reunião: Mostrar a simplicidade da importação via CSV/API.\nPauta Sugerida: 1. Demo Migração | 2. Dashboard Gestor | 3. IA Scoring."
  },
  {
    id: "deal-coach",
    title: "AI Deal Coach",
    description: "Um Diretor de Vendas virtual que lê todo o seu Kanban e aponta gargalos e a próxima melhor ação.",
    icon: LineChart,
    badge: "NOVIDADE 🔥",
    preview: "Alerta: R$ 45.000 parados na etapa de Negociação.",
    group: "closing",
    color: "text-violet-600",
    fullExample: "Insight Estratégico do Deal Coach:\n\n🚨 Gargalo Financeiro:\nSeu maior volume de capital parado (R$ 84.000) está concentrado na etapa de 'Apresentação'.\n\n🎯 Oportunidade FOCO:\nConcentre-se na Proposta 'Enterprise SoftwareXYZ'. O tempo médico deste deal esgota amanhã.\n\n⚡ Ação Sugerida:\nAgende o follow-up dos 4 leads na etapa Base que estão completando 15 dias sem retorno."
  },
  {
    id: "pitch-generator",
    title: "AI Proposal Writer",
    description: "Gera o pitch comercial persuasivo perfeito com base nos produtos da proposta em 4 segundos.",
    icon: Sparkles,
    badge: "NOVIDADE 🔥",
    preview: "Pitch gerado com foco em ROI para a Empresa XYZ...",
    group: "closing",
    color: "text-fuchsia-600",
    fullExample: "Proposta: Mentoria de Vendas B2B\n\nPitch Gerado:\n\nOlá Equipe XYZ,\n\nCom a Mentoria focada no pipeline, projetamos destravar os €45.000 que estão parados na etapa de Negociação nos últimos 2 meses. O treinamento atacará diretamente o contorno de objeções de preço e fechamento tático.\n\nO investimento do projeto se paga convertendo apenas 1 dia das vendas perdidas. Vamos avançar e blindar a equipe comercial?"
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
          10 Ferramentas de IA Que Só o <span className="text-primary italic">CRMia</span> Tem
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
