import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'placeholder', {
      apiVersion: '2026-02-25.clover' as any,
    });
  }
  return _stripe;
}

let _supabase: ReturnType<typeof createClient> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): any {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId e email são obrigatórios.' },
        { status: 400 }
      );
    }

    // ── 1. Check for a pending subscription stored by the webhook ──────────
    const { data: pending } = await getSupabase()
      .from('pending_subscriptions')
      .select('*')
      .eq('customer_email', email.toLowerCase())
      .maybeSingle();

    let stripeCustomerId: string | null = null;
    let stripeSubscriptionId: string | null = null;
    let planId: string | null = null;
    let fastCredits: number = 0;
    let premiumCredits: number = 0;

    if (pending) {
      // Happy path: webhook already stored everything we need.
      stripeCustomerId     = pending.stripe_customer_id;
      stripeSubscriptionId = pending.stripe_subscription_id;
      planId               = pending.plan_id;
      fastCredits          = pending.fast_credits_monthly ?? 0;
      premiumCredits       = pending.premium_credits_monthly ?? 0;
    } else {
      // Fallback: query Stripe directly (webhook may not have fired yet).
      const customers = await getStripe().customers.search({
        query: `email:'${email.toLowerCase()}'`,
        limit: 1,
      });

      if (!customers.data.length) {
        // No Stripe customer found — nothing to activate.
        return NextResponse.json({ activated: false, reason: 'no_stripe_customer' });
      }

      const customer = customers.data[0];
      stripeCustomerId = customer.id;

      const subscriptions = await getStripe().subscriptions.list({
        customer: stripeCustomerId,
        status:   'active',
        limit:    1,
      });

      if (!subscriptions.data.length) {
        return NextResponse.json({ activated: false, reason: 'no_active_subscription' });
      }

      const subscription    = subscriptions.data[0];
      stripeSubscriptionId  = subscription.id;
      const priceId         = subscription.items.data[0]?.price?.id;

      if (!priceId) {
        return NextResponse.json({ activated: false, reason: 'no_price_id' });
      }

      // Look up the plan in Supabase by stripe_price_id.
      const { data: plan } = await getSupabase()
        .from('plans')
        .select('id, fast_credits_monthly, premium_credits_monthly')
        .eq('stripe_price_id', priceId)
        .single();

      if (!plan) {
        return NextResponse.json({ activated: false, reason: 'plan_not_found' });
      }

      planId         = plan.id;
      fastCredits    = plan.fast_credits_monthly ?? 0;
      premiumCredits = plan.premium_credits_monthly ?? 0;
    }

    // ── 2. Update the merchant record with Stripe subscription data ─────────
    // NOTE: we do NOT reset fast_credits_used_total / premium_credits_used_total
    // here because activate-subscription may be called multiple times (e.g. if
    // the user returns to the success URL). Resetting _used_total would erase
    // real usage history and allow credits consumed before re-activation to
    // disappear. Credits are only refreshed here on NEW activations — the
    // monthly renewal is handled exclusively by invoice.payment_succeeded.
    const { error: updateError } = await getSupabase()
      .from('merchants')
      .update({
        stripe_customer_id:       stripeCustomerId,
        stripe_subscription_id:   stripeSubscriptionId,
        plan_id:                  planId,
        subscription_status:      'active',
        subscription_started_at:  new Date().toISOString(),
        fast_credits_remaining:   fastCredits,
        premium_credits_remaining: premiumCredits,
        overage_status:           'inactive',
        overage_used_cents:       0,
        updated_at:               new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[activate-subscription] merchants update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // ── 3. Clean up pending_subscriptions row if it existed ─────────────────
    if (pending) {
      await getSupabase()
        .from('pending_subscriptions')
        .delete()
        .eq('stripe_customer_id', stripeCustomerId);
    }

    console.log(
      `[activate-subscription] Linked Stripe customer ${stripeCustomerId} ` +
      `(sub ${stripeSubscriptionId}) to merchant ${userId}`
    );

    return NextResponse.json({ activated: true });
  } catch (err: any) {
    console.error('[activate-subscription] Unexpected error:', err);
    return NextResponse.json(
      { error: err.message || 'Erro inesperado.' },
      { status: 500 }
    );
  }
}
