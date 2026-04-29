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
    <section id="comparison" className="container mx-auto px-4 py-24">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
          Benchmark de Tecnologia
        </h2>
        <p className="text-slate-500 font-medium">
          Por que a IA4ALL é a única escolha técnica viável para a FUNARBE.
        </p>
      </div>

      <div className="max-w-4xl mx-auto overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-3xl overflow-hidden shadow-xl border">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="py-8 px-6 text-left text-sm font-bold uppercase tracking-widest">Funcionalidade</th>
              <th className="py-8 px-6 text-center bg-indigo-600">
                 <span className="text-xl font-black italic">IA4ALL</span>
              </th>
              <th className="py-8 px-6 text-center text-slate-400 font-bold">FirstIgnite</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {COMPARISON_DATA.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="py-5 px-6 text-sm font-bold text-slate-700">{row.feature}</td>
                <td className="py-5 px-6 text-center bg-indigo-50/30">
                   <div className="flex justify-center">
                     <div className="bg-indigo-600 p-1.5 rounded-full shadow-lg shadow-indigo-200">
                       <Check className="h-4 w-4 text-white" />
                     </div>
                   </div>
                </td>
                <td className="py-5 px-6 text-center">
                   <div className="flex justify-center">
                     {row.firstignite === "check" ? (
                       <Check className="h-4 w-4 text-slate-300" />
                     ) : row.firstignite === "alert" ? (
                       <div className="flex flex-col items-center">
                         <AlertTriangle className="h-4 w-4 text-amber-500" />
                         {row.alertText && <span className="text-[9px] font-black text-amber-600 mt-1 uppercase">{row.alertText}</span>}
                       </div>
                     ) : (
                       <X className="h-4 w-4 text-red-300" />
                     )}
                   </div>
                </td>
              </tr>
            ))}
            <tr className="bg-slate-50">
              <td className="py-8 px-6 text-sm font-black text-slate-900 uppercase">Aderência FUNARBE</td>
              <td className="py-8 px-6 text-center bg-indigo-100">
                 <span className="text-lg font-black text-indigo-700">100%</span>
              </td>
              <td className="py-8 px-6 text-center font-bold text-red-400 text-lg">~75%</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 font-medium">* Análise baseada no Memorial Técnico do Processo 56467 e especificações públicas do benchmark.</p>
        </div>
      </div>
    </section>
  );
}
