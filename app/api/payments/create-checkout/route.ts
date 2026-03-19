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

// Stripe Price IDs — conta acct_1T8taBQb0V048bOe (Reflexy)
// Starter    = $19/mês  — 100 try-ons, 5 Studio Pro
// Growth     = $39/mês  — 300 try-ons, 10 Studio Pro
// Pro        = $99/mês  — 800 try-ons, 20 Studio Pro
// Enterprise = $109/mês — volume customizado
const STRIPE_PRICE_IDS: Record<string, string> = {
  starter_monthly:    process.env.STRIPE_PRICE_STARTER_MONTHLY    || "price_1T8wXoQb0V048bOeSHwKxvtN",
  growth_monthly:     process.env.STRIPE_PRICE_GROWTH_MONTHLY     || "price_1T8wXrQb0V048bOeAU9Hnz5r",
  pro_monthly:        process.env.STRIPE_PRICE_PRO_MONTHLY        || "price_1T8wXtQb0V048bOe07iYDk2D",
  enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || "price_1T8wXyQb0V048bOezBnPdXrU",
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

    if (!planSlug) {
      return NextResponse.json(
        { error: "Plano não informado" },
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

    // Build session config — userId/userEmail são opcionais (landing page não autenticada)
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: userId
        ? `${baseUrl}/dashboard?payment=success&plan=${planSlug}`
        : `${baseUrl}/signup?plan=${planSlug}&payment=success`,
      cancel_url: `${baseUrl}/#pricing`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      locale: isPortuguese ? "pt-BR" : "auto",
      metadata: { planSlug, locale: locale || "pt", ...(userId && { userId }) },
      subscription_data: {
        trial_period_days: 7,
        metadata: { planSlug, ...(userId && { userId }) },
      },
    };

    // Se autenticado, pré-preenche email e vincula ao merchant
    if (userEmail) sessionConfig.customer_email = userEmail;
    if (userId)    sessionConfig.client_reference_id = userId;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar sessão de pagamento" },
      { status: 500 }
    );
  }
}
