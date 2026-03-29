'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { InternalFooter } from '@/components/ui/InternalFooter';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Eye, CheckCircle, Users, Clock, Target,
  TrendingUp, TrendingDown, Package, Ruler,
  AlertCircle, Loader2, ChevronRight, HelpCircle, Lock,
} from 'lucide-react';
import { getPlanFeatures } from '@/lib/plan-features';

/* ─────────────── Types ─────────────── */
type Period    = 7 | 30;
type ChartTab  = 'both' | 'completed';

interface KpiData {
  initiated:      number;
  completed:      number;
  completionRate: number;
  uniqueSessions: number;
  avgDuration:    number;
  initiatedTrend: number | undefined;
  completedTrend: number | undefined;
}

interface DayUsage  { label: string; initiated: number; completed: number; }
interface FunnelStep { label: string; count: number; pct: number; color: string; }
interface TopProduct { sku: string; name: string; initiated: number; completed: number; rate: number; }
interface SizeData   { size: string; count: number; pct: number; }

/* ─────────────── Color semantics ───────────────
 *
 *  Funil de conversão — degradê de brand para resultado:
 *    Lavender → Mauve → Cobalt → Verdigris
 *    (menos ênfase → intermediário → neutro → melhor resultado)
 *
 *  Taxa de conclusão / pílulas de produto:
 *    ≥60%  → Verdigris  (positivo, bom resultado)
 *    35–59% → Warning   (atenção, abaixo do ideal)
 *    <35%   → Error     (negativo, precisa de ação)
 *
 *  KPIs:
 *    Iniciados     → Cobalt    (volume neutro)
 *    Completos     → Verdigris (o resultado que queremos maximizar)
 *    Sessões       → Mauve     (dado estrutural de brand)
 *    Tempo médio   → Warning   (chama atenção sem julgamento positivo)
 *    Taxa conclusão → semântica por threshold
 *
 *  Tamanhos → Mauve (dado neutro, sem julgamento de performance)
 *
 * ──────────────────────────────────────────────*/

const completionColor = (r: number): string => {
  if (r >= 60) return '#0CC89E';   // verdigris — positivo
  if (r >= 35) return '#FFB432';   // warning   — atenção
  return '#FF5A5A';                // error     — crítico
};
const completionBg = (r: number): string => {
  if (r >= 60) return 'rgba(12,200,158,0.1)';
  if (r >= 35) return 'rgba(255,180,50,0.1)';
  return 'rgba(255,90,90,0.1)';
};
const completionBorder = (r: number): string => {
  if (r >= 60) return 'rgba(12,200,158,0.25)';
  if (r >= 35) return 'rgba(255,180,50,0.25)';
  return 'rgba(255,90,90,0.25)';
};

/* ─────────────── Tooltip ─────────────── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(15,13,30,0.97)', border: '1px solid rgba(184,174,221,0.26)', padding: '10px 14px', fontFamily: "'DM Sans',sans-serif" }}>
      <p style={{ color: '#B8AEDD', fontSize: 10, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontSize: 12, margin: '2px 0', fontFamily: "'IBM Plex Mono',monospace" }}>
          {p.dataKey === 'initiated' ? 'Iniciados' : 'Completos'}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

/* ─────────────── KPI Card ─────────────── */
const KpiCard = ({ icon, label, value, sub, trend, accentColor, tooltip, loading }: {
  icon: React.ReactNode; label: string; value: string; sub: string;
  trend?: number; accentColor: string; tooltip?: string; loading?: boolean;
}) => (
  <div style={{ flex: 1, background: '#0F0D1E', border: '1px solid rgba(184,174,221,0.14)', padding: '18px 20px', minWidth: 0, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accentColor, opacity: 0.6 }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: accentColor }}>{icon}</span>
        <span style={{ fontSize: 10, color: '#A09CC0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {trend !== undefined && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 11, fontFamily: "'IBM Plex Mono',monospace",
            /* up = verdigris, down = error */
            color: trend >= 0 ? '#0CC89E' : '#FF5A5A',
          }}>
            {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(trend)}%
          </span>
        )}
        {tooltip && <HelpCircle size={12} color="#A09CC0"  style={{ cursor: 'help' }} />}
      </div>
    </div>
    {loading
      ? <div style={{ height: 26, background: 'rgba(184,174,221,0.07)', borderRadius: 2, animation: 'pulse 1.5s ease-in-out infinite' }} />
      : <div style={{ fontSize: 'clamp(18px,2.2vw,28px)', fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, color: accentColor, lineHeight: 1 }}>{value}</div>
    }
    <div style={{ fontSize: 11, color: 'rgba(160,156,192,0.55)', marginTop: 5 }}>{sub}</div>
  </div>
);

/* ─────────────── Main ─────────────── */
export default function AnalyticsPage() {
  const supabase = createClient();
  const router   = useRouter();

  const [period,       setPeriodState] = useState<Period>(7);
  const [chartTab,     setChartTab]    = useState<ChartTab>('both');
  const [loading,      setLoading]     = useState(true);
  const [error,        setError]       = useState<string | null>(null);
  const [planLocked,   setPlanLocked]  = useState(false);
  const [kpi,          setKpi]         = useState<KpiData | null>(null);
  const [dailyData,    setDailyData]   = useState<DayUsage[]>([]);
  const [funnel,       setFunnel]      = useState<FunnelStep[]>([]);
  const [topProducts,  setTopProducts] = useState<TopProduct[]>([]);
  const [sizeData,     setSizeData]    = useState<SizeData[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: uErr } = await supabase.auth.getUser();
      if (uErr || !user) throw new Error('Não autenticado.');

      const { data: m, error: mErr } = await supabase
        .from('merchants')
        .select('id, plans!plan_id(slug)')
        .eq('id', user.id)
        .single();
      if (mErr) throw mErr;

      // Plan gate: analytics avançado requer Growth ou superior
      const planSlug = (m as any).plans?.slug ?? 'free';
      if (!getPlanFeatures(planSlug).analyticsAdvanced) {
        setPlanLocked(true);
        setLoading(false);
        return;
      }

      const since = new Date();
      since.setDate(since.getDate() - period);

      const { data: events, error: eErr } = await supabase
        .from('analytics_events')
        .select('event_type, created_at, metadata')
        .eq('merchant_id', m.id)
        .gte('created_at', since.toISOString());
      if (eErr) throw eErr;

      const evts      = events ?? [];
      const initiated = evts.filter((e: any) => e.event_type === 'try_on_started').length;
      const completed = evts.filter((e: any) => e.event_type === 'try_on_completed').length;
      const purchases = evts.filter((e: any) => e.event_type === 'purchase').length;
      const sessions  = new Set(evts.map((e: any) => e.metadata?.session_id).filter(Boolean)).size;
      const durations = evts.filter((e: any) => e.metadata?.duration_ms).map((e: any) => e.metadata.duration_ms as number);
      const avgDur    = durations.length > 0
        ? Math.round(durations.reduce((a: any, b: any) => a + b, 0) / durations.length / 1000)
        : 0;

      setKpi({
        initiated, completed,
        completionRate: initiated > 0 ? parseFloat(((completed / initiated) * 100).toFixed(1)) : 0,
        uniqueSessions: sessions,
        avgDuration:    avgDur,
        initiatedTrend: undefined as any,
        completedTrend: undefined as any,
      });

      // Funnel — Lavender → Mauve → Cobalt → Verdigris
      const pageViews = evts.filter((e: any) => e.event_type === 'page_view').length;
      const viewed    = pageViews > 0 ? pageViews : initiated; // real page views, or fall back to initiated if not tracked
      const addCart   = evts.filter((e: any) => e.event_type === 'add_to_cart').length;
      const funnelTop = Math.max(viewed, initiated); // ensure top of funnel >= initiated
      setFunnel([
        { label: 'Visualizaram',             count: funnelTop, pct: 100, color: '#B8AEDD' },  // lavender — menos ênfase
        { label: 'Fizeram Try-On',           count: initiated, pct: parseFloat(((initiated / Math.max(funnelTop, 1)) * 100).toFixed(1)), color: '#7050A0' }, // mauve
        { label: 'Adicionaram ao Carrinho',  count: addCart,   pct: parseFloat(((addCart / Math.max(initiated, 1)) * 100).toFixed(1)), color: '#3B82F6' }, // cobalt — neutro
        { label: 'Compraram',                count: purchases, pct: parseFloat(((purchases / Math.max(initiated, 1)) * 100).toFixed(1)), color: '#0CC89E' }, // verdigris — melhor resultado
      ]);

      // Daily data
      const days: DayUsage[] = [];
      for (let i = period - 1; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const ds    = d.toISOString().split('T')[0];
        const label = period === 7
          ? d.toLocaleDateString('pt-BR', { weekday: 'short' })
          : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const dayEvts = evts.filter((e: any) => e.created_at?.startsWith(ds));
        days.push({
          label,
          initiated: dayEvts.filter((e: any) => e.event_type === 'try_on_started').length,
          completed: dayEvts.filter((e: any) => e.event_type === 'try_on_completed').length,
        });
      }
      setDailyData(days);

      // Top products
      const prodMap: Record<string, { name: string; initiated: number; completed: number }> = {};
      evts.forEach((e: any) => {
        const sku  = e.metadata?.sku ?? e.metadata?.product_id;
        if (!sku) return;
        const name = e.metadata?.product_name ?? sku;
        prodMap[sku] = prodMap[sku] ?? { name, initiated: 0, completed: 0 };
        if (e.event_type === 'try_on_started')   prodMap[sku].initiated++;
        if (e.event_type === 'try_on_completed') prodMap[sku].completed++;
      });
      setTopProducts(
        Object.entries(prodMap)
          .map(([sku, v]) => ({
            sku, name: v.name,
            initiated: v.initiated, completed: v.completed,
            rate: v.initiated > 0 ? parseFloat(((v.completed / v.initiated) * 100).toFixed(1)) : 0,
          }))
          .sort((a, b) => b.initiated - a.initiated)
          .slice(0, 10)
      );

      // Size analysis — mauve padrão, sem semântica de julgamento
      const szMap: Record<string, number> = {};
      evts.filter((e: any) => e.metadata?.size).forEach((e: any) => {
        const sz = e.metadata.size as string;
        szMap[sz] = (szMap[sz] ?? 0) + 1;
      });
      const szTotal = Object.values(szMap).reduce((a: any, b: any) => a + b, 0);
      setSizeData(
        Object.entries(szMap)
          .sort((a, b) => b[1] - a[1])
          .map(([size, count]) => ({
            size, count,
            pct: szTotal > 0 ? parseFloat(((count / szTotal) * 100).toFixed(1)) : 0,
          }))
          .slice(0, 8)
      );

    } catch (err: any) {
      setError(err.message ?? 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, [supabase, period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const maxSizeCount = sizeData[0]?.count ?? 1;

  if (planLocked) return (
    <div style={{ minHeight: '100vh', background: '#06050F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', padding: '40px 24px', maxWidth: 460 }}>
        <div style={{ width: 56, height: 56, borderRadius: 4, background: 'rgba(43,18,80,0.6)', border: '1px solid rgba(112,80,160,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Lock size={24} color="#B8AEDD" />
        </div>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 700, color: '#EDEBF5', marginBottom: 12 }}>
          Analytics Avançado
        </h1>
        <p style={{ color: '#A09CC0', fontSize: 15, lineHeight: 1.6, marginBottom: 8 }}>
          Esta funcionalidade está disponível a partir do plano <strong style={{ color: '#B8AEDD' }}>Growth</strong>.
        </p>
        <p style={{ color: '#A09CC0', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
          Acesse funil de conversão, produtos mais provados, análise de tamanhos e KPIs detalhados.
        </p>
        <button
          onClick={() => window.location.href = '/#pricing'}
          style={{
            background: 'linear-gradient(135deg, #2B1250 0%, #7050A0 100%)',
            border: 'none', color: '#EDEBF5',
            padding: '13px 32px', fontSize: 14, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer', letterSpacing: '0.02em',
          }}
        >
          Ver planos
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
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#06050F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: 32 }}>
        <AlertCircle size={36} color="#FF5A5A" style={{ marginBottom: 16 }} />
        <p style={{ color: '#EDEBF5', marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>{error}</p>
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

        .period-btn { background:transparent; border:none; border-left:1px solid var(--rule); color:var(--dusk); padding:7px 18px; cursor:pointer; font-size:12px; font-family:'IBM Plex Mono',monospace; transition:all .15s; }
        .period-btn:first-child { border-left:none; }
        .period-btn:hover  { color:var(--lavender); }
        .period-btn.active { background:var(--plum); color:var(--mist); }

        .tab-btn { background:transparent; border:none; border-bottom:2px solid transparent; color:var(--dusk); padding:8px 16px; cursor:pointer; font-size:12px; font-family:'IBM Plex Mono',monospace; transition:all .15s; white-space:nowrap; margin-bottom:-1px; }
        .tab-btn:hover  { color:var(--lavender); }
        .tab-btn.active { color:var(--mist); border-bottom-color:var(--mauve); }

        .prod-tbl-row { display:grid; grid-template-columns:1fr 70px 70px 90px; gap:10px; align-items:center; padding:10px 0; border-bottom:1px solid rgba(184,174,221,0.06); transition:background .1s; }
        .prod-tbl-row:hover { background:rgba(184,174,221,0.03); }
        .prod-tbl-row:last-child { border-bottom:none; }

        .skeleton { background:rgba(184,174,221,0.07); border-radius:2px; animation:pulse 1.5s ease-in-out infinite; }
        .sz-bar-track { height:5px; background:rgba(184,174,221,0.08); border-radius:1px; overflow:hidden; margin-top:5px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#06050F' }}>

        {/* ── Topbar ── */}
        <div style={{ borderBottom: '1px solid rgba(184,174,221,0.14)', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 20, fontWeight: 700, color: '#EDEBF5' }}>Analytics</h1>
            <p style={{ color: '#A09CC0', fontSize: 13, marginTop: 2 }}>Comportamento dos seus clientes no provador virtual</p>
          </div>
          <div style={{ display: 'flex', border: '1px solid rgba(184,174,221,0.14)' }}>
            {([7, 30] as Period[]).map(p => (
              <button key={p} className={`period-btn${period === p ? ' active' : ''}`} onClick={() => setPeriodState(p)}>
                {p === 7 ? '7 dias' : '30 dias'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>

          {/* ── 5 KPI Cards ── */}
          <div style={{ display: 'flex', gap: '1px', background: 'rgba(184,174,221,0.14)', marginBottom: 24 }}>

            {/* Iniciados — cobalt: volume neutro, sem julgamento */}
            <KpiCard
              icon={<Eye size={13} />}
              label="Try-ons Iniciados"
              value={kpi?.initiated?.toLocaleString('pt-BR') ?? '0'}
              sub={`Últimos ${period} dias`}
              trend={kpi?.initiatedTrend}
              accentColor="#3B82F6"
              tooltip="Usuários que abriram o provador"
              loading={loading}
            />

            {/* Completos — verdigris: o resultado que queremos maximizar */}
            <KpiCard
              icon={<CheckCircle size={13} />}
              label="Try-ons Completos"
              value={kpi?.completed?.toLocaleString('pt-BR') ?? '0'}
              sub={`Taxa: ${kpi?.completionRate ?? 0}%`}
              trend={kpi?.completedTrend}
              accentColor="#0CC89E"
              tooltip="Usuários que completaram a prova virtual"
              loading={loading}
            />

            {/* Sessões — mauve: dado estrutural de brand */}
            <KpiCard
              icon={<Users size={13} />}
              label="Sessões Únicas"
              value={kpi?.uniqueSessions?.toLocaleString('pt-BR') ?? '0'}
              sub="Usuários distintos"
              accentColor="#7050A0"
              tooltip="Sessões únicas identificadas por ID"
              loading={loading}
            />

            {/* Tempo médio — warning: chama atenção, merece ser olhado */}
            <KpiCard
              icon={<Clock size={13} />}
              label="Tempo Médio"
              value={kpi?.avgDuration ? `${kpi.avgDuration}s` : '--'}
              sub="No modal do provador"
              accentColor="#FFB432"
              tooltip="Tempo médio em segundos dentro do provador"
              loading={loading}
            />

            {/* Taxa de conclusão — semântica por threshold */}
            <KpiCard
              icon={<Target size={13} />}
              label="Taxa de Conclusão"
              value={kpi ? `${kpi.completionRate}%` : '0%'}
              sub="Iniciado → Completo"
              accentColor={kpi ? completionColor(kpi.completionRate) : '#0CC89E'}
              tooltip="% de try-ons que chegaram ao fim"
              loading={loading}
            />
          </div>

          {/* ── Chart + Funnel ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 20 }}>

            {/* Daily Chart */}
            <div style={{ background: '#0F0D1E', border: '1px solid rgba(184,174,221,0.14)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 15, fontWeight: 600, color: '#EDEBF5' }}>Uso Diário</h2>
                  <p style={{ color: '#A09CC0', fontSize: 12, marginTop: 2 }}>Últimos {period} dias</p>
                </div>
                {/* Legend: mauve p/ iniciados (brand), verdigris p/ completos (resultado) */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#A09CC0', fontFamily: "'IBM Plex Mono',monospace" }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7050A0' }} />Iniciados
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#A09CC0', fontFamily: "'IBM Plex Mono',monospace" }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0CC89E' }} />Completos
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(184,174,221,0.1)', marginTop: 12, marginBottom: 16 }}>
                <button className={`tab-btn${chartTab === 'both' ? ' active' : ''}`} onClick={() => setChartTab('both')}>
                  Iniciados vs. Completos
                </button>
                <button className={`tab-btn${chartTab === 'completed' ? ' active' : ''}`} onClick={() => setChartTab('completed')}>
                  Apenas Completos
                </button>
              </div>

              {loading ? (
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={22} color="#7050A0" style={{ animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={dailyData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                    <defs>
                      {/* Iniciados — mauve (brand intermediário) */}
                      <linearGradient id="gInit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#7050A0" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#7050A0" stopOpacity={0} />
                      </linearGradient>
                      {/* Completos — verdigris (melhor resultado) */}
                      <linearGradient id="gComp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#0CC89E" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#0CC89E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(184,174,221,0.06)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#A09CC0', fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }} axisLine={false} tickLine={false}
                      interval={period === 30 ? 4 : 0} />
                    <YAxis tick={{ fill: '#A09CC0', fontSize: 10, fontFamily: "'IBM Plex Mono',monospace" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    {chartTab === 'both' && (
                      <Area type="monotone" dataKey="initiated" stroke="#7050A0" strokeWidth={2}
                        fill="url(#gInit)" dot={false}
                        activeDot={{ r: 4, fill: '#7050A0', stroke: '#0F0D1E', strokeWidth: 2 }} />
                    )}
                    <Area type="monotone" dataKey="completed" stroke="#0CC89E" strokeWidth={2}
                      fill="url(#gComp)" dot={false}
                      activeDot={{ r: 4, fill: '#0CC89E', stroke: '#0F0D1E', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Funnel — Lavender → Mauve → Cobalt → Verdigris */}
            <div style={{ background: '#0F0D1E', border: '1px solid rgba(184,174,221,0.14)', padding: '20px 22px' }}>
              <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 15, fontWeight: 600, color: '#EDEBF5', marginBottom: 4 }}>
                Funil de Conversão
              </h2>
              <p style={{ color: '#A09CC0', fontSize: 12, marginBottom: 20 }}>Jornada do usuário</p>

              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 5, width: '100%' }} />
                  </div>
                ))
              ) : funnel.map((step, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                    <span style={{ fontSize: 12, color: '#EDEBF5', fontFamily: "'DM Sans',sans-serif", flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {step.label}
                    </span>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 600, color: step.color, flexShrink: 0, width: 44, textAlign: 'right' }}>
                      {step.pct}%
                    </span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(184,174,221,0.08)', borderRadius: 1, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${step.pct}%`, background: step.color, transition: 'width 0.6s ease' }} />
                  </div>
                  {i < funnel.length - 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 0 6px 4px', fontSize: 10, color: '#A09CC0', fontFamily: "'IBM Plex Mono',monospace" }}>
                      <ChevronRight size={10} color="rgba(184,174,221,0.25)" />
                      {step.count.toLocaleString('pt-BR')} usuários
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Products + Sizes ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Top 10 Products */}
            <div style={{ background: '#0F0D1E', border: '1px solid rgba(184,174,221,0.14)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Package size={14} color="#7050A0" />
                <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 15, fontWeight: 600, color: '#EDEBF5' }}>
                  Produtos Mais Provados
                </h2>
              </div>
              <p style={{ color: '#A09CC0', fontSize: 12, marginBottom: 16 }}>Top 10 por iniciações</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 90px', gap: 10, padding: '0 0 8px', borderBottom: '1px solid rgba(184,174,221,0.12)' }}>
                {['Produto', 'Inic.', 'Compl.', 'Taxa'].map(h => (
                  <div key={h} style={{ fontSize: 10, color: '#A09CC0', fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
                ))}
              </div>

              <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                {loading ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="prod-tbl-row">
                      <div className="skeleton" style={{ height: 12, width: '70%' }} />
                      <div className="skeleton" style={{ height: 12, width: 40 }} />
                      <div className="skeleton" style={{ height: 12, width: 40 }} />
                      <div className="skeleton" style={{ height: 20, width: 60, borderRadius: 100 }} />
                    </div>
                  ))
                ) : topProducts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Package size={28} color="#A09CC0" style={{ marginBottom: 10 }} />
                    <p style={{ color: '#A09CC0', fontSize: 13 }}>Nenhum produto ainda</p>
                  </div>
                ) : topProducts.map(prod => (
                  <div key={prod.sku} className="prod-tbl-row">
                    <div>
                      <div style={{ fontSize: 12, color: '#EDEBF5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.name}</div>
                      <div style={{ fontSize: 10, color: '#A09CC0', fontFamily: "'IBM Plex Mono',monospace", marginTop: 2 }}>{prod.sku}</div>
                    </div>
                    {/* Iniciações — cobalt (volume neutro) */}
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: '#3B82F6' }}>{prod.initiated.toLocaleString('pt-BR')}</div>
                    {/* Completos — verdigris (resultado positivo) */}
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: '#0CC89E' }}>{prod.completed.toLocaleString('pt-BR')}</div>
                    {/* Taxa — pílula semântica */}
                    <div>
                      <span style={{
                        display: 'inline-block', padding: '3px 9px', borderRadius: 100,
                        fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600,
                        color: completionColor(prod.rate),
                        background: completionBg(prod.rate),
                        border: `1px solid ${completionBorder(prod.rate)}`,
                      }}>
                        {prod.rate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Size Analysis — mauve padrão, sem semântica */}
            <div style={{ background: '#0F0D1E', border: '1px solid rgba(184,174,221,0.14)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Ruler size={14} color="#7050A0" />
                <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 15, fontWeight: 600, color: '#EDEBF5' }}>
                  Análise de Tamanhos
                </h2>
              </div>
              <p style={{ color: '#A09CC0', fontSize: 12, marginBottom: 20 }}>Engajamento por tamanho</p>

              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 5, width: '100%' }} />
                  </div>
                ))
              ) : sizeData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Ruler size={28} color="#A09CC0" style={{ marginBottom: 10 }} />
                  <p style={{ color: '#A09CC0', fontSize: 13 }}>Nenhum dado de tamanho ainda</p>
                </div>
              ) : sizeData.map((sz, i) => {
                /* Mauve com opacidade variando por posição — intensidade de brand, não semântica */
                const barOpacity = 0.45 + ((sizeData.length - i) / sizeData.length) * 0.4;
                return (
                  <div key={sz.size} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 600, color: '#7050A0', minWidth: 36 }}>
                          {sz.size}
                        </span>
                        <span style={{ fontSize: 12, color: '#A09CC0' }}>{sz.count.toLocaleString('pt-BR')} provas</span>
                      </div>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: '#B8AEDD' }}>{sz.pct}%</span>
                    </div>
                    <div className="sz-bar-track">
                      <div style={{
                        height: '100%',
                        width: `${(sz.count / maxSizeCount) * 100}%`,
                        background: `rgba(112,80,160,${barOpacity})`,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <InternalFooter />

        </div>
      </div>
    </>
  );
}
