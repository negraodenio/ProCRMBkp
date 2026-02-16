"use client";

import { Check, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const COMPARISON_DATA = [
  { feature: "Business Case IA", crmia: "check", hubspot: "x", salesforce: "x", pipedrive: "x" },
  { feature: "Propensão Fechamento", crmia: "check", hubspot: "x", salesforce: "alert", pipedrive: "x", alertText: "$300" },
  { feature: "Scoring IA", crmia: "check", hubspot: "alert", salesforce: "alert", pipedrive: "x", alertText: "$$$" },
  { feature: "Comunicação IA", crmia: "check", hubspot: "alert", salesforce: "alert", pipedrive: "x", alertText: "básico" },
  { feature: "Análise Comportam.", crmia: "check", hubspot: "x", salesforce: "x", pipedrive: "x" },
  { feature: "Next Best Action", crmia: "check", hubspot: "x", salesforce: "alert", pipedrive: "x", alertText: "$300" },
  { feature: "Coach Negociação", crmia: "check", hubspot: "x", salesforce: "x", pipedrive: "x" },
  { feature: "Dossiê Pré-Reunião", crmia: "check", hubspot: "x", salesforce: "x", pipedrive: "x" },
  { feature: "WhatsApp nativo", crmia: "check", hubspot: "alert", salesforce: "alert", pipedrive: "alert", alertText: "$$$" },
  { feature: "Português nativo", crmia: "check", hubspot: "alert", salesforce: "alert", pipedrive: "alert" },
];

export function ComparisonTable() {
  return (
    <section id="comparison" className="container mx-auto px-4 py-24">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
          Porquê Trocar Para o CRMia?
        </h2>
        <p className="text-slate-500 font-medium">
          Compare as funcionalidades que realmente impactam no seu fechamento.
        </p>
      </div>

      <div className="max-w-5xl mx-auto overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-100">
              <th className="py-6 px-4 text-left text-sm font-bold text-slate-400 uppercase tracking-widest">Funcionalidade</th>
              <th className="py-6 px-4 text-center bg-primary/5 rounded-t-2xl">
                 <span className="text-xl font-black text-primary italic">CRMia</span>
              </th>
              <th className="py-6 px-4 text-center text-slate-400 font-bold">HubSpot</th>
              <th className="py-6 px-4 text-center text-slate-400 font-bold">Salesforce</th>
              <th className="py-6 px-4 text-center text-slate-400 font-bold">Pipedrive</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {COMPARISON_DATA.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-4 text-sm font-bold text-slate-700">{row.feature}</td>
                <td className="py-4 px-4 text-center bg-primary/5">
                   <div className="flex justify-center">
                     <div className="bg-emerald-100 p-1 rounded-full">
                       <Check className="h-4 w-4 text-emerald-600" />
                     </div>
                   </div>
                </td>
                <td className="py-4 px-4 text-center">
                   <div className="flex justify-center">
                     {row.hubspot === "check" ? (
                       <Check className="h-4 w-4 text-slate-300" />
                     ) : row.hubspot === "alert" ? (
                       <div className="flex flex-col items-center">
                         <AlertTriangle className="h-4 w-4 text-amber-500" />
                         {row.alertText && <span className="text-[8px] font-bold text-amber-600 mt-0.5">{row.alertText}</span>}
                       </div>
                     ) : (
                       <X className="h-4 w-4 text-red-200" />
                     )}
                   </div>
                </td>
                <td className="py-4 px-4 text-center">
                   <div className="flex justify-center">
                     {row.salesforce === "check" ? (
                       <Check className="h-4 w-4 text-slate-300" />
                     ) : row.salesforce === "alert" ? (
                        <div className="flex flex-col items-center">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          {row.alertText && <span className="text-[8px] font-bold text-amber-600 mt-0.5">{row.alertText}</span>}
                        </div>
                     ) : (
                       <X className="h-4 w-4 text-red-200" />
                     )}
                   </div>
                </td>
                <td className="py-4 px-4 text-center">
                   <div className="flex justify-center">
                     {row.pipedrive === "check" ? (
                       <Check className="h-4 w-4 text-slate-300" />
                     ) : row.pipedrive === "alert" ? (
                        <div className="flex flex-col items-center">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </div>
                     ) : (
                       <X className="h-4 w-4 text-red-200" />
                     )}
                   </div>
                </td>
              </tr>
            ))}
            <tr className="bg-slate-50/50">
              <td className="py-6 px-4 text-sm font-black text-slate-900 uppercase">Preço Mensal</td>
              <td className="py-6 px-4 text-center bg-primary/10 rounded-b-2xl">
                 <span className="text-xl font-black text-emerald-600">€29</span>
              </td>
              <td className="py-6 px-4 text-center font-bold text-red-400">€90+</td>
              <td className="py-6 px-4 text-center font-bold text-red-400">€300+</td>
              <td className="py-6 px-4 text-center font-bold text-red-400">€49+</td>
            </tr>
            <tr>
              <td className="py-6 px-4 text-sm font-black text-slate-900 uppercase">IA Tools Incluídas</td>
              <td className="py-6 px-4 text-center bg-primary/5">
                 <span className="text-sm font-black text-primary">9</span>
              </td>
              <td className="py-6 px-4 text-center text-slate-400 text-sm font-medium">0-1</td>
              <td className="py-6 px-4 text-center text-slate-400 text-sm font-medium">1-2</td>
              <td className="py-6 px-4 text-center text-slate-400 text-sm font-medium">0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
