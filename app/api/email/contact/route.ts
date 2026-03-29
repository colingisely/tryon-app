import { NextRequest, NextResponse } from 'next/server'
import { sendContactInquiry, sendContactAutoReply } from '@/lib/email'

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 503 })
  }

  const { name, email, subject, message } = await req.json()

  if (!name || !email || !subject) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  await Promise.all([
    sendContactInquiry({ name, email, subject, message }),
    sendContactAutoReply({ name, email }),
  ])

  return NextResponse.json({ sent: true })
}
