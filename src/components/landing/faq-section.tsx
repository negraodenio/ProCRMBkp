"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "O que síƒÂ£o os IA Tools?",
    answer: "SíƒÂ£o 5 ferramentas de inteligíƒÂªncia artificial integradas no CRM que automatizam tarefas como aníƒÂ¡lise de leads, geraíƒÂ§íƒÂ£o de business cases, coaching de negociaíƒÂ§íƒÂ£o e mais. Funcionam com 1 clique.",
  },
  {
    question: "Quanto custa usar a IA?",
    answer: "Os IA Tools estíƒÂ£o incluíƒÂ­dos em todos os planos. O plano Free inclui 3 usos/míƒÂªs. O Pro inclui uso ilimitado sem custos adicionais.",
  },
  {
    question: "íƒâ€° mais barato que HubSpot/Salesforce?",
    answer: "Sim. O Nexum Pro custa í¢â€šÂ¬79/míƒÂªs e inclui funcionalidades que no Salesforce custam í¢â€šÂ¬300+/míƒÂªs por utilizador, alíƒÂ©m de ter ferramentas exclusivas que eles níƒÂ£o oferecem.",
  },
  {
    question: "Funciona com WhatsApp?",
    answer: "Sim. IntegraíƒÂ§íƒÂ£o nativa com WhatsApp Business. As mensagens síƒÂ£o analisadas por IA automaticamente para identificar sentimento e inteníƒÂ§íƒÂ£o.",
  },
  {
    question: "Suporta portuguíƒÂªs de Portugal e Brasil?",
    answer: "Sim. Interface 100% em portuguíƒÂªs, com suporte para ambos os mercados, incluindo multi-moeda (EUR/BRL) e suporte localizado.",
  },
  {
    question: "Pode-se experimentar gríƒÂ¡tis?",
    answer: "Sim. Oferecemos 14 dias gríƒÂ¡tis no plano Pro, sem necessidade de cartíƒÂ£o de críƒÂ©dito. Temos tambíƒÂ©m o plano Free que íƒÂ© gratuito para sempre.",
  },
  {
    question: "Os meus dados estíƒÂ£o seguros?",
    answer: "Sim. Dados encriptados, servidores na Europa e conformidade total com RGPD. Aplicamos uma políƒÂ­tica de privacy-first para todo o processamento de IA.",
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
          Tudo o que vocíƒÂª precisa saber sobre o primeiro CRM Inteligente do mercado.
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
