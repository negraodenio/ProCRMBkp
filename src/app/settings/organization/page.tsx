import { createClient } from "@/lib/supabase/server";
import { Separator } from "@/components/ui/separator";
import { OrgForm } from "@/components/settings/org-form";

export default async function OrganizationPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch profile to get org id
    const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

    if (!profile?.organization_id) {
        return <div>Organização não encontrada.</div>;
    }

    const { data: org } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", profile.organization_id)
        .single();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Organização</h3>
                <p className="text-sm text-muted-foreground">
                    Gerencie os dados da sua empresa.
                </p>
            </div>
            <Separator />
            <OrgForm org={org} />
        </div>
    );
}
