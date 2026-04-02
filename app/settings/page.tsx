'use client'

/**
 * Reflexy — app/settings/page.tsx
 * Configurações · Brand System V5 · Deep Amethyst
 *
 * Tokens:
 *  Fundo          → --abyss     #06050F
 *  Cards          → --onyx      #0F0D1E
 *  Primário       → --plum      #2B1250 → --mauve #7050A0
 *  Sucesso        → --verdigris #0CC89E
 *  Erro           → --error     #FF5A5A
 *  Aviso          → --warning   #FFB432
 *  Texto          → --mist      #EDEBF5
 *  Texto dim      → --dusk      #A09CC0
 *  Bordas         → --rule      rgba(184,174,221,.14)
 *
 * Seções:
 *  1. Perfil da Loja     — storeName, merchantEmail
 *  2. API Key            — mostrar/ocultar, copiar, regerar (modal de confirmação)
 *  3. Widget de Provador — toggle ativo/inativo
 *  4. Zona de Perigo     — encerrar sessão
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter }                    from 'next/navigation'
import { createClient }                 from '@/lib/supabase/client'
import { InternalFooter }               from '@/components/ui/InternalFooter'
import {
  Store,
  Mail,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  X,
  Save,
  LogOut,
  ChevronRight,
  ShoppingBag,
  Settings,
  Info,
  CreditCard,
  Zap,
  Star,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import ReflexGem from '@/components/ui/ReflexGem'
import {
  Eyebrow,
  GrainOverlay,
  AmbientGlow,
  GlobalKeyframes,
  SPINNER_STYLE,
  INPUT_STYLE,
  FieldLabel,
  FieldIcon,
} from '@/app/login/page'

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingsTab = 'store' | 'api' | 'widget' | 'billing' | 'danger'

interface MerchantSettings {
  id:                             string
  storeName:                      string
  email:                          string
  apiKey:                         string
  widgetEnabled:                  boolean
  tryonMode:                      'fast' | 'premium'
  planId:                         string
  planSlug:                       string
  credits_remaining:              number
  credits_monthly:                number
  stripe_customer_id:             string | null
  subscription_current_period_end: string | null
}

interface SaveState {
  status:  'idle' | 'saving' | 'saved' | 'error'
  message: string
}

// ─── Nav tabs ─────────────────────────────────────────────────────────────────

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'store',   label: 'Perfil da Loja',     icon: <Store size={14} />      },
  { id: 'api',     label: 'API & Integração',   icon: <Key size={14} />        },
  { id: 'widget',  label: 'Widget',             icon: <ShoppingBag size={14} />},
  { id: 'billing', label: 'Plano & Faturamento',icon: <CreditCard size={14} /> },
  { id: 'danger',  label: 'Conta',              icon: <Settings size={14} />   },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<SettingsTab>('store')
  const [loading,   setLoading]   = useState(true)
  const [settings,  setSettings]  = useState<MerchantSettings>({
    id:                              '',
    storeName:                       '',
    email:                           '',
    apiKey:                          '',
    widgetEnabled:                   true,
    tryonMode:                       'fast',
    planId:                          'free',
    planSlug:                        'free',
    credits_remaining:               0,
    credits_monthly:                 10,
    stripe_customer_id:              null,
    subscription_current_period_end: null,
  })
  const [saveState, setSaveState] = useState<SaveState>({ status: 'idle', message: '' })

  // ── Fetch merchant data ────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchSettings() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const { data, error } = await supabase
          .from('merchants')
          .select(`
            id, store_name, email, api_key, widget_enabled, tryon_mode,
            plan_id, stripe_customer_id, subscription_current_period_end,
            credits_remaining,
            plans!plan_id(slug, credits_monthly)
          `)
          .eq('id', user.id)
          .single()

        if (error) throw error

        const plan = (data as any).plans ?? {}
        setSettings({
          id:                              data.id            ?? user.id,
          storeName:                       data.store_name    ?? '',
          email:                           data.email         ?? user.email ?? '',
          apiKey:                          data.api_key       ?? generateDemoKey(),
          widgetEnabled:                   data.widget_enabled ?? true,
          tryonMode:                       (data as any).tryon_mode ?? 'fast',
          planId:                          data.plan_id        ?? 'free',
          planSlug:                        plan.slug ?? 'free',
          credits_remaining:               (data as any).credits_remaining ?? 0,
          credits_monthly:                 plan.credits_monthly ?? 10,
          stripe_customer_id:              (data as any).stripe_customer_id ?? null,
          subscription_current_period_end: (data as any).subscription_current_period_end ?? null,
        })
      } catch {
        // Fallback for free/demo
        setSettings(prev => ({ ...prev, apiKey: generateDemoKey() }))
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  // ── Save handler ───────────────────────────────────────────────────────────
  async function handleSave(updates: Partial<MerchantSettings>) {
    setSaveState({ status: 'saving', message: '' })
    try {
      const { data: { user }, error: uErr } = await supabase.auth.getUser()
      if (uErr || !user) throw new Error('Não autenticado.')

      // Build only the fields that are being updated
      const payload: Record<string, unknown> = {}
      if (updates.storeName     !== undefined) payload.store_name     = updates.storeName.trim()
      if (updates.widgetEnabled !== undefined) payload.widget_enabled = updates.widgetEnabled
      if (updates.tryonMode     !== undefined) payload.tryon_mode     = updates.tryonMode

      if (Object.keys(payload).length === 0) {
        setSaveState({ status: 'saved', message: 'Nenhuma alteração detectada.' })
        setTimeout(() => setSaveState({ status: 'idle', message: '' }), 3000)
        return
      }

      const { error } = await supabase
        .from('merchants')
        .update(payload)
        .eq('id', user.id)

      if (error) throw error

      setSettings(prev => ({ ...prev, ...updates, id: user.id }))
      setSaveState({ status: 'saved', message: 'Alterações salvas.' })
      setTimeout(() => setSaveState({ status: 'idle', message: '' }), 3000)
    } catch (err: any) {
      setSaveState({ status: 'error', message: err.message ?? 'Erro ao salvar. Tente novamente.' })
      setTimeout(() => setSaveState({ status: 'idle', message: '' }), 4000)
    }
  }

  // ── Sign out ───────────────────────────────────────────────────────────────
  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <LoadingScreen />

  return (
    <main className="min-h-screen" style={{ background: '#06050F' }}>
      <GrainOverlay />
      <AmbientGlow />

      {/* ── Top nav ── */}
      <TopNav
        storeName={settings.storeName}
        planId={settings.planId}
        onSignOut={handleSignOut}
      />

      <div
        className="relative z-10 mx-auto px-6"
        style={{ maxWidth: 960, paddingTop: 44, paddingBottom: 100 }}
      >
        {/* Page header */}
        <div style={{ marginBottom: 40 }}>
          <Eyebrow text="Configurações" />
          <h1
            className="mt-3"
            style={{
              fontFamily:    "'Bricolage Grotesque', sans-serif",
              fontWeight:     700,
              fontSize:      'clamp(24px, 3vw, 36px)',
              color:          '#EDEBF5',
              letterSpacing: '-.02em',
              lineHeight:     1.1,
            }}
          >
            Configurações da Conta
          </h1>
        </div>

        <div className="flex gap-6" style={{ alignItems: 'flex-start' }}>

          {/* ── Sidebar tabs ── */}
          <nav
            className="flex flex-col"
            style={{
              width:     220,
              flexShrink: 0,
              background: '#0F0D1E',
              border:    '1px solid rgba(184,174,221,.14)',
            }}
          >
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center justify-between px-4 py-3 transition-all text-left w-full"
                style={{
                  background:   activeTab === tab.id ? 'rgba(43,18,80,.55)' : 'transparent',
                  borderLeft:  `2px solid ${activeTab === tab.id ? '#0CC89E' : 'transparent'}`,
                  borderBottom: '1px solid rgba(184,174,221,.08)',
                  cursor:       'pointer',
                }}
                onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.background = 'rgba(184,174,221,.03)' }}
                onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent' }}
              >
                <div className="flex items-center gap-2.5">
                  <span style={{ color: activeTab === tab.id ? '#0CC89E' : '#A09CC0', transition: 'color .15s' }}>
                    {tab.icon}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize:   13,
                      color:      activeTab === tab.id ? '#EDEBF5' : '#A09CC0',
                      transition: 'color .15s',
                      fontWeight: activeTab === tab.id ? 500 : 400,
                    }}
                  >
                    {tab.label}
                  </span>
                </div>
                {activeTab === tab.id && (
                  <ChevronRight size={12} style={{ color: '#0CC89E' }} />
                )}
              </button>
            ))}
          </nav>

          {/* ── Content panel ── */}
          <div className="flex-1 flex flex-col gap-4" style={{ minWidth: 0 }}>

            {/* Save feedback banner */}
            {saveState.status !== 'idle' && (
              <SaveBanner state={saveState} />
            )}

            {activeTab === 'store'   && <StoreProfileSection  settings={settings} onSave={handleSave} />}
            {activeTab === 'api'     && <ApiKeySection         settings={settings} setSettings={setSettings} supabase={supabase} />}
            {activeTab === 'widget'  && <WidgetSection         settings={settings} onSave={handleSave} />}
            {activeTab === 'billing' && <BillingSection        settings={settings} />}
            {activeTab === 'danger'  && <DangerSection         onSignOut={handleSignOut} />}
          </div>
        </div>
      </div>

      <InternalFooter />

      <GlobalKeyframes />
      <style>{`
        @keyframes dotPulse  { 0%,100%{opacity:1;} 50%{opacity:.4;} }
        @keyframes fadeIn    { from{opacity:0;transform:translateY(-4px);} to{opacity:1;transform:translateY(0);} }
        @keyframes slideIn   { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes shake     { 0%,100%{transform:translateX(0);} 20%,60%{transform:translateX(-4px);} 40%,80%{transform:translateX(4px);} }
      `}</style>
    </main>
  )
}

// ─── TopNav ───────────────────────────────────────────────────────────────────

function TopNav({
  storeName,
  planId,
  onSignOut,
}: {
  storeName: string
  planId:    string
  onSignOut: () => void
}) {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6"
      style={{
        height:              52,
        borderBottom:       '1px solid rgba(184,174,221,.09)',
        background:         'rgba(6,5,15,.92)',
        backdropFilter:     'blur(20px)',
        WebkitBackdropFilter:'blur(20px)',
      }}
    >
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <ReflexGem size={18} uid="settings-nav" noReflection />
          <span style={{
            fontFamily:    "'Bricolage Grotesque', sans-serif",
            fontWeight:     700,
            fontSize:       13,
            letterSpacing: '.20em',
            textTransform: 'uppercase',
            background:    'linear-gradient(160deg,#EDEBF5 0%,#B8AEDD 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip:       'text',
            WebkitTextFillColor:  'transparent',
          }}>
            Reflexy
          </span>
        </div>
        <span style={{ width: 1, height: 16, background: 'rgba(184,174,221,.18)', margin: '0 14px' }} />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#A09CC0' }}>
          Configurações
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Store name */}
        {storeName && (
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#A09CC0' }}>
            {storeName}
          </span>
        )}

        {/* Sign out */}
        <button
          type="button"
          onClick={onSignOut}
          className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
          style={{ background: 'transparent', border: '1px solid rgba(184,174,221,.14)', color: '#A09CC0', fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(184,174,221,.30)'; e.currentTarget.style.color = '#EDEBF5' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,174,221,.14)'; e.currentTarget.style.color = '#A09CC0' }}
        >
          <LogOut size={13} /> Sair
        </button>
      </div>
    </nav>
  )
}

// ─── SaveBanner ───────────────────────────────────────────────────────────────

function SaveBanner({ state }: { state: SaveState }) {
  const isSaved = state.status === 'saved'
  const isError = state.status === 'error'
  const isSaving = state.status === 'saving'

  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{
        background: isSaved ? 'rgba(12,200,158,.07)' : isError ? 'rgba(255,90,90,.07)' : 'rgba(184,174,221,.05)',
        border:    `1px solid ${isSaved ? 'rgba(12,200,158,.24)' : isError ? 'rgba(255,90,90,.22)' : 'rgba(184,174,221,.14)'}`,
        animation: 'fadeIn .25s ease both',
      }}
    >
      {isSaving && <span style={SPINNER_STYLE} />}
      {isSaved  && <Check size={14} style={{ color: '#0CC89E' }} />}
      {isError  && <AlertTriangle size={14} style={{ color: '#FF5A5A' }} />}
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize:   13,
        color:      isSaved ? '#0CC89E' : isError ? '#FF5A5A' : '#A09CC0',
        lineHeight: 1.5,
      }}>
        {isSaving ? 'Salvando alterações…' : state.message}
      </span>
    </div>
  )
}

// ─── SectionCard ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  description,
  children,
  action,
}: {
  title:        string
  description?: string
  children:     React.ReactNode
  action?:      React.ReactNode
}) {
  return (
    <div
      style={{
        background: '#0F0D1E',
        border:     '1px solid rgba(184,174,221,.14)',
        animation:  'slideIn .3s ease both',
      }}
    >
      {/* Card header */}
      <div
        className="flex items-start justify-between"
        style={{ padding: '20px 24px', borderBottom: '1px solid rgba(184,174,221,.10)' }}
      >
        <div>
          <h2 style={{
            fontFamily:    "'Bricolage Grotesque', sans-serif",
            fontWeight:     600,
            fontSize:       16,
            color:          '#EDEBF5',
            letterSpacing: '-.01em',
          }}>
            {title}
          </h2>
          {description && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#A09CC0', marginTop: 4, lineHeight: 1.6 }}>
              {description}
            </p>
          )}
        </div>
        {action}
      </div>

      {/* Card body */}
      <div style={{ padding: '24px' }}>
        {children}
      </div>
    </div>
  )
}

// ─── StoreProfileSection ─────────────────────────────────────────────────────

function StoreProfileSection({
  settings,
  onSave,
}: {
  settings: MerchantSettings
  onSave:   (updates: Partial<MerchantSettings>) => Promise<void>
}) {
  const [storeName, setStoreName] = useState(settings.storeName)
  const [email,     setEmail]     = useState(settings.email)
  const [saving,    setSaving]    = useState(false)

  // Sync if parent settings update
  useEffect(() => { setStoreName(settings.storeName) }, [settings.storeName])
  useEffect(() => { setEmail(settings.email)         }, [settings.email])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave({ storeName })
    setSaving(false)
  }

  const hasChanges = storeName !== settings.storeName

  return (
    <form onSubmit={handleSubmit}>
      <SectionCard
        title="Perfil da Loja"
        description="Informações exibidas no painel e nas notificações."
      >
        <div className="flex flex-col gap-5">

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="storeName">Nome da Loja</FieldLabel>
            <div className="relative">
              <FieldIcon><Store size={14} /></FieldIcon>
              <input
                id="storeName"
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                placeholder="Ex.: Boutique Lumina"
                autoComplete="organization"
                className="w-full outline-none transition-[border-color] duration-200"
                style={INPUT_STYLE}
                onFocus={e  => (e.currentTarget.style.borderColor = 'rgba(184,174,221,.40)')}
                onBlur={e   => (e.currentTarget.style.borderColor = 'rgba(184,174,221,.14)')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="merchantEmail">E-mail</FieldLabel>
            <div className="relative">
              <FieldIcon><Mail size={14} /></FieldIcon>
              <input
                id="merchantEmail"
                type="email"
                value={email}
                readOnly
                placeholder="voce@exemplo.com"
                autoComplete="email"
                className="w-full outline-none"
                style={{ ...INPUT_STYLE, cursor: 'default', opacity: 0.6 }}
              />
            </div>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '.16em', color: 'rgba(160,156,192,.45)', marginTop: 2 }}>
              Usado para notificações e acesso à conta.
            </p>
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <PrimaryButton type="submit" loading={saving} disabled={!hasChanges || saving} icon={<Save size={13} />}>
              Salvar Alterações
            </PrimaryButton>
          </div>
        </div>
      </SectionCard>
    </form>
  )
}

// ─── ApiKeySection ────────────────────────────────────────────────────────────

function ApiKeySection({
  settings,
  setSettings,
  supabase,
}: {
  settings:    MerchantSettings
  setSettings: React.Dispatch<React.SetStateAction<MerchantSettings>>
  supabase:    ReturnType<typeof createClient>
}) {
  const [visible,   setVisible]   = useState(false)
  const [copied,    setCopied]    = useState(false)
  const [regenOpen, setRegenOpen] = useState(false)
  const [regening,  setRegening]  = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(settings.apiKey).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  async function handleRegen() {
    setRegening(true)
    try {
      const newKey = generateApiKey()

      const { data: { user }, error: uErr } = await supabase.auth.getUser()
      if (uErr || !user) throw new Error('Não autenticado.')

      const { error } = await supabase
        .from('merchants')
        .update({ api_key: newKey })
        .eq('id', user.id)

      if (error) throw error

      setSettings(prev => ({ ...prev, apiKey: newKey }))
      setRegenOpen(false)
    } catch {
      // Error handling omitted for brevity — wire up toast if needed
    } finally {
      setRegening(false)
    }
  }

  const maskedKey = settings.apiKey
    ? settings.apiKey.slice(0, 8) + '••••••••••••••••••••••••' + settings.apiKey.slice(-4)
    : ''

  return (
    <>
      <SectionCard
        title="API Key"
        description="Use esta chave para autenticar chamadas à API do Reflexy."
      >
        <div className="flex flex-col gap-5">

          {/* Info box */}
          <div
            className="flex items-start gap-3 px-4 py-3"
            style={{ background: 'rgba(59,130,246,.07)', border: '1px solid rgba(59,130,246,.20)' }}
          >
            <Info size={13} className="mt-0.5 shrink-0" style={{ color: '#3B82F6' }} />
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(184,174,221,.70)', lineHeight: 1.65 }}>
              Trate sua API Key como uma senha. Mantenha-a protegida.
            </p>
          </div>

          {/* Key field */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Chave de API</FieldLabel>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FieldIcon><Key size={14} /></FieldIcon>
                <input
                  type={visible ? 'text' : 'password'}
                  value={settings.apiKey}
                  readOnly
                  className="w-full outline-none"
                  style={{
                    ...INPUT_STYLE,
                    fontFamily:  "'IBM Plex Mono', monospace",
                    fontSize:     12,
                    letterSpacing: visible ? '.04em' : '.08em',
                    color:         '#B8AEDD',
                    userSelect:    'all',
                    cursor:        'default',
                  }}
                />
                <button
                  type="button"
                  aria-label={visible ? 'Ocultar chave' : 'Mostrar chave'}
                  onClick={() => setVisible(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A09CC0', padding: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#B8AEDD')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#A09CC0')}
                >
                  {visible ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Copy button */}
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 transition-all shrink-0"
                style={{
                  background:  copied ? 'rgba(12,200,158,.10)' : 'rgba(184,174,221,.06)',
                  border:     `1px solid ${copied ? 'rgba(12,200,158,.30)' : 'rgba(184,174,221,.18)'}`,
                  color:       copied ? '#0CC89E' : '#A09CC0',
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight:  500,
                  fontSize:    10,
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  cursor:      'pointer',
                  minWidth:    88,
                  justifyContent: 'center',
                  transition: 'all .2s',
                }}
                onMouseEnter={e => { if (!copied) { e.currentTarget.style.background = 'rgba(184,174,221,.10)'; e.currentTarget.style.color = '#B8AEDD' } }}
                onMouseLeave={e => { if (!copied) { e.currentTarget.style.background = 'rgba(184,174,221,.06)'; e.currentTarget.style.color = '#A09CC0' } }}
              >
                {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
              </button>
            </div>

            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '.16em', color: 'rgba(160,156,192,.40)', marginTop: 2 }}>
              Criada em {new Date().toLocaleDateString('pt-BR')} · Última utilização: nunca
            </p>
          </div>

          {/* Regen button */}
          <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid rgba(184,174,221,.08)' }}>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#EDEBF5', fontWeight: 500 }}>
                Regerar chave
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#A09CC0', marginTop: 2 }}>
                A chave atual será invalidada imediatamente.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRegenOpen(true)}
              className="flex items-center gap-2 px-4 py-2 transition-all shrink-0"
              style={{
                background:   'rgba(255,180,50,.07)',
                border:       '1px solid rgba(255,180,50,.25)',
                color:         '#FFB432',
                fontFamily:   "'Bricolage Grotesque', sans-serif",
                fontWeight:    500,
                fontSize:      10,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                cursor:        'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,180,50,.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,180,50,.07)')}
            >
              <RefreshCw size={12} /> Regerar
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Regenerate confirmation modal */}
      {regenOpen && (
        <RegenModal
          loading={regening}
          onConfirm={handleRegen}
          onCancel={() => setRegenOpen(false)}
        />
      )}
    </>
  )
}

// ─── RegenModal ───────────────────────────────────────────────────────────────

function RegenModal({
  loading,
  onConfirm,
  onCancel,
}: {
  loading:   boolean
  onConfirm: () => void
  onCancel:  () => void
}) {
  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(6,5,15,.80)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        style={{
          background: '#0F0D1E',
          border:     '1px solid rgba(255,180,50,.30)',
          width:       '100%',
          maxWidth:    440,
          animation:  'slideIn .25s ease both',
        }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between"
          style={{ padding: '18px 24px', borderBottom: '1px solid rgba(184,174,221,.10)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center"
              style={{ width: 32, height: 32, background: 'rgba(255,180,50,.10)', border: '1px solid rgba(255,180,50,.25)' }}
            >
              <AlertTriangle size={15} style={{ color: '#FFB432' }} />
            </div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 16, color: '#EDEBF5', letterSpacing: '-.01em' }}>
              Regerar API Key
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A09CC0', padding: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#EDEBF5')}
            onMouseLeave={e => (e.currentTarget.style.color = '#A09CC0')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: '20px 24px 24px' }}>
          <div
            className="flex items-start gap-3 mb-5 p-4"
            style={{ background: 'rgba(255,180,50,.06)', border: '1px solid rgba(255,180,50,.20)' }}
          >
            <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: '#FFB432' }} />
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 13, color: '#FFB432', marginBottom: 4 }}>
                Atenção — esta ação não pode ser desfeita.
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#A09CC0', lineHeight: 1.65 }}>
                Sua chave atual será revogada imediatamente. Todas as integrações que a utilizam deixarão de funcionar até serem atualizadas com a nova chave.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 transition-all"
              style={{
                background:   'transparent',
                border:       '1px solid rgba(184,174,221,.18)',
                color:         '#A09CC0',
                fontFamily:   "'Bricolage Grotesque', sans-serif",
                fontWeight:    500,
                fontSize:      11,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                cursor:        loading ? 'not-allowed' : 'pointer',
                opacity:       loading ? 0.5 : 1,
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 transition-all"
              style={{
                background:   'rgba(255,180,50,.12)',
                border:       '1px solid rgba(255,180,50,.40)',
                color:         '#FFB432',
                fontFamily:   "'Bricolage Grotesque', sans-serif",
                fontWeight:    500,
                fontSize:      11,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                cursor:        loading ? 'not-allowed' : 'pointer',
                opacity:       loading ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(255,180,50,.20)' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'rgba(255,180,50,.12)' }}
            >
              {loading ? <><span style={SPINNER_STYLE} /> Regerando…</> : <><RefreshCw size={12} /> Sim, regerar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── BillingSection ───────────────────────────────────────────────────────────

const PLAN_LABELS: Record<string, string> = {
  free: 'Free', starter: 'Starter', growth: 'Growth', pro: 'Pro', enterprise: 'Enterprise',
}

function BillingSection({ settings }: { settings: MerchantSettings }) {
  const [upgrading, setUpgrading] = useState(false)

  async function handleManagePlan() {
    if (!settings.stripe_customer_id) {
      window.location.href = '/#pricing'
      return
    }
    setUpgrading(true)
    try {
      const res  = await fetch('/api/payments/create-portal-session', { method: 'POST' })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      alert(data.error || 'Não foi possível abrir o portal. Tente novamente.')
    } catch {
      alert('Erro ao conectar com o portal. Verifique sua conexão.')
    } finally {
      setUpgrading(false)
    }
  }

  const creditsLimit  = settings.credits_monthly  || 10
  const creditsRem    = settings.credits_remaining ?? creditsLimit
  const creditsPct    = Math.round((creditsRem / creditsLimit) * 100)
  const creditsColor  = creditsPct > 50 ? '#0CC89E' : creditsPct > 20 ? '#FFB432' : '#FF5A5A'

  const planLabel = PLAN_LABELS[settings.planSlug] ?? settings.planSlug
  const isFree    = settings.planSlug === 'free'

  const renewalDate = settings.subscription_current_period_end
    ? new Date(settings.subscription_current_period_end).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : null

  return (
    <div className="flex flex-col gap-4">

      {/* Plan overview card */}
      <SectionCard
        title="Plano atual"
        description="Resumo da sua assinatura e uso de créditos."
        action={
          <button
            type="button"
            onClick={handleManagePlan}
            disabled={upgrading}
            className="flex items-center gap-1.5 px-3 py-2 transition-all shrink-0"
            style={{
              background:   isFree
                ? 'linear-gradient(135deg,#2B1250 0%,#7050A0 100%)'
                : 'rgba(43,18,80,.55)',
              border:       '1px solid rgba(112,80,160,.5)',
              color:        '#B8AEDD',
              fontFamily:   "'DM Sans', sans-serif",
              fontSize:      12,
              fontWeight:    500,
              cursor:        upgrading ? 'not-allowed' : 'pointer',
              opacity:       upgrading ? 0.7 : 1,
              whiteSpace:   'nowrap',
            }}
          >
            {upgrading
              ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Abrindo…</>
              : isFree
                ? <><ExternalLink size={12} /> Fazer upgrade</>
                : <><ExternalLink size={12} /> Gerenciar plano</>
            }
          </button>
        }
      >
        <div className="flex flex-col gap-5">

          {/* Plan badge + renewal */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span style={{
                padding:      '4px 12px',
                background:    isFree ? 'rgba(184,174,221,.08)' : 'rgba(12,200,158,.08)',
                border:       `1px solid ${isFree ? 'rgba(184,174,221,.22)' : 'rgba(12,200,158,.3)'}`,
                fontFamily:   "'IBM Plex Mono', monospace",
                fontSize:      10,
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                color:          isFree ? '#A09CC0' : '#0CC89E',
              }}>
                {planLabel}
              </span>
              {!isFree && (
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#A09CC0' }}>
                  Assinatura ativa
                </span>
              )}
            </div>
            {renewalDate && (
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#A09CC0' }}>
                Renova em {renewalDate}
              </span>
            )}
          </div>

          {/* Credits bar */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={13} style={{ color: creditsColor }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#EDEBF5', fontWeight: 500 }}>
                  Créditos restantes
                </span>
              </div>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize:    13,
                color:       creditsColor,
                fontWeight:  600,
              }}>
                {creditsRem.toLocaleString('pt-BR')} <span style={{ color: '#A09CC0', fontWeight: 400 }}>/ {creditsLimit.toLocaleString('pt-BR')}</span>
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 4, background: 'rgba(184,174,221,.10)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height:      '100%',
                width:       `${Math.min(100, creditsPct)}%`,
                background:   creditsColor,
                borderRadius:  2,
                transition:   'width .4s ease',
              }} />
            </div>

            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#A09CC0' }}>
              Prova virtual rápida = 1 crédito · Studio Pro (tryon-max) = 4 créditos
            </p>
          </div>

          {/* Credit usage hint */}
          {creditsRem === 0 && (
            <div className="flex items-center gap-2 p-3" style={{
              background: 'rgba(255,90,90,.06)',
              border:     '1px solid rgba(255,90,90,.18)',
            }}>
              <AlertTriangle size={13} style={{ color: '#FF5A5A', flexShrink: 0 }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#FF5A5A', lineHeight: 1.5 }}>
                Seus créditos acabaram.{' '}
                {isFree
                  ? 'Faça upgrade para continuar gerando try-ons.'
                  : 'Gerencie seu plano para adicionar créditos ou aguarde a renovação.'}
              </span>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Credit model info */}
      <div style={{
        padding:    '14px 18px',
        background: 'rgba(184,174,221,.03)',
        border:     '1px solid rgba(184,174,221,.10)',
      }}>
        <div className="flex items-start gap-2.5">
          <Info size={13} style={{ color: '#7050A0', marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#A09CC0', lineHeight: 1.7, margin: 0 }}>
            <strong style={{ color: '#EDEBF5' }}>Modelo de crédito unificado:</strong>{' '}
            todos os tipos de geração usam o mesmo saldo. Prova virtual rápida consome 1 crédito,
            Studio Pro consome 4. Os créditos não acumulam entre ciclos.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── WidgetSection ────────────────────────────────────────────────────────────

function WidgetSection({
  settings,
  onSave,
}: {
  settings: MerchantSettings
  onSave:   (updates: Partial<MerchantSettings>) => Promise<void>
}) {
  const [enabled,   setEnabled]   = useState(settings.widgetEnabled)
  const [tryonMode, setTryonMode] = useState<'fast' | 'premium'>(settings.tryonMode)
  const [saving,    setSaving]    = useState(false)

  useEffect(() => { setEnabled(settings.widgetEnabled)   }, [settings.widgetEnabled])
  useEffect(() => { setTryonMode(settings.tryonMode)     }, [settings.tryonMode])

  async function handleToggle() {
    const next = !enabled
    setEnabled(next)
    setSaving(true)
    await onSave({ widgetEnabled: next })
    setSaving(false)
  }

  async function handleModeChange(mode: 'fast' | 'premium') {
    if (mode === tryonMode) return
    setTryonMode(mode)
    setSaving(true)
    await onSave({ tryonMode: mode })
    setSaving(false)
  }

  return (
    <SectionCard
      title="Widget de Provador"
      description="Controle a exibição do botão de provador virtual na sua loja."
    >
      <div className="flex flex-col gap-5">

        {/* Toggle row */}
        <div
          className="flex items-center justify-between p-4"
          style={{ background: 'rgba(184,174,221,.03)', border: '1px solid rgba(184,174,221,.10)' }}
        >
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#EDEBF5', fontWeight: 500, marginBottom: 3 }}>
              Widget ativo na loja
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#A09CC0', lineHeight: 1.6 }}>
              Quando ativo, o botão "Provar em mim" aparece nas páginas de produto.
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggle}
            disabled={saving}
            aria-label={enabled ? 'Desativar widget' : 'Ativar widget'}
            className="transition-all shrink-0 ml-6"
            style={{
              background: 'none',
              border:     'none',
              cursor:      saving ? 'not-allowed' : 'pointer',
              opacity:     saving ? 0.6 : 1,
              padding:     0,
            }}
          >
            {enabled
              ? <ToggleRight size={36} style={{ color: '#0CC89E' }} />
              : <ToggleLeft  size={36} style={{ color: '#A09CC0' }} />
            }
          </button>
        </div>

        {/* Status chip */}
        <div className="flex items-center gap-2">
          <span
            style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:           6,
              padding:      '4px 10px',
              background:    enabled ? 'rgba(12,200,158,.08)' : 'rgba(184,174,221,.06)',
              border:       `1px solid ${enabled ? 'rgba(12,200,158,.25)' : 'rgba(184,174,221,.14)'}`,
              fontFamily:   "'IBM Plex Mono', monospace",
              fontSize:      9,
              letterSpacing: '.20em',
              textTransform: 'uppercase',
              color:          enabled ? '#0CC89E' : '#A09CC0',
              transition:    'all .3s',
            }}
          >
            {enabled && (
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: '#0CC89E', boxShadow: '0 0 5px #0CC89E',
                animation: 'dotPulse 2.5s ease-in-out infinite',
              }} />
            )}
            {saving ? 'Salvando…' : enabled ? 'Widget ativo' : 'Widget inativo'}
          </span>
        </div>

        {/* Try-on mode toggle */}
        <div className="flex flex-col gap-3 pt-4" style={{ borderTop: '1px solid rgba(184,174,221,.08)' }}>
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#EDEBF5', fontWeight: 500, marginBottom: 4 }}>
              Modo de geração
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#A09CC0', lineHeight: 1.6, marginBottom: 12 }}>
              Define a qualidade padrão das provas virtuais do widget.
            </p>
            <div className="flex gap-2">
              {/* Fast mode */}
              <button
                type="button"
                disabled={saving}
                onClick={() => handleModeChange('fast')}
                className="flex-1 flex flex-col gap-1.5 p-3 transition-all text-left"
                style={{
                  background:  tryonMode === 'fast' ? 'rgba(12,200,158,.07)' : 'rgba(184,174,221,.03)',
                  border:     `1px solid ${tryonMode === 'fast' ? 'rgba(12,200,158,.35)' : 'rgba(184,174,221,.12)'}`,
                  cursor:      saving ? 'not-allowed' : 'pointer',
                  opacity:     saving ? 0.7 : 1,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap size={13} style={{ color: tryonMode === 'fast' ? '#0CC89E' : '#A09CC0' }} />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: tryonMode === 'fast' ? '#EDEBF5' : '#A09CC0', fontWeight: 500 }}>
                      Fast
                    </span>
                  </div>
                  {tryonMode === 'fast' && <Check size={11} style={{ color: '#0CC89E' }} />}
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#A09CC0', lineHeight: 1.5, margin: 0 }}>
                  12–17s · 1 crédito
                </p>
              </button>

              {/* Premium mode */}
              <button
                type="button"
                disabled={saving}
                onClick={() => handleModeChange('premium')}
                className="flex-1 flex flex-col gap-1.5 p-3 transition-all text-left"
                style={{
                  background:  tryonMode === 'premium' ? 'rgba(112,80,160,.12)' : 'rgba(184,174,221,.03)',
                  border:     `1px solid ${tryonMode === 'premium' ? 'rgba(112,80,160,.50)' : 'rgba(184,174,221,.12)'}`,
                  cursor:      saving ? 'not-allowed' : 'pointer',
                  opacity:     saving ? 0.7 : 1,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Star size={13} style={{ color: tryonMode === 'premium' ? '#B8AEDD' : '#A09CC0' }} />
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: tryonMode === 'premium' ? '#EDEBF5' : '#A09CC0', fontWeight: 500 }}>
                      Premium
                    </span>
                  </div>
                  {tryonMode === 'premium' && <Check size={11} style={{ color: '#B8AEDD' }} />}
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#A09CC0', lineHeight: 1.5, margin: 0 }}>
                  ~50s · 4K · 4 créditos
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Snippet section */}
        <div className="flex flex-col gap-2 pt-4" style={{ borderTop: '1px solid rgba(184,174,221,.08)' }}>
          <FieldLabel>Snippet de integração</FieldLabel>
          <div
            className="relative"
            style={{ background: 'rgba(6,5,15,.60)', border: '1px solid rgba(184,174,221,.12)', padding: '14px 16px' }}
          >
            <pre style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize:    11,
              letterSpacing: '.02em',
              color:       '#B8AEDD',
              lineHeight:  1.7,
              overflowX:   'auto',
              margin:       0,
            }}>
{`<script src="https://cdn.reflexy.com/widget.js"
  data-store-id="YOUR_STORE_ID"
  data-api-key="YOUR_API_KEY">
</script>`}
            </pre>
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(160,156,192,.50)', lineHeight: 1.6 }}>
            Cole este snippet antes do fechamento do <code style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#A09CC0' }}>&lt;/body&gt;</code> em seu tema.
          </p>
        </div>
      </div>
    </SectionCard>
  )
}

// ─── DangerSection ────────────────────────────────────────────────────────────

function DangerSection({ onSignOut }: { onSignOut: () => void }) {
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        title="Sessão"
        description="Gerencie o acesso à sua conta."
      >
        <div
          className="flex items-center justify-between p-4"
          style={{ background: 'rgba(184,174,221,.03)', border: '1px solid rgba(184,174,221,.10)' }}
        >
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#EDEBF5', fontWeight: 500, marginBottom: 3 }}>
              Encerrar sessão
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#A09CC0', lineHeight: 1.6 }}>
              Você será redirecionado para a página de login.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmSignOut(true)}
            className="flex items-center gap-2 px-4 py-2.5 transition-all shrink-0 ml-4"
            style={{
              background:   'transparent',
              border:       '1px solid rgba(184,174,221,.18)',
              color:         '#A09CC0',
              fontFamily:   "'Bricolage Grotesque', sans-serif",
              fontWeight:    500,
              fontSize:      10,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              cursor:        'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(184,174,221,.32)'; e.currentTarget.style.color = '#EDEBF5' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,174,221,.18)'; e.currentTarget.style.color = '#A09CC0' }}
          >
            <LogOut size={12} /> Sair
          </button>
        </div>
      </SectionCard>

      {/* Zona de perigo */}
      <div
        style={{
          background: '#0F0D1E',
          border:     '1px solid rgba(255,90,90,.16)',
          animation:  'slideIn .35s ease both',
          animationDelay: '.05s',
        }}
      >
        <div
          className="flex items-center gap-3"
          style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,90,90,.12)' }}
        >
          <AlertTriangle size={15} style={{ color: '#FF5A5A' }} />
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 15, color: '#FF5A5A', letterSpacing: '-.01em' }}>
            Zona de Perigo
          </h2>
        </div>
        <div style={{ padding: 24 }}>
          <div
            className="flex items-center justify-between p-4"
            style={{ background: 'rgba(255,90,90,.04)', border: '1px solid rgba(255,90,90,.12)' }}
          >
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#EDEBF5', fontWeight: 500, marginBottom: 3 }}>
                Excluir conta
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#A09CC0', lineHeight: 1.6 }}>
                Remove permanentemente sua conta e todos os dados associados.
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert('Entre em contato com o suporte para excluir sua conta.')}
              className="flex items-center gap-2 px-4 py-2.5 transition-all shrink-0 ml-4"
              style={{
                background:   'rgba(255,90,90,.08)',
                border:       '1px solid rgba(255,90,90,.25)',
                color:         '#FF5A5A',
                fontFamily:   "'Bricolage Grotesque', sans-serif",
                fontWeight:    500,
                fontSize:      10,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                cursor:        'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,90,90,.14)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,90,90,.08)')}
            >
              <X size={12} /> Excluir conta
            </button>
          </div>
        </div>
      </div>

      {/* Sign out confirmation */}
      {confirmSignOut && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(6,5,15,.80)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmSignOut(false) }}
        >
          <div
            style={{ background: '#0F0D1E', border: '1px solid rgba(184,174,221,.18)', width: '100%', maxWidth: 380, animation: 'slideIn .22s ease both' }}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(184,174,221,.10)' }}>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 15, color: '#EDEBF5' }}>
                Encerrar sessão?
              </h3>
            </div>
            <div style={{ padding: '16px 24px 20px' }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#A09CC0', lineHeight: 1.6, marginBottom: 20 }}>
                Você precisará fazer login novamente para acessar o painel.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmSignOut(false)}
                  style={{ background: 'transparent', border: '1px solid rgba(184,174,221,.18)', color: '#A09CC0', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer', padding: '8px 16px' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="flex items-center gap-2"
                  style={{ background: 'rgba(184,174,221,.08)', border: '1px solid rgba(184,174,221,.22)', color: '#EDEBF5', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer', padding: '8px 16px' }}
                >
                  <LogOut size={12} /> Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PrimaryButton ────────────────────────────────────────────────────────────

function PrimaryButton({
  children,
  loading,
  disabled,
  icon,
  type = 'button',
}: {
  children:  React.ReactNode
  loading?:  boolean
  disabled?: boolean
  icon?:     React.ReactNode
  type?:     'button' | 'submit'
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className="flex items-center gap-2 px-5 py-2.5 transition-all"
      style={{
        background:    disabled
          ? 'rgba(43,18,80,.3)'
          : 'linear-gradient(135deg, #2B1250 0%, #7050A0 100%)',
        border:        '1px solid rgba(112,80,160,.35)',
        color:          disabled ? 'rgba(184,174,221,.35)' : '#EDEBF5',
        fontFamily:    "'Bricolage Grotesque', sans-serif",
        fontWeight:     500,
        fontSize:       11,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        cursor:        (disabled || loading) ? 'not-allowed' : 'pointer',
        filter:       (!disabled && !loading) ? 'drop-shadow(0 0 16px rgba(43,18,80,.40))' : 'none',
        opacity:       disabled ? 0.5 : 1,
        transition:    'filter .2s',
      }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.filter = 'drop-shadow(0 0 22px rgba(43,18,80,.65)) brightness(1.08)' }}
      onMouseLeave={e => { if (!disabled && !loading) e.currentTarget.style.filter = 'drop-shadow(0 0 16px rgba(43,18,80,.40))' }}
    >
      {loading ? (
        <><span style={SPINNER_STYLE} /> Salvando…</>
      ) : (
        <>{icon}{children}</>
      )}
    </button>
  )
}

// ─── LoadingScreen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: '#06050F', zIndex: 100 }}
    >
      <div className="flex flex-col items-center gap-4">
        <ReflexGem size={48} uid="loading" />
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: '#A09CC0', marginTop: 4 }}>
          Carregando…
        </span>
      </div>
    </div>
  )
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const seg   = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `rfx_live_${seg(8)}_${seg(16)}_${seg(8)}`
}

function generateDemoKey(): string {
  return 'rfx_live_demoK3y_XXXXXXXXXXXX_demo0001'
}
