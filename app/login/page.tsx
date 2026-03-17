'use client'

/**
 * Reflexy — app/login/page.tsx
 * Brand System V5 · Deep Amethyst
 *
 * Tokens aplicados:
 *  Background  → --abyss   #06050F
 *  Card bg     → --s2-bg   rgba(15,13,30,.65) + blur(24px)
 *  Card border → --rule    rgba(184,174,221,.14)
 *  CTA Primary → gradient linear-gradient(135deg, --plum, --mauve)
 *  Inputs      → rgba(255,255,255,.05) + --rule border
 *  Títulos     → --f-mark  Bricolage Grotesque
 *  Corpo       → --f-body  DM Sans
 *  Labels      → --f-data  IBM Plex Mono
 *  Serif       → --f-serif Instrument Serif (descritores emotivos)
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react'
import ReflexGem from '@/components/ui/ReflexGem'

// ─── Types ───────────────────────────────────────────────────────────────────

type ErrorKind = 'invalid_credentials' | 'email_not_confirmed' | 'generic'

interface AuthError {
  kind:    ErrorKind
  message: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseError(raw: string): AuthError {
  const msg = raw.toLowerCase()

  if (msg.includes('email not confirmed') || msg.includes('email_not_confirmed')) {
    return {
      kind: 'email_not_confirmed',
      message:
        'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada (e a pasta de spam).',
    }
  }

  if (
    msg.includes('invalid login credentials') ||
    msg.includes('invalid credentials') ||
    msg.includes('wrong password') ||
    msg.includes('user not found')
  ) {
    return {
      kind: 'invalid_credentials',
      message: 'E-mail ou senha incorretos. Verifique os dados e tente novamente.',
    }
  }

  return { kind: 'generic', message: 'Algo deu errado. Tente novamente em instantes.' }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<AuthError | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return

    setError(null)
    setLoading(true)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email:    email.trim().toLowerCase(),
        password,
      })

      if (authError) {
        setError(parseError(authError.message))
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError({ kind: 'generic', message: 'Algo deu errado. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <main
      className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden"
      style={{ background: '#06050F' /* --abyss */ }}
    >
      <GrainOverlay />
      <AmbientGlow />

      <div className="relative z-10 w-full" style={{ maxWidth: 420 }}>

        {/* ── Brand header ── */}
        <header className="flex flex-col items-center mb-10">
          <ReflexGem size={64} uid="login" />

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

          {/* --f-serif para momentos emotivos */}
          <p
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle:  'italic',
              fontSize:    14,
              color:       '#A09CC0',
              marginTop:   4,
            }}
          >
            Bem-vindo de volta
          </p>
        </header>

        {/* ── Glass card ── */}
        <div
          style={{
            background:           'rgba(15,13,30,.65)', /* --s2-bg */
            backdropFilter:       'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border:               '1px solid rgba(184,174,221,.14)', /* --rule */
            borderRadius:          0, /* --r-card */
          }}
        >
          <form onSubmit={handleSubmit} noValidate>
            <div className="p-8 flex flex-col gap-5">

              <Eyebrow text="Autenticação" />

              <h1
                style={{
                  fontFamily:    "'Bricolage Grotesque', sans-serif",
                  fontWeight:     600,
                  fontSize:       22,
                  color:          '#EDEBF5',
                  letterSpacing: '-.01em',
                  lineHeight:     1.15,
                }}
              >
                Entrar na sua conta
              </h1>

              {/* Error banner */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 p-4"
                  style={{
                    background: 'rgba(255,90,90,.07)',
                    border:     '1px solid rgba(255,90,90,.22)',
                  }}
                >
                  <AlertCircle
                    size={14}
                    className="mt-0.5 shrink-0"
                    style={{ color: '#FF5A5A' }}
                  />
                  <div>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize:   13,
                        color:      '#FF5A5A',
                        lineHeight: 1.65,
                      }}
                    >
                      {error.message}
                    </p>
                    {error.kind === 'email_not_confirmed' && (
                      <ResendLink email={email} supabase={supabase} />
                    )}
                  </div>
                </div>
              )}

              {/* E-mail field */}
              <InputField
                id="email"
                label="E-mail"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="voce@exemplo.com"
                autoComplete="email"
                icon={<Mail size={14} />}
                disabled={loading}
              />

              {/* Senha field */}
              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <div className="relative">
                  <FieldIcon><Lock size={14} /></FieldIcon>
                  <input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    className="w-full outline-none transition-[border-color] duration-200"
                    style={INPUT_STYLE}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(184,174,221,.40)')}
                    onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(184,174,221,.14)')}
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
              </div>

              {/* Forgot password */}
              <div className="flex justify-end -mt-2">
                <Link
                  href="/forgot-password"
                  style={{
                    fontFamily:     "'DM Sans', sans-serif",
                    fontSize:        12,
                    color:           '#A09CC0',
                    textDecoration:  'none',
                    transition:      'color .15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#B8AEDD')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#A09CC0')}
                >
                  Esqueceu a senha?
                </Link>
              </div>

              {/* CTA Primary */}
              <CTAPrimary loading={loading}>Entrar</CTAPrimary>

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
              Ainda não tem conta?
            </span>
            <FooterNavLink href="/signup">Criar conta</FooterNavLink>
          </CardFooter>
        </div>
      </div>

      <GlobalKeyframes />
    </main>
  )
}

// ─── ResendLink ───────────────────────────────────────────────────────────────

function ResendLink({
  email,
  supabase,
}: {
  email: string
  supabase: ReturnType<typeof createClient>
}) {
  const [sent, setSent] = useState(false)

  async function resend() {
    if (!email) return
    await supabase.auth.resend({ type: 'signup', email })
    setSent(true)
  }

  if (sent) {
    return (
      <p style={{ fontSize: 12, color: '#0CC89E', marginTop: 4 }}>
        ✓ E-mail de confirmação reenviado!
      </p>
    )
  }

  return (
    <button
      type="button"
      onClick={resend}
      className="flex items-center gap-1.5 mt-1"
      style={{
        fontFamily:     "'DM Sans', sans-serif",
        fontSize:        12,
        color:           '#B8AEDD',
        textDecoration:  'underline',
        textUnderlineOffset: 3,
        background:      'none',
        border:          'none',
        cursor:          'pointer',
        padding:          0,
        transition:      'color .15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = '#EDEBF5')}
      onMouseLeave={e => (e.currentTarget.style.color = '#B8AEDD')}
    >
      <RefreshCw size={11} />
      Reenviar e-mail de confirmação
    </button>
  )
}

// ─── Design-system primitives (exportados para reutilização) ──────────────────

export const INPUT_STYLE: React.CSSProperties = {
  fontFamily:   "'DM Sans', sans-serif",
  fontSize:      14,
  color:         '#EDEBF5',
  background:   'rgba(255,255,255,.05)', /* --input bg conforme brand spec */
  border:       '1px solid rgba(184,174,221,.14)', /* --rule */
  borderRadius:  2, /* --r-input */
  padding:      '10px 12px 10px 36px',
  width:        '100%',
}

export const PWD_TOGGLE_STYLE: React.CSSProperties = {
  color:      '#A09CC0',
  background: 'none',
  border:     'none',
  cursor:     'pointer',
  padding:     0,
  transition: 'color .15s',
}

export function Eyebrow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        style={{
          display:    'block',
          width:       16,
          height:      1,
          background: '#0CC89E',
          opacity:    .65,
        }}
      />
      <span
        style={{
          fontFamily:    "'IBM Plex Mono', monospace",
          fontSize:       9,
          letterSpacing: '0.30em',
          textTransform: 'uppercase',
          color:          '#0CC89E',
        }}
      >
        {text}
      </span>
    </div>
  )
}

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        fontFamily:    "'IBM Plex Mono', monospace",
        fontSize:       10,
        letterSpacing: '0.20em',
        textTransform: 'uppercase',
        color:          '#A09CC0',
      }}
    >
      {children}
    </label>
  )
}

export function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
      style={{ color: '#A09CC0' }}
    >
      {children}
    </span>
  )
}

export function InputField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
  disabled,
}: {
  id:           string
  label:        string
  type:         string
  value:        string
  onChange:     (v: string) => void
  placeholder:  string
  autoComplete?: string
  icon:         React.ReactNode
  disabled?:    boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <FieldIcon>{icon}</FieldIcon>
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          disabled={disabled}
          className="w-full outline-none transition-[border-color] duration-200"
          style={INPUT_STYLE}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(184,174,221,.40)')}
          onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(184,174,221,.14)')}
        />
      </div>
    </div>
  )
}

export function CTAPrimary({
  loading,
  children,
}: {
  loading: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2.5"
      style={{
        fontFamily:    "'Bricolage Grotesque', sans-serif",
        fontWeight:     500,
        fontSize:       11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color:          '#EDEBF5',
        /* CTA Primary gradient: --plum → --mauve */
        background:    loading
          ? 'rgba(43,18,80,.45)'
          : 'linear-gradient(135deg, #2B1250 0%, #7050A0 100%)',
        border:        '1px solid rgba(112,80,160,.35)',
        borderRadius:   0,
        padding:       '14px 28px',
        cursor:        loading ? 'not-allowed' : 'pointer',
        opacity:       loading ? 0.65 : 1,
        filter:        'drop-shadow(0 0 20px rgba(43,18,80,.4))',
        transition:    'filter .2s, background .2s',
      }}
      onMouseEnter={e => {
        if (!loading) {
          e.currentTarget.style.filter = 'drop-shadow(0 0 28px rgba(43,18,80,.65)) brightness(1.10)'
        }
      }}
      onMouseLeave={e => {
        if (!loading) {
          e.currentTarget.style.filter = 'drop-shadow(0 0 20px rgba(43,18,80,.4))'
        }
      }}
    >
      {loading ? (
        <>
          <span style={SPINNER_STYLE} />
          Aguarde…
        </>
      ) : (
        <>
          {children}
          <ArrowRight size={13} />
        </>
      )}
    </button>
  )
}

export function CardFooter({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-center gap-2"
      style={{
        borderTop: '1px solid rgba(184,174,221,.10)',
        padding:   '16px 32px',
      }}
    >
      {children}
    </div>
  )
}

export function FooterNavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1"
      style={{
        fontFamily:    "'Bricolage Grotesque', sans-serif",
        fontWeight:     500,
        fontSize:       11,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        color:          '#B8AEDD',
        textDecoration: 'none',
        transition:    'color .15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = '#EDEBF5')}
      onMouseLeave={e => (e.currentTarget.style.color = '#B8AEDD')}
    >
      {children}
      <ArrowRight size={11} />
    </Link>
  )
}

// ─── Decorative ───────────────────────────────────────────────────────────────

export function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50"
      style={{
        backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='256' height='256' filter='url(%23g)' opacity='1'/></svg>")`,
        opacity: 0.022,
      }}
    />
  )
}

export function AmbientGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        top: '50%', left: '50%',
        transform:    'translate(-50%, -50%)',
        width:         560,
        height:        560,
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(43,18,80,.42) 0%, transparent 70%)',
        animation: 'ambientBreath 8s ease-in-out infinite',
      }}
    />
  )
}

export function GlobalKeyframes() {
  return (
    <style>{`
      @keyframes ambientBreath {
        0%,100% { opacity:.7; transform:translate(-50%,-50%) scale(1);    }
        50%      { opacity:1; transform:translate(-50%,-50%) scale(1.08); }
      }
      @keyframes spin       { to { transform:rotate(360deg); } }
      @keyframes fadeSlideUp {
        from { opacity:0; transform:translateY(10px); }
        to   { opacity:1; transform:translateY(0);    }
      }
    `}</style>
  )
}

export const SPINNER_STYLE: React.CSSProperties = {
  display:        'inline-block',
  width:           12,
  height:          12,
  border:         '1.5px solid rgba(184,174,221,.25)',
  borderTopColor: '#B8AEDD',
  borderRadius:   '50%',
  animation:      'spin 0.7s linear infinite',
}
