"use client";

import { Moon, Sun, Bell, User, Search, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/use-profile";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "lead" | "message";
  link?: string;
};

export function Header() {
  const { setTheme } = useTheme();
  const router = useRouter();
  const { profile } = useProfile();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!profile?.organization_id) return;

    const supabase = createClient();

    // Fetch recent leads (last 24h)
    const fetchNotifications = async () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      // Get new leads
      const { data: newLeads } = await supabase
        .from("contacts")
        .select("id, name, created_at")
        .eq("organization_id", profile.organization_id)
        .eq("type", "lead")
        .gte("created_at", oneDayAgo)
        .order("created_at", { ascending: false })
        .limit(5);

      // Get unread conversations
      const { data: unreadConvs } = await supabase
        .from("conversations")
        .select("id, contact_name, last_message_at, unread_count")
        .eq("organization_id", profile.organization_id)
        .gt("unread_count", 0)
        .order("last_message_at", { ascending: false })
        .limit(5);

      const notifs: Notification[] = [];

      // Add lead notifications
      newLeads?.forEach((lead) => {
        notifs.push({
          id: `lead-${lead.id}`,
          title: "Novo Lead",
          message: `${lead.name} entrou no funil`,
          time: formatDistanceToNow(new Date(lead.created_at), { locale: ptBR, addSuffix: true }),
          read: false,
          type: "lead",
          link: `/leads/${lead.id}`,
        });
      });

      // Add message notifications
      unreadConvs?.forEach((conv) => {
        notifs.push({
          id: `msg-${conv.id}`,
          title: "Nova Mensagem",
          message: `${conv.contact_name} enviou ${conv.unread_count} mensagem(ns)`,
          time: formatDistanceToNow(new Date(conv.last_message_at), { locale: ptBR, addSuffix: true }),
          read: false,
          type: "message",
          link: "/chat",
        });
      });

      setNotifications(notifs);
      setNotificationCount(notifs.length);
    };

    fetchNotifications();

    // Real-time subscription for new leads
    const leadsChannel = supabase
      .channel("new_leads")
      .on("postgres_changes" as any, {
        event: "INSERT",
        table: "contacts",
        filter: `organization_id=eq.${profile.organization_id}`,
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    // Real-time subscription for new messages
    const messagesChannel = supabase
      .channel("new_messages")
      .on("postgres_changes" as any, {
        event: "INSERT",
        table: "messages",
        filter: `organization_id=eq.${profile.organization_id}`,
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [profile?.organization_id]);

  const handleNotificationClick = (notif: Notification) => {
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso!");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 glass-nav">
      <div className="flex items-center justify-between h-16 px-4 gap-4">
        {/* Modern Search - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar leads, clientes..."
              className="pl-9 pr-4 bg-white/5 border border-white/10 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Spacer for mobile */}
        <div className="flex-1 md:hidden" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-white/10">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse shadow-glow-warning"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 glass-card max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-white/10">
                <h3 className="font-semibold text-sm">Notificações</h3>
              </div>
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Nenhuma notificação
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{notif.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-white/10">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 glass-card">
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/settings/profile")}>
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/settings/organization")}>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer hover:bg-destructive/10 gap-2"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Saindo..." : "Sair"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-white/10">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-warning" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-info" />
                <span className="sr-only">Alternar tema</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card">
              <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                ☀️ Claro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                🌙 Escuro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
                💻 Sistema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
