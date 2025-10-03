"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  Building2, 
  Calendar, 
  BarChart3, 
  Settings,
  Mail,
  Phone,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
  },
  {
    name: "Clientes",
    href: "/customers",
    icon: Users,
  },
  {
    name: "Leads",
    href: "/leads",
    icon: Building2,
  },
  {
    name: "Contatos",
    href: "/contacts",
    icon: Phone,
  },
  {
    name: "Atividades",
    href: "/activities",
    icon: Calendar,
  },
  {
    name: "Relatórios",
    href: "/reports",
    icon: FileText,
  },
  {
    name: "Configurações",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow border-r bg-background">
        <div className="flex items-center h-16 px-4 border-b shrink-0">
          <h1 className="text-xl font-bold">ProCRM</h1>
        </div>
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
                    "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}