import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Mail, MessageSquare } from "lucide-react";

export default function NotificationsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Notificações</h3>
                <p className="text-sm text-muted-foreground">
                    Escolha como e quando você deseja ser notificado.
                </p>
            </div>
            <Separator />

            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            E-mail
                        </CardTitle>
                        <CardDescription>
                            Receba atualizações importantes e alertas por e-mail.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="email-new-lead">Novos Leads</Label>
                            <Switch id="email-new-lead" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="email-reports">Relatórios Semanais</Label>
                            <Switch id="email-reports" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            WhatsApp
                        </CardTitle>
                        <CardDescription>
                            Notificações enviadas diretamente para o seu WhatsApp.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="wa-mentions">Menções em Conversas</Label>
                            <Switch id="wa-mentions" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="wa-system">Alertas do Sistema</Label>
                            <Switch id="wa-system" defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Navegador
                        </CardTitle>
                        <CardDescription>
                            Notificações push em tempo real no seu navegador.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="push-all">Todas as notificações</Label>
                            <Switch id="push-all" defaultChecked />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
