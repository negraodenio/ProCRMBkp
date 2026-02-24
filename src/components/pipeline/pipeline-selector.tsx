"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { KanbanSquare } from "lucide-react";

interface Pipeline {
  id: string;
  name: string;
}

interface PipelineSelectorProps {
  pipelines: Pipeline[];
  currentPipelineId: string;
}

export function PipelineSelector({ pipelines, currentPipelineId }: PipelineSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePipelineChange = (id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("pipelineId", id);
    router.push(`/pipeline?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <KanbanSquare className="h-5 w-5 text-slate-400" />
      <Select value={currentPipelineId} onValueChange={handlePipelineChange}>
        <SelectTrigger className="w-[220px] bg-white font-medium border-slate-200">
          <SelectValue placeholder="Selecionar Funil" />
        </SelectTrigger>
        <SelectContent>
          <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
             Funis de Vendas
          </div>
          {pipelines.map((p) => (
            <SelectItem key={p.id} value={p.id} className="text-sm">
              {p.name}
            </SelectItem>
          ))}
          <div className="border-t mt-1 pt-1">
             <SelectItem value="config" className="text-xs text-blue-600">
                Configurar funis
             </SelectItem>
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
