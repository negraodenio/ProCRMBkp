"use client";

import { Check, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const COMPARISON_DATA = [
  { feature: "IA Priority Scoring", ia4all: "check", firstignite: "alert", alertText: "Básico" },
  { feature: "Lattes Sync (Expertise BR)", ia4all: "check", firstignite: "x" },
  { feature: "WhatsApp Outreach Nativo", ia4all: "check", firstignite: "x" },
  { feature: "Auditoria HMAC-SHA256", ia4all: "check", firstignite: "x" },
  { feature: "TRL Identification", ia4all: "check", firstignite: "alert", alertText: "Manual" },
  { feature: "Market Strategy (GTM) IA", ia4all: "check", firstignite: "alert" },
  { feature: "LGPD Compliance (Brasil)", ia4all: "check", firstignite: "alert", alertText: "GDPR" },
  { feature: "Aderência Processo 56467", ia4all: "check", firstignite: "x" },
];

export function ComparisonTable() {
  return (
    <section id="comparison" className="container mx-auto px-4 py-32 bg-slate-50/30 rounded-[3rem]">
      <div className="text-center max-w-4xl mx-auto mb-20 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
           Análise Competitiva de Infraestrutura
        </div>
        <h2 className="text-4xl md:text-7xl font-black text-slate-900 leading-[1] tracking-tighter">
          Superioridade <br />
          <span className="text-indigo-600 italic">Técnica e Soberana</span>
        </h2>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Por que a IA4ALL é a única plataforma apta a gerir o capital intelectual estratégico da sua instituição.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="overflow-hidden border border-slate-200 rounded-[2.5rem] bg-white shadow-2xl shadow-slate-200/50">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-950 text-white">
                <th className="py-10 px-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Recurso Estratégico</th>
                <th className="py-10 px-8 text-center bg-indigo-600 relative overflow-hidden">
                   <div className="relative z-10">
                    <span className="text-2xl font-black italic tracking-tighter">IA4ALL</span>
                    <div className="text-[9px] font-bold text-indigo-200 mt-1 uppercase tracking-widest">Sovereign Edition</div>
                   </div>
                   <div className="absolute top-0 right-0 p-2 opacity-20">
                      <Shield className="h-20 w-20 text-white" />
                   </div>
                </th>
                <th className="py-10 px-8 text-center text-slate-400">
                  <div className="text-sm font-bold uppercase tracking-widest">CRMs Genéricos</div>
                  <div className="text-[9px] font-medium text-slate-600 mt-1 uppercase">(Market Standard)</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {COMPARISON_DATA.map((row, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="py-7 px-8">
                    <span className="text-lg font-bold text-slate-700 block">{row.feature}</span>
                  </td>
                  <td className="py-7 px-8 text-center bg-indigo-50/30">
                     <div className="flex justify-center">
                       <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                         <Check className="h-5 w-5 text-white" />
                       </div>
                     </div>
                  </td>
                  <td className="py-7 px-8 text-center">
                     <div className="flex justify-center">
                       {row.firstignite === "check" ? (
                         <Check className="h-5 w-5 text-slate-300" />
                       ) : row.firstignite === "alert" ? (
                         <div className="flex flex-col items-center">
                           <AlertTriangle className="h-5 w-5 text-amber-500" />
                           {row.alertText && <span className="text-[9px] font-black text-amber-600 mt-1 uppercase tracking-tighter">{row.alertText}</span>}
                         </div>
                       ) : (
                         <X className="h-5 w-5 text-red-300" />
                       )}
                     </div>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-900 text-white border-t-2 border-indigo-600">
                <td className="py-10 px-8">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-indigo-600 text-[9px] font-black rounded-full px-3 py-0.5">COMPLIANCE</Badge>
                        <span className="text-xl font-black uppercase tracking-widest">Aderência FUNARBE</span>
                    </div>
                </td>
                <td className="py-10 px-8 text-center bg-indigo-700">
                   <div className="flex flex-col items-center">
                    <span className="text-3xl font-black italic">100%</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-200 mt-1">Full Technical Coverage</span>
                   </div>
                </td>
                <td className="py-10 px-8 text-center">
                   <div className="flex flex-col items-center opacity-60">
                    <span className="text-3xl font-black italic text-red-400">~65%</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">Gap Analysis Required</span>
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-10">
            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <Shield className="h-4 w-4 text-indigo-500" />
                <span>Auditoria Criptográfica HMAC-SHA256 Ativa</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium italic text-center md:text-right">
                * Análise técnica baseada nos requisitos do Edital 56467 e arquitetura de rede universitária.
            </p>
        </div>
      </div>
    </section>
  );
}
