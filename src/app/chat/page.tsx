import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="flex-1 p-6">
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Conversas</h1>
                            <p className="text-muted-foreground">
                                Central de conversas com clientes
                            </p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Inbox
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-96 flex items-center justify-center">
                                <p className="text-muted-foreground">
                                    Nenhuma conversa ativa. Conecte o WhatsApp para começar.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
