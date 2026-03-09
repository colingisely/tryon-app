import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase.rpc('process_suspension_queue');

  if (error) {
    console.error('[cron/suspensions]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const suspended = data ?? [];
  console.log(`[cron/suspensions] ${suspended.length} merchant(s) suspended.`);
  return NextResponse.json({ processed: suspended.length, merchants: suspended });
}
