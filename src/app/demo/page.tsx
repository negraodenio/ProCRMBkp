"use client";

import { Rocket, Target, Zap, Users, BarChart3, ChevronRight, FileText, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function DemoShowcasePage() {
    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-orange-500/10">
            {/* Minimal Header */}
            <nav className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">I</div>
                    <span className="font-bold tracking-tight text-xl">Innovation Suite <span className="text-orange-600">Demo</span></span>
                </div>
                <Badge variant="outline" className="border-orange-200 text-orange-600 uppercase tracking-widest text-[10px] py-1 px-3">
                    Licitatório / Demo Mode
                </Badge>
            </nav>

            <main className="max-w-5xl mx-auto py-20 px-6 space-y-32">
                
                {/* Intro */}
                <div className="space-y-6 text-center">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter">Roteiro de Demonstraçío</h1>
                    <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed">
                        Siga estes 4 passos para demonstrar como o sistema resolve o gap entre a universidade e o mercado.
                    </p>
                </div>

                {/* Steps Container */}
                <div className="grid gap-24">
                    
                    {/* Step 1 */}
                    <DemoStep 
                        number="01"
                        title="Ingestío de Ativos (Intake)"
                        description="Demonstre como o sistema processa patentes ou artigos científicos complexos em segundos."
                        features={[
                            "Extraçío Automática de Texto (PDF)",
                            "Classificaçío TRL Instantânea",
                            "Identificaçío de Proposta de Valor por IA"
                        ]}
                        buttonText="Abrir Intake de Pesquisa"
                        href="/autopilot"
                        icon={FileText}
                    />

                    {/* Step 2 */}
                    <DemoStep 
                        number="02"
                        title="Inteligência de Matching"
                        description="Mostre a busca semântica em açío, encontrando parceiros corporativos com fit tecnológico."
                        features={[
                            "Matching Vetorial (Semântico)",
                            "Geraçío de Racional Estratégico",
                            "Score de Aderência Industriais"
                        ]}
                        buttonText="Executar Matchmaking"
                        href="/match"
                        icon={Target}
                    />

                    {/* Step 3 */}
                    <DemoStep 
                        number="03"
                        title="Prospecçío e Engajamento"
                        description="Mostre como encontrar os decisores certos e iniciar a comunicaçío oficial."
                        features={[
                            "Mapeamento de CTOs e Heads",
                            "Envio de Outreach Personalizado",
                            "Templates de Proposta Técnica"
                        ]}
                        buttonText="Ver Módulo de Engajamento"
                        href="/match" // Link shared with match
                        icon={Users}
                    />

                    {/* Step 4 */}
                    <DemoStep 
                        number="04"
                        title="Gestío de Impacto (Mission Control)"
                        description="Encerre mostrando a visío analítica para os gestores da instituiçío."
                        features={[
                            "Analytics de Interesse por Setor",
                            "Pipeline de Transferência",
                            "Exportaçío de Relatórios de Auditoria"
                        ]}
                        buttonText="Acessar Mission Control"
                        href="/mission-control"
                        icon={BarChart3}
                    />

                </div>

                {/* Final Pitch Summary */}
                <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white text-center space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                    <Sparkles className="h-12 w-12 text-orange-500 mx-auto" />
                    <h2 className="text-4xl font-bold">Por que nossa soluçío vence?</h2>
                    <div className="grid md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
                        <div className="space-y-2">
                            <p className="font-bold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Compliance Total</p>
                            <p className="text-sm text-slate-400">Registramos cada açío da IA para total transparência em licitações.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="font-bold flex items-center gap-2"><Rocket className="h-4 w-4 text-emerald-400" /> Velocidade</p>
                            <p className="text-sm text-slate-400">O Autopilot reduz de meses para minutos o tempo de prospecçío.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="font-bold flex items-center gap-2"><Sparkles className="h-4 w-4 text-emerald-400" /> IA Especializada</p>
                            <p className="text-sm text-slate-400">Modelos treinados especificamente para o mercado de TTO e P&D.</p>
                        </div>
                    </div>
                </div>

                {/* Footer Link */}
                <div className="text-center pb-20">
                    <Link href="/innovation" className="text-slate-400 hover:text-orange-600 transition-colors flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest">
                        Voltar para a Vitrine Principal <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

            </main>
        </div>
    );
}

function DemoStep({ number, title, description, features, buttonText, href, icon: Icon }: any) {
    return (
        <div className="flex flex-col md:flex-row gap-12 items-start group">
            <div className="text-8xl font-black text-slate-100 select-none transition-colors group-hover:text-orange-50 leading-none">
                {number}
            </div>
            <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-600/20">
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                </div>
                <p className="text-slate-500 text-lg leading-relaxed">
                    {description}
                </p>
                <div className="grid gap-3">
                    {features.map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                            <div className="h-1.5 w-1.5 bg-orange-500 rounded-full" />
                            {f}
                        </div>
                    ))}
                </div>
                <Link href={href} target="_blank">
                    <Button size="lg" className="bg-slate-900 hover:bg-orange-600 text-white mt-4 h-14 px-8 rounded-xl font-bold transition-all shadow-xl hover:shadow-orange-600/20">
                        {buttonText}
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
