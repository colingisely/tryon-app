import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' as any })

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()
    if (!sessionId) return NextResponse.json({ error: 'session_id required' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Retrieve the Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    })

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id

    // Look up the plan by price ID from the subscription
    let planId: string | null = null
    let fastCredits = 0
    let premiumCredits = 0

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = subscription.items.data[0]?.price.id

      if (priceId) {
        const { data: plan } = await supabase
          .from('plans')
          .select('id, fast_credits_monthly, premium_credits_monthly')
          .eq('stripe_price_id', priceId)
          .single()

        if (plan) {
          planId = plan.id
          fastCredits = plan.fast_credits_monthly
          premiumCredits = plan.premium_credits_monthly
        }
      }
    }

    // Update the merchant record
    const updateData: Record<string, unknown> = {
      stripe_customer_id: customerId,
      subscription_status: 'active',
      subscription_started_at: new Date().toISOString(),
    }
    if (subscriptionId) updateData.stripe_subscription_id = subscriptionId
    if (planId) {
      updateData.plan_id = planId
      updateData.fast_credits_remaining = fastCredits
      updateData.premium_credits_remaining = premiumCredits
    }

    const { error } = await supabase
      .from('merchants')
      .update(updateData)
      .eq('id', user.id)

    if (error) {
      console.error('link-session: DB update error', error)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true, planId, subscriptionId })
  } catch (err) {
    console.error('link-session error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
