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
  Zap,
  RefreshCw,
  Shield,
  Landmark,
  UserCheck,
  Mail,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/auth/actions";

const navigation = [
  // === InovaÃ§Ã£o & TTO ===
  { name: "Mission Control", href: "/mission-control", icon: LayoutDashboard },
  { name: "Autopilot", href: "/autopilot", icon: Zap },
  { name: "Matchmaking", href: "/match", icon: Target },
  { name: "People Search", href: "/people-search", icon: UserCheck },
  { name: "Email Outreach", href: "/outreach", icon: Mail },
  { name: "Grant Discovery", href: "/grants", icon: Landmark },
  { name: "Lattes Sync", href: "/lattes", icon: RefreshCw },
  // === CRM Base ===
  { name: "Empresas", href: "/companies", icon: Building2 },
  { name: "Contatos", href: "/contacts", icon: Users },
  { name: "Pipeline", href: "/pipeline", icon: KanbanSquare },
  { name: "Propostas", href: "/proposals", icon: FileText },
  { name: "Conversas", href: "/chat", icon: MessageSquare },
  { name: "WhatsApp", href: "/whatsapp", icon: Smartphone },
  { name: "IA Tools", href: "/ai-tools", icon: Sparkles },
  { name: "EstratÃ©gias", href: "/strategies", icon: Rocket },
  { name: "Audit Log", href: "/audit", icon: ShieldCheck },
  { name: "UsuÃ¡rios", href: "/users", icon: UserCog },
];

import { useProfile } from "@/hooks/use-profile";

// Export the props interface so it can be used if needed, or just keep it internal
interface SidebarProps {
    mobile?: boolean;
}

export function Sidebar({ mobile }: SidebarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { profile, loading } = useProfile();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logout();
        toast.success("Logout realizado com sucesso!");
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
        toast.error("Erro ao fazer logout");
      }
    });
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (mobile) {
      return (
         <div className="flex flex-col h-full bg-card text-foreground border-r border-border">
           {/* Mobile Header */}
            <div className="flex items-center h-16 px-4 border-b border-border">
             <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                   <Sparkles className="h-4 w-4 text-white" />
                 </div>
                 <h1 className="text-xl font-bold text-white">
                   {loading ? "..." : profile?.organizations?.name || "Nexum"}
                 </h1>
               </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
               <nav className="space-y-1 px-2">
                   {navigation.map((item) => {
                       const Icon = item.icon;
                       const isActive = pathname === item.href;
                       return (
                           <Link
                               key={item.name}
                               href={item.href}
                               className={cn(
                                   "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                                   isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                               )}
                           >
                               <Icon className="w-5 h-5 mr-3" />
                               {item.name}
                           </Link>
                       )
                   })}
               </nav>
            </div>

            {/* Logout Footer Mobile */}
            <div className="p-4 border-t border-border">
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                </Button>
            </div>
         </div>
      )
  }

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
      {/* Modern Sidebar com Glassmorphism */}
      <div className="flex flex-col flex-grow border-r border-white/10 bg-gradient-to-b from-background via-background to-background/95 backdrop-blur-xl">
        {/* Header com Gradient */}
        <div className="flex items-center h-16 px-4 border-b border-white/10 shrink-0 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold truncate bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              {loading ? "..." : profile?.organizations?.name || "Nexum"}
            </h1>
          </div>
        </div>

        {/* Navigation com Hover Effects */}
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
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "gradient-primary text-white shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 mr-3 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"
                  )} />
                  <span className={isActive ? "font-semibold" : ""}>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* LGPD & Governance Badge */}
        <div className="px-4 pb-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                <Shield className="h-3 w-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">LGPD Compliant</span>
            </div>
        </div>

        {/* User Profile Footer com Glass Effect */}
        <div className="border-t border-white/10 p-4 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-primary/20">
              <AvatarImage src="/avatars/user.png" alt="User" />
              <AvatarFallback className="gradient-primary text-white text-sm font-semibold">
                {loading ? "..." : getInitials(profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {loading ? "Carregando..." : profile?.full_name || "UsuÃ¡rio"}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {loading ? "..." : profile?.role || "Operador"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
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
