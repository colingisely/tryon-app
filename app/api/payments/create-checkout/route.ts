import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" })
  : null;

const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    : null;

// Stripe Price IDs
const STRIPE_PRICE_IDS: Record<string, string> = {
  free_monthly: process.env.STRIPE_PRICE_FREE_MONTHLY || "price_1T76CW1oCVkpQBTzGeXwx8Xd",
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || "price_1T76Ds1oCVkpQBTzm5P9bkqi",
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "price_1T76Ff1oCVkpQBTz1RwtClv0",
  enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || "price_1T76K01oCVkpQBTz4CsbJnYG",
};

export async function POST(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe não configurado" },
        { status: 500 }
      );
    }

    const { planSlug, userId, userEmail, locale } = await req.json();

    if (!planSlug || !userId || !userEmail) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    // Get price ID for the selected plan
    const priceId = STRIPE_PRICE_IDS[`${planSlug}_monthly`];
    if (!priceId) {
      return NextResponse.json(
        { error: `Plano "${planSlug}" não encontrado ou não configurado` },
        { status: 400 }
      );
    }

    const isPortuguese = locale === "pt" || !locale;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://reflexy.co";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Pass user ID to webhook for linking subscription to merchant
      client_reference_id: userId,
      metadata: {
        userId,
        planSlug,
        locale: locale || "pt",
      },
      success_url: `${baseUrl}/dashboard?payment=success&plan=${planSlug}`,
      cancel_url: `${baseUrl}/pricing?payment=cancelled`,
      // Allow promotion codes
      allow_promotion_codes: true,
      // Billing address collection
      billing_address_collection: "auto",
      // Locale
      locale: isPortuguese ? "pt-BR" : "auto",
      // Subscription data
      subscription_data: {
        metadata: {
          userId,
          planSlug,
        },
        trial_period_days: 7, // 7-day free trial
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar sessão de pagamento" },
      { status: 500 }
    );
  }
}
