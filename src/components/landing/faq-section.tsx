"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "O que sÃ£o os IA Tools?",
    answer: "SÃ£o 5 ferramentas de inteligÃªncia artificial integradas no CRM que automatizam tarefas como anÃ¡lise de leads, geraÃ§Ã£o de business cases, coaching de negociaÃ§Ã£o e mais. Funcionam com 1 clique.",
  },
  {
    question: "Quanto custa usar a IA?",
    answer: "Os IA Tools estÃ£o incluÃ­dos em todos os planos. O plano Free inclui 3 usos/mÃªs. O Pro inclui uso ilimitado sem custos adicionais.",
  },
  {
    question: "Ã‰ mais barato que HubSpot/Salesforce?",
    answer: "Sim. O Nexum Pro custa â‚¬79/mÃªs e inclui funcionalidades que no Salesforce custam â‚¬300+/mÃªs por utilizador, alÃ©m de ter ferramentas exclusivas que eles nÃ£o oferecem.",
  },
  {
    question: "Funciona com WhatsApp?",
    answer: "Sim. IntegraÃ§Ã£o nativa com WhatsApp Business. As mensagens sÃ£o analisadas por IA automaticamente para identificar sentimento e intenÃ§Ã£o.",
  },
  {
    question: "Suporta portuguÃªs de Portugal e Brasil?",
    answer: "Sim. Interface 100% em portuguÃªs, com suporte para ambos os mercados, incluindo multi-moeda (EUR/BRL) e suporte localizado.",
  },
  {
    question: "Pode-se experimentar grÃ¡tis?",
    answer: "Sim. Oferecemos 14 dias grÃ¡tis no plano Pro, sem necessidade de cartÃ£o de crÃ©dito. Temos tambÃ©m o plano Free que Ã© gratuito para sempre.",
  },
  {
    question: "Os meus dados estÃ£o seguros?",
    answer: "Sim. Dados encriptados, servidores na Europa e conformidade total com RGPD. Aplicamos uma polÃ­tica de privacy-first para todo o processamento de IA.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="container mx-auto px-4 py-24">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
          Perguntas Frequentes
        </h2>
        <p className="text-slate-500 font-medium">
          Tudo o que vocÃª precisa saber sobre o primeiro CRM Inteligente do mercado.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-white border border-slate-100 rounded-3xl p-6 md:p-10 shadow-sm">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-slate-50 last:border-0 py-2">
              <AccordionTrigger className="text-left font-bold text-slate-800 hover:text-primary hover:no-underline transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed font-semibold">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
