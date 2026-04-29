"use client";

import { Brain } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t bg-slate-50 py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1 bg-primary/10 rounded">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold">Nexum</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              A inteligência artificial especializada em transferência de tecnologia para universidades e instituições de pesquisa.
            </p>
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-200" />
                <div className="w-8 h-8 rounded-full bg-slate-200" />
                <div className="w-8 h-8 rounded-full bg-slate-200" />
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-[10px] tracking-widest">Produto</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><a href="#tools" className="hover:text-primary transition-colors">5 IA Tools</a></li>
              <li><a href="#comparison" className="hover:text-primary transition-colors">Comparação</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Preços</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Integrações</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-[10px] tracking-widest">IA Tools</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-primary transition-colors italic">Science Teaser</a></li>
              <li><a href="#" className="hover:text-primary transition-colors italic">Pitch de Patente</a></li>
              <li><a href="#" className="hover:text-primary transition-colors italic">Novos Mercados</a></li>
              <li><a href="#" className="hover:text-primary transition-colors italic">Business Case</a></li>
              <li><a href="#" className="hover:text-primary transition-colors italic">Scoring de Lead</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-[10px] tracking-widest">Suporte</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Documentação</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Webinars</a></li>
              <li><a href="mailto:contato@nexum.com.br" className="hover:text-primary transition-colors">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-[10px] tracking-widest">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Termos</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">RGPD</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Segurança</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            © 2026 Nexum. Todos os direitos reservados. 🛡️
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <span className="w-2 h-2 bg-emerald-500 rounded-full" />
             System Online
          </div>
        </div>
      </div>
    </footer>
  );
}
