"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Sparkles } from "lucide-react";
import { createCheckoutSession, createCustomerPortal } from "@/services/stripe";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

import { Progress } from "@/components/ui/progress";
import { PLANS, PlanLevel } from "@/lib/stripe/plans";

interface BillingContentProps {
    subscription: any;
    usage: {
        leads: number;
        users: number;
        ia_tools: number;
    };
    user: {
        email: string;
        name: string;
    };
}

export function BillingContent({ subscription, usage, user }: BillingContentProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const currentPlanSlug = (subscription?.subscription_plan || 'free') as PlanLevel;
    const currentPlan = PLANS[currentPlanSlug];

    const handleUpgrade = async (planId: string) => {
        try {
            setLoading(planId);
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orgId: subscription.id,
                    planId,
                    email: user.email,
                    name: user.name,
                }),
            });
            const data = await response.json();
            if (data.url) window.location.href = data.url;
        } catch (e: any) {
            toast.error("Erro ao iniciar checkout: " + e.message);
        } finally {
            setLoading(null);
        }
    };

    const handlePortal = async () => {
        try {
            setLoading("portal");
            const response = await fetch("/api/stripe/portal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orgId: subscription.id }),
            });
            const data = await response.json();
            if (data.url) window.location.href = data.url;
        } catch (e: any) {
            toast.error("Erro ao abrir portal: " + e.message);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-10">
            {/* Current Usage Stats */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Leads</CardDescription>
                        <CardTitle className="text-2xl">
                            {usage.leads} / {currentPlan.limits.leads === -1 ? "∞" : currentPlan.limits.leads}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress
                            value={currentPlan.limits.leads === -1 ? 0 : (usage.leads / currentPlan.limits.leads) * 100}
                            className="h-2"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>IA Tools / mês</CardDescription>
                        <CardTitle className="text-2xl">
                            {usage.ia_tools} / {currentPlan.limits.ia_tools_per_month === -1 ? "∞" : currentPlan.limits.ia_tools_per_month}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress
                            value={currentPlan.limits.ia_tools_per_month === -1 ? 0 : (usage.ia_tools / currentPlan.limits.ia_tools_per_month) * 100}
                            className="h-2"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Usuários</CardDescription>
                        <CardTitle className="text-2xl">
                            {usage.users} / {currentPlan.limits.users === -1 ? "∞" : currentPlan.limits.users}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress
                            value={currentPlan.limits.users === -1 ? 0 : (usage.users / currentPlan.limits.users) * 100}
                            className="h-2"
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* STARTER */}
                <Card className={currentPlanSlug === 'starter' ? "border-primary shadow-md relative" : "opacity-80"}>
                    {currentPlanSlug === 'starter' && <Badge className="absolute -top-2 -right-2">Atual</Badge>}
                    <CardHeader>
                        <CardTitle>Starter</CardTitle>
                        <CardDescription>O essencial para começar.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">€29<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 1.000 Leads</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 50 IA Tools</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> WhatsApp</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        {currentPlanSlug === 'starter' ? (
                            <Button variant="outline" className="w-full" onClick={handlePortal} disabled={!!loading}>
                                {loading === "portal" ? <Loader2 className="animate-spin h-4 w-4" /> : "Gerenciar"}
                            </Button>
                        ) : (
                            <Button className="w-full" onClick={() => handleUpgrade('starter')} disabled={!!loading}>
                                {loading === 'starter' ? <Loader2 className="animate-spin h-4 w-4" /> : "Upgrade"}
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* PRO */}
                <Card className={currentPlanSlug === 'pro' ? "border-primary shadow-xl relative scale-105" : "border-slate-200"}>
                    {currentPlanSlug === 'pro' && <Badge className="absolute -top-2 -right-2">Ativo</Badge>}
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            Pro
                            <Sparkles className="h-4 w-4 text-primary" />
                        </CardTitle>
                        <CardDescription>Escala e inteligência.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">€79<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2 font-bold"><Check className="h-4 w-4 text-primary" /> IA ILIMITADO ⚡</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 10.000 Leads</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> RAG Chatbot</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        {currentPlanSlug === 'pro' ? (
                            <Button variant="outline" className="w-full" onClick={handlePortal} disabled={!!loading}>
                                {loading === "portal" ? <Loader2 className="animate-spin h-4 w-4" /> : "Gerenciar"}
                            </Button>
                        ) : (
                            <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => handleUpgrade('pro')} disabled={!!loading}>
                                {loading === 'pro' ? <Loader2 className="animate-spin h-4 w-4" /> : "Selecionar Pro"}
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* ENTERPRISE */}
                <Card className="opacity-70 bg-slate-50 border-dashed">
                    <CardHeader>
                        <CardTitle>Enterprise</CardTitle>
                        <CardDescription>Controle total.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold italic">Sob consulta</div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-slate-400" /> Leads Ilimitados</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-slate-400" /> White Label</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-slate-400" /> Suporte 24/7</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant="ghost" className="w-full border" asChild>
                            <a href="mailto:contato@crmia.eu">Contactar Vendas</a>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
