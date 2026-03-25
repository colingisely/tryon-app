'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Brand System V5 Deep Amethyst ──────────────────────────────────────────
const T = {
  abyss:     '#06050F',
  onyx:      '#0F0D1E',
  onyxMid:   '#16132A',
  onyxLight: '#1E1A35',
  verdigris: '#0CC89E',
  cobalt:    '#3B82F6',
  plum:      '#2B1250',
  plumLight: '#3D1870',
  text:      '#E8E6F0',
  textMuted: '#7B7991',
  textDim:   '#4A4761',
  border:    'rgba(255,255,255,0.07)',
  borderAlt: 'rgba(255,255,255,0.12)',
  warning:   '#F59E0B',
  danger:    '#EF4444',
};

// ─── Admin gate ──────────────────────────────────────────────────────────────
const ADMIN_EMAILS = [
  'gisely@reflexy.co',
  'colin@reflexy.co',
  'admin@reflexy.co',
];

// ─── Types ───────────────────────────────────────────────────────────────────
interface Merchant {
  id: string;
  store_name: string | null;
  email: string;
  plan_name: string | null;
  plan_id:   string | null;
  fast_credits_remaining:    number;
  premium_credits_remaining: number;
  subscription_status: string | null;
  created_at: string;
}

interface KPIs {
  mrr:                number;
  totalMerchants:     number;
  activeSubscriptions: number;
  generations24h:     number;
  generations7d:      number;
}

interface UsagePt { date: string; count: number }
interface MRRPt   { month: string; mrr: number }
interface TxLog   { id: string; status: string; created_at: string }

// ─── Helpers ─────────────────────────────────────────────────────────────────
const brl  = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v / 100);
const fmtD = (s: string) => new Date(s).toLocaleDateString('pt-BR');
const fmtDT= (s: string) => new Date(s).toLocaleString('pt-BR');

function statusColor(s: string | null) {
  switch (s) {
    case 'active':   return T.verdigris;
    case 'trialing': return T.cobalt;
    case 'past_due': return T.warning;
    case 'canceled': return T.danger;
    default:         return T.textMuted;
  }
}
function statusLabel(s: string | null) {
  switch (s) {
    case 'active':   return 'Ativo';
    case 'trialing': return 'Trial';
    case 'past_due': return 'Inadimplente';
    case 'canceled': return 'Cancelado';
    default:         return '—';
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skel({ w = '80%', h = 14 }: { w?: string; h?: number }) {
  return <div style={{ height: h, width: w, background: T.onyxLight, borderRadius: 4 }} />;
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KPICard({
  label, value, sub, accent, icon, loading,
}: { label: string; value: string; sub: string; accent: string; icon: string; loading: boolean }) {
  return (
    <div style={{
      background: T.onyx, borderRadius: 16, padding: 24,
      border: `1px solid ${T.border}`, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 100, height: 100,
        background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ fontSize: 22, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{label}</div>
      {loading
        ? <Skel w="55%" h={28} />
        : <div style={{ fontSize: 28, fontWeight: 700, color: accent, letterSpacing: -0.5, marginBottom: 4 }}>{value}</div>
      }
      <div style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function BackofficePage() {
  const router = useRouter();

  const [ready,   setReady  ] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab    ] = useState<'overview' | 'merchants' | 'monitoring'>('overview');

  const [kpis,       setKpis      ] = useState<KPIs>({ mrr: 0, totalMerchants: 0, activeSubscriptions: 0, generations24h: 0, generations7d: 0 });
  const [merchants,  setMerchants ] = useState<Merchant[]>([]);
  const [usagePts,   setUsagePts  ] = useState<UsagePt[]>([]);
  const [mrrPts,     setMrrPts    ] = useState<MRRPt[]>([]);
  const [txLogs,     setTxLogs    ] = useState<TxLog[]>([]);
  const [aiStats,    setAiStats   ] = useState({ total: 0, errors: 0 });

  const [search,  setSearch ] = useState('');
  const [statusF, setStatusF] = useState('all');

  const [modal, setModal] = useState<{ open: boolean; m: Merchant | null }>({ open: false, m: null });
  const [credits, setCredits] = useState({ fast: 0, premium: 0 });
  const [saving,  setSaving ] = useState(false);

  // ── Auth ───────────────────────────────────────────────────────────────────
  useEffect(() => { checkAdmin(); }, []);

  async function checkAdmin() {
    if (!supabase) { router.push('/login'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    if (!ADMIN_EMAILS.includes(user.email ?? '')) { router.push('/dashboard'); return; }
    setReady(true);
    load();
  }

  // ── Data ───────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    await Promise.all([loadKPIs(), loadMerchants(), loadCharts(), loadMonitoring()]);
    setLoading(false);
  }, []);

  async function loadKPIs() {
    if (!supabase) return;

    const { count: total } = await supabase
      .from('merchants').select('*', { count: 'exact', head: true });

    const { count: active } = await supabase
      .from('merchants').select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active');

    const { count: g24 } = await supabase
      .from('usage_logs').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 864e5).toISOString());

    const { count: g7d } = await supabase
      .from('usage_logs').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 864e5).toISOString());

    const som = new Date(); som.setDate(1); som.setHours(0, 0, 0, 0);
    const { data: txs } = await supabase
      .from('transactions').select('amount')
      .eq('status', 'paid').gte('created_at', som.toISOString());
    const mrr = (txs ?? []).reduce((s, t) => s + (t.amount ?? 0), 0);

    setKpis({
      mrr,
      totalMerchants:      total  ?? 0,
      activeSubscriptions: active ?? 0,
      generations24h:      g24    ?? 0,
      generations7d:       g7d    ?? 0,
    });
  }

  async function loadMerchants() {
    if (!supabase) return;
    const { data } = await supabase
      .from('merchants')
      .select('id,store_name,email,plan_name,plan_id,fast_credits_remaining,premium_credits_remaining,subscription_status,created_at')
      .order('created_at', { ascending: false });
    setMerchants(data ?? []);
  }

  async function loadCharts() {
    if (!supabase) return;

    // Usage last 7 days
    const { data: logs } = await supabase
      .from('usage_logs').select('created_at')
      .gte('created_at', new Date(Date.now() - 7 * 864e5).toISOString());

    const byDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      byDay[d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })] = 0;
    }
    (logs ?? []).forEach(l => {
      const k = new Date(l.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (k in byDay) byDay[k]++;
    });
    setUsagePts(Object.entries(byDay).map(([date, count]) => ({ date, count })));

    // MRR last 6 months (from transactions)
    const { data: txs } = await supabase
      .from('transactions').select('amount, created_at')
      .eq('status', 'paid')
      .gte('created_at', new Date(Date.now() - 180 * 864e5).toISOString());

    const byMonth: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      byMonth[d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })] = 0;
    }
    (txs ?? []).forEach(t => {
      const k = new Date(t.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      if (k in byMonth) byMonth[k] += (t.amount ?? 0);
    });
    setMrrPts(Object.entries(byMonth).map(([month, mrr]) => ({ month, mrr: mrr / 100 })));
  }

  async function loadMonitoring() {
    if (!supabase) return;

    const { data } = await supabase
      .from('transactions').select('id,status,created_at')
      .order('created_at', { ascending: false }).limit(12);
    setTxLogs(data ?? []);

    const { count: total } = await supabase
      .from('usage_logs').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 864e5).toISOString());
    const { count: errors } = await supabase
      .from('usage_logs').select('*', { count: 'exact', head: true })
      .eq('type', 'error')
      .gte('created_at', new Date(Date.now() - 864e5).toISOString());
    setAiStats({ total: total ?? 0, errors: errors ?? 0 });
  }

  // ── Credits modal ──────────────────────────────────────────────────────────
  function openModal(m: Merchant) {
    setModal({ open: true, m });
    setCredits({ fast: m.fast_credits_remaining, premium: m.premium_credits_remaining });
  }

  async function saveCredits() {
    if (!supabase || !modal.m) return;
    setSaving(true);
    await supabase.from('merchants').update({
      fast_credits_remaining:    credits.fast,
      premium_credits_remaining: credits.premium,
    }).eq('id', modal.m.id);
    setSaving(false);
    setModal({ open: false, m: null });
    await loadMerchants();
  }

  // ── Filtered merchants ─────────────────────────────────────────────────────
  const filtered = merchants.filter(m => {
    const q = search.toLowerCase();
    const ok = (m.store_name ?? '').toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const st = statusF === 'all' || m.subscription_status === statusF;
    return ok && st;
  });

  // ── Status breakdown ───────────────────────────────────────────────────────
  const breakdown = merchants.reduce((acc, m) => {
    const s = m.subscription_status ?? 'unknown';
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const errorRate = aiStats.total > 0 ? Math.round((aiStats.errors / aiStats.total) * 100) : 0;

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!ready) return (
    <div style={{ background: T.abyss, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: `2px solid ${T.verdigris}`, borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div style={{ color: T.textMuted, fontSize: 13 }}>Verificando acesso admin…</div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: T.abyss, minHeight: '100vh', color: T.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{
        background: T.onyx, borderBottom: `1px solid ${T.border}`,
        padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: `linear-gradient(135deg, ${T.plum}, ${T.cobalt})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#fff',
          }}>R</div>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Reflexy</span>
          <span style={{
            padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 700,
            letterSpacing: 1.2, textTransform: 'uppercase',
            background: T.plum, color: T.verdigris,
          }}>BACKOFFICE</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={load}
            style={{ padding: '6px 14px', background: T.onyxLight, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textMuted, fontSize: 12, cursor: 'pointer' }}
          >
            ↻ Atualizar
          </button>
          <button
            onClick={() => { supabase?.auth.signOut(); router.push('/'); }}
            style={{ padding: '6px 14px', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, color: T.textMuted, fontSize: 12, cursor: 'pointer' }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* ── Tab nav ────────────────────────────────────────────────────────── */}
      <nav style={{ background: T.onyx, borderBottom: `1px solid ${T.border}`, padding: '0 32px', display: 'flex', gap: 2 }}>
        {([
          { id: 'overview',    label: 'Visão Geral',   emoji: '📊' },
          { id: 'merchants',   label: 'Merchants',     emoji: '🏪' },
          { id: 'monitoring',  label: 'Monitoramento', emoji: '🔧' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '13px 18px', background: 'none', border: 'none',
              borderBottom: tab === t.id ? `2px solid ${T.verdigris}` : '2px solid transparent',
              color: tab === t.id ? T.verdigris : T.textMuted,
              fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
              cursor: 'pointer', transition: 'all .15s',
            }}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </nav>

      <main style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>

        {/* ════════════════════════════════════════════════════════════════════
            OVERVIEW
        ════════════════════════════════════════════════════════════════════ */}
        {tab === 'overview' && (
          <>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
              <KPICard label="MRR"               value={brl(kpis.mrr)}                    sub="Receita mensal recorrente"  accent={T.verdigris} icon="💰" loading={loading} />
              <KPICard label="Total de Merchants" value={String(kpis.totalMerchants)}       sub={`${kpis.activeSubscriptions} assinaturas ativas`} accent={T.cobalt} icon="🏪" loading={loading} />
              <KPICard label="Gerações (24 h)"    value={String(kpis.generations24h)}       sub="Try-ons nas últimas 24 h"  accent={T.verdigris} icon="🖼️" loading={loading} />
              <KPICard label="Gerações (7 d)"     value={String(kpis.generations7d)}        sub="Try-ons nos últimos 7 dias" accent={T.cobalt}    icon="📈" loading={loading} />
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14, marginBottom: 24 }}>

              {/* Usage area */}
              <div style={{ background: T.onyx, borderRadius: 16, padding: 24, border: `1px solid ${T.border}` }}>
                <h3 style={{ margin: '0 0 20px', fontSize: 13, fontWeight: 600, color: T.text }}>Gerações por dia — últimos 7 dias</h3>
                {loading ? (
                  <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                    {[60,80,45,90,70,55,85].map((h,i) => (
                      <div key={i} style={{ flex:1, height:`${h}%`, background: T.onyxLight, borderRadius:'4px 4px 0 0' }} />
                    ))}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={usagePts} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gUsage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={T.verdigris} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={T.verdigris} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                      <XAxis dataKey="date" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: T.onyxMid, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }}
                        cursor={{ stroke: T.verdigris, strokeWidth: 1, strokeDasharray: '4 4' }}
                      />
                      <Area type="monotone" dataKey="count" stroke={T.verdigris} strokeWidth={2} fill="url(#gUsage)" name="Gerações" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Status breakdown */}
              <div style={{ background: T.onyx, borderRadius: 16, padding: 24, border: `1px solid ${T.border}` }}>
                <h3 style={{ margin: '0 0 20px', fontSize: 13, fontWeight: 600, color: T.text }}>Merchants por status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { key: 'active',   label: 'Ativo',        color: T.verdigris },
                    { key: 'trialing', label: 'Trial',        color: T.cobalt    },
                    { key: 'past_due', label: 'Inadimplente', color: T.warning   },
                    { key: 'canceled', label: 'Cancelado',    color: T.danger    },
                  ].map(item => {
                    const n   = breakdown[item.key] ?? 0;
                    const pct = kpis.totalMerchants > 0 ? Math.round((n / kpis.totalMerchants) * 100) : 0;
                    return (
                      <div key={item.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 12, color: T.textMuted }}>{item.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{loading ? '—' : `${n} (${pct}%)`}</span>
                        </div>
                        <div style={{ height: 5, background: T.onyxLight, borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: loading ? '0%' : `${pct}%`, background: item.color, borderRadius: 3, transition: 'width .6s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* MRR bar chart */}
            <div style={{ background: T.onyx, borderRadius: 16, padding: 24, border: `1px solid ${T.border}` }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 13, fontWeight: 600, color: T.text }}>MRR — últimos 6 meses (R$)</h3>
              {loading ? (
                <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                  {[50,70,60,85,65,90].map((h,i) => (
                    <div key={i} style={{ flex:1, height:`${h}%`, background: T.onyxLight, borderRadius:'4px 4px 0 0' }} />
                  ))}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={mrrPts} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(v: number | undefined) => [`R$ ${(v ?? 0).toFixed(2)}`, 'MRR']}
                      contentStyle={{ background: T.onyxMid, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12 }}
                    />
                    <Bar dataKey="mrr" fill={T.cobalt} radius={[4,4,0,0]} name="MRR" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            MERCHANTS
        ════════════════════════════════════════════════════════════════════ */}
        {tab === 'merchants' && (
          <>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                placeholder="Buscar por loja ou e-mail…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  flex: 1, minWidth: 220, padding: '9px 14px',
                  background: T.onyx, border: `1px solid ${T.border}`,
                  borderRadius: 10, color: T.text, fontSize: 13, outline: 'none',
                }}
              />
              <select
                value={statusF}
                onChange={e => setStatusF(e.target.value)}
                style={{
                  padding: '9px 14px', background: T.onyx, border: `1px solid ${T.border}`,
                  borderRadius: 10, color: T.text, fontSize: 13, outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="all">Todos os status</option>
                <option value="active">Ativo</option>
                <option value="trialing">Trial</option>
                <option value="past_due">Inadimplente</option>
                <option value="canceled">Cancelado</option>
              </select>
              <span style={{ fontSize: 12, color: T.textMuted }}>
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Table */}
            <div style={{ background: T.onyx, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                      {['Loja', 'E-mail', 'Plano', 'Créd. Rápidos', 'Créd. Premium', 'Status', 'Cadastro', 'Ações'].map(h => (
                        <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: 'uppercase', letterSpacing: 0.7, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                            {Array.from({ length: 8 }).map((_, j) => (
                              <td key={j} style={{ padding: '13px 16px' }}><Skel w="70%" /></td>
                            ))}
                          </tr>
                        ))
                      : filtered.length === 0
                        ? (
                          <tr>
                            <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: T.textMuted, fontSize: 14 }}>
                              Nenhum merchant encontrado
                            </td>
                          </tr>
                        )
                        : filtered.map(m => (
                            <tr
                              key={m.id}
                              style={{ borderBottom: `1px solid ${T.border}`, transition: 'background .1s' }}
                              onMouseEnter={e => (e.currentTarget.style.background = T.onyxLight)}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: T.text, whiteSpace: 'nowrap' }}>{m.store_name ?? '—'}</td>
                              <td style={{ padding: '12px 16px', fontSize: 12, color: T.textMuted }}>{m.email}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ padding: '3px 9px', background: T.plum, borderRadius: 5, fontSize: 11, fontWeight: 500, color: T.cobalt }}>
                                  {m.plan_name ?? m.plan_id ?? 'Free'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px', fontSize: 13, color: T.text, fontVariantNumeric: 'tabular-nums' }}>{m.fast_credits_remaining ?? 0}</td>
                              <td style={{ padding: '12px 16px', fontSize: 13, color: T.text, fontVariantNumeric: 'tabular-nums' }}>{m.premium_credits_remaining ?? 0}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{
                                  padding: '3px 9px', borderRadius: 5, fontSize: 11, fontWeight: 600,
                                  background: `${statusColor(m.subscription_status)}1A`,
                                  color: statusColor(m.subscription_status),
                                }}>
                                  {statusLabel(m.subscription_status)}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px', fontSize: 12, color: T.textMuted, whiteSpace: 'nowrap' }}>{fmtD(m.created_at)}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <button
                                  onClick={() => openModal(m)}
                                  style={{
                                    padding: '5px 12px', background: T.plum, border: `1px solid ${T.plumLight}`,
                                    borderRadius: 7, color: T.cobalt, fontSize: 11, fontWeight: 600,
                                    cursor: 'pointer', whiteSpace: 'nowrap',
                                  }}
                                >
                                  Editar Créditos
                                </button>
                              </td>
                            </tr>
                          ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            MONITORING
        ════════════════════════════════════════════════════════════════════ */}
        {tab === 'monitoring' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Webhook / transaction log */}
            <div style={{ background: T.onyx, borderRadius: 16, padding: 24, border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.text }}>Webhook Log — Stripe</h3>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.verdigris, display: 'inline-block', boxShadow: `0 0 8px ${T.verdigris}` }} />
              </div>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Array.from({ length: 5 }).map((_, i) => <Skel key={i} w="100%" h={40} />)}
                </div>
              ) : txLogs.length === 0 ? (
                <div style={{ color: T.textMuted, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Sem registros</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {txLogs.map(l => (
                    <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: T.onyxLight, borderRadius: 9 }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                        background: l.status === 'paid' ? T.verdigris : l.status === 'failed' ? T.danger : T.warning,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: T.textMuted, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          payment_intent — {l.id.slice(0, 16)}…
                        </div>
                        <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>{fmtDT(l.created_at)}</div>
                      </div>
                      <span style={{
                        fontSize: 10, padding: '2px 7px', borderRadius: 4, fontWeight: 700, flexShrink: 0,
                        background: l.status === 'paid' ? `${T.verdigris}20` : `${T.danger}20`,
                        color: l.status === 'paid' ? T.verdigris : T.danger,
                      }}>
                        {l.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI queue */}
            <div style={{ background: T.onyx, borderRadius: 16, padding: 24, border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.text }}>Fila de IA — 24 h</h3>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
                  background: errorRate > 10 ? T.danger : T.verdigris,
                  boxShadow: `0 0 8px ${errorRate > 10 ? T.danger : T.verdigris}`,
                }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total de Gerações', value: aiStats.total, color: T.verdigris },
                  { label: 'Erros',             value: aiStats.errors, color: aiStats.errors > 0 ? T.danger : T.verdigris },
                ].map(s => (
                  <div key={s.label} style={{ background: T.onyxLight, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                    {loading ? <Skel w="50%" h={32} /> : (
                      <div style={{ fontSize: 30, fontWeight: 700, color: s.color }}>{s.value}</div>
                    )}
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: T.textMuted }}>Taxa de erro</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: errorRate > 10 ? T.danger : T.verdigris }}>
                    {loading ? '—' : `${errorRate}%`}
                  </span>
                </div>
                <div style={{ height: 7, background: T.onyxLight, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4, transition: 'width .5s ease',
                    width: loading ? '0%' : `${errorRate}%`,
                    background: errorRate > 10 ? T.danger : T.verdigris,
                  }} />
                </div>
              </div>

              <div style={{
                marginTop: 20, padding: '12px 16px',
                background: T.onyxLight, borderRadius: 10,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>{errorRate > 10 ? '⚠️' : '✅'}</span>
                <span style={{ fontSize: 12, color: errorRate > 10 ? T.warning : T.verdigris }}>
                  {errorRate > 10 ? 'Taxa de erro acima do normal — verificar logs.' : 'Sistema operando normalmente.'}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Edit Credits Modal ─────────────────────────────────────────────── */}
      {modal.open && modal.m && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(6,5,15,0.8)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: T.onyx, borderRadius: 18, padding: 32,
            width: 420, border: `1px solid ${T.borderAlt}`,
            boxShadow: `0 24px 60px rgba(0,0,0,0.5)`,
          }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: T.text }}>Editar Créditos</h2>
            <p style={{ margin: '0 0 24px', fontSize: 12, color: T.textMuted }}>
              {modal.m.store_name ?? modal.m.email}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {([
                { key: 'fast',    label: 'Créditos Rápidos'  },
                { key: 'premium', label: 'Créditos Premium'  },
              ] as const).map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {f.label}
                  </span>
                  <input
                    type="number"
                    value={credits[f.key]}
                    onChange={e => setCredits(p => ({ ...p, [f.key]: parseInt(e.target.value) || 0 }))}
                    style={{
                      padding: '10px 14px', background: T.onyxLight,
                      border: `1px solid ${T.border}`, borderRadius: 9,
                      color: T.text, fontSize: 15, outline: 'none',
                    }}
                  />
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setModal({ open: false, m: null })}
                style={{ flex: 1, padding: '11px', background: T.onyxLight, border: `1px solid ${T.border}`, borderRadius: 10, color: T.textMuted, fontSize: 13, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={saveCredits}
                disabled={saving}
                style={{
                  flex: 1, padding: '11px', border: 'none', borderRadius: 10,
                  background: saving ? T.onyxLight : T.verdigris,
                  color: saving ? T.textMuted : '#000',
                  fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all .15s',
                }}
              >
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
