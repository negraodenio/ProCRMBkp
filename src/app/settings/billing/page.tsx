import { createClient } from "@/lib/supabase/server";
import { Separator } from "@/components/ui/separator";
import { BillingContent } from "@/components/settings/billing-content";

export default async function BillingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single();

    if (!profile?.organization_id) return <div>Organizaçío nío encontrada</div>;

    const { data: org } = await supabase
        .from("organizations")
        .select(`
            id,
            subscription_plan,
            subscription_status,
            stripe_customer_id,
            ia_tools_used_month,
            ia_tools_reset_date
        `)
        .eq("id", profile.organization_id)
        .single();

    // Fetch total leads for this org
    const { count: leadsCount } = await supabase
        .from("leads")
        .select("*", { count: 'exact', head: true })
        .eq("organization_id", profile.organization_id);

    // Fetch total users for this org
    const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true })
        .eq("organization_id", profile.organization_id);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Planos e Faturamento</h3>
                <p className="text-sm text-muted-foreground">
                    Gerencie a assinatura e cobrança da sua organizaçío.
                </p>
            </div>
            <Separator />
            <BillingContent
                subscription={org}
                usage={{
                    leads: leadsCount || 0,
                    users: usersCount || 0,
                    ia_tools: org?.ia_tools_used_month || 0
                }}
                user={{
                    email: user.email!,
                    name: user.user_metadata?.name || user.email!
                }}
            />
        </div>
    );
}
