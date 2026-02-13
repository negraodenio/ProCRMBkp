import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

// Service Role Client (Bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const resend = new Resend(process.env.RESEND_API_KEY!);

// ============================================
// MAPA DE PLANOS — Price IDs do Stripe
// ============================================
const PLAN_MAP: Record<string, { name: string; slug: string }> = {
  "price_1T0LLCHVYqBSctt34B3r7GS4": { name: "Starter", slug: "starter" },
  "price_1T0LLxHVYqBSctt3R6wYjwpM": { name: "Pro", slug: "pro" },
  "price_1T0LMXHVYqBSctt3PFmUVLaN": { name: "Business", slug: "business" },
};

function getPlanFromPriceId(priceId: string) {
  return PLAN_MAP[priceId] || { name: "Pro", slug: "pro" };
}

// ============================================
// EMAIL TEMPLATES
// ============================================
async function sendWelcomeEmail(email: string, planName: string) {
  try {
    await resend.emails.send({
      from: "CRMia <noreply@crmia.eu>",
      to: email,
      subject: `🎉 Bem-vindo ao CRMia ${planName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #7c3aed; margin: 0;">CRMia</h1>
          </div>

          <div style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); border-radius: 12px; padding: 30px; color: white; text-align: center;">
            <h2 style="margin: 0 0 10px;">🎉 Pagamento Confirmado!</h2>
            <p style="margin: 0; font-size: 18px;">Plano <strong>${planName}</strong> ativado com sucesso</p>
          </div>

          <div style="padding: 30px 0;">
            <p>Olá!</p>
            <p>O teu plano <strong>CRMia ${planName}</strong> está agora ativo. Já podes usar todas as funcionalidades incluídas.</p>

            <div style="text-align: center; padding: 20px 0;">
              <a href="https://crmia.eu/dashboard"
                 style="background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Ir para o Dashboard →
              </a>
            </div>

            <p>Se tiveres alguma dúvida, responde a este email.</p>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #9ca3af; font-size: 13px;">
            <p>CRMia — O CRM inteligente para o teu negócio</p>
          </div>
        </div>
      `,
    });
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
  }
}

async function sendPaymentFailedEmail(email: string) {
  try {
    await resend.emails.send({
      from: "CRMia <noreply@crmia.eu>",
      to: email,
      subject: `⚠️ Problema com o teu pagamento — CRMia`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #7c3aed; margin: 0;">CRMia</h1>
          </div>

          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 30px; text-align: center;">
            <h2 style="color: # dc2626; margin: 0 0 10px;">⚠️ Pagamento Falhou</h2>
            <p style="color: #7f1d1d; margin: 0;">Não conseguimos processar o teu pagamento.</p>
          </div>

          <div style="padding: 30px 0;">
            <p>Olá,</p>
            <p>O último pagamento da tua subscrição CRMia falhou. Para evitar a suspensão do teu plano, por favor atualiza o teu método de pagamento.</p>

            <div style="text-align: center; padding: 20px 0;">
              <a href="https://crmia.eu/dashboard/settings/billing"
                 style="background: #dc2626; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Atualizar Pagamento →
              </a>
            </div>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #9ca3af; font-size: 13px;">
            <p>CRMia — O CRM inteligente para o teu negócio</p>
          </div>
        </div>
      `,
    });
    console.log(`✅ Payment failed email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send payment failed email:", error);
  }
}

async function sendCancellationEmail(email: string) {
  try {
    await resend.emails.send({
      from: "CRMia <noreply@crmia.eu>",
      to: email,
      subject: `😢 Subscrição cancelada — CRMia`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #7c3aed; margin: 0;">CRMia</h1>
          </div>

          <div style="background: #fefce8; border: 1px solid #fde68a; border-radius: 12px; padding: 30px; text-align: center;">
            <h2 style="color: #a16207; margin: 0 0 10px;">Subscrição Cancelada</h2>
            <p style="color: #854d0e; margin: 0;">Vamos sentir a tua falta!</p>
          </div>

          <div style="padding: 30px 0;">
            <p>Olá,</p>
            <p>A tua subscrição CRMia foi cancelada. O teu acesso continuará ativo até ao fim do período atual.</p>
            <p>Se mudares de ideia, podes reativar a qualquer momento:</p>

            <div style="text-align: center; padding: 20px 0;">
              <a href="https://crmia.eu/pricing"
                 style="background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Reativar Plano →
              </a>
            </div>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #9ca3af; font-size: 13px;">
            <p>CRMia — O CRM inteligente para o teu negócio</p>
          </div>
        </div>
      `,
    });
    console.log(`✅ Cancellation email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send cancellation email:", error);
  }
}

// ============================================
// WEBHOOK HANDLER
// ============================================
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
    console.error(`❌ Webhook signature verification failed.`, err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`📩 Stripe event: ${event.type}`);

  try {
    switch (event.type) {
      // ========================================
      // CHECKOUT COMPLETED — Cliente pagou!
      // ========================================
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const orgId = session.metadata?.organizationId;
        const subscriptionId = session.subscription;
        const customerEmail = session.customer_details?.email || session.customer_email;

        if (orgId && subscriptionId) {
          // Buscar detalhes da subscription para obter o price_id
          const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId as string);
          const priceId = stripeSubscription.items.data[0]?.price?.id || "";
          const plan = getPlanFromPriceId(priceId);

          console.log(`✅ Checkout: org=${orgId}, plan=${plan.name}, price=${priceId}`);

          // 1. Update Organization
          await supabaseAdmin
            .from("organizations")
            .update({
              subscription_status: "active",
              subscription_plan: plan.slug,
              stripe_customer_id: session.customer,
            })
            .eq("id", orgId);

          // 2. Upsert Subscription (Idempotency)
          const { data: existingSub } = await supabaseAdmin
            .from("subscriptions")
            .select("id")
            .eq("stripe_subscription_id", subscriptionId)
            .maybeSingle();

          if (!existingSub) {
            await supabaseAdmin.from("subscriptions").insert({
              organization_id: orgId,
              stripe_subscription_id: subscriptionId,
              stripe_price_id: priceId,
              status: "active",
              current_period_start: new Date(
                stripeSubscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                stripeSubscription.current_period_end * 1000
              ).toISOString(),
            });
          } else {
            await supabaseAdmin
              .from("subscriptions")
              .update({
                stripe_price_id: priceId,
                status: "active",
                current_period_start: new Date(
                  stripeSubscription.current_period_start * 1000
                ).toISOString(),
                current_period_end: new Date(
                  stripeSubscription.current_period_end * 1000
                ).toISOString(),
              })
              .eq("stripe_subscription_id", subscriptionId);
          }

          // 3. Send Welcome Email
          if (customerEmail) {
            await sendWelcomeEmail(customerEmail, plan.name);
          }
        }
        break;
      }

      // ========================================
      // SUBSCRIPTION UPDATED — Plano alterado
      // ========================================
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;
        const status = subscription.status;
        const priceId = subscription.items?.data?.[0]?.price?.id || "";
        const plan = getPlanFromPriceId(priceId);

        console.log(`🔄 Subscription updated: customer=${customerId}, status=${status}, plan=${plan.name}`);

        // Find org by Stripe Customer ID
        const { data: org } = await supabaseAdmin
          .from("organizations")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (org) {
          // Update Organization
          await supabaseAdmin
            .from("organizations")
            .update({
              subscription_status: status === "active" ? "active" : "past_due",
              subscription_plan: status === "active" ? plan.slug : undefined,
            })
            .eq("id", org.id);

          // Update Subscription
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: status,
              stripe_price_id: priceId,
              current_period_start: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq("stripe_subscription_id", subscription.id);
        }
        break;
      }

      // ========================================
      // SUBSCRIPTION DELETED — Cancelamento
      // ========================================
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;

        console.log(`❌ Subscription deleted: customer=${customerId}`);

        const { data: org } = await supabaseAdmin
          .from("organizations")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (org) {
          // Downgrade to free
          await supabaseAdmin
            .from("organizations")
            .update({
              subscription_status: "inactive",
              subscription_plan: "free",
            })
            .eq("id", org.id);

          // Update Subscription
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "canceled",
            })
            .eq("stripe_subscription_id", subscription.id);

          // Get customer email for notification
          try {
            const customer = await stripe.customers.retrieve(customerId as string);
            if (customer && !customer.deleted && customer.email) {
              await sendCancellationEmail(customer.email);
            }
          } catch (e) {
            console.error("Could not fetch customer email for cancellation:", e);
          }
        }
        break;
      }

      // ========================================
      // INVOICE PAYMENT SUCCEEDED — Renovação OK
      // ========================================
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription;

        if (subscriptionId && invoice.billing_reason === "subscription_cycle") {
          console.log(`💰 Renewal payment succeeded: sub=${subscriptionId}`);

          // Update subscription period
          const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId as string);

          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "active",
              current_period_start: new Date(
                stripeSubscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                stripeSubscription.current_period_end * 1000
              ).toISOString(),
            })
            .eq("stripe_subscription_id", subscriptionId);

          // Update org status
          const { data: org } = await supabaseAdmin
            .from("organizations")
            .select("id")
            .eq("stripe_customer_id", invoice.customer)
            .single();

          if (org) {
            await supabaseAdmin
              .from("organizations")
              .update({ subscription_status: "active" })
              .eq("id", org.id);
          }
        }
        break;
      }

      // ========================================
      // INVOICE PAYMENT FAILED — Pagamento falhou
      // ========================================
      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const customerId = invoice.customer;

        console.log(`⚠️ Payment failed: customer=${customerId}`);

        const { data: org } = await supabaseAdmin
          .from("organizations")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (org) {
          await supabaseAdmin
            .from("organizations")
            .update({ subscription_status: "past_due" })
            .eq("id", org.id);
        }

        // Send payment failed email
        try {
          const customer = await stripe.customers.retrieve(customerId as string);
          if (customer && !customer.deleted && customer.email) {
            await sendPaymentFailedEmail(customer.email);
          }
        } catch (e) {
          console.error("Could not fetch customer email:", e);
        }
        break;
      }

      default:
        console.log(`⏭️ Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error("❌ Webhook Logic Error:", error);
    return new NextResponse("Webhook Logic Error", { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}
