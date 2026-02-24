"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Lock } from "lucide-react";
import { PlanLevel, PLANS } from "@/lib/stripe/plans";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  orgId?: string;
  userEmail?: string;
  userName?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  message,
  orgId,
  userEmail,
  userName
}: UpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: PlanLevel) => {
    try {
      setLoading(planId);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          planId,
          email: userEmail,
          name: userName,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Erro ao iniciar checkout. Tente novamente.");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error("Erro de conexão. Verifique sua internet.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <div className="mx-auto bg-amber-100 p-3 rounded-full w-fit mb-4">
            <Lock className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-2xl md:text-3xl font-bold">
            Limite atingido
          </DialogTitle>
          <DialogDescription className="text-lg text-slate-600">
            {message || "Você atingiu o limite do seu plano atual. Faça upgrade para continuar crescendo."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Starter Plan */}
          <div className="relative p-6 rounded-2xl border bg-white shadow-sm flex flex-col">
            <h3 className="text-xl font-bold mb-1">Starter</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold">€29</span>
              <span className="text-slate-500 text-sm">/mês</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Até 1.000 leads",
                "2 usuários incluídos",
                "50 IA Tools por mês",
                "WhatsApp Automático",
                "Automações Básicas",
                "Suporte por E-mail"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleUpgrade("starter")}
              disabled={!!loading}
            >
              {loading === "starter" ? "Processando..." : "Começar Agora"}
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="relative p-6 rounded-2xl border-2 border-primary bg-primary/5 shadow-md flex flex-col">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              ⭐ Mais Popular
            </div>

            <h3 className="text-xl font-bold mb-1">Pro</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold">€79</span>
              <span className="text-slate-500 text-sm">/mês</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Até 10.000 leads",
                "10 usuários incluídos",
                "IA Tools ILIMITADO ⚡",
                "WhatsApp Ilimitado",
                "RAG Chatbot (Base de Conhecimento)",
                "Automações Ilimitadas",
                "Relatórios Avançados"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg"
              onClick={() => handleUpgrade("pro")}
              disabled={!!loading}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {loading === "pro" ? "Processando..." : "Dominar o Mercado"}
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Precisa de mais? <a href="/contact" className="underline hover:text-primary">Entre em contato</a> para o plano Enterprise.
        </p>
      </DialogContent>
    </Dialog>
  );
}
