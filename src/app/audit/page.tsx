"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, Hash, Clock, FileText, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { maskPII } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

const AUDIT_LOGS = [
    {
        id: "AL-89234",
        action: "Matchmaking Gerado",
        user: "Senior Tester",
        timestamp: "2026-04-29 14:22:15",
        target: "Patente Grafeno V2 -> Natura &Co",
        hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        verified: true
    },
    {
        id: "AL-89233",
        action: "Relatório TRL Exportado",
        user: "Admin UFV",
        timestamp: "2026-04-29 13:05:42",
        target: "Relatório de Maturidade - Bio-Polímeros",
        hash: "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce",
        verified: true
    },
    {
        id: "AL-89232",
        action: "Acesso a Dados Sensíveis",
        user: "Senior Tester",
        timestamp: "2026-04-29 11:15:00",
        target: "Visualização de E-mail: Dr. Ricardo Almeida",
        hash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
        verified: true
    }
];

export default function AuditPage() {
    const [privacyMode, setPrivacyMode] = useState(true);

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="p-8 max-w-6xl mx-auto w-full space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trilha de Auditoria</h1>
                            <p className="text-muted-foreground italic">
                                Registro imutável de operações assinado com protocolo **HMAC-SHA256** para conformidade com o Processo 56467.
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-2 h-10 px-4">
                                <ShieldCheck className="h-4 w-4" />
                                Integridade Verificada (100%)
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
                                <div className="text-xl font-bold">Hash Chaining</div>
                                <p className="text-xs text-muted-foreground mt-1">Cada log referencia o hash anterior.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Retenção LGPD
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">5 Anos</div>
                                <p className="text-xs text-muted-foreground mt-1">Conforme normativa da FUNARBE.</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-lg">Registros de Conformidade</CardTitle>
                            <CardDescription>Eventos críticos assinados digitalmente pelo Neural Engine.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-y">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-medium text-slate-500">ID / Timestamp</th>
                                            <th className="px-6 py-3 text-left font-medium text-slate-500">Ação / Usuário</th>
                                            <th className="px-6 py-3 text-left font-medium text-slate-500">Objeto / Alvo</th>
                                            <th className="px-6 py-3 text-left font-medium text-slate-500">Assinatura Digital (Hash)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {AUDIT_LOGS.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900">{log.id}</div>
                                                    <div className="text-[10px] text-muted-foreground">{log.timestamp}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900">{log.action}</div>
                                                    <div className="text-xs text-indigo-600">
                                                        {privacyMode ? maskPII(log.user) : log.user}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs font-mono text-slate-600">
                                                        {privacyMode ? maskPII(log.target) : log.target}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-slate-100 p-2 rounded font-mono text-[9px] text-slate-400 break-all max-w-[150px]">
                                                            {log.hash.substring(0, 32)}...
                                                        </div>
                                                        {log.verified && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-indigo-600 rounded-xl p-8 text-white flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FileText className="h-6 w-6" />
                                Exportar Relatório de Auditoria
                            </h3>
                            <p className="opacity-80 text-sm">Gere um PDF assinado com todos os registros para prestação de contas à FUNARBE.</p>
                        </div>
                        <button className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors">
                            Gerar Relatório PDF
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}
