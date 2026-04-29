"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Sparkles, Target, Users, Mail, Loader2, CheckCircle2, ChevronRight, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { toast } from "sonner";
import { generateAIContent } from "@/app/actions/ai-actions";
import { findCorporateMatches } from "@/app/actions/match-actions";
import { findCompanyContacts } from "@/app/actions/engage-actions";
import { createOutreachCampaign } from "@/app/actions/outreach-actions";
import { extractTextFromPDF } from "@/app/actions/pdf-actions";
import { cn } from "@/lib/utils";
import { Upload, FileUp } from "lucide-react";

export default function AutopilotPage() {
    const router = useRouter();
    const [step, setStep] = useState(0); // 0: Input, 1: Processing, 2: Result
    const [inputText, setInputText] = useState("");
    const [status, setStatus] = useState("");
    const [progress, setProgress] = useState(0);
    const [isExtracting, setIsExtracting] = useState(false);
    
    const [results, setResults] = useState<{
        teaser: string;
        matches: any[];
        contactsCount: number;
    } | null>(null);

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsExtracting(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await extractTextFromPDF(formData);
            if (res.success && res.text) {
                setInputText(res.text);
                toast.success("PDF processado com sucesso!");
            } else {
                toast.error(res.error || "Erro ao ler PDF");
            }
        } catch (err) {
            toast.error("Falha no processamento");
        } finally {
            setIsExtracting(false);
        }
    }
    async function runAutopilot() {
        if (!inputText) return;
        
        setStep(1);
        setProgress(10);
        
        try {
            // STEP 1: Generate Teaser
            setStatus("Gerando Teaser de Mercado...");
            const teaserRes = await generateAIContent("science-teaser", undefined, inputText);
            if (!teaserRes.success) throw new Error("Falha ao gerar teaser");
            setProgress(40);

            // STEP 2: Find Matches
            setStatus("Identificando Parceiros Corporativos...");
            const matchRes = await findCorporateMatches(inputText);
            if (!matchRes.success) throw new Error("Falha no matchmaking");
            setProgress(70);

            // STEP 3: Find Contacts for Top Matches
            setStatus("Mapeando Decisores (CTO/Innovation)...");
            let contactsCount = 0;
            if (matchRes.matches && matchRes.matches.length > 0) {
                const contactRes = await findCompanyContacts(matchRes.matches[0].id);
                contactsCount = contactRes.contacts?.length || 0;
            }
            setProgress(100);

            setResults({
                teaser: teaserRes.result,
                matches: matchRes.matches || [],
                contactsCount
            });
            setStep(2);
            toast.success("Campanha Autopilot pronta!");

        } catch (err: any) {
            toast.error(err.message);
            setStep(0);
        }
    }

    return (
        <div className="flex min-h-screen bg-slate-900 text-white">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="flex-1 p-8 flex flex-col items-center justify-center">
                    <div className="max-w-4xl w-full space-y-12">
                        
                        {/* STEP 0: Input */}
                        {step === 0 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-xs font-bold uppercase tracking-widest">
                                        <Zap className="h-3 w-3" />
                                        Alpha Feature
                                    </div>
                                    <h1 className="text-5xl font-black tracking-tight">Outbound Autopilot</h1>
                                    <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                                        Cole sua patente ou artigo. A IA gerará a campanha, encontrará os parceiros e mapeará os decisores em segundos.
                                    </p>
                                </div>

                                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl shadow-2xl overflow-hidden">
                                    <div className="p-4 bg-slate-800 border-b border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-orange-500" />
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ativo Tecnológico</span>
                                            </div>
                                            <div className="h-4 w-[1px] bg-slate-700 hidden md:block" />
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-slate-500 font-bold uppercase">Polo/Depto:</span>
                                                <select className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] font-bold text-orange-400 outline-none focus:border-orange-500 transition-colors">
                                                    <option>Geral (NIT UFV)</option>
                                                    <option>Biotecnologia</option>
                                                    <option>Engenharias</option>
                                                    <option>Ciências Agrárias</option>
                                                    <option>Saúde e Biológicas</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[9px] border-orange-500/30 text-orange-400 bg-orange-500/5 px-2 py-0">
                                                Self-Service RAG Active
                                            </Badge>
                                            <div className="relative">
                                                <input 
                                                    type="file" 
                                                    id="pdf-upload" 
                                                    className="hidden" 
                                                    accept=".pdf" 
                                                    onChange={handleFileUpload}
                                                    disabled={isExtracting}
                                                />
                                                <label 
                                                    htmlFor="pdf-upload" 
                                                    className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                                >
                                                    {isExtracting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                                    Configurar Cérebro (Upload)
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 space-y-4">
                                        <textarea 
                                            className="w-full h-64 bg-transparent border-none text-slate-200 text-lg placeholder:text-slate-600 outline-none resize-none"
                                            placeholder="Cole aqui o texto técnico ou faça o upload do PDF..."
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                        />
                                        <div className="flex justify-center pt-4">
                                            <Button 
                                                onClick={runAutopilot}
                                                disabled={!inputText || isExtracting}
                                                className="bg-orange-600 hover:bg-orange-700 text-white h-16 px-12 rounded-2xl text-xl font-bold gap-3 shadow-xl shadow-orange-600/20 transition-all hover:scale-105 active:scale-95"
                                            >
                                                <Zap className="h-6 w-6 fill-current" />
                                                Iniciar Autopilot
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* STEP 1: Processing */}
                        {step === 1 && (
                            <div className="space-y-12 text-center animate-in fade-in zoom-in duration-500">
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 animate-pulse" />
                                    <Loader2 className="h-24 w-24 text-orange-500 animate-spin relative z-10 mx-auto" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-bold">{status}</h2>
                                    <div className="max-w-md mx-auto h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-orange-600 to-amber-400 transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-slate-500 text-sm">Acelerando o desenvolvimento de negócios via IA...</p>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Result Summary */}
                        {step === 2 && results && (
                            <div className="space-y-8 animate-in fade-in zoom-in duration-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-bold flex items-center gap-3">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                        Campanha Gerada
                                    </h2>
                                    <Button variant="outline" className="border-slate-700 hover:bg-slate-800" onClick={() => setStep(0)}>
                                        Nova Pesquisa
                                    </Button>
                                </div>

                                <div className="grid gap-6 md:grid-cols-3">
                                    <Card className="bg-slate-800/50 border-slate-700 p-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="p-3 bg-blue-500/10 rounded-xl w-fit text-blue-500">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-black uppercase tracking-tighter">
                                                TRL 4 - Protótipo
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Teaser</p>
                                            <p className="text-lg font-bold">Resumo Executivo</p>
                                            <p className="text-xs text-slate-500 mt-2 line-clamp-3">{results.teaser}</p>
                                        </div>
                                        <Button variant="link" className="text-blue-400 p-0 h-auto text-xs" onClick={() => router.push('/ai-tools')}>Ver completo <ChevronRight className="h-3 w-3" /></Button>
                                    </Card>

                                    <Card className="bg-slate-800/50 border-slate-700 p-6 space-y-4">
                                        <div className="p-3 bg-orange-500/10 rounded-xl w-fit text-orange-500">
                                            <Target className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Matches</p>
                                            <p className="text-lg font-bold">{results.matches.length} Empresas</p>
                                            <p className="text-xs text-slate-500 mt-2">Identificadas com fit tecnológico.</p>
                                        </div>
                                        <Button variant="link" className="text-orange-400 p-0 h-auto text-xs" onClick={() => router.push('/match')}>Ver empresas <ChevronRight className="h-3 w-3" /></Button>
                                    </Card>

                                    <Card className="bg-slate-800/50 border-slate-700 p-6 space-y-4">
                                        <div className="p-3 bg-purple-500/10 rounded-xl w-fit text-purple-500">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Outreach</p>
                                            <p className="text-lg font-bold">{results.contactsCount} Decisores</p>
                                            <p className="text-xs text-slate-500 mt-2">Prontos para contato imediato.</p>
                                        </div>
                                        <Button variant="link" className="text-purple-400 p-0 h-auto text-xs" onClick={() => router.push('/outreach')}>Iniciar envio <ChevronRight className="h-3 w-3" /></Button>
                                    </Card>

                                    <Card className="bg-slate-800/50 border-slate-700 p-6 space-y-4 md:col-span-3 border-dashed border-indigo-500/30">
                                        <div className="flex justify-between items-start">
                                            <div className="p-3 bg-indigo-500/10 rounded-xl w-fit text-indigo-400">
                                                <Sparkles className="h-6 w-6" />
                                            </div>
                                            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">GTM AI-Generated</Badge>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Market Strategy Report</p>
                                                <h3 className="text-xl font-bold">Plano Go-To-Market</h3>
                                                <p className="text-sm text-slate-400">
                                                    Análise estratégica de penetraçío baseada em 128 competidores globais e mapeamento de nichos FAPEMIG/FINEP.
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Pricing Sugerido</p>
                                                    <p className="text-sm font-bold text-emerald-400">R$ 150K - 400K</p>
                                                </div>
                                                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Potencial Market Share</p>
                                                    <p className="text-sm font-bold text-blue-400">12% (3 anos)</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 gap-2 mt-4" onClick={() => { window.print(); toast.success('Relatório enviado para impressío.'); }}>
                                            <Download className="h-4 w-4" />
                                            Baixar Relatório Estratégico Completo (PDF)
                                        </Button>
                                    </Card>
                                </div>

                                <div className="flex justify-center pt-8">
                                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 h-14 rounded-xl font-bold gap-2" onClick={async () => {
                                        toast.loading('Criando campanha de outreach...');
                                        const res = await createOutreachCampaign({ name: `Campanha: ${inputText.substring(0, 50)}`, targetTechnology: 'Autopilot' });
                                        toast.dismiss();
                                        if (res.success) { toast.success('Campanha criada! Redirecionando...'); router.push('/outreach'); }
                                        else { toast.error(res.error || 'Falha ao criar campanha'); }
                                    }}>
                                        <Mail className="h-5 w-5" />
                                        Disparar Campanha Sequencial
                                    </Button>
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}
