// app/api/widget/config/route.ts
// Public endpoint called by the widget on init.
// Returns per-merchant config based on plan (e.g. badge visibility).
// No auth required — only the public api_key is needed.

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getPlanFeatures } from '@/lib/plan-features';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get('key');

  if (!apiKey) {
    return NextResponse.json({ hideBadge: false }, { status: 200 });
  }

  try {
    const supabase = getSupabase();

    const { data: merchant } = await supabase
      .from('merchants')
      .select('plans!plan_id(slug)')
      .eq('api_key', apiKey)
      .single();

    const planSlug = (merchant as any)?.plans?.slug ?? 'free';
    const features = getPlanFeatures(planSlug);

    return NextResponse.json(
      { hideBadge: features.removeBadge },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch {
    // On any error, fall back to safe default (show badge)
    return NextResponse.json({ hideBadge: false }, { status: 200 });
  }
}
