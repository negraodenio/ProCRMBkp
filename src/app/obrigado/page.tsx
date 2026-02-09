import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Brain } from "lucide-react";

export default function ObrigadoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-full">
              <CheckCircle2 className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Obrigado!
          </span>
        </h1>

        <p className="text-xl text-slate-600 mb-2">
          Mensagem recebida com sucesso! ✅
        </p>

        <p className="text-lg text-slate-500 mb-8">
          Nossa equipe entrará em contato em até <strong>24 horas úteis</strong>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/">
            <Button size="lg" variant="outline" className="text-lg px-8">
              ← Voltar ao Início
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8">
              Começar Grátis Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Additional info */}
        <div className="bg-white rounded-2xl shadow-lg border p-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Enquanto espera...
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <p className="font-semibold text-slate-700 mb-1">📚 Documentação</p>
              <p className="text-sm text-slate-600">
                Explore nossos guias e tutoriais
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-1">🎥 Ver Demo</p>
              <p className="text-sm text-slate-600">
                Assista o CRM em ação
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-1">💬 WhatsApp</p>
              <p className="text-sm text-slate-600">
                Chat direto com nossa equipe
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-sm text-slate-400 mt-8">
          ProCRM - Venda 35% Mais com IA 🇵🇹 🇧🇷
        </p>
      </div>
    </div>
  );
}
