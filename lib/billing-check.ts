// lib/billing-check.ts
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ) as any
}

export type GenerationType = 'fast' | 'premium'

export interface BillingCheckResult {
  allowed: boolean
  error?: {
    status: number
    code: string
    message: string
  }
  deductCredit: () => Promise<void>
}

export async function checkBillingAndDeduct(
  merchantId: string,
  type: GenerationType
): Promise<BillingCheckResult> {
  const supabase = getSupabase()

  const { data: merchant, error } = await supabase
    .from('merchants')
    .select('id, fast_credits_remaining, premium_credits_remaining, overage_status, suspended_at')
    .eq('id', merchantId)
    .single()

  if (error || !merchant) {
    return {
      allowed: false,
      error: { status: 404, code: 'MERCHANT_NOT_FOUND', message: 'Merchant not found.' },
      deductCredit: async () => {},
    }
  }

  // Conta suspensa bloqueia tudo
  if (merchant.suspended_at) {
    return {
      allowed: false,
      error: {
        status: 403,
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your account has been suspended due to a billing issue. Please update your payment method.',
      },
      deductCredit: async () => {},
    }
  }

  const creditsRemaining: number =
    type === 'fast' ? (merchant.fast_credits_remaining ?? 0) : (merchant.premium_credits_remaining ?? 0)

  // Tem créditos inclusos → deduz do saldo
  if (creditsRemaining > 0) {
    return {
      allowed: true,
      deductCredit: async () => {
        await supabase.rpc('decrement_credit', {
          p_merchant_id:  merchantId,
          p_type:         type,
          p_reason:       'widget_tryon',
          p_source:       'api/tryon',
        })
      },
    }
  }

  // Créditos zerados — verifica overage
  const overageBlocked = ['blocked', 'suspended'].includes(merchant.overage_status)

  if (overageBlocked) {
    return {
      allowed: false,
      error: {
        status: 402,
        code: 'CREDITS_EXHAUSTED',
        message: 'You have used all your credits and overage billing is not available. Please upgrade your plan.',
      },
      deductCredit: async () => {},
    }
  }

  // Registra overage via endpoint interno
  const overageResponse = await fetch(`${process.env.NEXTAUTH_URL ?? 'https://reflexy.co'}/api/billing/overage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': process.env.REFLEXY_INTERNAL_SECRET!,
    },
    body: JSON.stringify({ merchant_id: merchantId, type }),
  })

  if (!overageResponse.ok) {
    const body = await overageResponse.json().catch(() => ({}))
    return {
      allowed: false,
      error: {
        status: 402,
        code: body.code ?? 'OVERAGE_DENIED',
        message: body.message ?? 'Unable to process overage billing.',
      },
      deductCredit: async () => {},
    }
  }

  return {
    allowed: true,
    deductCredit: async () => {
      // Já registrado pelo endpoint de overage
    },
  }
}
