import { createClient } from "@/lib/supabase/server";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components/settings/profile-form";

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Perfil</h3>
                <p className="text-sm text-muted-foreground">
                    Gerencie suas informações pessoais e aparência.
                </p>
            </div>
            <Separator />
            <ProfileForm profile={profile} />
        </div>
    );
}
