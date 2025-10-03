"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  Calendar, 
  User,
  Edit,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

const customer = {
  id: "1",
  name: "Empresa ABC Ltda",
  contact: "João Silva",
  email: "joao@empresaabc.com.br",
  phone: "(11) 99999-9999",
  address: "Av. Paulista, 1000 - São Paulo, SP",
  status: "Ativo",
  value: "R$ 50.000",
  since: "2023-01-15",
  lastContact: "2023-06-10",
  notes: "Cliente importante com potencial para expansão. Último contato foi positivo e demonstrou interesse em novos serviços.",
};

export function CustomerDetails() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Ativo":
        return "default";
      case "Inativo":
        return "secondary";
      case "Potencial":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customers">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Detalhes do Cliente</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {customer.name}
                    <Badge variant={getStatusVariant(customer.status)}>
                      {customer.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Informações principais do cliente</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Contato Principal</div>
                    <div className="font-medium">{customer.contact}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">{customer.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Telefone</div>
                    <div className="font-medium">{customer.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Endereço</div>
                    <div className="font-medium">{customer.address}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Comerciais</CardTitle>
              <CardDescription>Detalhes sobre o relacionamento comercial</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Valor Total</div>
                  <div className="text-2xl font-bold">{customer.value}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Cliente Desde</div>
                  <div className="font-medium">{customer.since}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Último Contato</div>
                  <div className="font-medium">{customer.lastContact}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
              <CardDescription>Notas importantes sobre o cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{customer.notes}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-primary p-1">
                    <Phone className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-medium">Ligação de follow-up</div>
                    <div className="text-sm text-muted-foreground">10/06/2023 às 14:30</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-secondary p-1">
                    <Mail className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="font-medium">Envio de proposta</div>
                    <div className="text-sm text-muted-foreground">05/06/2023 às 09:15</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-muted p-1">
                    <Calendar className="h-3 w-3" />
                  </div>
                  <div>
                    <div className="font-medium">Reunião de vendas</div>
                    <div className="text-sm text-muted-foreground">01/06/2023 às 16:00</div>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Ver todas as atividades
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Phone className="mr-2 h-4 w-4" />
                Fazer Ligação
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Enviar Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Atividade
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Registrar Venda
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}