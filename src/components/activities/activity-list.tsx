"use client";

import { useState } from "react";
import { Plus, Search, MoreHorizontal, Calendar, Phone, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const activities = [
  {
    id: "1",
    title: "Reunião de vendas",
    type: "Reunião",
    contact: "João Silva",
    company: "Empresa ABC Ltda",
    date: "2023-06-15",
    time: "14:00",
    status: "Agendado",
  },
  {
    id: "2",
    title: "Ligação de follow-up",
    type: "Ligação",
    contact: "Maria Oliveira",
    company: "Tech Solutions SA",
    date: "2023-06-14",
    time: "10:30",
    status: "Concluído",
  },
  {
    id: "3",
    title: "Envio de proposta",
    type: "Email",
    contact: "Carlos Santos",
    company: "Inovação Digital",
    date: "2023-06-13",
    time: "09:15",
    status: "Concluído",
  },
  {
    id: "4",
    title: "Visita técnica",
    type: "Visita",
    contact: "Ana Costa",
    company: "Global Services",
    date: "2023-06-16",
    time: "16:00",
    status: "Agendado",
  },
];

export function ActivityList() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Reunião":
        return <Calendar className="h-4 w-4" />;
      case "Ligação":
        return <Phone className="h-4 w-4" />;
      case "Email":
        return <Mail className="h-4 w-4" />;
      case "Visita":
        return <FileText className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Agendado":
        return "default";
      case "Concluído":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Atividades</h1>
          <p className="text-muted-foreground">
            Gerencie suas atividades e interações
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Atividade
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 md:w-1/3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar atividades..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Atividade</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      {getTypeIcon(activity.type)}
                    </div>
                    <div>
                      <div className="font-medium">{activity.title}</div>
                      <div className="text-sm text-muted-foreground">{activity.type}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {activity.contact.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {activity.contact}
                  </div>
                </TableCell>
                <TableCell>{activity.company}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{activity.date}</span>
                    <span className="text-sm text-muted-foreground">{activity.time}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(activity.status)}>
                    {activity.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Marcar como concluído</DropdownMenuItem>
                      <DropdownMenuItem>Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}