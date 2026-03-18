import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { priceId, quantity = 1 } = await req.json();

  if (!priceId) {
    return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
  }

  try {
    const checkoutConfig: any = {
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      success_url: `${req.nextUrl.origin}/dashboard?success=true`,
      cancel_url: `${req.nextUrl.origin}/?canceled=true`,
    };

    // If user is authenticated, add their email and userId
    if (user) {
      checkoutConfig.customer_email = user.email;
      checkoutConfig.metadata = { userId: user.id };
    } else {
      // For unauthenticated users, redirect to login after checkout
      checkoutConfig.success_url = `${req.nextUrl.origin}/login?redirect=/dashboard&success=true`;
    }

    const session = await stripe.checkout.sessions.create(checkoutConfig);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
