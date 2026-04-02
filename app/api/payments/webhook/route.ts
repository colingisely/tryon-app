import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendSubscriptionEmail, sendCancellationEmail, sendPaymentFailedEmail } from '@/lib/email';

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
          .select('id, credits_monthly')
          .eq('stripe_price_id', priceId)
          .single();

        // Fallback: find by slug
        if (!plan) {
          const { data: planBySlug } = await supabase
            .from('plans')
            .select('id, credits_monthly')
            .eq('slug', planSlug)
            .single();
          plan = planBySlug;
        }

        if (!plan) {
          console.error(`Plan not found for priceId: ${priceId}`);
          break;
        }

        // current_period_end moved to items level in newer Stripe API versions
        const periodEndRaw = subscription.current_period_end
          ?? subscription.items.data[0]?.current_period_end;
        const periodEnd = periodEndRaw
          ? new Date(periodEndRaw * 1000).toISOString()
          : null;

        await supabase
          .from('merchants')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan_id: plan.id,
            subscription_status: 'active',
            subscription_started_at: new Date().toISOString(),
            subscription_current_period_end: periodEnd,
            credits_remaining: plan.credits_monthly,
            payment_failed_at: null,
          })
          .eq('id', userId);

        // Audit: log the credit grant for this activation
        await supabase.rpc('log_credit_set', {
          p_merchant_id:  userId,
          p_credits_new:  plan.credits_monthly,
          p_reason:       'plan_activation',
          p_source:       'webhook:checkout.session.completed',
          p_reference_id: subscriptionId,
        });

        console.log(`Subscription activated for merchant ${userId} -> plan ${planSlug}`);

        // Send subscription confirmation email
        try {
          const { data: merchant } = await supabase
            .from('merchants')
            .select('email, store_name')
            .eq('id', userId)
            .single();

          if (merchant?.email) {
            const planLabel: Record<string, string> = {
              starter: 'Starter', growth: 'Growth', pro: 'Pro', enterprise: 'Enterprise',
            };
            await sendSubscriptionEmail(
              merchant.email,
              planLabel[planSlug] ?? planSlug,
              merchant.store_name
            );
          }
        } catch (emailErr) {
          console.error('Failed to send subscription email:', emailErr);
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // CRITICAL: Only reset credits on monthly RENEWAL cycles (subscription_cycle).
        //   - subscription_create → checkout.session.completed already set credits; skip.
        //   - subscription_update → proration invoice from mid-cycle upgrade/downgrade;
        //     customer.subscription.updated already handled the credit diff; skip.
        //   - subscription_cycle → genuine monthly renewal; reset credits here. ✅
        const billingReason = (invoice as any).billing_reason as string | undefined;
        if (billingReason !== 'subscription_cycle') {
          console.log(`invoice.payment_succeeded: billing_reason=${billingReason}, skipping credit reset for customer ${customerId}`);
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
          .select('credits_monthly')
          .eq('id', merchant.plan_id)
          .single();

        // Fetch subscription to get updated period end
        const renewedSub = merchant.plan_id
          ? await stripe.subscriptions.list({ customer: customerId, limit: 1 }).then(r => r.data[0]).catch(() => null)
          : null;
        // current_period_end moved to items level in newer Stripe API versions
        const renewedPeriodEndRaw = renewedSub?.current_period_end
          ?? renewedSub?.items?.data?.[0]?.current_period_end;
        const renewedPeriodEnd = renewedPeriodEndRaw
          ? new Date(renewedPeriodEndRaw * 1000).toISOString()
          : null;

        await supabase
          .from('merchants')
          .update({
            subscription_status: 'active',
            payment_failed_at: null,
            credits_remaining: plan?.credits_monthly ?? 0,
            ...(renewedPeriodEnd && { subscription_current_period_end: renewedPeriodEnd }),
          })
          .eq('id', merchant.id);

        // Audit: log the credit renewal
        await supabase.rpc('log_credit_set', {
          p_merchant_id:  merchant.id,
          p_credits_new:  plan?.credits_monthly ?? 0,
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

        // Send payment failed email
        try {
          const { data: failedMerchant } = await supabase
            .from('merchants')
            .select('email, plan_id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (failedMerchant?.email) {
            let failedPlanName = 'seu plano';
            if (failedMerchant.plan_id) {
              const { data: failedPlan } = await supabase
                .from('plans')
                .select('slug')
                .eq('id', failedMerchant.plan_id)
                .single();
              const planLabel: Record<string, string> = {
                starter: 'Starter', growth: 'Growth', pro: 'Pro', enterprise: 'Enterprise',
              };
              if (failedPlan?.slug) {
                failedPlanName = planLabel[failedPlan.slug] ?? failedPlan.slug;
              }
            }
            await sendPaymentFailedEmail(failedMerchant.email, failedPlanName);
          }
        } catch (emailErr) {
          console.error('Failed to send payment failed email:', emailErr);
        }

        console.warn(`Payment failed for customer ${customerId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0].price.id;
        const isActive = subscription.status === 'active';

        let planSlug = 'free';
        if (priceId === process.env.STRIPE_PRICE_STARTER_MONTHLY) planSlug = 'starter';
        else if (priceId === process.env.STRIPE_PRICE_GROWTH_MONTHLY) planSlug = 'growth';
        else if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) planSlug = 'pro';

        let { data: plan } = await supabase
          .from('plans')
          .select('id, slug, credits_monthly')
          .eq('stripe_price_id', priceId)
          .single();

        if (!plan) {
          const { data: planBySlug } = await supabase
            .from('plans')
            .select('id, slug, credits_monthly')
            .eq('slug', planSlug)
            .single();
          plan = planBySlug;
        }

        if (plan) {
          // Check if the price actually changed (upgrade/downgrade)
          const prevItems = (event.data.previous_attributes as any)?.items;
          const priceChanged = prevItems !== undefined;

          const updatePayload: Record<string, unknown> = {
            plan_id: plan.id,
            subscription_status: isActive ? 'active' : subscription.status,
          };

          // On plan change: add credits (upgrade) or reset credits (downgrade)
          if (priceChanged && isActive) {
            // Fetch current merchant to determine upgrade vs downgrade
            const { data: currentMerchant } = await supabase
              .from('merchants')
              .select('id, plan_id, credits_remaining')
              .eq('stripe_customer_id', customerId)
              .single();

            if (currentMerchant) {
              // Check old plan to determine if upgrade or downgrade
              const { data: oldPlan } = await supabase
                .from('plans')
                .select('credits_monthly')
                .eq('id', currentMerchant.plan_id)
                .single();

              const isUpgrade = plan.credits_monthly > (oldPlan?.credits_monthly ?? 0);

              if (isUpgrade) {
                // Upgrade: ADD only the DIFFERENCE between old and new plan.
                // Adding the full new plan total would grant free credits already
                // paid for in the current cycle — causing margin erosion on prorated upgrades.
                const diff = Math.max(0, plan.credits_monthly - (oldPlan?.credits_monthly ?? 0));
                updatePayload.credits_remaining = currentMerchant.credits_remaining + diff;
              } else {
                // Downgrade: reset to new plan credits
                updatePayload.credits_remaining = plan.credits_monthly;
              }
            } else {
              // Fallback: reset to new plan credits
              updatePayload.credits_remaining = plan.credits_monthly;
            }

            updatePayload.payment_failed_at = null;
          }

          // Save updated period end on plan change
          if (subscription.current_period_end) {
            updatePayload.subscription_current_period_end =
              new Date(subscription.current_period_end * 1000).toISOString();
          }

          await supabase
            .from('merchants')
            .update(updatePayload)
            .eq('stripe_customer_id', customerId);

          // Send confirmation email on plan upgrade/change
          if (priceChanged && isActive) {
            try {
              const { data: merchant } = await supabase
                .from('merchants')
                .select('email, store_name')
                .eq('stripe_customer_id', customerId)
                .single();

              if (merchant?.email) {
                const planLabel: Record<string, string> = {
                  starter: 'Starter', growth: 'Growth', pro: 'Pro', enterprise: 'Enterprise',
                };
                await sendSubscriptionEmail(
                  merchant.email,
                  planLabel[planSlug] ?? planSlug,
                  merchant.store_name
                );
              }
            } catch (emailErr) {
              console.error('Failed to send upgrade email:', emailErr);
            }
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: freePlan } = await supabase
          .from('plans')
          .select('id')
          .eq('slug', 'free')
          .single();

        // Get merchant info before updating for the cancellation email
        const { data: cancelledMerchant } = await supabase
          .from('merchants')
          .select('email, plan_id')
          .eq('stripe_customer_id', customerId)
          .single();

        // Get the plan name for the email
        let cancelledPlanName = 'seu plano';
        if (cancelledMerchant?.plan_id) {
          const { data: cancelledPlan } = await supabase
            .from('plans')
            .select('slug')
            .eq('id', cancelledMerchant.plan_id)
            .single();
          const planLabel: Record<string, string> = {
            starter: 'Starter', growth: 'Growth', pro: 'Pro', enterprise: 'Enterprise',
          };
          if (cancelledPlan?.slug) {
            cancelledPlanName = planLabel[cancelledPlan.slug] ?? cancelledPlan.slug;
          }
        }

        // Credits go to 0 on cancellation — free credits were given once at initial signup
        await supabase
          .from('merchants')
          .update({
            subscription_status: 'cancelled',
            stripe_subscription_id: null,
            plan_id: freePlan?.id ?? null,
            credits_remaining: 0,
          })
          .eq('stripe_customer_id', customerId);

        // Send cancellation email
        if (cancelledMerchant?.email) {
          try {
            const accessUntil = new Date(subscription.current_period_end * 1000)
              .toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            await sendCancellationEmail(cancelledMerchant.email, cancelledPlanName, accessUntil);
          } catch (emailErr) {
            console.error('Failed to send cancellation email:', emailErr);
          }
        }

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
