import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabase(): any {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await getSupabase().rpc('process_suspension_queue');

  if (error) {
    console.error('[cron/suspensions]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const suspended = data ?? [];
  console.log(`[cron/suspensions] ${suspended.length} merchant(s) suspended.`);
  return NextResponse.json({ processed: suspended.length, merchants: suspended });
}
