"use client";

import Link from "next/link";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            CRMia
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#features" className="text-slate-600 hover:text-primary transition-colors">Pipeline & Propostas</a>
          <a href="#tools" className="text-slate-600 hover:text-primary transition-colors">11 IA Tools</a>
          <a href="#pricing" className="text-slate-600 hover:text-primary transition-colors">Planos</a>
          <div className="flex items-center gap-4 ml-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-600 font-semibold hover:text-primary hover:bg-primary/5">Acessar CRM</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 font-bold">
                Criar Conta Grátis
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
