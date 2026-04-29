"use client";

import { ArrowRight, Zap, Target, Search, Mail, Shield, Globe, Sparkles, Building2, BarChart3, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function InnovationLandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
            <LandingHeader />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-orange-500/10 via-transparent to-transparent opacity-50" />
                    <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-orange-600/5 blur-[120px] rounded-full" />

                    <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-sm font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-1000">
                            <Sparkles className="h-4 w-4" />
                            The Future of Tech Transfer
                        </div>
                        
                        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1] max-w-5xl mx-auto">
                            Transforme Ciência em <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-400 to-orange-600">
                                Valor de Mercado.
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
                            A primeira plataforma de IA ponta-a-ponta para universidades e centros de pesquisa. 
                            Gere marketing, encontre parceiros corporativos e engaje decisores em segundos.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                            <Link href="/register">
                                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white text-xl h-20 px-12 rounded-2xl shadow-2xl shadow-orange-600/20 transition-all hover:scale-105">
                                    Agendar Demonstração
                                    <ArrowRight className="ml-2 h-6 w-6" />
                                </Button>
                            </Link>
                            <Button size="lg" variant="outline" className="border-slate-800 bg-slate-900/50 backdrop-blur-xl text-white text-xl h-20 px-12 rounded-2xl">
                                Ver Autopilot em Ação
                            </Button>
                        </div>

                        {/* Social Proof / Trusted By */}
                        <div className="pt-20 opacity-40 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">Tecnologia desenvolvida para</p>
                            <div className="flex flex-wrap justify-center gap-12 items-center">
                                <span className="text-2xl font-black italic">UNIVERSIDADES</span>
                                <span className="text-2xl font-black italic">R&D CENTERS</span>
                                <span className="text-2xl font-black italic">DEEP TECHS</span>
                                <span className="text-2xl font-black italic">INNOVATION HUBS</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid - The GME Framework */}
                <section className="py-32 container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={Zap} 
                            title="GERAR" 
                            description="Tradução automática de patentes e papers em Teasers de Mercado altamente persuasivos."
                            color="orange"
                        />
                        <FeatureCard 
                            icon={Target} 
                            title="MATCH" 
                            description="Motor vetorial que cruza sua tecnologia com o DNA de inovação das maiores empresas do mundo."
                            color="amber"
                        />
                        <FeatureCard 
                            icon={Mail} 
                            title="ENGAJAR" 
                            description="Outreach automatizado para decisores (CTOs e Heads), com sequências de e-mail personalizadas pela IA."
                            color="orange"
                        />
                    </div>
                </section>

                {/* Autopilot Showcase */}
                <section className="py-24 bg-slate-900/50 border-y border-slate-800">
                    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8">
                            <div className="p-3 bg-orange-600 w-fit rounded-2xl shadow-xl shadow-orange-600/20">
                                <Rocket className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black leading-tight">
                                Autopilot: <br />
                                <span className="text-orange-500">Do Paper à Reunião</span> <br />
                                em tempo recorde.
                            </h2>
                            <p className="text-slate-400 text-lg">
                                Esqueça semanas de prospecção manual. Nosso Autopilot mapeia o ecossistema, 
                                identifica o fit estratégico e prepara a campanha de contato em um único workflow inteligente.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-slate-200">
                                    <div className="h-2 w-2 bg-orange-500 rounded-full" />
                                    Mapeamento de decisores em tempo real
                                </li>
                                <li className="flex items-center gap-3 text-slate-200">
                                    <div className="h-2 w-2 bg-orange-500 rounded-full" />
                                    Geração de racional estratégico para cada match
                                </li>
                                <li className="flex items-center gap-3 text-slate-200">
                                    <div className="h-2 w-2 bg-orange-500 rounded-full" />
                                    Dashboard de Mission Control para gestão de ativos
                                </li>
                            </ul>
                        </div>
                        <div className="flex-1 relative">
                            <div className="absolute inset-0 bg-orange-600/20 blur-[100px] rounded-full animate-pulse" />
                            <div className="relative bg-slate-800 border border-slate-700 p-8 rounded-[2rem] shadow-2xl">
                                <div className="space-y-4 opacity-50">
                                    <div className="h-4 w-3/4 bg-slate-700 rounded" />
                                    <div className="h-4 w-full bg-slate-700 rounded" />
                                    <div className="h-4 w-1/2 bg-slate-700 rounded" />
                                </div>
                                <div className="mt-8 p-6 bg-slate-900 border border-orange-500/50 rounded-xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Sparkles className="h-5 w-5 text-orange-500" />
                                        <span className="text-xs font-bold uppercase tracking-widest">AI Match Found</span>
                                    </div>
                                    <p className="text-sm font-bold">BioHealth Pharma S.A.</p>
                                    <p className="text-[10px] text-slate-500 uppercase">94% Strategic Fit</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-32 text-center container mx-auto px-4">
                    <h2 className="text-4xl md:text-7xl font-black mb-12">
                        Pronto para liderar a <br />
                        <span className="italic underline decoration-orange-600 underline-offset-8">Próxima Onda</span> de inovação?
                    </h2>
                    <Link href="/register">
                        <Button size="lg" className="bg-white text-slate-950 hover:bg-slate-200 text-2xl h-24 px-16 rounded-[2rem] font-black transition-all hover:scale-105 active:scale-95">
                            Começar Agora
                            <ArrowRight className="ml-2 h-8 w-8" />
                        </Button>
                    </Link>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description, color }: any) {
    return (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] hover:border-orange-500/50 transition-all group">
            <div className={`p-4 bg-orange-500/10 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform`}>
                <Icon className={`h-8 w-8 text-orange-500`} />
            </div>
            <h3 className="text-2xl font-bold mb-4 tracking-tight">{title}</h3>
            <p className="text-slate-400 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
