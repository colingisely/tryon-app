import { NextRequest, NextResponse } from 'next/server';
import { activateOverage, checkOverageCap } from '@/lib/overage';

const INTERNAL_SECRET = process.env.REFLEXY_INTERNAL_SECRET!;

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function POST(req: NextRequest) {
  if (req.headers.get('x-reflexy-secret') !== INTERNAL_SECRET) return unauthorized();

  let body: { merchant_id?: string } = {};
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.merchant_id) return NextResponse.json({ error: 'merchant_id required' }, { status: 422 });

  const result = await activateOverage(body.merchant_id);
  return NextResponse.json({ result }, { status: result === 'failed' ? 402 : 200 });
}

export async function GET(req: NextRequest) {
  if (req.headers.get('x-reflexy-secret') !== INTERNAL_SECRET) return unauthorized();

  const { searchParams } = new URL(req.url);
  const merchantId = searchParams.get('merchant_id');
  const type       = searchParams.get('type') as 'fast' | 'premium' | null;

  if (!merchantId || !type || !['fast', 'premium'].includes(type))
    return NextResponse.json({ error: 'merchant_id and type (fast|premium) required' }, { status: 422 });

  const result = await checkOverageCap(merchantId, type);
  return NextResponse.json({ allowed: result === 'allowed', result }, {
    status: result === 'blocked' || result === 'cap_reached' ? 402 : 200,
  });
}
