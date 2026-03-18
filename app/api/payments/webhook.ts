import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not set.');
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      const supabase = await createClient();

      switch (event.type) {
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          const userId = checkoutSession.metadata?.userId;
          const subscriptionId = checkoutSession.subscription as string;
          const customerId = checkoutSession.customer as string;

          if (userId && subscriptionId && customerId) {
            // Update merchant with customer_id and subscription_id
            await supabase
              .from('merchants')
              .update({ stripe_customer_id: customerId, stripe_subscription_id: subscriptionId })
              .eq('id', userId);

            // Optionally, fetch subscription details to update plan_id and current_period_end
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items.data[0].price.id;

            // Map priceId to plan_id (e.g., 'price_starter' -> 'starter')
            let planId = 'preview'; // Default
            if (priceId === process.env.STRIPE_PRICE_STARTER) planId = 'starter';
            if (priceId === process.env.STRIPE_PRICE_GROWTH) planId = 'growth';
            if (priceId === process.env.STRIPE_PRICE_PRO) planId = 'pro';

            await supabase
              .from('merchants')
              .update({ plan_id: planId, current_period_end: new Date(subscription.current_period_end * 1000).toISOString() })
              .eq('id', userId);
          }
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscription = event.data.object as Stripe.Subscription;
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          const merchantId = (customer as any).metadata?.userId; // Assuming userId is stored in customer metadata

          if (merchantId) {
            const priceId = subscription.items.data[0].price.id;
            let planId = 'preview';
            if (priceId === process.env.STRIPE_PRICE_STARTER) planId = 'starter';
            if (priceId === process.env.STRIPE_PRICE_GROWTH) planId = 'growth';
            if (priceId === process.env.STRIPE_PRICE_PRO) planId = 'pro';

            await supabase
              .from('merchants')
              .update({ plan_id: planId, current_period_end: new Date(subscription.current_period_end * 1000).toISOString() })
              .eq('id', merchantId);
          }
          break;
        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object as Stripe.Subscription;
          const deletedCustomer = await stripe.customers.retrieve(deletedSubscription.customer as string);
          const deletedMerchantId = (deletedCustomer as any).metadata?.userId;

          if (deletedMerchantId) {
            await supabase
              .from('merchants')
              .update({ plan_id: 'preview', stripe_subscription_id: null, stripe_customer_id: null, current_period_end: null })
              .eq('id', deletedMerchantId);
          }
          break;
        default:
          console.warn(`Unhandled event type: ${event.type}`);
      }
    } catch (error: any) {
      console.error('Error handling Stripe event:', error);
      return new Response('Webhook handler failed', { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
