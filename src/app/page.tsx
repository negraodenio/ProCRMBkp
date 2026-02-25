import { headers } from "next/headers";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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
                <section className="container mx-auto px-4 py-24">
                    <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-purple-600 to-indigo-600" />

                        <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-black leading-tight">
                                11 IA Tools. 0 Alucinações. <br />
                                <span className="text-primary italic">1 CRM Que Pensa Por Si.</span>
                            </h2>

                            <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
                                Comece grátis em 2 minutos. Sem cartão. Sem compromisso.
                                Com inteligência artificial real que traz resultados medíveis.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                                <Link href="/register">
                                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-xl h-16 px-12 shadow-2xl shadow-primary/40 transition-all hover:scale-105">
                                        Começar Grátis Agora
                                        <ArrowRight className="ml-2 h-6 w-6" />
                                    </Button>
                                </Link>
                                <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-white/5 text-xl h-16 px-12">
                                    Agendar Demo de 15 min
                                </Button>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pt-10 border-t border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span>14 dias grátis no Pro</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span>Sem cartão de crédito</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span>Cancele quando quiser</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span>RGPD Compliant</span>
                                </div>
                            </div>
                        </div>

                        {/* Decorative blur elements */}
                        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
                        <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]" />
                    </div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}
