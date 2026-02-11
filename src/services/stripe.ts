"use server";

import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-scoped"; // Verify path
import { redirect } from "next/navigation";

export async function createCheckoutSession(priceId?: string) {
    const finalPriceId = priceId || process.env.STRIPE_PRO_PRICE_ID;
    if (!finalPriceId) throw new Error("Price ID not configured");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id, organizations(stripe_customer_id)")
        .eq("id", user.id)
        .single() as any;

    if (!profile || !profile.organization_id) {
        throw new Error("Organization not found");
    }

    const orgId = profile.organization_id;
    let customerId = profile.organizations?.stripe_customer_id;

    // Create Customer if not exists
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            metadata: {
                organizationId: orgId
            }
        });
        customerId = customer.id;

        // Save to DB using Service Role (bypass RLS)
        const supabaseAdmin = createServiceRoleClient();
        const { error } = await supabaseAdmin
            .from("organizations")
            .update({ stripe_customer_id: customerId })
            .eq("id", orgId);

        if (error) {
             console.error("Failed to update organization with stripe_customer_id:", error);
             // We might want to throw here, or continue?
             // If we continue, the user can pay but we won't listen to webhooks correctly linked?
             // Actually metadata has orgId, so webhook might still work, but better to fail safe.
             throw new Error("Failed to link payment account.");
        }
    }

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: "subscription",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
        metadata: {
            organizationId: orgId,
            userId: user.id
        }
    });

    if (session.url) {
        redirect(session.url);
    }
}

export async function createCustomerPortal() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
        .from("profiles")
        .select("organizations(stripe_customer_id)")
        .eq("id", user.id)
        .single() as any;

    const customerId = profile?.organizations?.stripe_customer_id;

    if (!customerId) {
        throw new Error("No subscription found");
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    });

    redirect(session.url);
}
