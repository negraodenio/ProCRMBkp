"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  History,
  Mail,
  CheckSquare,
  Package,
  File,
  FileText,
  Clock
} from "lucide-react";
import { DealProductsTab } from "./deal-products-tab";

interface DealTabsProps {
  deal: any;
}

export function DealTabs({ deal }: DealTabsProps) {
  return (
    <Tabs defaultValue="history" className="w-full">
      <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-12 p-0 gap-6">
        <TabTrigger value="history" icon={<History className="h-4 w-4" />} label="Histórico" />
        <TabTrigger value="email" icon={<Mail className="h-4 w-4" />} label="E-mail" />
        <TabTrigger value="tasks" icon={<CheckSquare className="h-4 w-4" />} label="Tarefas" />
        <TabTrigger value="products" icon={<Package className="h-4 w-4" />} label="Produtos e Serviços" />
        <TabTrigger value="files" icon={<File className="h-4 w-4" />} label="Arquivos" />
        <TabTrigger value="proposals" icon={<FileText className="h-4 w-4" />} label="Propostas" />
      </TabsList>

      <TabsContent value="history" className="mt-6">
        <HistoryTimeline dealId={deal.id} />
      </TabsContent>

      <TabsContent value="products" className="mt-6">
        <DealProductsTab dealId={deal.id} />
      </TabsContent>

      <TabsContent value="email" className="mt-6">
        <div className="py-20 text-center">
            <p className="text-sm text-slate-400">Nenhum e-mail vinculado a esta negociação.</p>
        </div>
      </TabsContent>

      <TabsContent value="tasks" className="mt-6">
        <div className="py-20 text-center">
            <p className="text-sm text-slate-400">Nenhuma tarefa pendente.</p>
        </div>
      </TabsContent>

      <TabsContent value="files" className="mt-6">
        <div className="py-20 text-center">
            <p className="text-sm text-slate-400">Nenhum arquivo anexado.</p>
        </div>
      </TabsContent>

      <TabsContent value="proposals" className="mt-6">
        <div className="py-20 text-center">
            <p className="text-sm text-slate-400">Nenhuma proposta gerada.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function TabTrigger({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
  return (
    <TabsTrigger
      value={value}
      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none h-full px-1 text-slate-500 data-[state=active]:text-cyan-600 flex gap-2 font-bold text-xs"
    >
      {icon}
      {label}
    </TabsTrigger>
  );
}

function HistoryTimeline({ dealId }: { dealId: string }) {
    const items = [
        { text: "Rickey Tatayama alterou a etapa para Follow UP a partir do funil Funil Padrão", date: "13/02/2026 12:43" },
        { text: "Rickey Tatayama alterou o valor único da negociação de R$ 4558,00 para R$ 4718,00", date: "13/02/2026 12:42" },
        { text: "Negociação criada via CRM", date: "13/02/2026 12:42" },
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
               <Clock className="h-4 w-4 text-slate-400" /> Próximas tarefas
            </h3>
            <Card className="bg-slate-50 border-dashed">
                <CardContent className="py-8 text-center text-xs text-slate-400">
                    Não existem tarefas pendentes para essa Negociação
                </CardContent>
            </Card>

            <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Linha do Tempo</h3>
            <div className="space-y-4 pl-4 border-l-2 border-slate-100">
                {items.map((item, i) => (
                    <div key={i} className="relative">
                        <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-slate-300 border-2 border-white" />
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-800">{item.text}</span>
                            <span className="text-[10px] text-slate-400">{item.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
