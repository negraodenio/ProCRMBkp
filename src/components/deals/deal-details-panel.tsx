"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  User,
  Phone,
  Mail,
  Briefcase,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DealDetailsPanelProps {
  deal: any;
}

export function DealDetailsPanel({ deal }: DealDetailsPanelProps) {
  const company = deal.companies;
  const contact = deal.contacts;

  return (
    <div className="space-y-6">
      {/* 1. Negociação (Opportunity) */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3 border-b bg-slate-50/50">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-blue-500" />
            Negociação
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <DetailItem label="Nome" value={deal.title} />
          <DetailItem label="Valor Total" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.value)} />
          <DetailItem
            label="Fonte"
            value={deal.source || '-'}
          />
        </CardContent>
      </Card>

      {/* 2. Contato (Contact) */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3 border-b bg-slate-50/50">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-500" />
            Contatos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {contact ? (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-slate-900">{contact.name}</span>
                <div className="flex items-center gap-2 text-xs text-blue-600 hover:underline cursor-pointer">
                   <Phone className="h-3 w-3" /> {contact.phone || '-'}
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-600 hover:underline cursor-pointer">
                   <Mail className="h-3 w-3" /> {contact.email || '-'}
                </div>
              </div>
              <button className="w-full text-xs text-slate-500 border border-dashed h-8 rounded-md mt-2 flex items-center justify-center hover:bg-slate-50">
                 + Adicionar contato
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-400 italic">Sem contato vinculado</p>
          )}
        </CardContent>
      </Card>

      {/* 3. Empresa (Account/Company) */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3 border-b bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-500" />
            Empresa
          </CardTitle>
          <Link href={`/companies`} className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-bold">
             ABRIR PAINEL <ExternalLink className="h-2 w-2" />
          </Link>
        </CardHeader>
        <CardContent className="pt-4 space-y-2">
          {company ? (
            <>
              <DetailItem label="Nome" value={company.name} />
              <DetailItem label="Segmento" value={company.segment || '-'} />
              <DetailItem label="Cidade" value={company.city || '-'} />
              <DetailItem label="CNPJ" value={company.cnpj || '-'} />
            </>
          ) : (
            <p className="text-sm text-slate-400 italic">Sem empresa vinculada</p>
          )}
        </CardContent>
      </Card>

      {/* 4. Responsável */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-2 bg-slate-50/50">
          <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Responsável</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
           <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">RT</div>
              Rickey Tatayama
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-2 gap-2 py-0.5 border-b last:border-0 border-slate-100 pb-2">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-xs font-bold text-slate-800 text-right">{value}</span>
    </div>
  );
}
