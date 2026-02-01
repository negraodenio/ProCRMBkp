"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode, RefreshCw, LogOut } from "lucide-react";
import { getQrCode, logoutWhatsApp } from "./actions";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function WhatsAppPage() {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [instanceName, setInstanceName] = useState<string>("");

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
                toast.info("Instância já conectada ou aguardando.");
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
        toast.success("Desconectado.");
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="flex-1 p-6">
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold">WhatsApp Connection</h1>
                            <p className="text-muted-foreground">
                                Conecte seu CRM ao WhatsApp para automação e chat.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <QrCode className="h-6 w-6" />
                                        Conectar Nova Instância
                                    </CardTitle>
                                    <CardDescription>
                                        Escaneie o QR Code com seu celular (WhatsApp Web)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
                                    {!qrCode && !loading && (
                                        <div className="text-center space-y-4">
                                            <p className="text-sm text-muted-foreground max-w-xs">
                                                Clique abaixo para gerar um novo QR Code. Certifique-se de que a API Evolution esteja rodando.
                                            </p>
                                            <Button onClick={handleConnect} size="lg">
                                                Gerar QR Code
                                            </Button>
                                        </div>
                                    )}

                                    {loading && (
                                        <div className="flex flex-col items-center animate-pulse gap-2">
                                            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                                            <p className="text-sm text-muted-foreground">Contactando Evolution API...</p>
                                        </div>
                                    )}

                                    {qrCode && (
                                        <div className="flex flex-col items-center space-y-4">
                                            <div className="border-4 border-white shadow-lg rounded-lg overflow-hidden">
                                                <img src={qrCode} alt="QR Code" width={280} height={280} />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Instância: <span className="font-mono">{instanceName}</span>
                                            </p>
                                            <Button variant="outline" onClick={handleConnect}>
                                                <RefreshCw className="mr-2 h-4 w-4" /> Atualizar Code
                                            </Button>
                                            <Button variant="destructive" onClick={handleDisconnect}>
                                                <LogOut className="mr-2 h-4 w-4" /> Desconectar
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Status da Conexão</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                                            <span className="text-sm font-medium">API Status</span>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Online</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                                            <span className="text-sm font-medium">Webhook</span>
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Configurado</span>
                                        </div>
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
