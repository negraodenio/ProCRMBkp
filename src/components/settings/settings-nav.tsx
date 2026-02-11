"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Building2, CreditCard, Shield, Bell } from "lucide-react";

const items = [
  {
    title: "Perfil",
    href: "/settings/profile",
    icon: User,
  },
  {
    title: "Organização",
    href: "/settings/organization",
    icon: Building2,
  },
  {
    title: "Faturamento",
    href: "/settings/billing",
    icon: CreditCard,
  },
  {
    title: "Segurança",
    href: "/settings/security",
    icon: Shield,
  },
  {
    title: "Notificações",
    href: "/settings/notifications",
    icon: Bell,
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "justify-start flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100 transition-colors",
            pathname === item.href
              ? "bg-slate-100 text-primary"
              : "text-muted-foreground bg-transparent"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
