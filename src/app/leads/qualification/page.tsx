import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { QualificationForm } from "@/components/leads/qualification-form";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function LeadQualificationPage({
  searchParams,
}: {
  searchParams: { leadId?: string };
}) {
  const leadId = searchParams.leadId;

  if (!leadId) {
    return redirect("/leads");
  }

  const supabase = await createClient();

  // Buscar dados do Lead
  const { data: lead } = await supabase
    .from("contacts")
    .select("id, name, organization_id")
    .eq("id", leadId)
    .single();

  if (!lead) {
    return redirect("/leads");
  }

  // Buscar qualificação existente (se houver)
  const { data: existingQual } = await supabase
    .from("lead_qualifications")
    .select("*")
    .eq("contact_id", leadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-64">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gradient">Qualificação de Leads - Fase 2</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                Qualificando: <strong>{lead.name}</strong>
              </p>
            </div>
            <Link href="/leads">
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar aos Leads
              </Button>
            </Link>
          </div>

          {/* Form Content */}
          <QualificationForm
            leadId={lead.id}
            organizationId={lead.organization_id}
            leadName={lead.name}
            initialData={existingQual}
          />
        </main>
      </div>
    </div>
  );
}
