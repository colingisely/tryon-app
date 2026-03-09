/**
 * lib/overage.ts
 * Lógica central de excedentes do Reflexy
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const OVERAGE_RATES: Record<string, { fast_cents: number; premium_cents: number }> = {
  free:       { fast_cents: 0,  premium_cents: 0  },
  starter:    { fast_cents: 17, premium_cents: 15 },
  growth:     { fast_cents: 15, premium_cents: 15 },
  pro:        { fast_cents: 13, premium_cents: 15 },
  enterprise: { fast_cents: 10, premium_cents: 15 },
};

export function getOverageRate(planSlug: string, type: 'fast' | 'premium'): number {
  const rates = OVERAGE_RATES[planSlug] ?? OVERAGE_RATES.starter;
  return type === 'fast' ? rates.fast_cents : rates.premium_cents;
}

export async function getMerchantBillingState(merchantId: string) {
  const { data, error } = await supabase
    .from('merchants')
    .select(`
      id, stripe_customer_id, stripe_subscription_id,
      overage_status, overage_cap_cents, overage_used_cents,
      overage_payment_intent_id, payment_failed_at, suspended_at,
      fast_credits_remaining, premium_credits_remaining,
      plans!plan_id ( slug, price_usd )
    `)
    .eq('id', merchantId)
    .single();
  if (error || !data) return null;
  return data;
}

export async function activateOverage(
  merchantId: string
): Promise<'authorized' | 'failed' | 'already_active' | 'free_plan'> {
  const merchant = await getMerchantBillingState(merchantId);
  if (!merchant) return 'failed';

  const plan = Array.isArray(merchant.plans) ? merchant.plans[0] : merchant.plans as any;
  if (!plan || plan.slug === 'free') return 'free_plan';
  if (['active', 'preauth_pending'].includes(merchant.overage_status)) return 'already_active';

  const planPriceCents = Math.round(Number(plan.price_usd) * 100);
  if (!merchant.stripe_customer_id) return 'failed';

  await supabase.from('merchants').update({
    overage_status: 'preauth_pending',
    overage_cap_cents: planPriceCents,
    overage_used_cents: 0,
    updated_at: new Date().toISOString(),
  }).eq('id', merchantId);

  try {
    const customer = await stripe.customers.retrieve(merchant.stripe_customer_id) as Stripe.Customer;
    const paymentMethodId = customer.invoice_settings?.default_payment_method as string;
    if (!paymentMethodId) throw new Error('No default payment method on customer');

    const intent = await stripe.paymentIntents.create({
      amount: planPriceCents,
      currency: 'usd',
      customer: merchant.stripe_customer_id,
      payment_method: paymentMethodId,
      capture_method: 'manual',
      confirm: true,
      description: `Reflexy overage pre-auth — ${plan.slug} — merchant: ${merchantId}`,
      metadata: { merchant_id: merchantId, plan_slug: plan.slug, type: 'overage_preauth' },
      payment_method_options: { card: { request_three_d_secure: 'automatic' } },
    });

    if (intent.status === 'requires_capture') {
      await supabase.from('merchants').update({
        overage_status: 'active',
        overage_cap_cents: planPriceCents,
        overage_used_cents: 0,
        overage_payment_intent_id: intent.id,
        updated_at: new Date().toISOString(),
      }).eq('id', merchantId);
      await logNotification(merchantId, 'overage_activated', { cap_dollars: (planPriceCents / 100).toFixed(2), plan_slug: plan.slug });
      return 'authorized';
    }
    throw new Error(`Unexpected PaymentIntent status: ${intent.status}`);

  } catch (err) {
    await supabase.from('merchants').update({
      overage_status: 'payment_failed',
      payment_failed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', merchantId);
    await scheduleSuspension(merchantId);
    await logNotification(merchantId, 'overage_preauth_failed', {});
    console.error(`[overage] Pre-auth failed for merchant ${merchantId}:`, err);
    return 'failed';
  }
}

export async function checkOverageCap(
  merchantId: string,
  type: 'fast' | 'premium'
): Promise<'allowed' | 'cap_reached' | 'blocked'> {
  const merchant = await getMerchantBillingState(merchantId);
  if (!merchant) return 'blocked';
  if (['suspended','payment_failed','cap_reached','preauth_pending','inactive','free_plan'].includes(merchant.overage_status)) return 'blocked';
  if (merchant.overage_status !== 'active') return 'blocked';

  const plan = Array.isArray(merchant.plans) ? merchant.plans[0] : merchant.plans as any;
  const costCents = getOverageRate(plan?.slug ?? 'starter', type);
  const newUsed = merchant.overage_used_cents + costCents;

  if (newUsed > merchant.overage_cap_cents) {
    await captureAndBlock(merchantId, merchant);
    return 'cap_reached';
  }

  await supabase.from('merchants').update({
    overage_used_cents: newUsed,
    updated_at: new Date().toISOString(),
  }).eq('id', merchantId);

  const prevPct = merchant.overage_used_cents / merchant.overage_cap_cents;
  const newPct  = newUsed / merchant.overage_cap_cents;
  if (newPct >= 0.8 && prevPct < 0.8) {
    await logNotification(merchantId, 'overage_cap_80pct', {
      used_dollars: (newUsed / 100).toFixed(2),
      cap_dollars: (merchant.overage_cap_cents / 100).toFixed(2),
    });
  }
  return 'allowed';
}

async function captureAndBlock(merchantId: string, merchant: any) {
  if (merchant.overage_payment_intent_id) {
    try {
      await stripe.paymentIntents.capture(merchant.overage_payment_intent_id, {
        amount_to_capture: merchant.overage_used_cents,
      });
    } catch (err) {
      console.error(`[overage] Capture failed for merchant ${merchantId}:`, err);
    }
  }
  await supabase.from('merchants').update({
    overage_status: 'cap_reached',
    overage_payment_intent_id: null,
    updated_at: new Date().toISOString(),
  }).eq('id', merchantId);
  await logNotification(merchantId, 'overage_cap_reached', { used_dollars: (merchant.overage_used_cents / 100).toFixed(2) });
}

export async function scheduleSuspension(merchantId: string) {
  const suspendAt = new Date();
  suspendAt.setDate(suspendAt.getDate() + 3);
  await supabase.from('billing_suspension_queue').upsert({
    merchant_id: merchantId,
    suspend_at: suspendAt.toISOString(),
    reason: 'payment_failed',
    processed: false,
  }, { onConflict: 'merchant_id' });
}

export async function cancelScheduledSuspension(merchantId: string) {
  await supabase.from('billing_suspension_queue')
    .update({ processed: true })
    .eq('merchant_id', merchantId)
    .eq('processed', false);
}

export async function suspendMerchant(merchantId: string) {
  await supabase.from('merchants').update({
    overage_status: 'suspended',
    suspended_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', merchantId);
  await logNotification(merchantId, 'merchant_suspended', {});
}

export async function reactivateMerchant(merchantId: string) {
  await cancelScheduledSuspension(merchantId);
  await supabase.from('merchants').update({
    overage_status: 'inactive',
    overage_used_cents: 0,
    overage_payment_intent_id: null,
    payment_failed_at: null,
    suspended_at: null,
    updated_at: new Date().toISOString(),
  }).eq('id', merchantId);
  await logNotification(merchantId, 'merchant_reactivated', {});
}

export async function getMerchantIdByCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabase
    .from('merchants')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  return data?.id ?? null;
}

async function logNotification(merchantId: string, event: string, payload: Record<string, string>) {
  console.log(`[notify] merchant=${merchantId} event=${event}`, payload);
  await supabase.from('billing_notifications').insert({ merchant_id: merchantId, event, payload }).then(() => {});
}