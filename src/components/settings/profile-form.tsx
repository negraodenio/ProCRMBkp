"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Upload, User } from "lucide-react";
import { updateProfile } from "@/app/settings/actions";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
    profile: any;
}

export function ProfileForm({ profile }: ProfileFormProps) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url);
    const router = useRouter();

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = event.target.files?.[0];
            if (!file) return;

            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(publicUrl);
            toast.success("Imagem carregada! Clique em Salvar para persistir.");
        } catch (error: any) {
            toast.error("Erro ao fazer upload da imagem: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        if (avatarUrl) {
            formData.set("avatar_url", avatarUrl);
        }

        const result = await updateProfile(formData);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Perfil atualizado com sucesso!");
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-2 border-slate-100">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="text-2xl bg-slate-100 text-slate-400">
                        {profile?.full_name?.charAt(0) || <User />}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 border rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            Alterar Foto
                        </div>
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                            disabled={uploading}
                        />
                    </Label>
                    <p className="text-xs text-muted-foreground">JPG, GIF ou PNG. Máx 2MB.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input id="full_name" name="full_name" defaultValue={profile?.full_name || ""} placeholder="Seu nome" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" defaultValue={profile?.email || ""} disabled className="bg-slate-50" />
                    <p className="text-[10px] text-muted-foreground">O email não pode ser alterado.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" name="phone" defaultValue={profile?.phone || ""} placeholder="Seu telefone" />
                </div>
            </div>

            <div className="flex justify-start">
                <Button type="submit" disabled={loading || uploading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                </Button>
            </div>
        </form>
    );
}
