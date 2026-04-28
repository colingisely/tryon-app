'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { InternalFooter } from '@/components/ui/InternalFooter';
import AppNav from '@/components/ui/AppNav';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  Zap, Star, Eye, TrendingUp, TrendingDown,
  ArrowUpRight,
  AlertCircle, Loader2, RefreshCw, ShoppingBag,
  Mail, Download, Lock, Copy, Check,
} from 'lucide-react';
import { getPlanFeatures } from '@/lib/plan-features';

/* ─────────────── Types ─────────────── */
interface Lead {
  id: string;
  email: string;
  created_at: string;
  result_url: string | null;
}

interface MerchantData {
  id: string;
  store_name: string;
  credits_remaining: number;
  credits_monthly: number;
  plan_slug: string | null;
  stripe_customer_id?: string | null;
}

interface UsageDay { label: string; fast: number; premium: number; }
interface TopProduct { name: string; sku: string; count: number; }
interface DashStats {
  totalTryOns: number;
  conversionRate: number;
  tryOnsTrend: number | undefined;
  convTrend: number | undefined;
  avgPerDay: number;
}
type Period = 7 | 15 | 30;

/* ─────────────── Color semantics ───────────────
 *
 *  Verdigris  #0CC89E  → melhor resultado, conversão, conquista (reservado)
 *  Cobalt     #3B82F6  → neutro / informativo (volume, contagens)
 *  Warning    #FFB432  → atenção, abaixo da média, crédito baixo
 *  Error      #FF5A5A  → negativo, crítico, crédito zerado, queda
 *
 *  Plum       #2B1250  → ênfase máxima (brand)
 *  Mauve      #7050A0  → neutro intermediário (brand)
 *  Lavender   #B8AEDD  → menos ênfase (brand)
 *
 * ──────────────────────────────────────────────*/

/* Credit remaining → color */
const creditColor = (remaining: number, limit: number): string => {
  const pct = remaining / limit;
  if (pct > 0.5) return '#0CC89E';   // verdigris — saudável
  if (pct > 0.2) return '#FFB432';   // warning   — atenção
  return '#FF5A5A';                  // error     — crítico
};

/* Conversion rate → color */
const convColor = (rate: number): string => {
  if (rate >= 15) return '#0CC89E';  // verdigris — bom resultado
  if (rate >= 8)  return '#FFB432';  // warning   — abaixo da média
  return '#FF5A5A';                  // error     — crítico
};

/* ─────────────── Custom Tooltip ─────────────── */
const UsageTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(15,13,30,0.97)',
      border: '1px solid rgba(184,174,221,0.26)',
      padding: '12px 16px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <p style={{ color: '#B8AEDD', fontSize: 11, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontSize: 13, margin: '3px 0', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
          {p.dataKey === 'fast' ? 'Fast' : 'Premium'}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

/* ─────────────── Stat Card ─────────────── */
const StatCard = ({
  icon, label, value, sub, trend, accentColor,
  remainingPct, emptyAction, loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  trend?: number;
  accentColor: string;
  remainingPct?: number;   // 0–100, percentage REMAINING (for health bar)
  emptyAction?: () => void;
  loading?: boolean;
}) => {
  const isEmpty = value === '0' && !!emptyAction;
  return (
    <div style={{
      flex: 1, background: '#0F0D1E',
      border: '1px solid rgba(184,174,221,0.14)',
      borderRadius: 12,
      padding: '20px 22px', position: 'relative', overflow: 'hidden', minWidth: 0,
    }}>
      {/* Accent top line — inherits semantic color */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accentColor, opacity: 0.65 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(43,18,80,0.45)',
          border: '1px solid rgba(184,174,221,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accentColor,
        }}>
          {icon}
        </div>

        {trend !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 11, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
            /* trend up = verdigris (positivo), down = error (negativo) */
            color: trend >= 0 ? '#0CC89E' : '#FF5A5A',
          }}>
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ height: 28, background: 'rgba(184,174,221,0.07)', borderRadius: 2, marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
      ) : isEmpty ? (
        <div>
          <div style={{ fontSize: 28, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: '#FF5A5A', lineHeight: 1, marginBottom: 6 }}>0</div>
          <button onClick={emptyAction} style={{
            background: 'rgba(43,18,80,0.5)', border: '1px solid rgba(112,80,160,0.5)',
            color: '#B8AEDD', fontSize: 11, fontFamily: "'DM Sans', sans-serif",
            padding: '4px 10px', borderRadius: 100, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            Fazer upgrade <ArrowUpRight size={10} />
          </button>
        </div>
      ) : (
        <div style={{
          fontSize: 'clamp(20px,2.5vw,32px)',
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600, color: accentColor, lineHeight: 1, marginBottom: 6,
        }}>
          {value}
        </div>
      )}

      <div style={{ fontSize: 11, color: '#A09CC0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontSize: 11, color: 'rgba(160,156,192,0.55)', marginTop: 3 }}>{sub}</div>

      {/* Health bar — only for credit cards */}
      {remainingPct !== undefined && (
        <div style={{ marginTop: 12 }}>
          <div style={{ height: 3, background: 'rgba(184,174,221,0.1)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${Math.min(remainingPct, 100)}%`,
              background: accentColor, borderRadius: 2, transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{ fontSize: 10, color: '#A09CC0', marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
            {Math.round(remainingPct)}% restante
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────── Main ─────────────── */
export default function DashboardPage() {
  const supabase = createClient();
  const router   = useRouter();

  const [merchant, setMerchant]       = useState<MerchantData | null>(null);
  const [stats, setStats]             = useState<DashStats | null>(null);
  const [usageData, setUsageData]     = useState<UsageDay[]>([]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [period, setPeriod]           = useState<Period>(7);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [showFast, setShowFast]       = useState(true);
  const [showPremium, setShowPremium] = useState(true);
  const [leads, setLeads]             = useState<Lead[]>([]);
  const [leadsLocked, setLeadsLocked] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  // Refs to store current user identity for upgrade calls (avoids stale closure)
  const currentUserRef = useRef<{ id: string; email: string } | null>(null);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data: { user }, error: uErr } = await supabase.auth.getUser();
      if (uErr || !user) throw new Error('Não autenticado.');
      // Store for upgrade calls
      currentUserRef.current = { id: user.id, email: user.email ?? '' };

      let merchantRaw: any = null;

      const { data: m, error: mErr } = await supabase
        .from('merchants')
        .select('id,store_name,credits_remaining,subscription_status,stripe_customer_id,plans!plan_id(slug,credits_monthly)')
        .eq('id', user.id)
        .single();

      if (mErr && mErr.code === 'PGRST116') {
        // No merchant record found — self-healing: create one with free plan
        const { data: freePlan } = await supabase
          .from('plans')
          .select('id, credits_monthly')
          .eq('slug', 'free')
          .single();

        await supabase.from('merchants').insert({
          id: user.id,
          store_name: user.user_metadata?.store_name ?? 'Minha Loja',
          email: user.email ?? '',
          plan_id: freePlan?.id ?? null,
          credits_remaining: freePlan?.credits_monthly ?? 10,
          api_key: 'tk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          created_at: new Date().toISOString(),
        });

        // Re-fetch the merchant after insert
        const { data: m2, error: m2Err } = await supabase
          .from('merchants')
          .select('id,store_name,credits_remaining,subscription_status,stripe_customer_id,plans!plan_id(slug,credits_monthly)')
          .eq('id', user.id)
          .single();
        if (m2Err) throw m2Err;
        merchantRaw = m2;
      } else if (mErr) {
        throw mErr;
      } else {
        merchantRaw = m;
      }

      const plan = merchantRaw?.plans ?? {};
      const planSlug = plan.slug ?? 'free';
      const merchant_normalized = merchantRaw ? {
        id:                merchantRaw.id,
        store_name:        merchantRaw.store_name,
        credits_remaining: merchantRaw.credits_remaining ?? 0,
        credits_monthly:   plan.credits_monthly ?? 0,
        plan_slug:         planSlug,
        stripe_customer_id: merchantRaw.stripe_customer_id ?? null,
      } : null;
      setMerchant(merchant_normalized as any);

      // ── Access Gate ────────────────────────────────────────────────────────
      // Allow access if the merchant has an active paid subscription OR is on
      // the free plan (slug='free' in DB, 10 try-ons).
      // Block anyone with no plan assigned (null planSlug).
      const hasAccess =
        merchantRaw?.subscription_status === 'active' ||
        planSlug === 'free'
      if (!hasAccess) {
        router.replace('/?gate=true#pricing')
        return
      }

      // Leads — disponível a partir do Starter
      const features = getPlanFeatures(planSlug);
      if (!features.leads) {
        setLeadsLocked(true);
      } else {
        setLeadsLocked(false);
        const { data: leadsData } = await supabase
          .from('tryon_leads')
          .select('id, email, created_at, result_url')
          .eq('merchant_id', merchantRaw.id)
          .order('created_at', { ascending: false })
          .limit(50);
        setLeads(leadsData ?? []);
      }

      const since = new Date();
      since.setDate(since.getDate() - period);

      const { data: events, error: eErr } = await supabase
        .from('analytics_events')
        .select('event_type, created_at, metadata')
        .eq('merchant_id', merchantRaw.id)
        .gte('created_at', since.toISOString());
      if (eErr) throw eErr;

      const evts = events ?? [];
      const tryOns   = evts.filter((e: any) => e.event_type === 'try_on_completed');
      const purchases = evts.filter((e: any) => e.event_type === 'purchase');
      const convRate  = tryOns.length > 0
        ? parseFloat(((purchases.length / tryOns.length) * 100).toFixed(1))
        : 0;

      setStats({
        totalTryOns:    tryOns.length,
        conversionRate: convRate,
        tryOnsTrend:    undefined,
        convTrend:      undefined,
        avgPerDay:      parseFloat((tryOns.length / period).toFixed(1)),
      });

      // Build usage days
      const days: UsageDay[] = [];
      for (let i = period - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds    = d.toISOString().split('T')[0];
        const label = period <= 7
          ? d.toLocaleDateString('pt-BR', { weekday: 'short' })
          : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const dayEvts = evts.filter((e: any) => e.created_at?.startsWith(ds));
        days.push({
          label,
          fast:    dayEvts.filter((e: any) => e.metadata?.credit_type === 'fast').length,
          premium: dayEvts.filter((e: any) => e.metadata?.credit_type === 'premium').length,
        });
      }
      setUsageData(days);

      // Top products
      const prodMap: Record<string, { name: string; count: number }> = {};
      evts.filter((e: any) => e.event_type === 'try_on_completed').forEach((e: any) => {
        const sku  = e.metadata?.sku ?? e.metadata?.product_id ?? 'unknown';
        const name = e.metadata?.product_name ?? sku;
        prodMap[sku] = prodMap[sku] ?? { name, count: 0 };
        prodMap[sku].count++;
      });
      setTopProducts(
        Object.entries(prodMap)
          .map(([sku, v]) => ({ sku, name: v.name, count: v.count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );

    } catch (err: any) {
      setError(err.message ?? 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabase, period, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('payment') === 'success') {
        setPaymentSuccess(true);
        // Remove param from URL without re-render
        window.history.replaceState({}, '', '/dashboard');
        // Auto-dismiss after 6s
        setTimeout(() => setPaymentSuccess(false), 6000);
      }
    }
  }, []);

  // ── Upgrade handler — user is already authenticated ────────────────────────
  const handleUpgrade = useCallback(async () => {
    const currentUser = currentUserRef.current;
    if (!currentUser) {
      window.location.href = '/#pricing';
      return;
    }

    // If merchant has a Stripe customer → open Stripe Portal for plan management
    if (merchant?.stripe_customer_id) {
      setUpgradingPlan('portal');
      try {
        const res = await fetch('/api/payments/create-portal-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        // Portal call succeeded but no URL returned — show error
        console.error('[portal] no url:', data);
        alert(data.error || 'Não foi possível abrir o portal. Tente novamente.');
        return;
      } catch (err) {
        console.error('[portal] fetch error:', err);
        alert('Erro ao conectar com o portal. Verifique sua conexão e tente novamente.');
        return;
      } finally {
        setUpgradingPlan(null);
      }
    }

    // No Stripe customer yet → redirect to pricing to choose a plan
    window.location.href = '/#pricing';
  }, [merchant?.stripe_customer_id]);

  /* ── Derived values ── */
  const currentPlanSlug = merchant?.plan_slug ?? 'free';
  const PLAN_ORDER = ['free', 'starter', 'growth', 'pro', 'enterprise'];
  const nextPlan = PLAN_ORDER[Math.min(PLAN_ORDER.indexOf(currentPlanSlug) + 1, PLAN_ORDER.length - 2)] ?? 'starter';

  const creditsLimit = merchant?.credits_monthly   ?? 10;
  const creditsRem   = merchant?.credits_remaining ?? creditsLimit;
  const creditsRemPct = creditsLimit > 0 ? (creditsRem / creditsLimit) * 100 : 100;

  /* Average for reference line */
  const avgVal = usageData.length
    ? usageData.reduce((s, d) => s + d.fast + d.premium, 0) / usageData.length
    : 0;

  /* Bar colors for Top Products — mauve family, no semantic meaning */
  const prodBarColors = ['#7050A0', '#7050A0', '#7050A0', '#7050A0', '#7050A0'];

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#06050F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ textAlign: 'center', padding: 32 }}>
        <AlertCircle size={36} color="#FF5A5A" style={{ marginBottom: 16 }} />
        <p style={{ color: '#EDEBF5', marginBottom: 8 }}>{error}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {error?.toLowerCase().includes('autenticad') ? (
            <button
              onClick={() => window.location.href = '/login'}
              style={{ background: 'linear-gradient(135deg,#7C3AED 0%,#5B21B6 100%)', border: 'none', borderRadius: 100, color: '#EDEBF5', padding: '10px 24px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}
            >
              Fazer login
            </button>
          ) : (
            <button onClick={fetchData} style={{ background: '#2B1250', border: 'none', borderRadius: 100, color: '#EDEBF5', padding: '10px 20px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700&family=DM+Sans:wght@400;500;600&display=swap');
        :root {
          --abyss:#06050F; --onyx:#0F0D1E; --plum:#2B1250; --mauve:#7050A0;
          --lavender:#B8AEDD; --mist:#EDEBF5; --verdigris:#0CC89E; --dusk:#A09CC0;
          --rule:rgba(184,174,221,0.14); --rule-v:rgba(184,174,221,0.26);
          --error:#FF5A5A; --warning:#FFB432; --cobalt:#3B82F6;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: var(--abyss); color: var(--mist); font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin  { to{transform:rotate(360deg)} }

        .period-btn { background:transparent; border:none; border-left:1px solid var(--rule); color:var(--dusk); padding:7px 16px; cursor:pointer; font-size:12px; font-weight:500; font-family:'DM Sans',sans-serif; transition:all .15s; }
        .period-btn:first-child { border-left:none; }
        .period-btn:hover  { color:var(--lavender); }
        .period-btn.active { background:var(--plum); color:var(--mist); }

        .legend-toggle { display:flex; align-items:center; gap:5px; font-size:11px; font-weight:500; color:var(--dusk); font-family:'DM Sans',sans-serif; cursor:pointer; padding:4px 7px; border:1px solid transparent; transition:all .15s; user-select:none; }
        .legend-toggle:hover { border-color:var(--rule); color:var(--lavender); }
        .legend-toggle.off  { opacity:.3; }

        .shortcut-btn { background:var(--onyx); border:1px solid var(--rule-v); border-radius:12px; color:var(--lavender); padding:11px 16px; display:flex; align-items:center; gap:8px; cursor:pointer; font-size:13px; font-family:'DM Sans',sans-serif; transition:all .18s; width:100%; }
        .shortcut-btn:hover { background:rgba(43,18,80,0.4); border-color:var(--mauve); color:var(--mist); }

        .prod-bar-track { height:5px; background:rgba(184,174,221,0.08); border-radius:1px; overflow:hidden; margin-top:5px; }
        .skeleton { background:rgba(184,174,221,0.07); border-radius:2px; animation:pulse 1.5s ease-in-out infinite; }

        /* ── Responsive ── */
        .dash-grid-main > *, .dash-grid-credits > *, .dash-stats > * { min-width: 0; }
        @media (max-width: 768px) {
          .dash-topbar { flex-direction:column !important; align-items:flex-start !important; gap:12px !important; padding:16px 20px !important; }
          .dash-content { padding:20px 16px !important; }
          .dash-stats { flex-direction:column !important; }
          .dash-grid-main { grid-template-columns:1fr !important; }
          .dash-grid-credits { grid-template-columns:1fr !important; }
          .dash-leads-row { grid-template-columns:1fr !important; gap:4px !important; }
          .dash-leads-header { display:none !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .dash-topbar { padding:18px 24px !important; }
          .dash-content { padding:24px 24px !important; }
          .dash-grid-main { grid-template-columns:1fr !important; }
          .dash-grid-credits { grid-template-columns:repeat(2,1fr) !important; }
        }
      `}</style>

      <AppNav
        current="dashboard"
        onSignOut={async () => { await supabase.auth.signOut(); router.push('/login'); }}
        extraRight={merchant?.plan_slug ? (
          <div
            className="flex items-center"
            style={{
              gap: 8,
              padding: '6px 14px',
              background: 'rgba(43,18,80,0.55)',
              border: '1px solid rgba(112,80,160,0.35)',
              borderRadius: 100,
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#0CC89E', boxShadow: '0 0 6px #0CC89E',
              display: 'inline-block', flexShrink: 0,
              animation: 'pulse 3s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12, fontWeight: 500,
              color: '#B8AEDD', textTransform: 'capitalize',
            }}>
              {merchant.plan_slug}
            </span>
          </div>
        ) : undefined}
      />

      <div style={{ minHeight: '100vh', background: '#06050F' }}>

        {/* ── Payment success toast ── */}
        {paymentSuccess && (
          <div style={{
            position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
            zIndex: 9999, background: 'rgba(43,18,80,0.95)', border: '1px solid rgba(112,80,160,0.6)',
            borderRadius: 16, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
            animation: 'ent-modal-in 0.25s ease',
          }}>
            <span style={{ fontSize: 20 }}>🎉</span>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#EDEBF5', fontFamily: "'DM Sans',sans-serif" }}>
                Plano ativado com sucesso!
              </p>
              <p style={{ margin: 0, fontSize: 12, color: '#A09CC0', fontFamily: "'DM Sans',sans-serif", marginTop: 2 }}>
                Seus créditos já estão disponíveis.
              </p>
            </div>
            <button
              onClick={() => setPaymentSuccess(false)}
              style={{ background: 'none', border: 'none', color: '#6B6890', cursor: 'pointer', marginLeft: 8, fontSize: 18, lineHeight: 1 }}
            >×</button>
          </div>
        )}

        {/* ── Topbar ── */}
        <div className="dash-topbar" style={{ borderBottom: '1px solid rgba(184,174,221,0.14)', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 20, fontWeight: 600, color: '#EDEBF5' }}>
                {loading ? 'Dashboard' : `Olá, ${merchant?.store_name ?? 'lojista'}`}
              </h1>
            </div>
            <p style={{ color: '#A09CC0', fontSize: 13, marginTop: 2 }}>Aqui está o resumo da sua loja hoje.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', border: '1px solid rgba(184,174,221,0.14)', borderRadius: 8, overflow: 'hidden' }}>
              {([7, 15, 30] as Period[]).map(p => (
                <button key={p} className={`period-btn${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
                  {p}d
                </button>
              ))}
            </div>
            <button onClick={fetchData} style={{ background: 'transparent', border: '1px solid rgba(184,174,221,0.14)', borderRadius: 8, color: '#A09CC0', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>

        <div className="dash-content" style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>

          {/* ── Stat Cards ── */}
          <div className="dash-stats" style={{ display: 'flex', gap: '1px', background: 'rgba(184,174,221,0.14)', borderRadius: 16, overflow: 'hidden', marginBottom: 28 }}>

            {/* Fast Credits — health-based color */}
            <StatCard
              icon={<Zap size={15} />}
              label="Créditos"
              value={creditsRem.toLocaleString('pt-BR')}
              sub={`de ${creditsLimit.toLocaleString('pt-BR')} disponíveis · fast=1cr · Studio Pro=4cr`}
              accentColor={creditColor(creditsRem, creditsLimit)}
              remainingPct={creditsRemPct}
              loading={loading}
              emptyAction={creditsRem === 0 ? () => handleUpgrade() : undefined}
            />


            {/* Try-ons — cobalt: dado neutro de volume */}
            <StatCard
              icon={<Eye size={15} />}
              label="Try-ons"
              value={stats?.totalTryOns?.toLocaleString('pt-BR') ?? '0'}
              sub={`~${stats?.avgPerDay ?? 0}/dia`}
              trend={stats?.tryOnsTrend}
              accentColor="#3B82F6"
              loading={loading}
            />

            {/* Conversion — verdigris/warning/error por performance */}
            <StatCard
              icon={<TrendingUp size={15} />}
              label="Conversão"
              value={`${stats?.conversionRate ?? 0}%`}
              sub="prova → compra"
              trend={stats?.convTrend}
              accentColor={stats ? convColor(stats.conversionRate) : '#0CC89E'}
              loading={loading}
            />
          </div>

          {/* ── Chart + Products ── */}
          <div className="dash-grid-main" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20 }}>

            {/* Usage Chart */}
            <div style={{ background: '#0F0D1E', border: '1px solid rgba(184,174,221,0.14)', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 600, color: '#EDEBF5' }}>Uso de Créditos</h2>
                  <p style={{ color: '#A09CC0', fontSize: 12, marginTop: 2 }}>Últimos {period} dias</p>
                </div>
                {/* Legend — brand colors (mauve/lavender), não semântico */}
                <div style={{ display: 'flex', gap: 4 }}>
                  <div className={`legend-toggle${!showFast ? ' off' : ''}`} onClick={() => setShowFast(v => !v)}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7050A0' }} />Fast
                  </div>
                  <div className={`legend-toggle${!showPremium ? ' off' : ''}`} onClick={() => setShowPremium(v => !v)}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#B8AEDD' }} />Premium
                  </div>
                </div>
              </div>

              {loading ? (
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={22} color="#7050A0" style={{ animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart
                    data={usageData}
                    margin={{ top: 4, right: 4, left: -22, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="gFast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#7050A0" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7050A0" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gPrem" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#B8AEDD" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#B8AEDD" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(184,174,221,0.06)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#A09CC0', fontSize: 10, fontFamily: "'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#A09CC0', fontSize: 10, fontFamily: "'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<UsageTooltip />} />
                    {avgVal > 0 && (
                      <ReferenceLine
                        y={Math.round(avgVal)}
                        stroke="rgba(184,174,221,0.25)"
                        strokeDasharray="4 4"
                        label={{ value: 'média', position: 'insideTopRight', fill: '#A09CC0', fontSize: 10, fontFamily: "'DM Sans',sans-serif" }}
                      />
                    )}
                    {showFast && (
                      <Area type="monotone" dataKey="fast" stroke="#7050A0" strokeWidth={2} fill="url(#gFast)" dot={false}
                        activeDot={{ r: 4, fill: '#7050A0', stroke: '#0F0D1E', strokeWidth: 2 }} />
                    )}
                    {showPremium && (
                      <Area type="monotone" dataKey="premium" stroke="#B8AEDD" strokeWidth={2} fill="url(#gPrem)" dot={false}
                        activeDot={{ r: 4, fill: '#B8AEDD', stroke: '#0F0D1E', strokeWidth: 2 }} />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top Products — mauve como cor padrão, sem semântica de performance */}
            <div style={{ background: '#0F0D1E', border: '1px solid rgba(184,174,221,0.14)', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <ShoppingBag size={14} color="#7C3AED" />
                <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 600, color: '#EDEBF5', margin: 0 }}>
                  Produtos Mais Provados
                </h2>
              </div>
              <p style={{ color: '#A09CC0', fontSize: 12, marginBottom: 20 }}>Top 5 no período</p>

              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div className="skeleton" style={{ height: 12, width: '65%', marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 5,  width: '100%' }} />
                  </div>
                ))
              ) : topProducts.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 32, paddingBottom: 16 }}>
                  <ShoppingBag size={28} color="#A09CC0" style={{ marginBottom: 10 }} />
                  <p style={{ color: '#A09CC0', fontSize: 13, textAlign: 'center' }}>Nenhum produto ainda</p>
                </div>
              ) : (() => {
                const max = topProducts[0]?.count ?? 1;
                return topProducts.map((prod, i) => {
                  const pct = (prod.count / max) * 100;
                  /* Intensity via opacity — mais provas = mais destaque, mesma cor brand */
                  const opacity = 0.55 + (i === 0 ? 0.45 : (1 - i / topProducts.length) * 0.35);
                  return (
                    <div key={prod.sku} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: 12, color: '#EDEBF5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '72%' }}>{prod.name}</span>
                        <span style={{ fontSize: 11, color: '#A09CC0', fontWeight: 500, fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>{prod.count}</span>
                      </div>
                      <div className="prod-bar-track">
                        {/* mauve com opacidade variando por posição — ênfase por intensidade, não por semântica */}
                        <div style={{ height: '100%', width: `${pct}%`, background: `rgba(112,80,160,${opacity})`, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* ── Leads ── */}
          <div style={{ marginTop: 20, background: '#0F0D1E', border: '1px solid rgba(184,174,221,0.14)', borderRadius: 16, overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(184,174,221,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={14} color="#7C3AED" />
                <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 600, color: '#EDEBF5', margin: 0 }}>
                  Leads Coletados
                </h2>
                {!leadsLocked && leads.length > 0 && (
                  <span style={{ padding: '2px 8px', background: 'rgba(43,18,80,0.6)', border: '1px solid rgba(112,80,160,0.3)', borderRadius: 100, fontSize: 10, fontWeight: 500, fontFamily: "'DM Sans',sans-serif", color: '#B8AEDD' }}>
                    {leads.length}
                  </span>
                )}
              </div>
              {!leadsLocked && leads.length > 0 && (
                <button
                  onClick={() => {
                    const csv = 'email,data\n' + leads.map(l =>
                      `${l.email},${new Date(l.created_at).toLocaleDateString('pt-BR')}`
                    ).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url  = URL.createObjectURL(blob);
                    const a    = Object.assign(document.createElement('a'), { href: url, download: 'leads-reflexy.csv' });
                    document.body.appendChild(a); a.click(); document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(43,18,80,0.4)', border: '1px solid rgba(112,80,160,0.3)', borderRadius: 8, color: '#B8AEDD', fontSize: 12, fontFamily: "'DM Sans',sans-serif", padding: '6px 12px', cursor: 'pointer' }}
                >
                  <Download size={11} />
                  Exportar CSV
                </button>
              )}
            </div>

            {/* Body */}
            {leadsLocked ? (
              /* Plano Free — lock */
              <div style={{ padding: '36px 24px', textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(43,18,80,0.5)', border: '1px solid rgba(112,80,160,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Lock size={18} color="#B8AEDD" />
                </div>
                <p style={{ color: '#EDEBF5', fontSize: 14, fontFamily: "'DM Sans',sans-serif", marginBottom: 6 }}>
                  Disponível a partir do plano <strong>Starter</strong>
                </p>
                <p style={{ color: '#A09CC0', fontSize: 13, marginBottom: 20 }}>
                  Veja e exporte os emails capturados pelo provador virtual.
                </p>
                <button
                  onClick={() => handleUpgrade()}
                  disabled={!!upgradingPlan}
                  style={{ background: 'linear-gradient(135deg,#7C3AED 0%,#5B21B6 100%)', border: 'none', borderRadius: 100, color: '#EDEBF5', padding: '10px 24px', fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: upgradingPlan ? 'not-allowed' : 'pointer', opacity: upgradingPlan ? 0.6 : 1 }}
                >
                  Ver planos
                </button>
              </div>
            ) : loading ? (
              <div style={{ padding: 24 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                    <div style={{ flex: 1, height: 12, background: 'rgba(184,174,221,0.07)', borderRadius: 2, animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ width: 80, height: 12, background: 'rgba(184,174,221,0.07)', borderRadius: 2, animation: 'pulse 1.5s ease-in-out infinite' }} />
                  </div>
                ))}
              </div>
            ) : leads.length === 0 ? (
              <div style={{ padding: '36px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={28} color="#A09CC0" style={{ marginBottom: 10 }} />
                <p style={{ color: '#A09CC0', fontSize: 13, fontFamily: "'DM Sans',sans-serif", textAlign: 'center' }}>
                  Nenhum lead capturado ainda.
                </p>
                <p style={{ color: 'rgba(160,156,192,0.55)', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                  Os emails aparecem aqui quando visitantes usam o provador pela segunda vez.
                </p>
              </div>
            ) : (
              <div>
                {/* Table header */}
                <div className="dash-leads-header" style={{ display: 'grid', gridTemplateColumns: '1fr 140px 36px', gap: 0, padding: '8px 24px', borderBottom: '1px solid rgba(184,174,221,0.06)' }}>
                  <span style={{ fontSize: 10, color: '#A09CC0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'DM Sans',sans-serif" }}>Email</span>
                  <span style={{ fontSize: 10, color: '#A09CC0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'DM Sans',sans-serif" }}>Data</span>
                  <span />
                </div>
                {/* Rows */}
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="dash-leads-row"
                      style={{ display: 'grid', gridTemplateColumns: '1fr 140px 36px', gap: 0, padding: '11px 24px', borderBottom: '1px solid rgba(184,174,221,0.05)', alignItems: 'center' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(43,18,80,0.2)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <span style={{ fontSize: 13, color: '#EDEBF5', fontFamily: "'DM Sans',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.email}
                      </span>
                      <span style={{ fontSize: 11, color: '#A09CC0', fontFamily: "'DM Sans',sans-serif" }}>
                        {new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </span>
                      <button
                        title="Copiar email"
                        onClick={() => {
                          navigator.clipboard.writeText(lead.email);
                          setCopiedEmail(lead.id);
                          setTimeout(() => setCopiedEmail(null), 1500);
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedEmail === lead.id ? '#0CC89E' : '#A09CC0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}
                      >
                        {copiedEmail === lead.id ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <InternalFooter />

        </div>
      </div>
    </>
  );
}
