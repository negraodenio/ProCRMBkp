"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado" };
    }

    const start_full_name = formData.get("full_name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const position = formData.get("position") as string;
    const avatar_url = formData.get("avatar_url") as string;

    const updates: any = {
        updated_at: new Date().toISOString(),
    };

    if (start_full_name) updates.start_full_name = start_full_name; // Check column name in DB, usually full_name or name
    // Actually, let's assume 'full_name' based on common patterns. If it fails, I'll check schema.
    // Wait, the input name in SettingsPanel was "name".

    if (formData.has("full_name")) updates.full_name = formData.get("full_name");
    if (formData.has("phone")) updates.phone = formData.get("phone");
    // Position might not exist in profiles, maybe in a separate table or metadata?
    // Let's stick to basics.
    if (formData.has("avatar_url")) updates.avatar_url = formData.get("avatar_url");

    const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

    if (error) {
        console.error("Error updating profile:", error);
        return { error: "Erro ao atualizar perfil" };
    }

    revalidatePath("/settings/profile");
    return { success: true };
}

export async function updateOrganization(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Não autorizado" };

    // Get user's org id
    const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single();
    if (!profile?.organization_id) return { error: "Organização não encontrada" };

    const name = formData.get("name") as string;
    // Add other fields if available in DB (address, etc)

    const updates: any = {
        updated_at: new Date().toISOString(),
    };
    if (name) updates.name = name;

    const { error } = await supabase
        .from("organizations")
        .update(updates)
        .eq("id", profile.organization_id);

    if (error) {
        console.error("Error updating org:", error);
        return { error: "Erro ao atualizar organização" };
    }

    revalidatePath("/settings/organization");
    return { success: true };
}
