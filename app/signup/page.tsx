'use client'

/**
 * Reflexy — app/signup/page.tsx
 * Brand System V6 · Aligned with Landing Page
 *
 * Fluxo Supabase:
 *  1. supabase.auth.signUp()  → cria usuário
 *  2. supabase.from('merchants').insert({ plan_id: 'free' })
 *  3. Se session ativa → redirect /dashboard
 *     Se confirmação pendente → estado de sucesso inline
 */

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Store,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react'

import {
  FieldIcon,
  AuthLabel,
  AuthInputField,
  CTAPrimary,
  CardFooter,
  FooterNavLink,
  GrainOverlay,
  AmbientGlow,
  GlobalKeyframes,
  INPUT_STYLE,
  PWD_TOGGLE_STYLE,
  SPINNER_STYLE,
} from '@/app/login/page'
import ReflexGem from '@/components/ui/ReflexGem'

// ─── Constants ────────────────────────────────────────────────────────────────

/** Ajuste para corresponder ao valor real na tabela plans do Supabase */
const FREE_PLAN_SLUG = 'free'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormValues {
  storeName: string
  email:     string
  password:  string
}

interface StrengthResult {
  score: 0 | 1 | 2 | 3
  label: string
  color: string
}

// ─── Password strength ────────────────────────────────────────────────────────

function measureStrength(pwd: string): StrengthResult {
  if (!pwd) return { score: 0, label: '', color: 'transparent' }

  let score = 0
  if (pwd.length >= 8)             score++
  if (/[A-Z]/.test(pwd))           score++
  if (/[0-9!@#$%^&*]/.test(pwd))  score++

  const map: Record<number, StrengthResult> = {
    1: { score: 1, label: 'Fraca',    color: '#FF5A5A' },
    2: { score: 2, label: 'Razoável', color: '#FFB432' },
    3: { score: 3, label: 'Forte',    color: '#0CC89E' },
  }
  return map[score] ?? { score: 0, label: '', color: 'transparent' }
}

// ─── Page ────────────────────────────────────────────────────────────────────

function SignupPageInner() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const supabase    = createClient()
  const [mounted, setMounted] = useState(false)

  const planSlug        = searchParams.get('plan') ?? ''

  useEffect(() => {
    setMounted(true)
  }, [])

  const [form,    setForm]    = useState<FormValues>({ storeName: '', email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const strength = measureStrength(form.password)

  function patch(key: keyof FormValues) {
    return (value: string) => setForm(prev => ({ ...prev, [key]: value }))
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Client-side guards
    if (!form.storeName.trim()) {
      setError('Informe o nome da sua loja.')
      return
    }
    if (!form.email.trim()) {
      setError('Informe um e-mail válido.')
      return
    }
    if (form.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    setLoading(true)

    try {
      // ── Step 1: Supabase Auth ──────────────────────────────────────────────
      const { data, error: authError } = await supabase.auth.signUp({
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: {
            store_name: form.storeName.trim(),
          },
        },
      })

      if (authError) {
        const msg = authError.message.toLowerCase()
        const paidPlans = ['starter', 'growth', 'pro']
        const isExisting =
          msg.includes('already registered') ||
          msg.includes('already been registered') ||
          msg.includes('user already') ||
          msg.includes('email already')
        if (isExisting) {
          const loginParams = new URLSearchParams()
          if (planSlug && paidPlans.includes(planSlug)) {
            loginParams.set('plan', planSlug)
          }
          const query = loginParams.toString()
          router.push(query ? `/login?${query}` : '/login')
          return
        } else {
          setError(authError.message)
        }
        return
      }

      if (!data.user) {
        setError('Não foi possível criar sua conta. Tente novamente.')
        return
      }

      // ── Step 2: Criar merchant com plano free ───────────────────────────
      const { data: planData } = await supabase
        .from('plans')
        .select('id')
        .eq('slug', 'free')
        .single()

      const { error: merchantError } = await supabase.from('merchants').insert({
        id:         data.user.id,
        store_name: form.storeName.trim(),
        email:      form.email.trim().toLowerCase(),
        plan_id:    planData?.id || null,
        api_key:    'tk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        created_at: new Date().toISOString(),
      })

      if (merchantError) {
        const isDuplicate =
          merchantError.code === '23505' ||
          merchantError.message?.toLowerCase().includes('duplicate') ||
          merchantError.message?.toLowerCase().includes('already exists')

        if (isDuplicate) {
          // Supabase returned a "new" user for an existing confirmed email
          // (email enumeration protection). Redirect to login.
          console.warn('[Reflexy] merchant duplicate — redirecting to login')
          const paidPlans = ['starter', 'growth', 'pro']
          const loginParams = new URLSearchParams()
          if (planSlug && paidPlans.includes(planSlug)) {
            loginParams.set('plan', planSlug)
          }
          const query = loginParams.toString()
          router.push(query ? `/login?${query}` : '/login')
          return
        }
        // Non-blocking for other errors — user Auth record exists, merchant may be
        // created via DB trigger or will be retried on next login.
        console.error('[Reflexy] merchants insert error:', merchantError.message)
      }

      // ── Step 3: Welcome email ─────────────────────────────────────────────
      try {
        await fetch('/api/email/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email.trim().toLowerCase(),
            storeName: form.storeName.trim(),
          }),
        })
      } catch (e) {
        // non-fatal
        console.warn('welcome email failed:', e)
      }

      // ── Step 4: Handle post-signup destination ────────────────────────────

      // If a paid plan was selected, redirect to Stripe checkout
      const paidPlans = ['starter', 'growth', 'pro']
      if (planSlug && paidPlans.includes(planSlug) && data.user) {
        try {
          const res = await fetch('/api/payments/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              planSlug,
              userId: data.user.id,
              userEmail: data.user.email,
            }),
          })
          const { url } = await res.json()
          if (url) {
            window.location.href = url
            return
          }
        } catch (e) {
          console.warn('[signup] create-checkout failed:', e)
        }
      }

      // Default: go to dashboard
      if (data.session) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Algo deu errado. Tente novamente em instantes.')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!mounted) {
    return null
  }

  return (
    <main
      className="relative min-h-screen flex items-center justify-center px-5 sm:px-8 py-16 overflow-hidden"
      style={{ background: '#06050F' /* --abyss */ }}
    >
      <GrainOverlay />
      <AmbientGlow />

      <div className="relative z-10 w-full" style={{ maxWidth: 400 }}>

        {/* ── Brand header ── */}
        <header className="flex flex-col items-center mb-10">
          <ReflexGem size={64} uid="signup" />

          <p
            className="mt-5 tracking-[.22em] uppercase"
            style={{
              fontFamily:  "'Bricolage Grotesque', sans-serif",
              fontWeight:   700,
              fontSize:     22,
              background:
                'linear-gradient(160deg, #EDEBF5 0%, rgba(237,235,245,.75) 60%, #B8AEDD 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip:       'text',
              WebkitTextFillColor:  'transparent',
            }}
          >
            Reflexy
          </p>

        </header>

        {/* ── Glass card ── */}
        <div
          style={{
            background:           'rgba(255,255,255,.03)',
            backdropFilter:       'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border:               '1px solid rgba(255,255,255,.07)',
            borderRadius:          22,
          }}
        >
          {success ? (
            <SuccessState email={form.email} />
          ) : (
            <>
              <form onSubmit={handleSubmit} noValidate>
                <div className="px-5 py-6 sm:p-8 flex flex-col" style={{ gap: 24 }}>

                  <h1
                    style={{
                      fontFamily:    "'DM Sans', sans-serif",
                      fontWeight:     600,
                      fontSize:       20,
                      color:          '#EDEBF5',
                      letterSpacing: '-.01em',
                      lineHeight:     1.15,
                    }}
                  >
                    Criar conta
                  </h1>

                  {/* Plan badge */}
                  <PlanBadge planSlug={planSlug} />

                  {/* Error banner */}
                  {error && (
                    <div
                      role="alert"
                      className="flex items-start gap-3 p-4"
                      style={{
                        background: 'rgba(255,90,90,.07)',
                        border:     '1px solid rgba(255,90,90,.22)',
                        borderRadius: 12,
                      }}
                    >
                      <AlertCircle
                        size={14}
                        className="mt-0.5 shrink-0"
                        style={{ color: '#FF5A5A' }}
                      />
                      <p
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize:   13,
                          color:      '#FF5A5A',
                          lineHeight: 1.65,
                        }}
                      >
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Nome da Loja */}
                  <AuthInputField
                    id="storeName"
                    label="Nome da loja"
                    type="text"
                    value={form.storeName}
                    onChange={patch('storeName')}
                    placeholder="Ex.: Boutique Lumina"
                    autoComplete="organization"
                    icon={<Store size={14} />}
                    disabled={loading}
                  />

                  {/* E-mail */}
                  <AuthInputField
                    id="email"
                    label="E-mail"
                    type="email"
                    value={form.email}
                    onChange={patch('email')}
                    placeholder="voce@exemplo.com"
                    autoComplete="email"
                    icon={<Mail size={14} />}
                    disabled={loading}
                  />

                  {/* Senha + strength indicator */}
                  <div className="flex flex-col gap-2">
                    <AuthLabel htmlFor="password">Senha</AuthLabel>
                    <div className="relative">
                      <FieldIcon><Lock size={14} /></FieldIcon>
                      <input
                        id="password"
                        type={showPwd ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => patch('password')(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                        required
                        disabled={loading}
                        className="w-full outline-none transition-[border-color] duration-200"
                        style={INPUT_STYLE}
                        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,.45)')}
                        onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)')}
                      />
                      <button
                        type="button"
                        aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
                        onClick={() => setShowPwd(v => !v)}
                        style={PWD_TOGGLE_STYLE}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onMouseEnter={e => (e.currentTarget.style.color = '#B8AEDD')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#A09CC0')}
                      >
                        {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    {/* Strength bars */}
                    {form.password.length > 0 && (
                      <StrengthMeter strength={strength} />
                    )}
                  </div>

                  {/* Terms */}
                  <p
                    style={{
                      fontFamily:   "'DM Sans', sans-serif",
                      fontSize:     12,
                      color:        '#A09CC0',
                      lineHeight:   1.75,
                      marginTop:    16,
                      marginBottom: 24,
                    }}
                  >
                    Ao criar uma conta, você concorda com os{' '}
                    <Link
                      href="/terms"
                      style={{ color: '#B8AEDD', textDecoration: 'underline', textUnderlineOffset: 3 }}
                    >
                      Termos de Uso
                    </Link>{' '}
                    e a{' '}
                    <Link
                      href="/privacy"
                      style={{ color: '#B8AEDD', textDecoration: 'underline', textUnderlineOffset: 3 }}
                    >
                      Política de Privacidade
                    </Link>
                    .
                  </p>

                  {/* CTA Primary */}
                  <CTAPrimary loading={loading}>
                    Criar conta
                  </CTAPrimary>

                </div>
              </form>

              <CardFooter>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize:   13,
                    color:      '#A09CC0',
                  }}
                >
                  Já tem conta?
                </span>
                <FooterNavLink href="/login">Entrar</FooterNavLink>
              </CardFooter>
            </>
          )}
        </div>
      </div>

      <GlobalKeyframes />
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageInner />
    </Suspense>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const PAID_PLANS = new Set(['starter', 'growth', 'pro', 'enterprise'])

function PlanBadge({ planSlug }: { planSlug: string }) {
  const isPaid = planSlug && PAID_PLANS.has(planSlug)

  // Hide badge entirely for free flow — avoids redundant "free" messaging
  if (!isPaid) return null

  const label = `Plano ${planSlug.charAt(0).toUpperCase() + planSlug.slice(1)} — Ativado ✓`

  return (
    <div
      className="inline-flex items-center gap-2 self-start"
      style={{
        background: 'rgba(12,200,158,.07)',
        border:     '1px solid rgba(12,200,158,.22)',
        borderRadius: 100,
        padding:    '5px 14px',
      }}
    >
      {/* Pulsing dot */}
      <span
        style={{
          display:     'block',
          width:        6,
          height:       6,
          borderRadius: '50%',
          background:   '#0CC89E',
          boxShadow:   '0 0 6px #0CC89E',
          animation:   'ambientBreath 2.5s ease-in-out infinite',
        }}
      />
      <span
        style={{
          fontFamily:    "'DM Sans', sans-serif",
          fontSize:       12,
          fontWeight:     500,
          color:          '#0CC89E',
        }}
      >
        {label}
      </span>
    </div>
  )
}

function StrengthMeter({ strength }: { strength: StrengthResult }) {
  return (
    <div>
      <div className="flex gap-1 mt-1">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              flex:       1,
              height:     3,
              borderRadius: 2,
              background: i <= strength.score
                ? strength.color
                : 'rgba(255,255,255,.07)',
              transition: 'background .25s ease',
            }}
          />
        ))}
      </div>
      {strength.label && (
        <p
          style={{
            fontFamily:    "'DM Sans', sans-serif",
            fontSize:       11,
            fontWeight:     500,
            color:          strength.color,
            marginTop:      4,
            transition:    'color .25s',
          }}
        >
          {strength.label}
        </p>
      )}
    </div>
  )
}

function SuccessState({ email }: { email: string }) {
  return (
    <div
      className="flex flex-col items-center text-center gap-4 px-5 py-8 sm:p-10"
      style={{ animation: 'fadeSlideUp .45s ease both' }}
    >
      {/* Icon circle */}
      <div
        className="flex items-center justify-center"
        style={{
          width:        56,
          height:       56,
          borderRadius: '50%',
          background:   'rgba(12,200,158,.09)',
          border:       '1px solid rgba(12,200,158,.26)',
        }}
      >
        <CheckCircle2 size={24} style={{ color: '#0CC89E' }} />
      </div>

      <h2
        style={{
          fontFamily:  "'DM Sans', sans-serif",
          fontWeight:   600,
          fontSize:     20,
          color:        '#EDEBF5',
          lineHeight:   1.2,
        }}
      >
        Conta criada com sucesso!
      </h2>

      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize:   14,
          color:      '#A09CC0',
          lineHeight: 1.75,
          maxWidth:   300,
        }}
      >
        Enviamos um link de confirmação para{' '}
        <span style={{ color: '#B8AEDD', fontWeight: 500 }}>{email}</span>.
        {' '}Confirme seu e-mail para ativar sua conta.
      </p>

      {/* Tip */}
      <div
        style={{
          width:      '100%',
          background: 'rgba(12,200,158,.05)',
          border:     '1px solid rgba(12,200,158,.14)',
          borderRadius: 12,
          padding:    '11px 16px',
        }}
      >
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize:    12,
            fontWeight:  500,
            color:       '#0CC89E',
          }}
        >
          Verifique também a pasta de spam
        </p>
      </div>

      <FooterNavLink href="/login">Ir para o login</FooterNavLink>
    </div>
  )
}
