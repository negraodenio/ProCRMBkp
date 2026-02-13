"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode, RefreshCw, LogOut, BookOpen, Bot, Sparkles } from "lucide-react";
import { getQrCode, logoutWhatsApp, getBotStatus, updateBotStatus } from "./actions";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function WhatsAppPage() {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [instanceName, setInstanceName] = useState<string>("");

    const [botActive, setBotActive] = useState(true);
    const [botLoading, setBotLoading] = useState(false);

    // Check status on load
    useEffect(() => {
        handleConnect();
        loadBotStatus();
    }, []);

    const loadBotStatus = async () => {
        const res = await getBotStatus();
        if (res.active !== undefined) {
            setBotActive(res.active);
        }
    };

    // Mock status for now, ideally fetching from API
    // const isConnected = !qrCode && !loading && instanceName;

    const handleConnect = async () => {
        setLoading(true);
        setQrCode(null);
        try {
            const res = await getQrCode();
            if (res.error) {
                toast.error("Erro ao conectar: " + res.error);
            } else if (res.qrcode) {
                setQrCode(res.qrcode);
                setInstanceName(res.instanceName || "");
                toast.success("QR Code gerado! Escaneie agora.");
            } else {
                toast.info("Instância já conectada.");
                setInstanceName(res.instanceName || "Connected");
                if (res.webhookUrl) {
                    console.log("Webhook Active:", res.webhookUrl);
                    // Optional: Show to user as confirmation
                    // toast.success(`Webhook: ${res.webhookUrl}`);
                }
            }
        } catch (e) {
            toast.error("Erro inesperado.");
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("Tem certeza que deseja desconectar?")) return;
        await logoutWhatsApp();
        setQrCode(null);
        setInstanceName("");
        toast.success("Desconectado.");
    }

    const handleBotToggle = async (checked: boolean) => {
        setBotLoading(true);
        try {
            const res = await updateBotStatus(checked);
            if (res.error) {
                toast.error("Erro ao atualizar robô: " + res.error);
            } else {
                setBotActive(checked);
                toast.success(checked ? "Robô ativado!" : "Robô pausado.");
            }
        } catch (e) {
            toast.error("Erro na comunicação.");
        } finally {
            setBotLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64 transition-all duration-300 ease-in-out">
                <Header />
                <main className="flex-1 p-8 max-w-5xl mx-auto w-full">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">WhatsApp</h1>
                            <p className="text-muted-foreground mt-1">Gerencie sua conexão e treine sua IA.</p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border shadow-sm">
                            <div className={`h-2.5 w-2.5 rounded-full ${instanceName ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                            <span className="text-sm font-medium text-muted-foreground">
                                {instanceName ? 'Online' : 'Desconectado'}
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-12">

                        {/* Connection Card (Main) */}
                        <div className="md:col-span-8">
                            <Card className="h-full border-0 shadow-xl shadow-primary/5 ring-1 ring-border overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <QrCode className="h-5 w-5 text-indigo-600" />
                                        Conexão
                                    </CardTitle>
                                    <CardDescription>
                                        Escaneie o QR Code para conectar seu número.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-muted/20">

                                    {!qrCode && !loading && !instanceName && (
                                        <div className="text-center space-y-6 max-w-sm animate-in fade-in zoom-in duration-500">
                                            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                                <QrCode className="h-8 w-8 text-primary" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-foreground">Nenhuma conexão ativa</h3>
                                            <p className="text-muted-foreground">
                                                Clique no botão abaixo para gerar um novo QR Code e conectar seu WhatsApp.
                                            </p>
                                            <Button onClick={handleConnect} size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                                                Gerar QR Code
                                            </Button>
                                        </div>
                                    )}

                                    {loading && (
                                        <div className="flex flex-col items-center animate-pulse gap-4">
                                            <div className="p-4 rounded-full bg-primary/10">
                                                <RefreshCw className="h-10 w-10 animate-spin text-primary" />
                                            </div>
                                            <p className="text-sm font-medium text-muted-foreground">Iniciando Evolution API...</p>
                                        </div>
                                    )}

                                    {qrCode && (
                                        <div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-300">
                                            <div className="relative group">
                                                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                                <div className="relative bg-background p-2 rounded-xl border shadow-sm">
                                                    <img src={qrCode} alt="QR Code" width={260} height={260} className="rounded-lg" />
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground text-center max-w-[250px]">
                                                Abra o WhatsApp &gt; Configurações &gt; Aparelhos Conectados &gt; Conectar
                                            </p>
                                            <Button variant="outline" onClick={handleConnect} size="sm">
                                                <RefreshCw className="mr-2 h-3.5 w-3.5" /> Atualizar Code
                                            </Button>
                                        </div>
                                    )}

                                    {instanceName && !qrCode && (
                                        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                                            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2 ring-8 ring-green-50">
                                                <div className="bg-green-500 p-2 rounded-full">
                                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-foreground">Tudo conectado!</h3>
                                                <p className="text-muted-foreground mt-2">
                                                    Instância: <span className="font-mono bg-muted px-2 py-1 rounded text-foreground text-xs">{instanceName}</span>
                                                </p>
                                            </div>
                                            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDisconnect}>
                                                <LogOut className="mr-2 h-4 w-4" /> Desconectar
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* RAG / Actions Column */}
                        <div className="md:col-span-4 flex flex-col gap-6">

                            {/* Knowledge Base Card (Prominent) */}
                            <Link href="/whatsapp/knowledge" className="group">
                                <Card className="border-0 shadow-lg shadow-blue-100 hover:shadow-xl hover:shadow-blue-200 transition-all duration-300 ring-1 ring-blue-100 cursor-pointer overflow-hidden relative h-full">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all" />

                                    <CardHeader>
                                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-2 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                                            <BookOpen className="h-6 w-6 text-white" />
                                        </div>
                                        <CardTitle className="text-blue-900">Base de Conhecimento</CardTitle>
                                        <CardDescription className="text-blue-700/70">
                                            Treine sua IA com PDFs e textos da sua empresa.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                                            Acessar RAG <div className="ml-1">→</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            {/* Bot AI Control Card */}
                            <Card className="border-0 shadow-lg shadow-indigo-100 ring-1 ring-indigo-100 overflow-hidden relative">
                                <div className={`absolute top-0 left-0 w-full h-1 ${botActive ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Bot className="h-5 w-5 text-indigo-600" />
                                            Status da IA
                                        </CardTitle>
                                        <Switch
                                            checked={botActive}
                                            onCheckedChange={handleBotToggle}
                                            disabled={botLoading}
                                        />
                                    </div>
                                    <CardDescription>
                                        Controle se o robô deve responder automaticamente.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
                                        botActive
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            : 'bg-orange-50 text-orange-700 border border-orange-100'
                                    }`}>
                                        <Sparkles className={`h-4 w-4 ${botActive ? 'animate-pulse' : ''}`} />
                                        {botActive ? 'Robô Ativo' : 'Robô Pausado'}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Info Card */}
                            <Card className="border-0 shadow-md ring-1 ring-border">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base text-muted-foreground">Detalhes</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center text-sm border-b pb-2">
                                        <span className="text-slate-500">API</span>
                                        <span className="font-mono text-slate-700">Evolution v2</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b pb-2">
                                        <span className="text-slate-500">Webhook</span>
                                        <span className="text-emerald-600 font-medium">Ativo</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Porta</span>
                                        <span className="font-mono text-slate-700">3001</span>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
