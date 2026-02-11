"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado" };
    }

    const full_name = formData.get("full_name") as string;
    const phone = formData.get("phone") as string;
    const avatar_url = formData.get("avatar_url") as string;

    const updates: any = {
        updated_at: new Date().toISOString(),
    };

    if (full_name) updates.full_name = full_name;
    if (phone) updates.phone = phone;
    if (avatar_url) updates.avatar_url = avatar_url;

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
