"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingSectionProps {
  currency: string;
  prices: {
    starter: string;
    pro: string;
    enterprise: string;
  };
}

export function PricingSection({ currency, prices }: PricingSectionProps) {
  const PLANS = [
    {
      name: "Free",
      price: "0",
      description: "Para experimentação inicial",
      features: [
        "Até 100 leads",
        "1 usuário",
        "3 IA Tools/mês (Qualquer uma)",
        "Pipeline visual",
        "Dashboard básico",
      ],
      buttonText: "Começar Grátis",
      variant: "outline" as const,
      footerNote: null
    },
    {
      name: "Starter",
      price: prices.starter,
      description: "Para pequenos times em crescimento",
      features: [
        "Até 1.000 leads",
        "2 usuários",
        "50 IA Tools/mês",
        "WhatsApp integrado",
        "Automações básicas",
      ],
      buttonText: "Começar Agora",
      variant: "outline" as const,
      footerNote: null
    },
    {
      name: "Pro",
      price: prices.pro,
      description: "Para times que buscam alta performance",
      popular: true,
      features: [
        "Até 10.000 leads",
        "10 usuários",
        "5 IA Tools ILIMITADOS ⚡",
        "WhatsApp ilimitado",
        "Automações ilimitadas",
        "Propostas digitais",
        "RAG Chatbot (Assistente IA)",
        "Relatórios avançados",
      ],
      buttonText: "Dominar o Mercado",
      variant: "default" as const,
      footerNote: null
    },
    {
      name: "Enterprise",
      price: prices.enterprise,
      description: "Para operações de grande escala",
      features: [
        "Leads ilimitados",
        "Usuários ilimitados",
        "Tudo do plano Pro",
        "API Access",
        "White label",
        "Suporte prioritário",
        "SLA garantido",
      ],
      buttonText: "Falar com Vendas",
      variant: "outline" as const,
      footerNote: null
    }
  ];

  return (
    <section id="pricing" className="container mx-auto px-4 py-24">
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
          Preços Simples para <span className="text-primary italic">IA Real</span>
        </h2>
        <p className="text-slate-500 font-medium">
          Escolha o plano ideal para a escala da sua empresa.
          Cancele quando quiser, sem letras miúdas.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {PLANS.map((plan, i) => (
          <div
            key={i}
            className={cn(
              "relative bg-white border rounded-3xl p-8 transition-all duration-500 hover:shadow-2xl flex flex-col justify-between",
              plan.popular ? "border-primary shadow-xl shadow-primary/5 lg:-translate-y-4 z-10" : "border-slate-100"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-primary/20">
                🏆 MAIS POPULAR
              </div>
            )}

            <div>
              <div className="mb-8">
                <h3 className="text-xl font-black text-slate-900 mb-1">{plan.name}</h3>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{plan.description}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">{plan.price !== "Custom" ? currency : ""}{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-slate-400 font-bold">/mês</span>}
              </div>

              <div className="space-y-4 mb-10">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-2.5 text-sm font-medium text-slate-600">
                    <Check className={cn("h-4 w-4 mt-0.5 shrink-0", plan.popular ? "text-primary" : "text-emerald-500")} />
                    <span className={cn(feature.includes("ILIMITADOS") && "font-black text-primary")}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Link href={plan.name === "Enterprise" ? "#" : "/register"}>
                <Button
                  variant={plan.variant}
                  className={cn(
                    "w-full h-12 font-bold transition-all duration-300",
                    plan.popular ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:scale-105" : "hover:border-primary hover:text-primary"
                  )}
                >
                  {plan.buttonText}
                </Button>
              </Link>
              {plan.footerNote && (
                 <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    "{plan.footerNote}"
                 </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center max-w-2xl mx-auto p-6 bg-slate-50 rounded-2xl border border-slate-100">
         <p className="text-slate-500 text-sm font-medium">
            Cada plano inclui acesso às <span className="text-primary font-bold">5 IA Tools</span>.
            A diferença é o volume de uso. Todos os planos incluem atualizações e novas IA Tools automaticamente.
         </p>
      </div>
    </section>
  );
}
