import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" })
  : null;

// Use service role key for webhook (bypasses RLS)
const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    : null;

const PLAN_CREDITS: Record<string, { fast: number; premium: number }> = {
  free: { fast: 100, premium: 0 },
  starter: { fast: 500, premium: 10 },
  pro: { fast: 2000, premium: 50 },
  enterprise: { fast: 999999, premium: 300 },
};

export async function POST(req: Request) {
  if (!stripe || !supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`📦 Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        const planSlug = session.metadata?.planSlug || "starter";

        if (!userId) {
          console.error("No userId in session metadata");
          break;
        }

        const credits = PLAN_CREDITS[planSlug] || PLAN_CREDITS.starter;

        // Get plan ID from database
        const { data: plan } = await supabase
          .from("plans")
          .select("id")
          .eq("slug", planSlug)
          .single();

        // Update merchant subscription
        await supabase
          .from("merchants")
          .update({
            plan_id: plan?.id,
            subscription_status: "active",
            subscription_started_at: new Date().toISOString(),
            subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            fast_credits_remaining: credits.fast,
            premium_credits_remaining: credits.premium,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        // Log transaction
        await supabase.from("transactions").insert({
          merchant_id: userId,
          type: "subscription",
          amount: (session.amount_total || 0) / 100,
          currency: session.currency?.toUpperCase() || "BRL",
          status: "completed",
          stripe_payment_id: session.payment_intent as string,
          description: `Assinatura ${planSlug} - Stripe`,
          metadata: { stripe_session_id: session.id, plan: planSlug },
        });

        console.log(`✅ Subscription activated for user ${userId} - plan: ${planSlug}`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        // Get subscription details
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = sub.metadata?.userId;
        const planSlug = sub.metadata?.planSlug || "starter";

        if (!userId) break;

        const credits = PLAN_CREDITS[planSlug] || PLAN_CREDITS.starter;
        const periodEnd = (sub as any).current_period_end;

        // Renew credits monthly
        await supabase
          .from("merchants")
          .update({
            subscription_status: "active",
            subscription_expires_at: new Date(periodEnd * 1000).toISOString(),
            fast_credits_remaining: credits.fast,
            premium_credits_remaining: credits.premium,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        console.log(`🔄 Credits renewed for user ${userId} - plan: ${planSlug}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoiceFailed = event.data.object as any;
        const subscriptionFailed = invoiceFailed.subscription as string;

        if (!subscriptionFailed) break;

        const subFailed = await stripe.subscriptions.retrieve(subscriptionFailed);
        const userIdFailed = subFailed.metadata?.userId;

        if (!userIdFailed) break;

        // Mark subscription as past_due
        await supabase
          .from("merchants")
          .update({
            subscription_status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userIdFailed);

        console.log(`⚠️ Payment failed for user ${userIdFailed}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        // Cancel subscription
        await supabase
          .from("merchants")
          .update({
            subscription_status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        console.log(`❌ Subscription cancelled for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
