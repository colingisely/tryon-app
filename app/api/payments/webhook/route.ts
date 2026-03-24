import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Log the event (idempotency)
  const { error: logError } = await supabase
    .from('stripe_webhook_log')
    .insert({ event_id: event.id, event_type: event.type })
    .select()
    .single();

  if (logError && logError.code !== '23505') {
    // 23505 = unique violation = already processed
    console.error('Failed to log webhook event:', logError);
  }

  // If already processed (duplicate), skip
  if (logError?.code === '23505') {
    return NextResponse.json({ received: true, skipped: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!userId || !subscriptionId || !customerId) {
          console.warn('checkout.session.completed: missing userId, subscriptionId or customerId');
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;

        // Look up plan by stripe_price_id first, then by slug fallback
        let planSlug = 'free';
        if (priceId === process.env.STRIPE_PRICE_STARTER_MONTHLY) planSlug = 'starter';
        else if (priceId === process.env.STRIPE_PRICE_GROWTH_MONTHLY) planSlug = 'growth';
        else if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) planSlug = 'pro';

        // Try to find plan by stripe_price_id in DB
        let { data: plan } = await supabase
          .from('plans')
          .select('id, fast_credits_monthly, premium_credits_monthly')
          .eq('stripe_price_id', priceId)
          .single();

        // Fallback: find by slug
        if (!plan) {
          const { data: planBySlug } = await supabase
            .from('plans')
            .select('id, fast_credits_monthly, premium_credits_monthly')
            .eq('slug', planSlug)
            .single();
          plan = planBySlug;
        }

        if (!plan) {
          console.error(`Plan not found for priceId: ${priceId}`);
          break;
        }

        await supabase
          .from('merchants')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan_id: plan.id,
            subscription_status: 'active',
            subscription_started_at: new Date().toISOString(),
            fast_credits_remaining: plan.fast_credits_monthly,
            premium_credits_remaining: plan.premium_credits_monthly,
            payment_failed_at: null,
          })
          .eq('id', userId);

        // Audit: log the credit grant for this activation
        await supabase.rpc('log_credit_set', {
          p_merchant_id:  userId,
          p_fast_new:     plan.fast_credits_monthly,
          p_premium_new:  plan.premium_credits_monthly,
          p_reason:       'plan_activation',
          p_source:       'webhook:checkout.session.completed',
          p_reference_id: subscriptionId,
        });

        console.log(`Subscription activated for merchant ${userId} -> plan ${planSlug}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // CRITICAL: Only reset credits on monthly RENEWAL cycles.
        // billing_reason = 'subscription_create' fires when the subscription
        // is first created — checkout.session.completed already handled that.
        // Resetting here would wipe any credits used in the gap between the
        // two events (seconds to minutes), causing billing discrepancies.
        if ((invoice as any).billing_reason === 'subscription_create') {
          console.log(`invoice.payment_succeeded: initial invoice (subscription_create), skipping credit reset for customer ${customerId}`);
          break;
        }

        const { data: merchant } = await supabase
          .from('merchants')
          .select('id, plan_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!merchant) break;

        const { data: plan } = await supabase
          .from('plans')
          .select('fast_credits_monthly, premium_credits_monthly')
          .eq('id', merchant.plan_id)
          .single();

        await supabase
          .from('merchants')
          .update({
            subscription_status: 'active',
            payment_failed_at: null,
            fast_credits_remaining: plan?.fast_credits_monthly ?? 0,
            premium_credits_remaining: plan?.premium_credits_monthly ?? 0,
          })
          .eq('id', merchant.id);

        // Audit: log the credit renewal
        await supabase.rpc('log_credit_set', {
          p_merchant_id:  merchant.id,
          p_fast_new:     plan?.fast_credits_monthly ?? 0,
          p_premium_new:  plan?.premium_credits_monthly ?? 0,
          p_reason:       'plan_renewal',
          p_source:       'webhook:invoice.payment_succeeded',
          p_reference_id: (invoice as any).id ?? null,
        });

        console.log(`Payment succeeded (renewal), credits reset for merchant ${merchant.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await supabase
          .from('merchants')
          .update({
            subscription_status: 'past_due',
            payment_failed_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        console.warn(`Payment failed for customer ${customerId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0].price.id;

        let planSlug = 'free';
        if (priceId === process.env.STRIPE_PRICE_STARTER_MONTHLY) planSlug = 'starter';
        else if (priceId === process.env.STRIPE_PRICE_GROWTH_MONTHLY) planSlug = 'growth';
        else if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) planSlug = 'pro';

        let { data: plan } = await supabase
          .from('plans')
          .select('id')
          .eq('stripe_price_id', priceId)
          .single();

        if (!plan) {
          const { data: planBySlug } = await supabase
            .from('plans')
            .select('id')
            .eq('slug', planSlug)
            .single();
          plan = planBySlug;
        }

        if (plan) {
          await supabase
            .from('merchants')
            .update({
              plan_id: plan.id,
              subscription_status: subscription.status === 'active' ? 'active' : subscription.status,
            })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: freePlan } = await supabase
          .from('plans')
          .select('id, fast_credits_monthly, premium_credits_monthly')
          .eq('slug', 'free')
          .single();

        await supabase
          .from('merchants')
          .update({
            subscription_status: 'cancelled',
            stripe_subscription_id: null,
            plan_id: freePlan?.id ?? null,
            fast_credits_remaining: freePlan?.fast_credits_monthly ?? 0,
            premium_credits_remaining: freePlan?.premium_credits_monthly ?? 0,
          })
          .eq('stripe_customer_id', customerId);

        console.log(`Subscription cancelled for customer ${customerId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
