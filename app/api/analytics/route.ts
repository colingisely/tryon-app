import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { api_key, event_type, product_id, product_name, product_image_url, session_id, user_fingerprint, metadata } = body;

    // Validate required fields
    if (!event_type) {
      return NextResponse.json(
        { error: 'Missing required field: event_type' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Para eventos do Studio Pro (admin), nao precisa de api_key
    let merchantId: string | null = null;
    if (api_key) {
      // Find merchant by API key
      const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        .select('id')
        .eq('api_key', api_key)
        .single();

      if (merchantError || !merchant) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }
      merchantId = merchant.id;
    }

    // Enriquecimento de metadata por tipo de evento
    let enrichedMetadata = { ...metadata };

    if (event_type === 'studio_pro_generated') {
      enrichedMetadata.duration_ms = Number(metadata?.duration_ms ?? 0);
      enrichedMetadata.render_mode = String(metadata?.render_mode ?? 'unknown');
      enrichedMetadata.success = Boolean(metadata?.success ?? false);
      enrichedMetadata.duration_bucket = metadata?.duration_bucket ?? 'unknown';
      enrichedMetadata.output_format = metadata?.output_format ?? 'jpeg';
    }

    if (event_type === 'tryon_completed') {
      enrichedMetadata.duration_ms = Number(metadata?.duration_ms ?? 0);
      enrichedMetadata.duration_bucket = metadata?.duration_bucket ?? 'unknown';
    }

    if (event_type === 'modal_closed') {
      enrichedMetadata.dwell_time_ms = Number(metadata?.dwell_time_ms ?? 0);
      enrichedMetadata.dwell_time_bucket = metadata?.dwell_time_bucket ?? 'unknown';
      enrichedMetadata.image_was_shown = Boolean(metadata?.image_was_shown ?? false);
      enrichedMetadata.closed_by = metadata?.closed_by ?? 'unknown';
    }

    // Insert analytics event
    const { error: insertError } = await supabase
      .from('analytics_events')
      .insert({
        merchant_id: merchantId,
        event_type,
        product_id: product_id || null,
        product_name: product_name || null,
        product_image_url: product_image_url || null,
        session_id: session_id || null,
        user_fingerprint: user_fingerprint || null,
        metadata: enrichedMetadata,
      });

    if (insertError) {
      console.error('Error inserting analytics event:', insertError);
      // Retorna 200 mesmo em erro de DB — analytics nunca pode quebrar a UX
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Analytics API error:', error);
    // Retorna 200 mesmo em erro — analytics nunca deve quebrar a experiencia do lojista
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
