"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { createCheckoutSession, createCustomerPortal } from "@/services/stripe";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function BillingPage() {

    // Hardcoded Price ID - Replace with your actual Stripe Price ID
    const PRO_PRICE_ID = "price_H5ggYJDqMN891"; // EXAMPLE

    const handleUpgrade = async () => {
        try {
            await createCheckoutSession(PRO_PRICE_ID);
        } catch (e: any) {
            alert("Erro ao iniciar checkout: " + e.message);
        }
    };

    const handlePortal = async () => {
        try {
            await createCustomerPortal();
        } catch (e: any) {
            alert("Erro ao abrir portal: " + e.message);
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="flex-1 p-6 space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold">Planos e Faturamento</h1>
                        <p className="text-muted-foreground">Gerencie a assinatura da sua organização.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
                        {/* FREE PLAN */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Plano Gratuito</CardTitle>
                                <CardDescription>Para testar e começar.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-3xl font-bold">R$ 0<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
                                <ul className="space-y-2 pt-4">
                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 1 Usuário</li>
                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 100 Mensagens/mês</li>
                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Funil Básico</li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" disabled className="w-full">Plano Atual</Button>
                            </CardFooter>
                        </Card>

                        {/* PRO PLAN */}
                        <Card className="border-primary shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl">Recomendado</div>
                            <CardHeader>
                                <CardTitle>Plano PRO</CardTitle>
                                <CardDescription>Para empresas em crescimento.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-3xl font-bold">R$ 197<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
                                <ul className="space-y-2 pt-4">
                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Usuários Ilimitados</li>
                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> IA + RAG Ilimitado</li>
                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Múltiplos Funis</li>
                                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Automações Avançadas</li>
                                </ul>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2">
                                <Button className="w-full" onClick={handleUpgrade}>Assinar Agora</Button>
                                <Button variant="ghost" size="sm" onClick={handlePortal} className="text-muted-foreground">Gerenciar Assinatura Existente</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
