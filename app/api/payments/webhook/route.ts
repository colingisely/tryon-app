import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import {
  getMerchantIdByCustomer, cancelScheduledSuspension,
  scheduleSuspension, suspendMerchant, reactivateMerchant,
} from '@/lib/overage';

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

async function getPlanByPriceId(priceId: string) {
  const { data } = await getSupabase()
    .from('plans')
    .select('id, slug, fast_credits_monthly, premium_credits_monthly, price_usd')
    .eq('stripe_price_id', priceId)
    .single();
  return data;
}

async function logAndDedup(eventId: string, eventType: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (getSupabase() as any).from('stripe_webhook_log').insert({ event_id: eventId, event_type: eventType });
  return !error;
}

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('[webhook] Invalid signature:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const isNew = await logAndDedup(event.id, event.type);
  if (!isNew) return NextResponse.json({ received: true, skipped: 'duplicate' });

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session    = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const priceId    = (session as any).metadata?.price_id ?? session.line_items?.data?.[0]?.price?.id;
        if (!customerId || !priceId) break;
        const plan = await getPlanByPriceId(priceId);
        if (!plan) break;
        const merchantId = await getMerchantIdByCustomer(customerId) ?? session.metadata?.merchant_id ?? null;
        if (!merchantId) break;
        await getSupabase().from('merchants').update({
          plan_id: plan.id, stripe_customer_id: customerId,
          stripe_subscription_id: session.subscription as string,
          subscription_status: 'active', subscription_started_at: new Date().toISOString(),
          fast_credits_remaining: plan.fast_credits_monthly,
          premium_credits_remaining: plan.premium_credits_monthly,
          fast_credits_used_total: 0, premium_credits_used_total: 0,
          overage_status: 'inactive', overage_used_cents: 0,
          updated_at: new Date().toISOString(),
        }).eq('id', merchantId);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice    = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;
        if ((invoice as any).billing_reason === 'subscription_create') break;
        const merchantId = await getMerchantIdByCustomer(customerId);
        if (!merchantId) break;
        const sub  = await getStripe().subscriptions.retrieve((invoice as any).subscription as string);
        const plan = await getPlanByPriceId(sub.items.data[0]?.price?.id);
        if (plan) {
          await getSupabase().from('merchants').update({
            fast_credits_remaining: plan.fast_credits_monthly,
            premium_credits_remaining: plan.premium_credits_monthly,
            subscription_status: 'active', updated_at: new Date().toISOString(),
          }).eq('id', merchantId);
        }
        await reactivateMerchant(merchantId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice    = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;
        const merchantId = await getMerchantIdByCustomer(customerId);
        if (!merchantId) break;
        await getSupabase().from('merchants').update({
          overage_status: 'payment_failed', payment_failed_at: new Date().toISOString(),
          subscription_status: 'past_due', updated_at: new Date().toISOString(),
        }).eq('id', merchantId);
        await scheduleSuspension(merchantId);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub        = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
        if (!customerId) break;
        const merchantId = await getMerchantIdByCustomer(customerId);
        if (!merchantId) break;
        await getSupabase().from('merchants').update({
          subscription_status: 'canceled',
          fast_credits_remaining: 0, premium_credits_remaining: 0,
          updated_at: new Date().toISOString(),
        }).eq('id', merchantId);
        await suspendMerchant(merchantId);
        break;
      }

      case 'customer.subscription.updated': {
        const sub        = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
        if (!customerId) break;
        const merchantId = await getMerchantIdByCustomer(customerId);
        if (!merchantId) break;
        const plan = await getPlanByPriceId(sub.items.data[0]?.price?.id);
        if (plan) await getSupabase().from('merchants').update({ plan_id: plan.id, updated_at: new Date().toISOString() }).eq('id', merchantId);
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        if (intent.metadata?.type !== 'overage_preauth') break;
        const merchantId = intent.metadata?.merchant_id;
        if (!merchantId) break;
        await getSupabase().from('merchants').update({
          overage_status: 'payment_failed', payment_failed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('id', merchantId);
        await scheduleSuspension(merchantId);
        break;
      }

      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        if (intent.metadata?.type !== 'overage_preauth') break;
        const merchantId = intent.metadata?.merchant_id;
        if (!merchantId) break;
        await cancelScheduledSuspension(merchantId);
        break;
      }
    }
  } catch (err) {
    console.error(`[webhook] Error on ${event.type}:`, err);
  }

  return NextResponse.json({ received: true });
}
