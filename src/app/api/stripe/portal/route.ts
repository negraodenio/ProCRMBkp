import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { orgId } = await req.json();

    if (!orgId) {
      return new NextResponse("Missing organization ID", { status: 400 });
    }

    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("stripe_customer_id")
      .eq("id", orgId)
      .single();

    if (!org?.stripe_customer_id) {
      return new NextResponse("No Stripe customer found", { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.Nexum.eu'}/dashboard/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Portal Error:", error);
    return new NextResponse(error.message, { status: 500 });
  }
}

