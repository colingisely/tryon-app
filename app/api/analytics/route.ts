import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { api_key, event_type, product_id, product_name, product_image_url, session_id, user_fingerprint, metadata } = body;

    // Validate required fields
    if (!api_key || !event_type) {
      return NextResponse.json(
        { error: 'Missing required fields: api_key, event_type' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Insert analytics event
    const { error: insertError } = await supabase
      .from('analytics_events')
      .insert({
        merchant_id: merchant.id,
        event_type,
        product_id: product_id || null,
        product_name: product_name || null,
        product_image_url: product_image_url || null,
        session_id: session_id || null,
        user_fingerprint: user_fingerprint || null,
        metadata: metadata || {},
      });

    if (insertError) {
      console.error('Error inserting analytics event:', insertError);
      return NextResponse.json(
        { error: 'Failed to store event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
