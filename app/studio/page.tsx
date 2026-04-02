'use client'

/**
 * Reflexy — app/studio/page.tsx
 * Studio Pro · Brand System V5 · Deep Amethyst
 *
 * Tokens aplicados:
 *  Página          → --abyss   #06050F
 *  Upload cards    → --onyx    #0F0D1E  (--s1-bg)
 *  Upload border   → --rule    rgba(184,174,221,.14)
 *  Progress bar    → --verdigris #0CC89E
 *  Galeria items   → --onyx
 *  CTA Primary     → gradient  #2B1250 → #7050A0
 *
 * Features:
 *  - Upload duplo com drag-and-drop e preview
 *  - Galeria de Modelos Recomendados (accordion colapsável)
 *  - Progress bar com mensagens em tempo real
 *  - Créditos no nav → CTA de upgrade quando zerado
 *  - Nome da loja no nav (via Supabase)
 *  - Galeria de gerações recentes
 */

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type DragEvent,
  type ChangeEvent,
} from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { InternalFooter } from '@/components/ui/InternalFooter'
import { getPlanFeatures } from '@/lib/plan-features'
import {
  Upload,
  Sparkles,
  Download,
  AlertCircle,
  X,
  Clock,
  Zap,
  User,
  ShoppingBag,
  ChevronDown,
  LayoutGrid,
  RefreshCw,
  Crown,
  LogOut,
  Check,
} from 'lucide-react'
import ReflexGem from '@/components/ui/ReflexGem'
import {
  GrainOverlay,
  AmbientGlow,
  GlobalKeyframes,
  SPINNER_STYLE,
} from '@/app/login/page'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadedImage {
  preview: string  // object URL or preset URL
  name:    string
  isPreset?: boolean
  file?: File      // actual File object for uploads (undefined for presets)
}

type GenerationStatus =
  | 'idle'
  | 'analyzing'
  | 'identifying'
  | 'mapping'
  | 'optimizing'
  | 'generating'
  | 'refining'
  | 'done'
  | 'error'

interface GenerationResult {
  id:        string
  url:       string
  createdAt: Date
  modelName: string
}

interface MerchantData {
  storeName:          string
  plan:               'free' | 'starter' | 'growth' | 'pro' | 'enterprise'
  credits_remaining:  number
  stripe_customer_id: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GENERATION_STEPS: { status: GenerationStatus; message: string; pct: number }[] = [
  { status: 'analyzing',   message: 'Analisando fotos…',       pct: 15 },
  { status: 'identifying', message: 'Identificando modelo…',   pct: 30 },
  { status: 'mapping',     message: 'Mapeando a peça…',        pct: 48 },
  { status: 'optimizing',  message: 'Otimizando prompt IA…',   pct: 62 },
  { status: 'generating',  message: 'Gerando com IA…',         pct: 80 },
  { status: 'refining',    message: 'Aplicando refinamentos…', pct: 93 },
]

/** Preset models offered by Reflexy. Replace URLs with real CDN assets. */
const PRESET_MODELS: { id: string; url: string; thumb: string; label: string }[] = [
  { id: 'p1', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=90', thumb: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=75', label: 'Modelo 1' },
  { id: 'p2', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=90', thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=75', label: 'Modelo 2' },
  { id: 'p3', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=90', thumb: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=75', label: 'Modelo 3' },
  { id: 'p4', url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=90', thumb: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&q=75', label: 'Modelo 4' },
  { id: 'p5', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=90', thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=75', label: 'Modelo 5' },
  { id: 'p6', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=90', thumb: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=75', label: 'Modelo 6' },
]

// ─── Demo gallery ─────────────────────────────────────────────────────────────

const DEMO_GALLERY: GenerationResult[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', createdAt: new Date(Date.now() - 12 * 60000), modelName: 'Modelo A' },
  { id: '2', url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80', createdAt: new Date(Date.now() - 45 * 60000), modelName: 'Modelo B' },
  { id: '3', url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&q=80', createdAt: new Date(Date.now() - 90 * 60000), modelName: 'Modelo A' },
  { id: '4', url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80', createdAt: new Date(Date.now() - 180 * 60000), modelName: 'Modelo C' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const mins = Math.round((Date.now() - d.getTime()) / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min atrás`
  return `${Math.round(mins / 60)}h atrás`
}

function triggerDownload(url: string, filename: string) {
  const a = Object.assign(document.createElement('a'), {
    href: url, download: filename, target: '_blank', rel: 'noopener noreferrer',
  })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudioPage() {
  const router   = useRouter()
  const supabase = createClient()

  // ── Merchant data ────────────────────────────────────────────────────────
  const [merchant, setMerchant] = useState<MerchantData>({
    storeName:          '',
    plan:               'free',
    credits_remaining:  0,
    stripe_customer_id: null,
  })

  useEffect(() => {
    async function fetchMerchant() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('merchants')
        .select('store_name, credits_remaining, stripe_customer_id, plans!plan_id(slug)')
        .eq('id', user.id)
        .single()

      if (data) {
        const planSlug = (data as any).plans?.slug ?? 'free'
        const features = getPlanFeatures(planSlug)
        if (!features.studioPro) setPlanLocked(true)
        setMerchant({
          storeName:          data.store_name ?? '',
          plan:               planSlug as MerchantData['plan'],
          credits_remaining:  (data as any).credits_remaining ?? 0,
          stripe_customer_id: (data as any).stripe_customer_id ?? null,
        })
      }
    }
    fetchMerchant()
  }, [])

  // ── Upload state ─────────────────────────────────────────────────────────
  const [modelImg,    setModelImg]    = useState<UploadedImage | null>(null)
  const [productImg,  setProductImg]  = useState<UploadedImage | null>(null)
  const [modelDrag,   setModelDrag]   = useState(false)
  const [productDrag, setProductDrag] = useState(false)
  const modelRef   = useRef<HTMLInputElement>(null)
  const productRef = useRef<HTMLInputElement>(null)

  // ── Recommended models ────────────────────────────────────────────────────
  const [recOpen,         setRecOpen]         = useState(false)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)

  // ── Plan gate ─────────────────────────────────────────────────────────────
  const [planLocked,   setPlanLocked]   = useState(false)
  const [upgradingPlan, setUpgradingPlan] = useState(false)

  async function handleUpgrade() {
    if (merchant.stripe_customer_id) {
      setUpgradingPlan(true)
      try {
        const res  = await fetch('/api/payments/create-portal-session', { method: 'POST' })
        const data = await res.json()
        if (data.url) { window.location.href = data.url; return }
        alert(data.error || 'Não foi possível abrir o portal.')
      } catch { alert('Erro ao conectar com o portal.') }
      finally { setUpgradingPlan(false) }
    } else {
      window.location.href = '/#pricing'
    }
  }

  // ── Generation state ─────────────────────────────────────────────────────
  const [status,   setStatus]   = useState<GenerationStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [progMsg,  setProgMsg]  = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [result,   setResult]   = useState<string | null>(null)
  const [gallery,  setGallery]  = useState<GenerationResult[]>(DEMO_GALLERY)

  const isGenerating = !['idle', 'done', 'error'].includes(status)
  const canGenerate  = !!modelImg && !!productImg && !isGenerating

  // ── Lightbox state ────────────────────────────────────────────────────────
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxOpen(false)
    }
    if (lightboxOpen) {
      document.addEventListener('keydown', onKeyDown)
      return () => document.removeEventListener('keydown', onKeyDown)
    }
  }, [lightboxOpen])

  // ── History fetch ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/studio/history')
        if (res.ok) {
          const data: GenerationResult[] = await res.json()
          const hydrated = data.map(item => ({
            ...item,
            createdAt: new Date(item.createdAt as unknown as string),
          }))
          if (hydrated.length) setGallery(hydrated)
        }
      } catch {
        // Falls back to demo gallery
      }
    }
    fetchHistory()
  }, [])

  // ── Cleanup object URLs ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (modelImg?.preview && !modelImg.isPreset) URL.revokeObjectURL(modelImg.preview)
      if (productImg?.preview) URL.revokeObjectURL(productImg.preview)
    }
  }, []) // eslint-disable-line

  // ── Upload handlers ───────────────────────────────────────────────────────

  function loadFile(file: File, setter: (img: UploadedImage) => void) {
    if (!file.type.startsWith('image/')) return
    setter({ preview: URL.createObjectURL(file), name: file.name, file })
  }

  const onModelChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      if (modelImg && !modelImg.isPreset) URL.revokeObjectURL(modelImg.preview)
      setSelectedPresetId(null)
      loadFile(e.target.files[0], setModelImg)
    }
  }

  const onProductChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      if (productImg) URL.revokeObjectURL(productImg.preview)
      loadFile(e.target.files[0], setProductImg)
    }
  }

  const onModelDrop = useCallback((e: DragEvent) => {
    e.preventDefault(); setModelDrag(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      if (modelImg && !modelImg.isPreset) URL.revokeObjectURL(modelImg.preview)
      setSelectedPresetId(null)
      loadFile(file, setModelImg)
    }
  }, [modelImg])

  const onProductDrop = useCallback((e: DragEvent) => {
    e.preventDefault(); setProductDrag(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      if (productImg) URL.revokeObjectURL(productImg.preview)
      loadFile(file, setProductImg)
    }
  }, [productImg])

  // ── Preset model selection ─────────────────────────────────────────────────

  function selectPreset(preset: typeof PRESET_MODELS[0]) {
    if (modelImg && !modelImg.isPreset) URL.revokeObjectURL(modelImg.preview)
    setModelImg({ preview: preset.url, name: preset.label, isPreset: true })
    setSelectedPresetId(preset.id)
    setRecOpen(false)
  }

  // ── Generation ────────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!canGenerate) return
    setError(null)
    setResult(null)
    setStatus('analyzing')

    try {
      for (const step of GENERATION_STEPS) {
        setStatus(step.status)
        setProgMsg(step.message)
        setProgress(step.pct)
        await sleep(step.status === 'generating' ? 2200 : 900)
      }

      const formData = new FormData()
      if (modelImg!.isPreset) {
        // Preset: send the public URL directly
        formData.append('modelPresetId', selectedPresetId ?? '')
        formData.append('model', modelImg!.preview)
      } else if (modelImg!.file) {
        // Uploaded file: send actual File blob
        formData.append('modelFile', modelImg!.file)
      } else {
        // Should not happen (canGenerate guard), but surface a clear error
        throw new Error('Imagem do modelo inválida. Por favor recarregue a foto.')
      }
      if (productImg!.file) {
        // Uploaded file: send actual File blob
        formData.append('productFile', productImg!.file)
      } else {
        // Should not happen (canGenerate guard), but surface a clear error
        throw new Error('Imagem do produto inválida. Por favor recarregue a foto.')
      }

      const res = await fetch('/api/studio/generate', { method: 'POST', body: formData })
      if (!res.ok) {
        // Surface the server error message instead of a generic "Erro 500"
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Erro ${res.status}`)
      }

      const data: { url: string } = await res.json()

      setProgress(100)
      setProgMsg('Pronto.')
      await sleep(400)
      setStatus('done')
      setResult(data.url)

      setMerchant(prev => ({ ...prev, credits_remaining: Math.max(0, prev.credits_remaining - 4) }))
      setGallery(prev => [{
        id:        Date.now().toString(),
        url:       data.url,
        createdAt: new Date(),
        modelName: modelImg!.name,
      }, ...prev])

    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.')
    }
  }

  function handleReset() {
    setStatus('idle')
    setError(null)
    setResult(null)
    setProgress(0)
    setProgMsg('')
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // ── Render ────────────────────────────────────────────────────────────────

  // Plan gate: Free plan cannot access Studio Pro
  if (planLocked) {
    return (
      <main style={{ minHeight: '100vh', background: '#06050F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <GrainOverlay />
        <AmbientGlow />
        <div style={{ textAlign: 'center', padding: '40px 24px', maxWidth: 480, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 56, height: 56, borderRadius: 10, background: 'rgba(43,18,80,0.6)', border: '1px solid rgba(112,80,160,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Crown size={24} color="#B8AEDD" />
          </div>
          <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 24, fontWeight: 600, color: '#EDEBF5', marginBottom: 12 }}>
            Studio Pro
          </h1>
          <p style={{ color: '#A09CC0', fontSize: 15, lineHeight: 1.6, marginBottom: 8 }}>
            O Studio Pro está disponível a partir do plano <strong style={{ color: '#B8AEDD' }}>Starter</strong>.
          </p>
          <p style={{ color: '#A09CC0', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
            Gere fotos profissionais com modelos usando inteligência artificial de alta qualidade.
          </p>
          <button
            onClick={handleUpgrade}
            disabled={upgradingPlan}
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
              border: 'none', borderRadius: 100, color: '#EDEBF5',
              padding: '13px 32px', fontSize: 14, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: upgradingPlan ? 'not-allowed' : 'pointer',
              opacity: upgradingPlan ? 0.7 : 1,
              letterSpacing: '0.02em',
            }}
          >
            {upgradingPlan ? 'Abrindo…' : merchant.stripe_customer_id ? 'Gerenciar plano ↗' : 'Ver planos'}
          </button>
          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => router.push('/dashboard')}
              style={{ background: 'none', border: 'none', color: '#A09CC0', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            >
              Voltar ao dashboard
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#06050F', display: 'flex', flexDirection: 'column' }}>
      <GrainOverlay />
      <AmbientGlow />

      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-7"
        style={{
          height:              52,
          borderBottom:       '1px solid rgba(184,174,221,.09)',
          background:         'rgba(6,5,15,.92)',
          backdropFilter:     'blur(20px)',
          WebkitBackdropFilter:'blur(20px)',
        }}
      >
        {/* Left */}
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <ReflexGem size={18} uid="nav" noReflection />
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
            Estúdio Pro
          </span>
        </div>

        {/* Right */}
        <div className="studio-nav-right flex items-center gap-2.5">

          {/* Premium badge */}
          {(merchant.plan === 'pro' || merchant.plan === 'enterprise') && (
            <div
              className="flex items-center gap-2 px-3 py-1.5"
              style={{ background: 'rgba(43,18,80,.60)', border: '1px solid rgba(112,80,160,.35)', borderRadius: 100 }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#0CC89E', boxShadow: '0 0 6px #0CC89E',
                display: 'inline-block', animation: 'dotPulse 3s ease-in-out infinite',
              }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, color: '#B8AEDD' }}>
                Premium
              </span>
            </div>
          )}

          {/* Credits counter or upgrade CTA */}
          {merchant.credits_remaining > 0 ? (
            <div className="flex items-center gap-1.5">
              <Zap size={11} style={{ color: '#A09CC0' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, color: '#A09CC0' }}>
                {merchant.credits_remaining} crédito{merchant.credits_remaining !== 1 ? 's' : ''}
              </span>
            </div>
          ) : (
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 transition-all"
              style={{
                background:    'linear-gradient(135deg,#7C3AED,#5B21B6)',
                border:        '1px solid rgba(112,80,160,.45)',
                borderRadius:   100,
                color:          '#EDEBF5',
                fontFamily:    "'DM Sans', sans-serif",
                fontWeight:     500,
                fontSize:       12,
                cursor:         'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.12)')}
              onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
            >
              <Crown size={11} /> Obter mais créditos
            </button>
          )}

          {/* Store name */}
          {merchant.storeName && (
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#A09CC0' }}>
              {merchant.storeName}
            </span>
          )}

          {/* Sign out */}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
            style={{
              background:  'transparent',
              border:      '1px solid rgba(184,174,221,.14)',
              borderRadius: 8,
              color:        '#A09CC0',
              fontFamily:  "'DM Sans', sans-serif",
              fontSize:     12,
              cursor:       'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(184,174,221,.30)'; e.currentTarget.style.color = '#EDEBF5' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,174,221,.14)'; e.currentTarget.style.color = '#A09CC0' }}
          >
            <LogOut size={13} /> Sair
          </button>
        </div>
      </nav>

      {/* ── Page content ── */}
      <div
        className="studio-content relative z-10 px-7"
        style={{ width: '100%', paddingTop: 48, paddingBottom: 100, flex: 1 }}
      >

        {/* Header */}
        <div style={{ marginBottom: 44 }}>
          <div
            className="inline-flex items-center gap-2 mb-4"
            style={{ background: 'rgba(43,18,80,.55)', border: '1px solid rgba(112,80,160,.30)', borderRadius: 100, padding: '5px 14px' }}
          >
            <Sparkles size={12} style={{ color: '#B8AEDD' }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, color: '#B8AEDD' }}>
              Try-On Max — Qualidade Máxima
            </span>
          </div>

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: 13, color: 'rgba(160,156,192,.50)', lineHeight: 1.6 }}>
            Ideal para catálogo, anúncios e redes sociais.
          </p>
        </div>

        {/* ── Upload grid ── */}
        <div
          className="studio-upload-grid grid gap-4 mb-4"
          style={{ gridTemplateColumns: '1fr 1fr' }}
        >

          {/* Modelo card */}
          <div style={{ background: '#0F0D1E', border: '1px solid rgba(184,174,221,.14)', borderRadius: 16, overflow: 'hidden' }}>
            <UploadCardHeader
              icon={<User size={15} style={{ color: '#A09CC0' }} />}
              title="Foto do Modelo"
              desc="Pessoa a ser vestida"
            />

            <UploadDropZone
              id="model"
              primaryText="Upload da Pessoa"
              secondaryText="Foto de corpo inteiro recomendada"
              image={modelImg}
              isDragging={modelDrag}
              inputRef={modelRef}
              onDragOver={e => { e.preventDefault(); setModelDrag(true) }}
              onDragLeave={() => setModelDrag(false)}
              onDrop={onModelDrop}
              onChange={onModelChange}
              onClear={() => {
                if (modelImg && !modelImg.isPreset) URL.revokeObjectURL(modelImg.preview)
                setModelImg(null)
                setSelectedPresetId(null)
              }}
              onSwap={() => modelRef.current?.click()}
            />

            {/* Recommended models toggle */}
            <button
              type="button"
              onClick={() => setRecOpen(v => !v)}
              className="w-full flex items-center justify-between transition-colors"
              style={{
                padding:     '10px 16px',
                borderTop:  '1px solid rgba(184,174,221,.14)',
                background:  'transparent',
                cursor:      'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(184,174,221,.03)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="flex items-center gap-2">
                <LayoutGrid size={11} style={{ color: '#A09CC0' }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, color: '#A09CC0' }}>
                  Modelos Recomendados
                </span>
                <span
                  style={{
                    fontFamily:    "'DM Sans', sans-serif",
                    fontSize:       10,
                    fontWeight:     500,
                    color:          '#0CC89E',
                    background:    'rgba(12,200,158,.08)',
                    border:        '1px solid rgba(12,200,158,.20)',
                    borderRadius:   100,
                    padding:       '2px 7px',
                  }}
                >
                  Reflexy
                </span>
              </div>
              <ChevronDown
                size={13}
                style={{
                  color:     '#A09CC0',
                  transform: recOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition:'transform .25s',
                }}
              />
            </button>

            {/* Recommended models panel */}
            {recOpen && (
              <div
                style={{
                  borderTop: '1px solid rgba(184,174,221,.14)',
                  padding:    '14px 16px',
                  background: 'rgba(6,5,15,.30)',
                  animation:  'recPanelReveal .22s ease both',
                }}
              >
                <div
                  className="studio-preset-grid grid gap-2"
                  style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
                >
                  {PRESET_MODELS.map(preset => (
                    <PresetModelThumb
                      key={preset.id}
                      preset={preset}
                      isSelected={selectedPresetId === preset.id}
                      onSelect={() => selectPreset(preset)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Produto card */}
          <div style={{ background: '#0F0D1E', border: '1px solid rgba(184,174,221,.14)', borderRadius: 16, overflow: 'hidden' }}>
            <UploadCardHeader
              icon={<ShoppingBag size={15} style={{ color: '#A09CC0' }} />}
              title="Foto do Produto"
              desc="Peça de roupa a vestir"
            />

            <UploadDropZone
              id="product"
              primaryText="Upload da Roupa"
              secondaryText="Foto em cabide ou flat-lay"
              image={productImg}
              isDragging={productDrag}
              inputRef={productRef}
              onDragOver={e => { e.preventDefault(); setProductDrag(true) }}
              onDragLeave={() => setProductDrag(false)}
              onDrop={onProductDrop}
              onChange={onProductChange}
              onClear={() => { if (productImg) URL.revokeObjectURL(productImg.preview); setProductImg(null) }}
              onSwap={() => productRef.current?.click()}
            />
          </div>
        </div>

        {/* Tip bar */}
        <div
          className="flex items-start gap-3 mb-8"
          style={{ padding: '12px 18px', background: 'rgba(184,174,221,.03)', border: '1px solid rgba(184,174,221,.10)', borderRadius: 12 }}
        >
          <span style={{ color: '#A09CC0', marginTop: 1, flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </span>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#A09CC0', lineHeight: 1.6 }}>
            <span style={{ color: 'rgba(184,174,221,.65)', fontWeight: 500 }}>Para melhores resultados:</span>
            {' '}use fotos com fundo neutro e boa iluminação. O modelo deve estar em posição frontal e a roupa bem visível.
          </p>
        </div>

        {/* ── Generate area ── */}
        <div className="flex flex-col items-center gap-3">

          {/* CTA */}
          <button
            type="button"
            disabled={!canGenerate}
            onClick={status === 'done' ? handleReset : handleGenerate}
            className="flex items-center justify-center gap-2 transition-all"
            style={{
              width:         '100%',
              maxWidth:       480,
              padding:       '16px 48px',
              background:    canGenerate
                ? 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'
                : 'rgba(15,13,30,.80)',
              border:        canGenerate
                ? '1px solid rgba(112,80,160,.40)'
                : '1px solid rgba(184,174,221,.12)',
              borderRadius:   100,
              color:          canGenerate ? '#EDEBF5' : 'rgba(160,156,192,.45)',
              fontFamily:    "'DM Sans', sans-serif",
              fontWeight:     500,
              fontSize:       14,
              cursor:        canGenerate ? 'pointer' : 'not-allowed',
              filter:        canGenerate ? 'drop-shadow(0 0 24px rgba(43,18,80,.45))' : 'none',
            }}
            onMouseEnter={e => { if (canGenerate) e.currentTarget.style.filter = 'drop-shadow(0 0 36px rgba(43,18,80,.70)) brightness(1.08)' }}
            onMouseLeave={e => { if (canGenerate) e.currentTarget.style.filter = 'drop-shadow(0 0 24px rgba(43,18,80,.45))' }}
          >
            {isGenerating ? (
              <><span style={SPINNER_STYLE} /> Gerando…</>
            ) : status === 'done' ? (
              <><RefreshCw size={14} /> Nova geração</>
            ) : (
              <><Sparkles size={14} /> Gerar Foto Profissional</>
            )}
          </button>

          {/* Hint / progress */}
          {!isGenerating && status === 'idle' && !canGenerate && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(160,156,192,.50)', textAlign: 'center' }}>
              Faça upload das duas imagens para continuar
            </p>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center gap-2" style={{ width: '100%', maxWidth: 480 }}>
              <div style={{ width: '100%', height: 2, background: 'rgba(184,174,221,.10)', overflow: 'hidden', position: 'relative' }}>
                <div
                  style={{
                    position:           'absolute',
                    inset:               0,
                    right:             `${100 - progress}%`,
                    background:         'linear-gradient(90deg, #0CC89E, #7ADAC8)',
                    backgroundSize:     '200% 100%',
                    animation:          'barShimmer 1.6s linear infinite',
                    transition:         'right .7s cubic-bezier(0.16,1,0.3,1)',
                  }}
                />
              </div>
              <div className="flex items-center justify-between w-full">
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, color: '#0CC89E' }}>
                  {progMsg}
                </span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: 'rgba(160,156,192,.45)' }}>
                  {progress}%
                </span>
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && error && (
            <div
              className="flex items-start gap-3 w-full"
              style={{ maxWidth: 480, padding: '12px 14px', background: 'rgba(255,90,90,.07)', border: '1px solid rgba(255,90,90,.22)', borderRadius: 12 }}
            >
              <AlertCircle size={14} className="mt-0.5 shrink-0" style={{ color: '#FF5A5A' }} />
              <div className="flex flex-col gap-2 flex-1">
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#FF5A5A', lineHeight: 1.65 }}>
                  {error}
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 self-start"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, color: '#A09CC0', padding: 0 }}
                >
                  <RefreshCw size={10} /> Tentar novamente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Result ── */}
        {status === 'done' && result && (
          <div style={{ marginTop: 48, animation: 'resultReveal .6s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: '#EDEBF5' }}>Resultado</h2>
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5"
                  style={{ padding: '3px 9px', background: 'rgba(12,200,158,.07)', border: '1px solid rgba(12,200,158,.24)', borderRadius: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, color: '#0CC89E' }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#0CC89E', boxShadow: '0 0 5px #0CC89E', display: 'inline-block', animation: 'dotPulse 2s infinite' }} />
                  Nova
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 transition-colors"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, color: '#A09CC0', padding: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#B8AEDD')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#A09CC0')}
                >
                  <RefreshCw size={10} /> Nova geração
                </button>
              </div>
            </div>

            {/* Centered result card */}
            <div className="flex flex-col items-center">
              <div
                className="studio-result-card"
                style={{
                  background:  '#0F0D1E',
                  border:      '1px solid rgba(12,200,158,.20)',
                  width:        400,
                  maxWidth:    '100%',
                  overflow:    'hidden',
                  borderRadius: 16,
                  boxShadow:   '0 0 40px rgba(112,80,160,.35), 0 0 80px rgba(43,18,80,.25)',
                }}
              >
                <img
                  src={result}
                  alt="Resultado"
                  onClick={() => setLightboxOpen(true)}
                  style={{
                    width:      '100%',
                    aspectRatio:'3/4',
                    objectFit:  'cover',
                    display:    'block',
                    cursor:     'zoom-in',
                  }}
                />
                <div className="flex items-center justify-between" style={{ padding: '12px 16px', borderTop: '1px solid rgba(184,174,221,.10)' }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, color: '#0CC89E' }}>
                    Try-On Max · Qualidade Máxima
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const count = gallery.length + 1
                      const paddedNum = String(count).padStart(3, '0')
                      const filename = `Reflexy Studio Pro ${paddedNum}.jpg`
                      triggerDownload(result, filename)
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 transition-all"
                    style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', border: '1px solid rgba(112,80,160,.35)', borderRadius: 8, color: '#EDEBF5', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 12, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.12)')}
                    onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                  >
                    <Download size={12} /> Baixar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Lightbox ── */}
        {lightboxOpen && result && (
          <div
            onClick={() => setLightboxOpen(false)}
            style={{
              position:       'fixed',
              inset:           0,
              zIndex:          1000,
              background:     'rgba(6,5,15,.95)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              animation:      'lightboxFadeIn .25s ease both',
            }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              style={{
                position:   'absolute',
                top:         20,
                right:       20,
                background: 'rgba(184,174,221,.10)',
                border:     '1px solid rgba(184,174,221,.22)',
                borderRadius: 10,
                color:       '#B8AEDD',
                width:       36,
                height:      36,
                display:    'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor:     'pointer',
                zIndex:      1001,
              }}
            >
              <X size={16} />
            </button>
            <img
              src={result}
              alt="Resultado em tela cheia"
              onClick={e => e.stopPropagation()}
              style={{
                maxHeight:   '90vh',
                maxWidth:    '90vw',
                objectFit:   'contain',
                display:     'block',
                boxShadow:   '0 0 60px rgba(112,80,160,.40)',
                animation:   'lightboxScaleIn .3s cubic-bezier(0.16,1,0.3,1) both',
              }}
            />
          </div>
        )}

        {/* ── Gallery ── */}
        <RecentGallery items={gallery} />
      </div>

      <InternalFooter />

      <GlobalKeyframes />
      <style>{`
        @keyframes dotPulse { 0%,100%{opacity:1;} 50%{opacity:.4;} }
        @keyframes barShimmer { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
        @keyframes resultReveal { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes recPanelReveal { from{opacity:0;transform:translateY(-6px);} to{opacity:1;transform:translateY(0);} }
        @keyframes lightboxFadeIn { from{opacity:0;} to{opacity:1;} }
        @keyframes lightboxScaleIn { from{opacity:0;transform:scale(.94);} to{opacity:1;transform:scale(1);} }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .studio-content { padding-left:16px !important; padding-right:16px !important; padding-top:28px !important; }
          .studio-upload-grid { grid-template-columns:1fr !important; }
          .studio-result-card { width:100% !important; }
          .studio-nav-right { flex-wrap:wrap !important; }
          .studio-preset-grid { grid-template-columns:repeat(2,1fr) !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .studio-content { padding-left:20px !important; padding-right:20px !important; }
        }
      `}</style>
    </main>
  )
}

// ─── UploadCardHeader ─────────────────────────────────────────────────────────

function UploadCardHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div
      className="flex items-center gap-3"
      style={{ padding: '16px 20px', borderBottom: '1px solid rgba(184,174,221,.14)' }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(184,174,221,.06)', border: '1px solid rgba(184,174,221,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: '#EDEBF5' }}>
          {title}
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#A09CC0', marginTop: 1 }}>
          {desc}
        </div>
      </div>
    </div>
  )
}

// ─── UploadDropZone ───────────────────────────────────────────────────────────

interface DropZoneProps {
  id:           string
  primaryText:  string
  secondaryText:string
  image:        UploadedImage | null
  isDragging:   boolean
  inputRef:     React.RefObject<HTMLInputElement | null>
  onDragOver:   (e: DragEvent<HTMLDivElement>) => void
  onDragLeave:  () => void
  onDrop:       (e: DragEvent<HTMLDivElement>) => void
  onChange:     (e: ChangeEvent<HTMLInputElement>) => void
  onClear:      () => void
  onSwap:       () => void
}

function UploadDropZone({
  id, primaryText, secondaryText,
  image, isDragging, inputRef,
  onDragOver, onDragLeave, onDrop, onChange, onClear, onSwap,
}: DropZoneProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => !image && inputRef.current?.click()}
      className="relative overflow-hidden transition-colors"
      style={{
        aspectRatio: '4/3',
        cursor:      image ? 'default' : 'pointer',
        background:  isDragging ? 'rgba(184,174,221,.04)' : 'transparent',
        minHeight:   260,
      }}
    >
      {image ? (
        <>
          <img src={image.preview} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          {/* Hover overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(6,5,15,.68)' }}
          >
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onClear() }}
              className="flex items-center gap-1.5 px-3 py-1.5 transition-colors"
              style={{ background: 'rgba(255,90,90,.12)', border: '1px solid rgba(255,90,90,.28)', borderRadius: 8, color: '#FF5A5A', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 12, cursor: 'pointer' }}
            >
              <X size={10} /> Remover
            </button>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onSwap() }}
              className="flex items-center gap-1.5 px-3 py-1.5 transition-colors"
              style={{ background: 'rgba(184,174,221,.08)', border: '1px solid rgba(184,174,221,.22)', borderRadius: 8, color: '#B8AEDD', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 12, cursor: 'pointer' }}
            >
              <RefreshCw size={10} /> Trocar
            </button>
          </div>
          {/* File name */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 14px', background: 'linear-gradient(to top, rgba(6,5,15,.80), transparent)' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: '#A09CC0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {image.name}
            </p>
          </div>
        </>
      ) : (
        <div
          className="absolute flex flex-col items-center justify-center gap-3 transition-all"
          style={{
            inset:      16,
            border:    `1px dashed ${isDragging ? 'rgba(184,174,221,.40)' : 'rgba(184,174,221,.14)'}`,
          }}
        >
          <div
            style={{
              width:      40,
              height:     40,
              background: isDragging ? 'rgba(184,174,221,.10)' : 'rgba(184,174,221,.05)',
              display:    'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform:  isDragging ? 'translateY(-3px)' : 'none',
              transition: 'all .2s',
            }}
          >
            <Upload size={18} style={{ color: isDragging ? '#B8AEDD' : '#A09CC0' }} />
          </div>
          <div className="text-center">
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 14, color: isDragging ? '#B8AEDD' : '#EDEBF5', textAlign: 'center' }}>
              {primaryText}
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#A09CC0', textAlign: 'center', marginTop: 2 }}>
              {secondaryText}
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: 'rgba(160,156,192,.45)', textAlign: 'center', marginTop: 4 }}>
              PNG, JPG — max. 10MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onChange}
        id={`input-${id}`}
      />
    </div>
  )
}

// ─── PresetModelThumb ─────────────────────────────────────────────────────────

function PresetModelThumb({
  preset,
  isSelected,
  onSelect,
}: {
  preset: typeof PRESET_MODELS[0]
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className="relative overflow-hidden group"
      style={{
        aspectRatio:  '2/3',
        background:   '#0F0D1E',
        border:       `1px solid ${isSelected ? '#0CC89E' : 'rgba(184,174,221,.10)'}`,
        boxShadow:    isSelected ? '0 0 0 1px #0CC89E' : 'none',
        cursor:       'pointer',
        transition:   'border-color .2s',
      }}
    >
      <img
        src={preset.thumb}
        alt={preset.label}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        style={{ display: 'block' }}
      />

      {/* Selected checkmark */}
      {isSelected && (
        <div
          className="absolute flex items-center justify-center"
          style={{ top: 6, right: 6, width: 18, height: 18, borderRadius: '50%', background: '#0CC89E', boxShadow: '0 0 8px rgba(12,200,158,.50)' }}
        >
          <Check size={10} strokeWidth={3} style={{ color: '#06050F' }} />
        </div>
      )}

      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'rgba(6,5,15,.50)' }}
      >
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 11, color: '#EDEBF5', background: 'rgba(15,13,30,.85)', border: '1px solid rgba(184,174,221,.22)', borderRadius: 8, padding: '5px 10px' }}>
          Usar
        </span>
      </div>
    </div>
  )
}

// ─── RecentGallery ────────────────────────────────────────────────────────────

function RecentGallery({ items }: { items: GenerationResult[] }) {
  if (!items.length) return null

  return (
    <section style={{ marginTop: 64 }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: '#EDEBF5', margin: 0 }}>Gerações Recentes</h2>
          <span
            style={{
              fontFamily:    "'DM Sans', sans-serif",
              fontSize:       10,
              fontWeight:     500,
              color:         'rgba(160,156,192,.45)',
              padding:       '3px 8px',
              border:        '1px solid rgba(184,174,221,.10)',
              borderRadius:   100,
            }}
          >
            {items.length} imagens
          </span>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 transition-colors"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, color: '#A09CC0', padding: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#B8AEDD')}
          onMouseLeave={e => (e.currentTarget.style.color = '#A09CC0')}
        >
          Ver arquivo
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1, background: 'rgba(184,174,221,.14)', borderRadius: 16, overflow: 'hidden' }}
      >
        {items.map(item => (
          <div key={item.id} className="group relative" style={{ background: '#0F0D1E', overflow: 'hidden' }}>
            <div style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
              <img
                src={item.url}
                alt={item.modelName}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                style={{ display: 'block' }}
              />
            </div>

            {/* Hover overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ bottom: 36, background: 'rgba(6,5,15,.60)' }}
            >
              <button
                type="button"
                onClick={() => triggerDownload(item.url, `reflexy-${item.id}.jpg`)}
                className="flex items-center gap-1.5 px-3 py-2"
                style={{ background: 'rgba(15,13,30,.90)', border: '1px solid rgba(184,174,221,.22)', borderRadius: 8, color: '#B8AEDD', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 12, cursor: 'pointer' }}
              >
                <Download size={11} /> Baixar
              </button>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between"
              style={{ padding: '9px 12px', borderTop: '1px solid rgba(184,174,221,.07)' }}
            >
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#A09CC0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.modelName}
              </span>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <Clock size={9} style={{ color: 'rgba(160,156,192,.40)' }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: 'rgba(160,156,192,.40)' }}>
                  {formatRelative(item.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
