"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { createCheckoutSession, createCustomerPortal } from "@/services/stripe";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface BillingContentProps {
    subscription: any;
}

export function BillingContent({ subscription }: BillingContentProps) {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        try {
            setLoading(true);
            await createCheckoutSession(); // Uses env var on server
        } catch (e: any) {
            toast.error("Erro ao iniciar checkout: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePortal = async () => {
        try {
            setLoading(true);
            await createCustomerPortal();
        } catch (e: any) {
            toast.error("Erro ao abrir portal: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper to check if current plan
    const isPlan = (plan: string) => (subscription?.subscription_plan || 'free') === plan;
    const isPro = isPlan('pro') || isPlan('premium'); // simplistic check

    return (
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            {/* STARTER PLAN */}
            <Card className={!isPro ? "border-blue-500 shadow-md transform scale-105 transition-all" : "opacity-80"}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle>Plano Starter</CardTitle>
                        {!isPro && <Badge>Atual</Badge>}
                    </div>
                    <CardDescription>O início da sua automação.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-3xl font-bold">R$ 29<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
                    <ul className="space-y-2 pt-4 text-sm">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Até 200 leads ativos</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 1 conexão WhatsApp</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Robô IA ATIVO</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Personalidade configurável</li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" disabled={!isPro} className="w-full">
                        {!isPro ? "Plano Ativo" : "Downgrade disponível via suporte"}
                    </Button>
                </CardFooter>
            </Card>

            {/* PRO PLAN */}
            <Card className={isPro ? "border-primary shadow-lg relative overflow-hidden transform scale-105 transition-all" : "border-slate-200"}>
                {isPro && <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl">Ativo</div>}
                <CardHeader>
                    <CardTitle>Plano PRO</CardTitle>
                    <CardDescription>Para escala e multi-atendimento.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-3xl font-bold">R$ 49<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
                    <ul className="space-y-2 pt-4 text-sm">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Chatep IA + RAG (Documentos)</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Mensagens Automáticas de Status</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Usuários Ilimitados</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Dashboard Analytics Avançado</li>
                    </ul>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    {isPro ? (
                        <Button className="w-full" variant="outline" onClick={handlePortal} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Gerenciar Assinatura
                        </Button>
                    ) : (
                        <Button className="w-full" onClick={handleUpgrade} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Upgrade para PRO
                        </Button>
                    )}

                    {!isPro && subscription?.stripe_customer_id && (
                        <Button variant="ghost" size="sm" onClick={handlePortal} className="text-muted-foreground w-full">
                             Faturas / Histórico
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
