import { NextRequest, NextResponse } from 'next/server'
import { sendEnterpriseInquiry, sendEnterpriseAutoReply } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { name, email, store, volume, message } = await req.json()

    if (!name || !email || !store || !volume) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set — enterprise email skipped')
      return NextResponse.json({ sent: false, reason: 'no_api_key' })
    }

    await Promise.all([
      sendEnterpriseInquiry({ name, email, store, volume, message }),
      sendEnterpriseAutoReply({ name, email }),
    ])

    return NextResponse.json({ sent: true })
  } catch (err: any) {
    console.error('Enterprise email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
