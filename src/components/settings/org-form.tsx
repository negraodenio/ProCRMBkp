"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { updateOrganization } from "@/app/settings/actions";

interface OrgFormProps {
    org: any;
}

export function OrgForm({ org }: OrgFormProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await updateOrganization(formData);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Organização atualizada com sucesso!");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nome da Empresa</Label>
                    <Input id="name" name="name" defaultValue={org?.name || ""} placeholder="Nome da empresa" />
                </div>
                <div className="space-y-2">
                    <Label>ID da Organização</Label>
                    <div className="p-3 bg-slate-50 border rounded-md text-sm font-mono text-slate-500 select-all">
                        {org?.id}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Use este ID para integrações ou suporte.</p>
                </div>
                {/* Add more fields here as needed (Address, Tax ID, etc) */}
            </div>

            <div className="flex justify-start">
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                </Button>
            </div>
        </form>
    );
}
