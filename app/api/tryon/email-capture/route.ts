// Public endpoint — called by the widget running in the consumer's browser.
// No merchant auth required; shop domain is used to resolve the merchant.
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, shop, result_url } = body ?? {};

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400, headers: CORS_HEADERS });
    }
    if (!shop || typeof shop !== 'string') {
      return NextResponse.json({ error: 'Shop obrigatório' }, { status: 400, headers: CORS_HEADERS });
    }

    const supabase = getSupabase();

    // Resolve merchant by shop domain (non-fatal if not found)
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('shop_domain', shop)
      .maybeSingle();

    const { error: insertError } = await supabase.from('tryon_leads').insert({
      merchant_id: merchant?.id ?? null,
      shop,
      email: email.toLowerCase().trim(),
      result_url: result_url ?? null,
    });

    if (insertError) {
      console.error('[email-capture] insert failed:', insertError.message);
    }

    return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error('[email-capture] unexpected error:', err);
    // Always return ok — never expose errors to end consumers
    return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
  }
}
