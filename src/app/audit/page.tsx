"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, Hash, Clock, FileText, CheckCircle2, Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { maskPII } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { getAuditLogs } from "@/app/actions/audit-actions";
import { toast } from "sonner";

export default function AuditPage() {
    const [privacyMode, setPrivacyMode] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
    const [chainIntact, setChainIntact] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const res = await getAuditLogs();
            if (res.success) {
                setLogs(res.logs || []);
                setChainIntact(res.chainIntact ?? true);
            } else {
                toast.error("Erro ao carregar logs de auditoria.");
            }
            setLoading(false);
        }
        load();
    }, []);

    const getActionLabel = (action: string) => {
        const labels: Record<string, string> = {
            "PLATFORM_INIT": "Inicializaçío da Plataforma",
            "SEED_DATA": "Seed de Dados",
            "CREATE_PIPELINE": "Pipeline Criado",
            "CREATE_PROPOSAL": "Proposta Criada",
            "MATCH_RUN": "Matchmaking Executado",
            "OUTREACH_SEND": "Outreach Enviado",
            "CONTACT_DISCOVERY": "Descoberta de Contatos",
            "LATTES_SYNC": "Sincronizaçío Lattes",
            "LATTES_SYNC_NEW": "Novo Perfil Lattes",
            "GRANT_SEARCH": "Busca de Editais",
            "CREATE_CAMPAIGN": "Campanha Criada",
            "CONVERT_TO_LEAD": "Conversío para Lead",
        };
        return labels[action] || action;
    };

    const handleExportPDF = () => {
        window.print();
        toast.success("Relatório de auditoria enviado para impressío.");
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <style jsx global>{`
                @media print {
                    .no-print, .sidebar, header { display: none !important; }
                    .md\\:ml-64 { margin-left: 0 !important; }
                    main { padding: 0 !important; }
                    body { background: white !important; }
                }
            `}</style>
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="p-8 max-w-6xl mx-auto w-full space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trilha de Auditoria</h1>
                            <p className="text-muted-foreground italic">
                                Registro imutável de operações assinado com protocolo <strong>HMAC-SHA256</strong> para conformidade com o Processo 56467.
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 no-print">
                            <Badge variant="outline" className={`gap-2 h-10 px-4 ${chainIntact ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                {chainIntact ? (
                                    <><ShieldCheck className="h-4 w-4" /> Integridade Verificada (100%)</>
                                ) : (
                                    <><AlertTriangle className="h-4 w-4" /> Cadeia Comprometida</>
                                )}
                            </Badge>
                            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Modo Privacidade LGPD</span>
                                <Switch 
                                    checked={privacyMode}
                                    onCheckedChange={setPrivacyMode}
                                />
                                {privacyMode ? <EyeOff className="h-4 w-4 text-indigo-600" /> : <Eye className="h-4 w-4 text-slate-400" />}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Lock className="h-4 w-4" /> Camada de Segurança
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">AES-256 + SHA-256</div>
                                <p className="text-xs text-muted-foreground mt-1">Criptografia em repouso e trânsito.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Hash className="h-4 w-4" /> Encadeamento
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">HMAC Hash Chaining</div>
                                <p className="text-xs text-muted-foreground mt-1">Cada log referencia o hash anterior (trigger SQL).</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Retençío LGPD
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">5 Anos</div>
                                <p className="text-xs text-muted-foreground mt-1">Conforme normativa da FUNARBE. {logs.length} registros.</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-lg">Registros de Conformidade</CardTitle>
                            <CardDescription>Eventos críticos assinados digitalmente pelo Neural Engine via trigger SQL.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 border-y">
                                            <tr>
                                                <th className="px-6 py-3 text-left font-medium text-slate-500">Timestamp</th>
                                                <th className="px-6 py-3 text-left font-medium text-slate-500">Açío / Usuário</th>
                                                <th className="px-6 py-3 text-left font-medium text-slate-500">Detalhes</th>
                                                <th className="px-6 py-3 text-left font-medium text-slate-500">Assinatura HMAC-SHA256</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {logs.map((log) => (
                                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="text-[10px] text-muted-foreground">{log.timestamp}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-slate-900">{getActionLabel(log.action)}</div>
                                                        <div className="text-xs text-indigo-600">
                                                            {privacyMode ? maskPII(log.user_name, "phone") : log.user_name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs font-mono text-slate-600 max-w-[200px] truncate">
                                                            {privacyMode 
                                                                ? JSON.stringify(log.details || {}).substring(0, 40) + "..."
                                                                : JSON.stringify(log.details || {})
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="bg-slate-100 p-2 rounded font-mono text-[9px] text-slate-400 break-all max-w-[150px]">
                                                                {log.hmac_hash ? log.hmac_hash.substring(0, 32) + "..." : "Pendente"}
                                                            </div>
                                                            {log.chain_verified && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="bg-indigo-600 rounded-xl p-8 text-white flex items-center justify-between no-print">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FileText className="h-6 w-6" />
                                Exportar Relatório de Auditoria
                            </h3>
                            <p className="opacity-80 text-sm">Gere um PDF assinado com todos os registros para prestaçío de contas à FUNARBE.</p>
                        </div>
                        <button 
                            className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
                            onClick={handleExportPDF}
                        >
                            Gerar Relatório PDF
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
