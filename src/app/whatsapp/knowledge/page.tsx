import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, FileText, Database } from "lucide-react";
import { UploadForm, DeleteButton } from "./upload-form";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import { redirect } from "next/navigation";

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
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            Base de Conhecimento (RAG)
                        </h1>
                        <p className="text-muted-foreground">
                            Ensine o robô do WhatsApp sobre sua empresa.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Upload Column */}
                        <div className="md:col-span-1 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Treinamento</CardTitle>
                                    <CardDescription>Envie manuais, preços ou FAQs.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <UploadForm />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Database className="h-4 w-4" /> Estatísticas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Documentos:</span>
                                        <span className="font-bold">{documents.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Trechos (Chunks):</span>
                                        <span className="font-bold">{chunks?.length || 0}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* List Column */}
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Documentos Ativos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {!documents.length ? (
                                        <div className="text-center py-10 text-muted-foreground">
                                            <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                            Nenhum documento encontrado.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {documents.map((doc) => (
                                                <div key={doc.id} className="flex items-center justify-between p-4 bg-card border rounded-lg shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-primary/10 p-2 rounded-full">
                                                            <FileText className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium truncate max-w-[200px] md:max-w-md">
                                                                {doc.filename}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs text-muted-foreground">
                                                                    Enviado há {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: ptBR })}
                                                                </p>
                                                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                                                                    {doc.count} trechos
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <DeleteButton id={doc.id} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
