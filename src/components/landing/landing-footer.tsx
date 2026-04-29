"use client";

import { Brain, Sparkles } from "lucide-react";

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
              O primeiro CRM com inteligÃªncia artificial real que pensa estrategicamente junto com seu time de vendas.
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
              <li><a href="#comparison" className="hover:text-primary transition-colors">ComparaÃ§Ã£o</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">PreÃ§os</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">IntegraÃ§Ãµes</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-[10px] tracking-widest">IA Tools</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-primary transition-colors italic">Business Case EstratÃ©gico</a></li>
              <li><a href="#" className="hover:text-primary transition-colors italic">PropensÃ£o de Fechamento</a></li>
              <li><a href="#" className="hover:text-primary transition-colors italic">Scoring & QualificaÃ§Ã£o</a></li>
              <li><a href="#" className="hover:text-primary transition-colors italic">ComunicaÃ§Ã£o Persuasiva</a></li>
              <li><a href="#" className="hover:text-primary transition-colors italic">InteligÃªncia Comportamental</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-[10px] tracking-widest invisible hidden lg:block">Tools Cont.</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-primary transition-colors italic">Next Best Action</a></li>
              <li><a href="#" className="hover:text-primary transition-colors italic">Consultoria de NegociaÃ§Ã£o</a></li>
              <li><a href="#" className="hover:text-primary transition-colors italic">Framework de Conversa</a></li>
              <li><a href="#" className="hover:text-primary transition-colors italic">DossiÃª PrÃ©-ReuniÃ£o</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-[10px] tracking-widest">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Termos</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">RGPD</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">SeguranÃ§a</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            Â© 2026 Nexum. Todos os direitos reservados. ðŸ‡µðŸ‡¹ ðŸ‡§ðŸ‡· ðŸ›¡ï¸
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
