import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Bot } from "lucide-react";
import { redirect } from "next/navigation";
import { KnowledgeContent } from "./knowledge-content";

export default async function KnowledgeBasePage() {
    const supabase = await createClient();

    // Get Organization ID
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return redirect("/login");

    const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single();
    if (!profile?.organization_id) return <div>Organization not found</div>;

    // Fetch Documents (Chunks)
    const { data: chunks } = await supabase
        .from("documents")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });

    // Fetch Bot Settings
    const { data: org } = await supabase
        .from("organizations")
        .select("bot_settings")
        .eq("id", profile.organization_id)
        .single();

    const botSettings = org?.bot_settings || {};

    // Grouping logic: One filename -> most recent created_at
    const groupedDocs: Record<string, { id: string, filename: string, created_at: string, count: number }> = {};

    chunks?.forEach(chunk => {
        const filename = (chunk.metadata as any)?.filename || "Documento sem nome";
        if (!groupedDocs[filename]) {
            groupedDocs[filename] = {
                id: chunk.id,
                filename,
                created_at: chunk.created_at,
                count: 1
            };
        } else {
            groupedDocs[filename].count++;
        }
    });

    const documents = Object.values(groupedDocs);

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="flex-1 p-6 space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Bot className="h-8 w-8 text-gradient" />
                            <span className="text-gradient">Robô do WhatsApp</span>
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Configure documentos e personalidade do assistente inteligente
                        </p>
                    </div>

                    {/* Content com Tabs */}
                    <KnowledgeContent
                        documents={documents}
                        chunks={chunks || []}
                        botSettings={botSettings}
                        organizationId={profile.organization_id}
                    />
                </main>
            </div>
        </div>
    );
}
