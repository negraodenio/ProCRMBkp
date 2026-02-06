"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, FileType, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { uploadDocument, deleteDocument } from "./actions";

export function UploadForm() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("");

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setStatus("Iniciando envio...");
        setProgress(10);

        try {
            // Fake progress for UX perception
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return prev;
                    return prev + 10;
                });
            }, 500);

            setStatus("Processando Inteligência Artificial...");

            const res = await uploadDocument(formData);

            clearInterval(progressInterval);
            setProgress(100);

            if (res.error) {
                toast.error(res.error);
                setStatus("Erro no processamento.");
            } else {
                setStatus("Concluído!");
                toast.success(`Documento processado! ${res.count} trechos salvos.`);
                // Reset form manually or by key
                const form = document.querySelector("form") as HTMLFormElement;
                form?.reset();
                setTimeout(() => {
                    setProgress(0);
                    setStatus("");
                }, 3000);
            }
        } catch (error) {
            toast.error("Erro no envio do arquivo.");
            setStatus("Erro crítico.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form 
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(new FormData(e.currentTarget));
            }} 
            className="space-y-4 border p-4 rounded-lg bg-muted/30"
        >
            <div className="space-y-2">
                <Label htmlFor="file">Novo Documento (PDF ou TXT)</Label>
                <div className="flex gap-2">
                    <Input id="file" name="file" type="file" required accept=".pdf,.txt,.md" className="bg-background" disabled={loading} />
                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        {loading ? "Enviando..." : "Enviar"}
                    </Button>
                </div>

                {/* Status Bar */}
                {loading && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{status}</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300 ease-in-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}{!loading && status === "Concluído!" && (
                    <div className="text-xs text-green-500 font-medium">✅ Arquivo processado com sucesso!</div>
                )}

                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <FileType className="h-3 w-3" />
                    O robô aprenderá com este conteúdo para responder no WhatsApp.
                </p>
            </div>
        </form>
    );
}

export function DeleteButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);
    // Dynamic import to avoid circular dependency if actions were used directly? No, actions are fine.
    // import { deleteDocument } from "./actions"; // Already imported at top? Need to check.

    async function handleDelete() {
        if (!confirm("Tem certeza?")) return;
        setLoading(true);
        try {
            await deleteDocument(id);
            toast.success("Documento removido.");
        } catch {
            toast.error("Erro ao remover.");
        } finally {
            setLoading(false);
        }
    }

    // Reuse Loader2 or Trash icon
    const { Trash2 } = require("lucide-react"); // Dynamic require or just import top level.
    // Let's rely on top level import updates.

    return (
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={loading} className="text-red-500 hover:text-red-700 hover:bg-red-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
    );
}
