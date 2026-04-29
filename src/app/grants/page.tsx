"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Landmark, Calendar, DollarSign, ArrowRight, Loader2 } from "lucide-react";
import { searchGrants } from "../actions/grant-actions";
import { toast } from "sonner";

export default function GrantDiscoveryPage() {
    const [topic, setTopic] = useState("");
    const [loading, setLoading] = useState(false);
    const [grants, setGrants] = useState<any[]>([]);

    async function handleSearch() {
        if (!topic) return;
        setLoading(true);
        try {
            const res = await searchGrants(topic);
            if (res.success) {
                setGrants(res.grants);
                toast.success("Editais encontrados!");
            } else {
                toast.error(res.error);
            }
        } catch (err) {
            toast.error("Erro na busca.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="p-8 max-w-5xl mx-auto w-full space-y-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                            <Landmark className="h-4 w-4" />
                            Funding Intelligence
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Grant Discovery</h1>
                        <p className="text-muted-foreground italic text-lg">
                            Monitoramento inteligente de editais de fomento nacionais (**FAPEMIG**, **CNPq**, **FINEP**) e internacionais cruzados com seu portfólio.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Input 
                            placeholder="Sobre o que é sua pesquisa? (ex: Hidrogênio Verde, Bioinsumos...)" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="text-lg h-12"
                        />
                        <Button 
                            onClick={handleSearch}
                            disabled={loading || !topic}
                            className="h-12 px-8 gap-2 bg-indigo-600 hover:bg-indigo-700"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            Buscar Editais
                        </Button>
                    </div>

                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-muted rounded-2xl border" />
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {grants.map((grant, idx) => (
                            <Card key={idx} className="border-indigo-100 shadow-sm hover:shadow-md transition-all">
                                <CardHeader className="pb-2">
                                    <div className="p-2 bg-indigo-50 w-fit rounded-lg text-indigo-600 mb-2">
                                        <Landmark className="h-4 w-4" />
                                    </div>
                                    <CardTitle className="text-lg leading-tight">{grant.nome || grant.name}</CardTitle>
                                    <CardDescription>{grant.agencia || grant.agency}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4 text-sm font-medium">
                                        <div className="flex items-center gap-1 text-emerald-600">
                                            <DollarSign className="h-3 w-3" />
                                            {grant.valor || grant.value}
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-500">
                                            <Calendar className="h-3 w-3" />
                                            {grant.prazo || grant.deadline}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-3">
                                        {grant.justificativa || grant.justification}
                                    </p>
                                    <Button variant="ghost" className="w-full justify-between text-indigo-600 p-0 h-auto hover:bg-transparent hover:text-indigo-700">
                                        Ver Detalhes do Edital
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {!loading && grants.length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed rounded-3xl opacity-50">
                            <Landmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p>Digite seu tópico acima para monitorar editais de fomento abertos.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
