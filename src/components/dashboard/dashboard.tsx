"use client";

import { 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const metrics = [
  {
    title: "Total de Clientes",
    value: "1,234",
    description: "+12% em relação ao mês passado",
    icon: Users,
  },
  {
    title: "Novos Leads",
    value: "56",
    description: "+8% em relação ao mês passado",
    icon: Building2,
  },
  {
    title: "Taxa de Conversão",
    value: "24.5%",
    description: "+3.2% em relação ao mês passado",
    icon: TrendingUp,
  },
  {
    title: "Receita Estimada",
    value: "R$ 45,231",
    description: "+15% em relação ao mês passado",
    icon: DollarSign,
  },
];

const chartData = [
  { name: "Jan", leads: 45, clientes: 24 },
  { name: "Fev", leads: 52, clientes: 32 },
  { name: "Mar", leads: 48, clientes: 38 },
  { name: "Abr", leads: 61, clientes: 45 },
  { name: "Mai", leads: 55, clientes: 52 },
  { name: "Jun", leads: 67, clientes: 58 },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do desempenho do seu CRM
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Atividade dos Leads</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leads" fill="hsl(var(--primary))" name="Leads" />
                <Bar dataKey="clientes" fill="hsl(var(--secondary))" name="Clientes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}