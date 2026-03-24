import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email, shop, result_url } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    if (!shop) {
      return NextResponse.json({ error: 'Shop obrigatório' }, { status: 400 })
    }

    const supabase = await createClient()

    // Resolve merchant by shop domain
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('shop_domain', shop)
      .single()

    await supabase.from('tryon_leads').insert({
      merchant_id: merchant?.id ?? null,
      shop,
      email,
      result_url: result_url ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Always return ok to the widget — don't expose errors to end consumers
    return NextResponse.json({ ok: true })
  }
}
