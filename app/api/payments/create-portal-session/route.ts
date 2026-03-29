import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" })
  : null;

const supabaseAdmin =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    : null;

export async function POST() {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe não configurado" },
        { status: 500 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase não configurado" },
        { status: 500 }
      );
    }

    // 1. Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // 2. Get merchant's stripe_customer_id
    const { data: merchant, error: mErr } = await supabaseAdmin
      .from("merchants")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (mErr || !merchant?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Nenhuma assinatura ativa encontrada. Escolha um plano primeiro." },
        { status: 400 }
      );
    }

    // 3. Create Stripe Customer Portal session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://reflexy.co";

    const session = await stripe.billingPortal.sessions.create({
      customer: merchant.stripe_customer_id,
      return_url: `${baseUrl}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[create-portal-session] Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Erro ao criar sessão de portal" },
      { status: 500 }
    );
  }
}
