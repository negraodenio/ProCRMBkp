'use client'

import { useState } from 'react'
import { login, signup } from '@/app/auth/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function LoginPage() {
    const [loading, setLoading] = useState(false)

    async function handleLogin(formData: FormData) {
        console.log("Tentando fazer login...", Object.fromEntries(formData));
        setLoading(true);
        try {
            const result = await login(formData);
            console.log("Resultado do login:", result);

            if (result?.error) {
                toast.error(result.error);
                setLoading(false);
            }
            // Se sucesso, o redirect acontece no server e esta linha pode nao ser atingida ou o componente desmonta
        } catch (error) {
            console.error("Erro no login:", error);
            toast.error("Erro ao conectar. Verifique o console.");
            setLoading(false);
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
        <div className="flex items-center justify-center min-h-screen bg-muted/40 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">ProCRM</CardTitle>
                    <CardDescription>
                        Entre na sua conta para acessar o sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Cadastro</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                await handleLogin(formData);
                            }} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Senha</Label>
                                    <Input id="password" name="password" type="password" required />
                                </div>
                                <Button className="w-full" type="submit" disabled={loading}>
                                    {loading ? "Entrando..." : "Entrar"}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <form action={handleSignup} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input id="signup-email" name="email" type="email" placeholder="seu@email.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Nome Completo</Label>
                                    <Input id="fullName" name="fullName" placeholder="João Silva" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Nome da Empresa</Label>
                                    <Input id="companyName" name="companyName" placeholder="Minha Empresa Ltda" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Senha</Label>
                                    <Input id="signup-password" name="password" type="password" required />
                                </div>
                                <Button className="w-full" type="submit" disabled={loading}>
                                    {loading ? "Criando conta..." : "Criar Conta"}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
