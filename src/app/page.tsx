import { headers } from "next/headers";
import { ArrowRight, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Custom Landing Components
import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { MetricsBar } from "@/components/landing/metrics-bar";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { AIToolsShowcase } from "@/components/landing/ai-tools-showcase";
import { CoreFeatures } from "@/components/landing/core-features";
import { ComparisonTable } from "@/components/landing/comparison-table";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQSection } from "@/components/landing/faq-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default async function LandingPage() {
    const headersList = await headers();
    const country = headersList.get("x-vercel-ip-country") || "PT";
    const isBR = country === "BR";

    const currency = isBR ? "R$" : "€";
    const prices = {
        starter: isBR ? "129" : "29",
        pro: isBR ? "349" : "79",
        enterprise: "Custom",
    };

    return (
        <div className="min-h-screen bg-white">
            <LandingHeader />

            <main>
                <HeroSection />

                <MetricsBar />

                <ProblemSolution />

                <AIToolsShowcase />

                <CoreFeatures />

                <ComparisonTable />

                <PricingSection currency={currency} prices={prices} />

                <FAQSection />

                {/* Final CTA Section */}
                <section className="container mx-auto px-4 py-32">
                    <div className="bg-slate-950 rounded-[4rem] p-16 md:p-32 text-center text-white relative overflow-hidden group border border-white/5 shadow-[0_50px_100px_-20px_rgba(79,70,229,0.2)]">
                        {/* Background mesh */}
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]" />
                            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[120px]" />
                        </div>

                        <div className="relative z-10 space-y-10 max-w-5xl mx-auto">
                            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">
                                Liderança Tecnológica em Inovação
                            </div>

                            <h2 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter">
                                Eleve o Impacto da Sua <br />
                                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent italic">
                                    Instituição.
                                </span>
                            </h2>

                            <p className="text-xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed">
                                Junte-se à elite das universidades que utilizam inteligência artificial para transformar pesquisa em progresso industrial e soberania nacional.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
                                <Link href="/register">
                                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xl h-20 px-16 rounded-2xl shadow-2xl shadow-indigo-600/40 transition-all hover:scale-105 active:scale-95 font-black uppercase tracking-widest">
                                        Solicitar Acesso Master
                                        <ArrowRight className="ml-3 h-7 w-7" />
                                    </Button>
                                </Link>
                                <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 text-xl h-20 px-16 rounded-2xl backdrop-blur-md font-bold">
                                    Agendar Consultoria Técnica
                                </Button>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 pt-16 border-t border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-indigo-500" />
                                    <span>NIST & LGPD COMPLIANT</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    <span>AUDITORIA HMAC-SHA256</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    <span>CONFORMIDADE EDITAL 56467</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    <span>SOBERANIA DE DADOS NACIONAL</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}
