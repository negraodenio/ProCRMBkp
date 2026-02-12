import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SettingsNav } from "@/components/settings/settings-nav";
import { Separator } from "@/components/ui/separator";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-64 relative">
        <Header />
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
                <p className="text-muted-foreground">
                    Gerencie as configurações da sua conta e preferências.
                </p>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    <SettingsNav />
                </aside>
                <div className="flex-1 lg:max-w-3xl">
                    {children}
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}
