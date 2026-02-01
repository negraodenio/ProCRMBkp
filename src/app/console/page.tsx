import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConsolePage() {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="flex-1 p-6">
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Console</h1>
                            <p className="text-muted-foreground">
                                Logs e debug do sistema
                            </p>
                        </div>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Terminal className="h-5 w-5" />
                                    Logs em Tempo Real
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Play className="h-4 w-4 mr-1" />
                                        Iniciar
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Square className="h-4 w-4 mr-1" />
                                        Parar
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-slate-950 text-green-400 font-mono text-sm p-4 rounded-lg h-96 overflow-auto">
                                    <p>[2026-02-01 20:30:00] Sistema inicializado</p>
                                    <p>[2026-02-01 20:30:01] Conectado ao Supabase</p>
                                    <p>[2026-02-01 20:30:02] Evolution API: Online</p>
                                    <p className="text-muted-foreground">Aguardando novos eventos...</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
