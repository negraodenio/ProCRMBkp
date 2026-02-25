"use client";

import { useState, useEffect } from "react";
import { User, Building2, ChevronDown, Search, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  name: string;
  company?: string;
  status?: string;
  score?: number;
  last_contact?: string;
}

interface AIToolsHeaderProps {
  selectedLeadId: string | null;
  onSelectLead: (lead: Lead | null) => void;
  orgId: string | null;
}

export function AIToolsHeader({ selectedLeadId, onSelectLead, orgId }: AIToolsHeaderProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (selectedLeadId && orgId) {
      loadLead(selectedLeadId);
    } else {
      setSelectedLead(null);
    }
  }, [selectedLeadId, orgId]);

  async function loadLead(id: string) {
    const { data, error } = await supabase
      .from("contacts")
      .select("id, name, company, status, score")
      .eq("id", id)
      .single();

    if (!error && data) {
      setSelectedLead(data as Lead);
      onSelectLead(data as Lead);
    }
  }

  useEffect(() => {
    if (searchTerm.length > 2 && orgId) {
      const delayDebounceFn = setTimeout(() => {
        searchLeads(searchTerm);
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, orgId]);

  async function searchLeads(term: string) {
    setLoading(true);
    const { data } = await supabase
      .from("contacts")
      .select("id, name, company, status, score")
      .eq("organization_id", orgId)
      .ilike("name", `%${term}%`)
      .limit(5);

    setSearchResults((data as Lead[]) || []);
    setLoading(false);
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            IA Tools
          </h2>
          <p className="text-slate-500 text-sm">
            11 ferramentas de inteligência artificial para acelerar suas vendas
          </p>
        </div>

        <div className="min-w-[300px]">
          {!selectedLead ? (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 rounded-full">
                  <User className="h-4 w-4 text-amber-600" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-amber-900">Nenhum lead selecionado</p>
                  <p className="text-amber-700 text-xs">Selecione um para habilitar as ferramentas</p>
                </div>
              </div>
              <LeadSearchDropdown onSelect={onSelectLead} searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchResults={searchResults} loading={loading} />
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                    {getInitials(selectedLead.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{selectedLead.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {selectedLead.company || "Sem Empresa"}
                    </span>
                    <span>•</span>
                    <span className="text-primary">{selectedLead.status || "Novo"}</span>
                    <span>•</span>
                    <span className={cn(
                        "font-bold",
                        (selectedLead.score || 0) >= 70 ? "text-orange-500" : "text-blue-500"
                    )}>
                        Score: {selectedLead.score || 0}
                    </span>
                  </div>
                </div>
              </div>
              <LeadSearchDropdown onSelect={onSelectLead} searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchResults={searchResults} loading={loading} isChange />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LeadSearchDropdown({
    onSelect,
    searchTerm,
    setSearchTerm,
    searchResults,
    loading,
    isChange = false
}: {
    onSelect: (lead: Lead) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    searchResults: Lead[];
    loading: boolean;
    isChange?: boolean;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={isChange ? "ghost" : "default"} size="sm" className={cn(
                    "text-xs gap-2",
                    !isChange && "bg-amber-600 hover:bg-amber-700 text-white border-none"
                )}>
                    {isChange ? "Trocar Lead" : "Selecionar Lead"}
                    <ChevronDown className="h-3 w-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px] p-2">
                <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou empresa..."
                        className="pl-9 h-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">Buscando...</div>
                    ) : searchResults.length > 0 ? (
                        searchResults.map((lead) => (
                            <DropdownMenuItem
                                key={lead.id}
                                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                                onSelect={() => onSelect(lead)}
                            >
                                <div className="font-semibold text-sm">{lead.name}</div>
                                <div className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                                    <Building2 className="h-3 w-3" /> {lead.company || "Sem Empresa"} • {lead.status}
                                </div>
                            </DropdownMenuItem>
                        ))
                    ) : searchTerm.length > 2 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">Nenhum lead encontrado</div>
                    ) : (
                        <div className="p-4 text-center text-xs text-muted-foreground">Digite pelo menos 3 caracteres</div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
