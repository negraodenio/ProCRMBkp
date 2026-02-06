import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Force Node.js runtime for Stripe Webhook signature verification
export const dynamic = "force-dynamic";

// Service Role Client (Bypass RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
);

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature") as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as any;
                const orgId = session.metadata?.organizationId;
                const subscriptionId = session.subscription;

                if (orgId && subscriptionId) {
                    await supabaseAdmin
                        .from("organizations")
                        .update({
                            subscription_status: "active",
                            subscription_plan: "pro", // Or derive from price ID
                            stripe_customer_id: session.customer
                        })
                        .eq("id", orgId);

                    // Also populate subscriptions table if you want history
                    await supabaseAdmin.from("subscriptions").insert({
                        organization_id: orgId,
                        stripe_subscription_id: subscriptionId,
                        status: "active",
                        stripe_price_id: session.line_items?.[0]?.price?.id, // Simplified
                        current_period_start: new Date().toISOString(), // Approximate
                    });
                }
                break;
            }

            case "customer.subscription.updated":
            case "customer.subscription.deleted": {
                const subscription = event.data.object as any;
                const customerId = subscription.customer;
                const status = subscription.status;

                // Find org by Stripe Customer ID
                const { data: org } = await supabaseAdmin
                    .from("organizations")
                    .select("id")
                    .eq("stripe_customer_id", customerId)
                    .single();

                if (org) {
                    await supabaseAdmin
                        .from("organizations")
                        .update({
                            subscription_status: status === "active" ? "active" : "inactive" // Logic can be more complex
                        })
                        .eq("id", org.id);

                    // Update Subscriptions Table
                    await supabaseAdmin
                        .from("subscriptions")
                        .update({
                            status: status,
                            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                            cancel_at_period_end: subscription.cancel_at_period_end
                        })
                        .eq("stripe_subscription_id", subscription.id);
                }
                break;
            }
        }
    } catch (error: any) {
        console.error("Webhook Logic Error:", error);
        return new NextResponse("Webhook Logic Error", { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}
