"use client";

import { MessageCircle, BarChart3, FileText, Zap, Globe, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const CORE_FEATURES = [
  {
    title: "WhatsApp com Typing",
    description: "Status 'Digitando...', histórico e resumos por IA nativos na plataforma.",
    icon: MessageCircle,
    color: "bg-green-50 text-green-600"
  },
  {
    title: "Dashboard Analytics",
    description: "Funil visual, métricas de conversão e insights acionáveis.",
    icon: LayoutDashboard,
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Propostas Digitais",
    description: "Templates, tracking de abertura e assinatura digital integrada.",
    icon: FileText,
    color: "bg-purple-50 text-purple-600"
  },
  {
    title: "Automações Inteligentes",
    description: "Workflows 24/7 de follow-up e qualificação automática.",
    icon: Zap,
    color: "bg-amber-50 text-amber-600"
  },
  {
    title: "Multi-idioma / Moeda",
    description: "Interface e moedas adaptadas para mercado PT e BR.",
    icon: Globe,
    color: "bg-rose-50 text-rose-600"
  },
  {
    title: "B2B & B2C Multicanal",
    description: "Gestão flexível para empresas ou direto para o consumidor final (CPF).",
    icon: BarChart3,
    color: "bg-indigo-50 text-indigo-600"
  }
];

export function CoreFeatures() {
  return (
    <section id="features" className="container mx-auto px-4 py-24">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
          Tudo Que Um CRM Precisa — E Mais
        </h2>
        <p className="text-slate-500 font-medium">
          Além das 5 IA Tools, o Nexum tem todas as funcionalidades essenciais para escalar sua operação.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {CORE_FEATURES.map((feature, i) => (
          <div key={i} className="group p-8 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-300">
            <div className={cn("p-3 rounded-xl w-fit mb-6 transition-transform duration-300 group-hover:scale-110", feature.color)}>
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
