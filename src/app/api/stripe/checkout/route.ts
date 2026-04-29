import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { PLANS, PlanLevel } from "@/lib/stripe/plans";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { orgId, planId, email, name } = await req.json();

    if (!orgId || !planId) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    const plan = PLANS[planId as PlanLevel];
    if (!plan || !plan.stripe_price_id) {
      return new NextResponse("Invalid plan or missing Price ID", { status: 400 });
    }

    // 1. Get or Create Stripe Customer
    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("stripe_customer_id")
      .eq("id", orgId)
      .single();

    let customerId = org?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email,
        name: name,
        metadata: { organizationId: orgId },
      });
      customerId = customer.id;

      await supabaseAdmin
        .from("organizations")
        .update({ stripe_customer_id: customerId })
        .eq("id", orgId);
    }

    // 2. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: plan.stripe_price_id,
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.Nexum.eu'}/dashboard/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.Nexum.eu'}/dashboard/settings/billing?canceled=true`,
      metadata: {
        organizationId: orgId,
        plan: planId,
      },
      subscription_data: {
        metadata: {
          organizationId: orgId,
          plan: planId,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return new NextResponse(error.message, { status: 500 });
  }
}

