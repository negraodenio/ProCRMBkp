"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, CheckCircle2, BookOpen, Microscope, GraduationCap, Hash, FlaskConical, ArrowRight } from "lucide-react";
import { syncLattesProfile } from "../actions/lattes-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function LattesSyncPage() {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    async function handleSync() {
        if (!name) return;
        setLoading(true);
        setResult(null);
        
        try {
            const res = await syncLattesProfile(name);
            if (res.success) {
                setResult(res.stats);
                toast.success(res.message);
            } else {
                toast.error(res.error);
            }
        } catch (err) {
            toast.error("Erro na conexão.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="p-8 max-w-4xl mx-auto w-full space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Sincronização Lattes</h1>
                        <p className="text-muted-foreground italic">Mapeamento automatizado de ativos de inovação diretamente da base CNPq.</p>
                    </div>

                    <Card className="border-primary/20 shadow-lg shadow-primary/5">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Search className="h-5 w-5 text-primary" />
                                Buscar Pesquisador
                            </CardTitle>
                            <CardDescription>
                                Digite o nome completo do pesquisador para importar suas publicações e patentes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <Input 
                                    placeholder="Ex: José Carlos Silva, Maria Helena Costa..." 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSync()}
                                    className="text-lg h-12"
                                />
                                <Button 
                                    onClick={handleSync}
                                    disabled={loading || !name}
                                    className="h-12 px-8 gap-2"
                                >
                                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                    Sincronizar
                                </Button>
                            </div>

                            {loading && (
                                <div className="py-12 flex flex-col items-center gap-4">
                                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '70%' }} />
                                    </div>
                                    <p className="text-xs font-bold text-primary uppercase tracking-widest">Processando perfil acadêmico via IA...</p>
                                </div>
                            )}

                            {result && (
                                <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <StatsCard icon={BookOpen} label="Publicações" value={result.publicationsFound} color="blue" />
                                    <StatsCard icon={Microscope} label="Patentes" value={result.patentsIdentified} color="orange" />
                                    <StatsCard icon={Hash} label="Índice-H" value={result.hIndex} color="emerald" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {result && (
                        <>
                            <Card className="border-indigo-200">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                                        <h3 className="font-bold text-lg">Detalhes do Perfil</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold">Departamento</p>
                                            <p className="font-medium">{result.department}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold">Última Atualização</p>
                                            <p className="font-medium">{result.lastUpdate}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-2">Expertises Identificadas</p>
                                        <div className="flex gap-2 flex-wrap">
                                            {(result.expertise || []).map((e: string) => (
                                                <span key={e} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                                                    {e}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex items-start gap-4">
                                <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <h4 className="font-bold text-emerald-900">Mapeamento Concluído</h4>
                                    <p className="text-sm text-emerald-700">
                                        As publicações identificadas foram indexadas no Neural Engine. 
                                        Agora você pode usar o <strong>Matchmaking</strong> para encontrar empresas interessadas nestas pesquisas.
                                    </p>
                                    <Link href="/match">
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-2 mt-2">
                                            <FlaskConical className="h-4 w-4" />
                                            Ir para Matchmaking
                                            <ArrowRight className="h-3 w-3" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

function StatsCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className={cn(
            "p-6 rounded-2xl border flex flex-col gap-2",
            color === "blue" && "bg-blue-50 border-blue-100 text-blue-700",
            color === "orange" && "bg-orange-50 border-orange-100 text-orange-700",
            color === "emerald" && "bg-emerald-50 border-emerald-100 text-emerald-700"
        )}>
            <Icon className="h-5 w-5 opacity-70" />
            <div className="text-3xl font-black">{value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</div>
        </div>
    );
}
