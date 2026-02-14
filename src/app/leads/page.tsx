import { Suspense } from "react";
import { LeadList } from "@/components/leads/lead-list";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function LeadsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-64">
        <Header />
        <main className="flex-1 p-6">
          <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando leads...</div>}>
            <LeadList />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
