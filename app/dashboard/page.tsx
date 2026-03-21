'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { InternalFooter } from '@/components/ui/InternalFooter';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  Zap, Star, Eye, TrendingUp, TrendingDown,
  BarChart2, Settings, Layers, ArrowUpRight,
  AlertCircle, Loader2, RefreshCw, ShoppingBag,
  Key, AlertTriangle,
} from 'lucide-react';

/* ─────────────── Types ─────────────── */
interface MerchantData {
  id: string;
  store_name: string;
  fast_credits_remaining: number;
  premium_credits_remaining: number;
  fast_credits_monthly: number;
  premium_credits_monthly: number;
  plan_slug: string | null;
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
        <p key={p.dataKey} style={{ color: p.color, fontSize: 13, margin: '3px 0', fontFamily: "'IBM Plex Mono', monospace" }}>
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
      padding: '20px 22px', position: 'relative', overflow: 'hidden', minWidth: 0,
    }}>
      {/* Accent top line — inherits semantic color */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accentColor, opacity: 0.65 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 2,
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
            fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
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
          <div style={{ fontSize: 28, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: '#FF5A5A', lineHeight: 1, marginBottom: 6 }}>0</div>
          <button onClick={emptyAction} style={{
            background: 'rgba(43,18,80,0.5)', border: '1px solid rgba(112,80,160,0.5)',
            color: '#B8AEDD', fontSize: 11, fontFamily: "'DM Sans', sans-serif",
            padding: '4px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            Fazer upgrade <ArrowUpRight size={10} />
          </button>
        </div>
      ) : (
        <div style={{
          fontSize: 'clamp(20px,2.5vw,32px)',
          fontFamily: "'IBM Plex Mono', monospace",
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
          <div style={{ fontSize: 10, color: '#A09CC0', marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
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

  const [merchant, setMerchant]       = useState<MerchantData | null>(null);
  const [stats, setStats]             = useState<DashStats | null>(null);
  const [usageData, setUsageData]     = useState<UsageDay[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [period, setPeriod]           = useState<Period>(7);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [showFast, setShowFast]       = useState(true);
  const [showPremium, setShowPremium] = useState(true);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data: { user }, error: uErr } = await supabase.auth.getUser();
      if (uErr || !user) throw new Error('Não autenticado.');

      const { data: m, error: mErr } = await supabase
        .from('merchants')
        .select('id,store_name,fast_credits_remaining,premium_credits_remaining,plans!plan_id(slug,fast_credits_monthly,premium_credits_monthly)')
        .eq('id', user.id)
        .single();
      if (mErr) throw mErr;
      const plan = (m as any)?.plans ?? {};
      const merchant_normalized = m ? {
        id:                       m.id,
        store_name:               m.store_name,
        fast_credits_remaining:   m.fast_credits_remaining,
        premium_credits_remaining: m.premium_credits_remaining,
        fast_credits_monthly:     plan.fast_credits_monthly  ?? 0,
        premium_credits_monthly:  plan.premium_credits_monthly ?? 0,
        plan_slug:                plan.slug ?? null,
      } : null;
      setMerchant(merchant_normalized as any);

      const since = new Date();
      since.setDate(since.getDate() - period);

      const { data: events, error: eErr } = await supabase
        .from('analytics_events')
        .select('event_type, created_at, metadata')
        .eq('merchant_id', m.id)
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
  }, [supabase, period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Derived values ── */
  const fastLimit   = merchant?.fast_credits_monthly   ?? 5000;
  const premLimit   = merchant?.premium_credits_monthly ?? 2000;
  const fastRem     = merchant?.fast_credits_remaining   ?? fastLimit;
  const premRem     = merchant?.premium_credits_remaining ?? premLimit;
  const fastRemPct  = (fastRem / fastLimit) * 100;
  const premRemPct  = (premRem / premLimit) * 100;

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
        <button onClick={fetchData} style={{ background: '#2B1250', border: 'none', color: '#EDEBF5', padding: '10px 20px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
          Tentar novamente
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700&family=DM+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
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

        .period-btn { background:transparent; border:none; border-left:1px solid var(--rule); color:var(--dusk); padding:7px 16px; cursor:pointer; font-size:12px; font-family:'IBM Plex Mono',monospace; transition:all .15s; }
        .period-btn:first-child { border-left:none; }
        .period-btn:hover  { color:var(--lavender); }
        .period-btn.active { background:var(--plum); color:var(--mist); }

        .legend-toggle { display:flex; align-items:center; gap:5px; font-size:11px; color:var(--dusk); font-family:'IBM Plex Mono',monospace; cursor:pointer; padding:4px 7px; border:1px solid transparent; transition:all .15s; user-select:none; }
        .legend-toggle:hover { border-color:var(--rule); color:var(--lavender); }
        .legend-toggle.off  { opacity:.3; }

        .shortcut-btn { background:var(--onyx); border:1px solid var(--rule-v); color:var(--lavender); padding:11px 16px; display:flex; align-items:center; gap:8px; cursor:pointer; font-size:13px; font-family:'DM Sans',sans-serif; transition:all .18s; width:100%; }
        .shortcut-btn:hover { background:rgba(43,18,80,0.4); border-color:var(--mauve); color:var(--mist); }

        .prod-bar-track { height:5px; background:rgba(184,174,221,0.08); border-radius:1px; overflow:hidden; margin-top:5px; }
        .skeleton { background:rgba(184,174,221,0.07); border-radius:2px; animation:pulse 1.5s ease-in-out infinite; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#06050F' }}>

        {/* ── Topbar ── */}
        <div style={{ borderBottom: '1px solid rgba(184,174,221,0.14)', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 20, fontWeight: 700, color: '#EDEBF5' }}>
                {loading ? 'Dashboard' : `Olá, ${merchant?.store_name ?? 'lojista'}`}
              </h1>
              {merchant?.plan_slug && (
                <span style={{
                  padding: '3px 10px', fontSize: 10, fontFamily: "'IBM Plex Mono',monospace",
                  textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: 100,
                  /* Plan badge uses brand colors, not semantic */
                  background: merchant.plan_slug === 'premium' ? 'rgba(43,18,80,0.6)' : 'rgba(43,18,80,0.4)',
                  border: '1px solid rgba(112,80,160,0.4)',
                  color: '#B8AEDD',
                }}>
                  {merchant.plan_slug}
                </span>
              )}
            </div>
            <p style={{ color: '#A09CC0', fontSize: 13, marginTop: 2 }}>Aqui está o resumo da sua loja hoje.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', border: '1px solid rgba(184,174,221,0.14)' }}>
              {([7, 15, 30] as Period[]).map(p => (
                <button key={p} className={`period-btn${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
                  {p}d
                </button>
              ))}
            </div>
            <button onClick={fetchData} style={{ background: 'transparent', border: '1px solid rgba(184,174,221,0.14)', color: '#A09CC0', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>

        <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>

          {/* ── Stat Cards ── */}
          <div style={{ display: 'flex', gap: '1px', background: 'rgba(184,174,221,0.14)', marginBottom: 28 }}>

            {/* Fast Credits — health-based color */}
            <StatCard
              icon={<Zap size={15} />}
              label="Créditos Fast"
              value={fastRem.toLocaleString('pt-BR')}
              sub={`de ${fastLimit.toLocaleString('pt-BR')} disponíveis`}
              accentColor={creditColor(fastRem, fastLimit)}
              remainingPct={fastRemPct}
              loading={loading}
              emptyAction={fastRem === 0 ? () => window.location.href = '/planos' : undefined}
            />

            {/* Premium Credits — health-based color */}
            <StatCard
              icon={<Star size={15} />}
              label="Créditos Premium"
              value={premRem.toLocaleString('pt-BR')}
              sub={`de ${premLimit.toLocaleString('pt-BR')} disponíveis`}
              accentColor={creditColor(premRem, premLimit)}
              remainingPct={premRemPct}
              loading={loading}
              emptyAction={premRem === 0 ? () => window.location.href = '/planos' : undefined}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20 }}>

            {/* Usage Chart */}
            <div style={{ background: '#0F0D1E', border: '1px solid rgba(184,174,221,0.14)', padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 15, fontWeight: 600, color: '#EDEBF5' }}>Uso de Créditos</h2>
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
                    <XAxis dataKey="label" tick={{ fill: '#A09CC0', fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#A09CC0', fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<UsageTooltip />} />
                    {avgVal > 0 && (
                      <ReferenceLine
                        y={Math.round(avgVal)}
                        stroke="rgba(184,174,221,0.25)"
                        strokeDasharray="4 4"
                        label={{ value: 'média', position: 'insideTopRight', fill: '#A09CC0', fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }}
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
            <div style={{ background: '#0F0D1E', border: '1px solid rgba(184,174,221,0.14)', padding: 24 }}>
              <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 15, fontWeight: 600, color: '#EDEBF5', marginBottom: 4 }}>
                Produtos Mais Provados
              </h2>
              <p style={{ color: '#A09CC0', fontSize: 12, marginBottom: 20 }}>Top 5 no período</p>

              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div className="skeleton" style={{ height: 12, width: '65%', marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 5,  width: '100%' }} />
                  </div>
                ))
              ) : topProducts.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: 32 }}>
                  <ShoppingBag size={28} color="#A09CC0" style={{ marginBottom: 10 }} />
                  <p style={{ color: '#A09CC0', fontSize: 13 }}>Nenhum produto ainda</p>
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
                        <span style={{ fontSize: 11, color: '#A09CC0', fontFamily: "'IBM Plex Mono',monospace", flexShrink: 0 }}>{prod.count}</span>
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

          {/* ── Shortcuts ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            <button className="shortcut-btn" onClick={() => window.location.href = '/studio'}>
              <Layers  size={14} style={{ color: '#7050A0' }} />
              <span>Estúdio Pro</span>
              <ArrowUpRight size={12} style={{ marginLeft: 'auto', opacity: 0.4 }} />
            </button>
            <button className="shortcut-btn" onClick={() => window.location.href = '/analytics'}>
              <BarChart2 size={14} style={{ color: '#7050A0' }} />
              <span>Analytics</span>
              <ArrowUpRight size={12} style={{ marginLeft: 'auto', opacity: 0.4 }} />
            </button>
            <button className="shortcut-btn" onClick={() => window.location.href = '/settings'}>
              {/* Warning color no ícone de API Key — dado sensível, merece atenção */}
              <Key size={14} style={{ color: '#FFB432' }} />
              <span>Configurações</span>
              <ArrowUpRight size={12} style={{ marginLeft: 'auto', opacity: 0.4 }} />
            </button>
          </div>

          {/* API Key warning banner */}
          <div style={{ marginTop: 12, padding: '10px 16px', background: 'rgba(255,180,50,0.05)', border: '1px solid rgba(255,180,50,0.18)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={13} color="#FFB432" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: '#A09CC0', fontFamily: "'DM Sans',sans-serif" }}>
              Sua API Key está disponível em{' '}
              <button onClick={() => window.location.href = '/settings'} style={{ background: 'none', border: 'none', color: '#FFB432', cursor: 'pointer', fontSize: 12, fontFamily: "'DM Sans',sans-serif", padding: 0 }}>
                Configurações
              </button>. Nunca a exponha publicamente.
            </p>
          </div>

          <InternalFooter />

        </div>
      </div>
    </>
  );
}
