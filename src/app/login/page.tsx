'use client'

import { useState } from 'react'
import { login, signup } from '@/app/auth/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, ArrowRight, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import Link from 'next/link'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)

    async function handleLogin(formData: FormData) {
        setLoading(true);
        const result = await login(formData); // Handles redirect or throws inside Next.js
        setLoading(false);

        if (result?.error) {
            toast.error(result.error);
        }
    }

    async function handleSignup(formData: FormData) {
        setLoading(true)
        const result = await signup(formData)
        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Conta criada! Verifique seu email para confirmar.")
        }
    }

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side: Auth Form */}
            <div className="w-full lg:w-1/2 flex flex-col px-8 sm:px-16 md:px-24 py-12 justify-center relative">
                <Link href="/" className="absolute top-8 left-8 sm:left-12 flex items-center gap-2 group">
                    <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        CRMia
                    </span>
                </Link>

                <div className="w-full max-w-md mx-auto space-y-8 mt-12 lg:mt-0">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Bem-vindo de volta</h1>
                        <p className="text-slate-500 font-medium text-sm">
                            Acesse seu assistente de vendas inteligente para continuar faturando.
                        </p>
                    </div>

                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100/50 p-1 rounded-xl">
                            <TabsTrigger value="login" className="rounded-lg data-[state=active]:shadow-sm">Login</TabsTrigger>
                            <TabsTrigger value="signup" className="rounded-lg data-[state=active]:shadow-sm">Cadastro</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <form action={handleLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-semibold text-slate-700">Email Corporativo</Label>
                                    <Input id="email" name="email" type="email" placeholder="seu@email.com" required className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="font-semibold text-slate-700">Senha</Label>
                                        <Link href="#" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">Esqueceu a senha?</Link>
                                    </div>
                                    <Input id="password" name="password" type="password" required className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all" />
                                </div>
                                <Button className="w-full h-12 text-base font-semibold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" type="submit" disabled={loading}>
                                    {loading ? "Autenticando..." : "Entrar no Sistema"}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <form action={handleSignup} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="font-semibold text-slate-700">Nome Completo</Label>
                                    <Input id="fullName" name="fullName" placeholder="João Silva" required className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="companyName" className="font-semibold text-slate-700">Nome da Empresa</Label>
                                    <Input id="companyName" name="companyName" placeholder="Minha Empresa Ltda" required className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email" className="font-semibold text-slate-700">Email Corporativo</Label>
                                    <Input id="signup-email" name="email" type="email" placeholder="seu@email.com" required className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password" className="font-semibold text-slate-700">Senha</Label>
                                    <Input id="signup-password" name="password" type="password" required className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all" />
                                </div>
                                <Button className="w-full h-12 text-base font-semibold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2" type="submit" disabled={loading}>
                                    {loading ? "Criando sua conta..." : "Criar Conta Grátis"}
                                </Button>
                                <p className="text-xs text-center text-slate-500 font-medium">
                                    Ao se cadastrar, você concorda com nossos Termos de Serviço e Política de Privacidade.
                                </p>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Right Side: Marketing/Decorative */}
            <div className="hidden lg:flex w-1/2 p-2 relative overflow-hidden bg-white">
                <div className="w-full h-full rounded-[2.5rem] bg-slate-950 relative overflow-hidden flex flex-col justify-between p-16">
                    {/* Background Effects */}
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px]" />
                    <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-[80px]" />

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Novo Pipeline & Propostas
                        </div>
                        <h2 className="text-5xl font-black text-white leading-[1.1] mb-6">
                            Venda mais rápido.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                                Feche mais negócios.
                            </span>
                        </h2>
                        <p className="text-xl text-slate-300 font-medium max-w-lg leading-relaxed">
                            O CRMia agora integra seu Kanban de vendas com automação de propostas financeiras em múltiplas moedas. Tudo no piloto automático.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
                            <div className="flex gap-4 items-start">
                                <div className="mt-1 p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg text-white">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold mb-1">11 Ferramentas de IA Integradas</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Da qualificação automática de leads ao Conselheiro de Vendas virtual guiando seu funil em tempo real.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm font-semibold text-slate-400">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                Sem cartão de crédito
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                Suporte dedicado
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
