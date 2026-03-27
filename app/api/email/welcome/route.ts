import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email, storeName } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set — welcome email skipped')
      return NextResponse.json({ sent: false, reason: 'no_api_key' })
    }

    await sendWelcomeEmail(email, storeName)
    return NextResponse.json({ sent: true })
  } catch (err: any) {
    console.error('Welcome email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
