import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Key, Smartphone } from "lucide-react";

export default function SecurityPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Segurança</h3>
                <p className="text-sm text-muted-foreground">
                    Gerencie suas configurações de segurança e proteção de conta.
                </p>
            </div>
            <Separator />

            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            Senha
                        </CardTitle>
                        <CardDescription>
                            Altere sua senha regularmente para manter sua conta segura.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline">Alterar Senha</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            Autenticação de Dois Fatores (2FA)
                        </CardTitle>
                        <CardDescription>
                            Adicione uma camada extra de segurança à sua conta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" disabled>Configurar 2FA (Em breve)</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Sessões Ativas
                        </CardTitle>
                        <CardDescription>
                            Gerencie os dispositivos onde você está logado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Você está logado atualmente neste dispositivo.</p>
                        <Button variant="ghost" className="text-red-600">Encerrar outras sessões</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
