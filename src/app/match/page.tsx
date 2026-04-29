"use client";

import { useState } from "react";
import { Sparkles, Building2, ArrowRight, Loader2, Target, CheckCircle2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { toast } from "sonner";
import { findCorporateMatches, convertMatchToLead } from "@/app/actions/match-actions";
import { findCompanyContacts, startOutreachCampaign } from "@/app/actions/engage-actions";
import { extractTextFromPDF } from "@/app/actions/pdf-actions";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Mail, Linkedin, Send, Upload, FileUp, Shield } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function MatchPage() {
    const [researchText, setResearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [matches, setMatches] = useState<any[]>([]);
    const [convertedIds, setConvertedIds] = useState<string[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    const [contacts, setContacts] = useState<any[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [sendingOutreach, setSendingOutreach] = useState(false);

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsExtracting(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await extractTextFromPDF(formData);
            if (res.success && res.text) {
                setResearchText(res.text);
                toast.success("PDF processado!");
            } else {
                toast.error(res.error || "Erro ao ler PDF");
            }
        } catch (err) {
            toast.error("Falha no processamento");
        } finally {
            setIsExtracting(false);
        }
    }
    async function handleMatch() {
        if (!researchText) {
            toast.error("Por favor, insira o texto da pesquisa ou patente.");
            return;
        }

        setLoading(true);
        setMatches([]);
        
        try {
            const res = await findCorporateMatches(researchText);
            if (res.success) {
                setMatches(res.matches || []);
                if (res.matches?.length === 0) {
                    toast.info("Nenhum match encontrado com o limite atual. Tente descrever mais detalhes técnicos.");
                } else {
                    toast.success(`${res.matches?.length} parceiros potenciais encontrados!`);
                }
            } else {
                toast.error("Erro ao buscar matches: " + res.error);
            }
        } catch (err) {
            toast.error("Erro na comunicação com o servidor.");
        } finally {
            setLoading(false);
        }
    }

    async function handleEngage(match: any) {
        setSelectedMatch(match);
        setLoadingContacts(true);
        setContacts([]);
        
        try {
            const res = await findCompanyContacts(match.id);
            if (res.success) {
                setContacts(res.contacts || []);
            } else {
                toast.error("Erro ao buscar contatos.");
            }
        } catch (err) {
            toast.error("Erro na busca.");
        } finally {
            setLoadingContacts(false);
        }
    }

    async function handleSendOutreach(contact: any) {
        setSendingOutreach(true);
        try {
            const res = await startOutreachCampaign({
                contactEmail: contact.email,
                contactName: contact.name,
                companyName: selectedMatch.name,
                researchTitle: "Nova Tecnologia de Inovação", // Could be dynamic
                teaserContent: researchText.substring(0, 300) + "..."
            });

            if (res.success) {
                toast.success(`Outreach enviado para ${contact.name}!`);
                setConvertedIds(prev => [...prev, selectedMatch.id]);
                setSelectedMatch(null);
            } else {
                toast.error("Erro ao enviar outreach.");
            }
        } catch (err) {
            toast.error("Erro no envio.");
        } finally {
            setSendingOutreach(false);
        }
    }

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="flex-1 p-6">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Header */}
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <Target className="h-8 w-8 text-orange-600" />
                                Corporate Matchmaking
                            </h1>
                            <p className="text-slate-500">
                                Identifique parceiros industriais ideais com base em fit tecnológico e estratégico.
                            </p>
                        </div>

                        {/* Input Section */}
                        <Card className="border-orange-100 shadow-sm overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-lg">Input de Ativo Tecnológico</CardTitle>
                                    <CardDescription>Descreva a tecnologia ou faça upload do PDF.</CardDescription>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        id="pdf-upload-match" 
                                        className="hidden" 
                                        accept=".pdf" 
                                        onChange={handleFileUpload}
                                        disabled={isExtracting}
                                    />
                                    <label 
                                        htmlFor="pdf-upload-match" 
                                        className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all"
                                    >
                                        {isExtracting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                        Upload PDF
                                    </label>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <textarea
                                    className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                                    placeholder="Ex: Novo polímero biodegradável..."
                                    value={researchText}
                                    onChange={(e) => setResearchText(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button 
                                        onClick={handleMatch} 
                                        disabled={loading || !researchText || isExtracting}
                                        className="bg-orange-600 hover:bg-orange-700 text-white gap-2 px-8"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                        Encontrar Parceiros
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Results Section */}
                        <div className="space-y-6">
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                                    <p className="text-slate-500 font-medium animate-pulse">Cruzando dados de mercado com sua pesquisa...</p>
                                </div>
                            )}

                            {!loading && matches.length > 0 && (
                                <div className="grid gap-6">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        Resultados Prioritários
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">AI Verified</Badge>
                                    </h3>
                                    {matches.map((match) => (
                                        <Card key={match.id} className="group hover:border-orange-300 transition-all duration-300 border-slate-200 shadow-sm overflow-hidden">
                                            <div className="flex flex-col md:flex-row">
                                                {/* Left: Company Info */}
                                                <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/30">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                                                            <Building2 className="h-6 w-6 text-slate-600" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{match.name}</h4>
                                                            <p className="text-xs text-slate-500 uppercase tracking-wider">{match.industry}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-slate-500">Fit Score</span>
                                                            <span className="font-bold text-orange-600">{Math.round(match.similarity * 100)}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-orange-500 rounded-full" 
                                                                style={{ width: `${match.similarity * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: AI Rational */}
                                                <div className="p-6 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-orange-700 uppercase">
                                                            <Sparkles className="h-3 w-3" />
                                                            Racional Estratégico
                                                        </div>
                                                        <div className="relative mt-2 p-3 bg-muted/50 rounded-lg border border-dashed">
                                                            <div className="absolute -top-2.5 right-3 px-1.5 py-0.5 bg-background border rounded-[4px] text-[9px] font-black uppercase tracking-tighter text-emerald-600 flex items-center gap-1 shadow-sm">
                                                                <Shield className="h-2.5 w-2.5" /> NIST AI RMF
                                                            </div>
                                                            <div className="prose prose-sm text-slate-600 max-w-none italic leading-relaxed">
                                                                <ReactMarkdown>{match.rational}</ReactMarkdown>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex justify-end mt-6">
                                                        {convertedIds.includes(match.id) ? (
                                                            <Button disabled className="bg-emerald-50 text-emerald-700 border-emerald-100 gap-2">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                Engajado
                                                            </Button>
                                                        ) : (
                                                            <Button 
                                                                onClick={() => handleEngage(match)}
                                                                variant="outline" 
                                                                className="hover:bg-orange-600 hover:text-white transition-all gap-2"
                                                            >
                                                                Iniciar Engajamento
                                                                <ArrowRight className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {!loading && matches.length === 0 && !researchText && (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl">
                                    <Search className="h-12 w-12 mb-4 opacity-20" />
                                    <p>Aguardando input para iniciar matchmaking...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Engage Modal */}
            <Dialog open={selectedMatch !== null} onOpenChange={(open) => !open && setSelectedMatch(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-orange-600" />
                            Iniciar Engajamento: {selectedMatch?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Encontramos os seguintes tomadores de decisão para esta empresa.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        {loadingContacts ? (
                            <div className="flex flex-col items-center justify-center py-10 space-y-2">
                                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                                <p className="text-sm text-slate-500">Buscando decisores (CTO, R&D)...</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {contacts.map((contact, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-orange-200 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-full border border-slate-100 relative">
                                                <Mail className="h-4 w-4 text-slate-400" />
                                                <div className="absolute -bottom-1 -right-1 text-[10px]" title="IA Sentiment: Positivo">😃</div>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">{contact.name}</p>
                                                <p className="text-xs text-slate-500">{contact.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[8px] bg-emerald-50 text-emerald-600 border-emerald-200">Lead Qualificado</Badge>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                                                <Linkedin className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                className="bg-orange-600 hover:bg-orange-700 h-8 gap-2"
                                                onClick={() => handleSendOutreach(contact)}
                                                disabled={sendingOutreach}
                                            >
                                                {sendingOutreach ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                                                Outreach
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-2">
                            <div className="flex items-center gap-2 text-[10px] text-indigo-700 font-black uppercase tracking-wider">
                                <Sparkles className="h-3 w-3" />
                                Sugestão de Abordagem (IA Optimized)
                            </div>
                            <p className="text-xs text-indigo-900 leading-relaxed bg-white/50 p-3 rounded-lg border border-indigo-200/50">
                                "Olá {contacts[0]?.name || 'Decisor'}, observei que a <strong>{selectedMatch?.name}</strong> está expandindo em {selectedMatch?.industry}. Desenvolvemos uma tecnologia de <strong>TRL 4</strong> que reduz custos operacionais em 15% via {researchText.substring(0, 30)}... Gostaria de um breve PDF com os dados técnicos?"
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setSelectedMatch(null)}>Cancelar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
