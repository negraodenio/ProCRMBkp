"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  KanbanSquare,
  FileText,
  Files,
  MessageSquare,
  Smartphone,
  Bot,
  Sparkles,
  UserCog,
  Terminal,
  BarChart3,
  Target,
  LogOut,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/auth/actions";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: Building2 },
  { name: "Pipeline", href: "/pipeline", icon: KanbanSquare },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Propostas", href: "/proposals", icon: FileText },
  { name: "Templates", href: "/templates", icon: Files },
  { name: "Conversas", href: "/chat", icon: MessageSquare },
  { name: "WhatsApp", href: "/whatsapp", icon: Smartphone },
  { name: "Mensagens Automáticas", href: "/automations", icon: Bot },
  { name: "IA Tools", href: "/ai-tools", icon: Sparkles },
  { name: "Usuários", href: "/users", icon: UserCog },
  { name: "Console", href: "/console", icon: Terminal },
  { name: "Relatórios", href: "/reports", icon: BarChart3 },
  { name: "Estratégias", href: "/strategies", icon: Target },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
      <div className="flex flex-col flex-grow border-r bg-background">
        {/* Header */}
        <div className="flex items-center h-16 px-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">CRM IA</h1>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 mr-3",
                    isActive && "text-primary"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars/user.png" alt="User" />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                EP
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Elisangela Pereira</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}