'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

const THEME = {
  bg: "#0a0a0f",
  bgCard: "rgba(255,255,255,0.04)",
  bgGlass: "rgba(139,92,246,0.08)",
  border: "rgba(255,255,255,0.08)",
  borderPurple: "rgba(139,92,246,0.3)",
  text: "#ffffff",
  textMuted: "rgba(255,255,255,0.55)",
  textLight: "rgba(255,255,255,0.3)",
  purple: "#8b5cf6",
  purpleLight: "#a78bfa",
  purpleDark: "#6d28d9",
  purpleGlow: "rgba(139,92,246,0.15)",
  green: "#10b981",
  blue: "#3b82f6",
  orange: "#f59e0b",
  red: "#f87171",
};

interface AnalyticsStats {
  totalInitiated: number;
  totalCompleted: number;
  totalClosed: number;
  uniqueSessions: number;
  avgDwellMs: number;
  completionRate: number;
}

interface ProductStat {
  product_id: string;
  product_name: string;
  initiated: number;
  completed: number;
  completionRate: number;
}

interface SizeStat {
  size_label: string;
  count: number;
  avgDwellMs: number;
}

interface DailyUsage {
  day: string;
  initiated: number;
  completed: number;
}

interface RecentEvent {
  id: string;
  event_type: string;
  product_name: string | null;
  created_at: string;
  metadata: any;
}

const EVENT_LABELS: Record<string, string> = {
  tryon_initiated: 'Try-On Iniciado',
  tryon_completed: 'Try-On Completo',
  tryon_failed: 'Try-On Falhou',
  modal_closed: 'Modal Fechado',
  size_selected: 'Tamanho Selecionado',
  add_to_cart: 'Adicionado ao Carrinho',
  purchase_completed: 'Compra Finalizada',
  studio_pro_generated: 'Estudio Pro',
};

const EVENT_COLORS: Record<string, string> = {
  tryon_initiated: "#8b5cf6",
  tryon_completed: "#10b981",
  tryon_failed: "#f87171",
  modal_closed: "rgba(255,255,255,0.55)",
  size_selected: "#3b82f6",
  add_to_cart: "#f59e0b",
  purchase_completed: "#10b981",
  studio_pro_generated: "#a78bfa",
};

function formatMs(ms: number): string {
  if (!ms || ms <= 0) return '--';
  if (ms < 1000) return ms + 'ms';
  if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
  return Math.floor(ms / 60000) + 'm ' + Math.floor((ms % 60000) / 1000) + 's';
}

function formatRelative(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return minutes + 'm atras';
  if (hours < 24) return hours + 'h atras';
  return days + 'd atras';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(15,15,25,0.95)",
        border: "1px solid rgba(139,92,246,0.3)",
        borderRadius: 8,
        padding: "10px 14px",
      }}>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, margin: "0 0 6px" }}>{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color, fontSize: 13, margin: "2px 0", fontWeight: 600 }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [topProducts, setTopProducts] = useState<ProductStat[]>([]);
  const [sizeStats, setSizeStats] = useState<SizeStat[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [merchantEmail, setMerchantEmail] = useState("");
  const [period, setPeriod] = useState<7 | 30>(7);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      if (!supabase) { router.push('/login'); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setMerchantEmail(user.email || '');

      const since = new Date();
      since.setDate(since.getDate() - period);

      const { data: events } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('merchant_id', user.id)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })
        .limit(2000);

      if (!events) { setLoading(false); return; }

      const initiated = events.filter((e: any) => e.event_type === 'tryon_initiated');
      const completed = events.filter((e: any) => e.event_type === 'tryon_completed');
      const closed = events.filter((e: any) => e.event_type === 'modal_closed');
      const uniqueSessions = new Set(events.map((e: any) => e.session_id).filter(Boolean)).size;
      const dwellTimes = closed.map((e: any) => e.metadata?.dwell_time_ms).filter((v: any): v is number => typeof v === 'number' && v > 0);
      const avgDwellMs = dwellTimes.length > 0 ? Math.round(dwellTimes.reduce((a: number, b: number) => a + b, 0) / dwellTimes.length) : 0;
      const completionRate = initiated.length > 0 ? Math.round((completed.length / initiated.length) * 100) : 0;

      setStats({ totalInitiated: initiated.length, totalCompleted: completed.length, totalClosed: closed.length, uniqueSessions, avgDwellMs, completionRate });

      const productMap: Record<string, { name: string; initiated: number; completed: number }> = {};
      events.forEach((e: any) => {
        if (!e.product_id) return;
        if (!productMap[e.product_id]) productMap[e.product_id] = { name: e.product_name || e.product_id, initiated: 0, completed: 0 };
        if (e.event_type === 'tryon_initiated') productMap[e.product_id].initiated++;
        if (e.event_type === 'tryon_completed') productMap[e.product_id].completed++;
      });
      setTopProducts(Object.entries(productMap).map(([id, v]) => ({ product_id: id, product_name: v.name, initiated: v.initiated, completed: v.completed, completionRate: v.initiated > 0 ? Math.round((v.completed / v.initiated) * 100) : 0 })).sort((a, b) => b.initiated - a.initiated).slice(0, 10));

      const sizeMap: Record<string, { count: number; dwells: number[] }> = {};
      events.forEach((e: any) => {
        const size = e.metadata?.size_label || (e.event_type === 'size_selected' ? e.metadata?.size : null);
        if (!size) return;
        if (!sizeMap[size]) sizeMap[size] = { count: 0, dwells: [] };
        sizeMap[size].count++;
        if (e.metadata?.dwell_time_ms) sizeMap[size].dwells.push(e.metadata.dwell_time_ms);
      });
      setSizeStats(Object.entries(sizeMap).map(([label, v]) => ({ size_label: label, count: v.count, avgDwellMs: v.dwells.length > 0 ? Math.round(v.dwells.reduce((a, b) => a + b, 0) / v.dwells.length) : 0 })).sort((a, b) => b.count - a.count).slice(0, 8));

      const dayMap: Record<string, { initiated: number; completed: number }> = {};
      events.forEach((e: any) => {
        const day = e.created_at.substring(0, 10);
        if (!dayMap[day]) dayMap[day] = { initiated: 0, completed: 0 };
        if (e.event_type === 'tryon_initiated') dayMap[day].initiated++;
        if (e.event_type === 'tryon_completed') dayMap[day].completed++;
      });
      const daily: DailyUsage[] = [];
      for (let i = period - 1; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().substring(0, 10);
        daily.push({ day: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), initiated: dayMap[key]?.initiated || 0, completed: dayMap[key]?.completed || 0 });
      }
      setDailyUsage(daily);
      setRecentEvents(events.slice(0, 25));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/');
  }

  const funnelData = stats ? [
    { name: 'Iniciados', value: stats.totalInitiated, fill: THEME.purple },
    { name: 'Completos', value: stats.totalCompleted, fill: THEME.green },
    { name: 'Fechados', value: stats.totalClosed, fill: THEME.blue },
  ] : [];

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: THEME.bg }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, border: "2px solid rgba(139,92,246,0.2)", borderTopColor: THEME.purple, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: THEME.textMuted, fontSize: 14 }}>Carregando analytics...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "⊞", href: "/dashboard" },
    { id: "analytics", label: "Analytics", icon: "◈", href: "/analytics" },
    { id: "studio", label: "Estudio Pro", icon: "◉", href: "/admin" },
    { id: "pricing", label: "Planos", icon: "◇", href: "/pricing" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: THEME.bg, fontFamily: "'Inter', -apple-system, sans-serif", color: THEME.text }}>
      <div style={{ position: "fixed", top: -200, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 240, background: "rgba(10,10,20,0.95)", borderRight: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", zIndex: 100, padding: "24px 0" }}>
        <div style={{ padding: "0 24px 32px" }}>
          <img src="/logos/logo-horizontal-dark.png" alt="Reflexy" style={{ height: 28, width: "auto" }} />
        </div>
        <nav style={{ flex: 1, padding: "0 12px" }}>
          {navItems.map(item => (
            <Link key={item.id} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 8, marginBottom: 4, cursor: "pointer", background: item.id === "analytics" ? THEME.bgGlass : "transparent", border: item.id === "analytics" ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent", color: item.id === "analytics" ? THEME.purpleLight : THEME.textMuted, fontSize: 14, fontWeight: item.id === "analytics" ? 600 : 400 }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
        <div style={{ padding: "16px 16px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ padding: "12px 14px", borderRadius: 8, background: THEME.bgCard, marginBottom: 8 }}>
            <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 2px" }}>Logado como</p>
            <p style={{ fontSize: 13, color: THEME.text, margin: 0, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{merchantEmail}</p>
          </div>
          <button onClick={handleLogout} style={{ width: "100%", padding: "10px 14px", background: "transparent", color: THEME.textMuted, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontWeight: 500, fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>Sair</button>
        </div>
      </div>

      <main style={{ marginLeft: 240, padding: "40px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.5px" }}>Analytics</h1>
            <p style={{ fontSize: 14, margin: 0, color: THEME.textMuted }}>Comportamento dos seus clientes no provador virtual</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {([7, 30] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{ padding: "8px 16px", borderRadius: 8, border: period === p ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(255,255,255,0.08)", background: period === p ? THEME.bgGlass : "transparent", color: period === p ? THEME.purpleLight : THEME.textMuted, fontSize: 13, fontWeight: period === p ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                {p === 7 ? "7 dias" : "30 dias"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Try-Ons Iniciados", value: stats?.totalInitiated ?? 0, sub: `Ultimos ${period} dias`, color: THEME.purple, icon: "▷" },
            { label: "Try-Ons Completos", value: stats?.totalCompleted ?? 0, sub: `Taxa: ${stats?.completionRate ?? 0}%`, color: THEME.green, icon: "✓" },
            { label: "Sessoes Unicas", value: stats?.uniqueSessions ?? 0, sub: "Usuarios distintos", color: THEME.blue, icon: "◉" },
            { label: "Tempo Medio", value: formatMs(stats?.avgDwellMs ?? 0), sub: "No modal do provador", color: THEME.orange, icon: "◷" },
            { label: "Taxa de Conclusao", value: `${stats?.completionRate ?? 0}%`, sub: "Iniciado → Completo", color: THEME.purpleLight, icon: "◈" },
          ].map((stat, i) => (
            <div key={i} style={{ background: THEME.bgCard, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "20px", backdropFilter: "blur(10px)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`, opacity: 0.6 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: THEME.textMuted, margin: 0, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>{stat.label}</p>
                <span style={{ fontSize: 16, color: stat.color, opacity: 0.8 }}>{stat.icon}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: THEME.text }}>{stat.value}</div>
              <p style={{ fontSize: 11, color: THEME.textMuted, margin: 0 }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>
          <div style={{ background: THEME.bgCard, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "24px", backdropFilter: "blur(10px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Uso Diario</h3>
                <p style={{ fontSize: 12, color: THEME.textMuted, margin: 0 }}>Iniciados vs. Completos</p>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: THEME.purple }} /><span style={{ fontSize: 12, color: THEME.textMuted }}>Iniciados</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: THEME.green }} /><span style={{ fontSize: 12, color: THEME.textMuted }}>Completos</span></div>
              </div>
            </div>
            {dailyUsage.some(d => d.initiated > 0 || d.completed > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={dailyUsage}>
                  <defs>
                    <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={THEME.purple} stopOpacity={0.3} /><stop offset="95%" stopColor={THEME.purple} stopOpacity={0} /></linearGradient>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={THEME.green} stopOpacity={0.3} /><stop offset="95%" stopColor={THEME.green} stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: THEME.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: THEME.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="initiated" name="Iniciados" stroke={THEME.purple} strokeWidth={2} fill="url(#ig)" />
                  <Area type="monotone" dataKey="completed" name="Completos" stroke={THEME.green} strokeWidth={2} fill="url(#cg)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: THEME.textMuted, fontSize: 14 }}>Nenhum dado no periodo selecionado</div>
            )}
          </div>

          <div style={{ background: THEME.bgCard, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "24px", backdropFilter: "blur(10px)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Funil de Conversao</h3>
            <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 24px" }}>Jornada do usuario</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {funnelData.map((item, i) => {
                const maxVal = funnelData[0]?.value || 1;
                const pct = maxVal > 0 ? Math.round((item.value / maxVal) * 100) : 0;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: THEME.textMuted }}>{item.name}</span>
                      <span style={{ fontSize: 14, color: item.fill, fontWeight: 700 }}>{item.value}</span>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: item.fill, borderRadius: 4, transition: "width 0.8s ease" }} />
                    </div>
                    {i < funnelData.length - 1 && funnelData[i].value > 0 && (
                      <p style={{ fontSize: 10, color: THEME.textLight, margin: "3px 0 0", textAlign: "right" }}>
                        {Math.round((funnelData[i + 1].value / funnelData[i].value) * 100)}% continuaram
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <div style={{ background: THEME.bgCard, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "24px", backdropFilter: "blur(10px)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Produtos Mais Provados</h3>
            <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 20px" }}>Top 10 por iniciacoes</p>
            {topProducts.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: THEME.textMuted, fontSize: 14 }}>Nenhum produto ainda.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {topProducts.map((product, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: THEME.purpleLight, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.product_name}</p>
                      <p style={{ fontSize: 11, color: THEME.textMuted, margin: 0 }}>{product.initiated} iniciados · {product.completed} completos</p>
                    </div>
                    <div style={{ padding: "3px 8px", borderRadius: 20, background: product.completionRate >= 70 ? "rgba(16,185,129,0.12)" : product.completionRate >= 40 ? "rgba(245,158,11,0.12)" : "rgba(248,113,113,0.12)", color: product.completionRate >= 70 ? THEME.green : product.completionRate >= 40 ? THEME.orange : THEME.red, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                      {product.completionRate}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: THEME.bgCard, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "24px", backdropFilter: "blur(10px)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Analise de Tamanhos</h3>
            <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 20px" }}>Engajamento por tamanho</p>
            {sizeStats.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: THEME.textMuted, fontSize: 14 }}>Nenhum dado de tamanho ainda.</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={sizeStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: THEME.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="size_label" type="category" tick={{ fill: THEME.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Selecoes" radius={[0, 4, 4, 0]}>
                      {sizeStats.map((_: any, index: number) => (
                        <Cell key={index} fill={`rgba(139,92,246,${1 - index * 0.1})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                  {sizeStats.slice(0, 4).map((s, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", borderRadius: 6, background: "rgba(255,255,255,0.02)" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: THEME.purpleLight }}>{s.size_label}</span>
                      <span style={{ fontSize: 12, color: THEME.textMuted }}>{s.count} selecoes</span>
                      {s.avgDwellMs > 0 && <span style={{ fontSize: 11, color: THEME.textLight }}>{formatMs(s.avgDwellMs)} medio</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ background: THEME.bgCard, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "24px", backdropFilter: "blur(10px)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Eventos Recentes</h3>
          <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 20px" }}>Ultimas 25 interacoes</p>
          {recentEvents.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: THEME.textMuted, fontSize: 14 }}>Nenhum evento registrado ainda.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Evento", "Produto", "Detalhes", "Quando"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 600, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.map((event, idx) => {
                    const color = EVENT_COLORS[event.event_type] || THEME.textMuted;
                    const label = EVENT_LABELS[event.event_type] || event.event_type;
                    let details = '';
                    if (event.event_type === 'tryon_completed' && event.metadata?.duration_ms) details = formatMs(event.metadata.duration_ms);
                    else if (event.event_type === 'modal_closed' && event.metadata?.dwell_time_ms) details = formatMs(event.metadata.dwell_time_ms) + ' no modal';
                    else if (event.metadata?.size_label) details = 'Tam. ' + event.metadata.size_label;
                    return (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 20, background: `${color}18`, border: `1px solid ${color}30`, color, fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" }}>{label}</span>
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 13, color: THEME.textMuted, maxWidth: 200 }}>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{event.product_name || '—'}</span>
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: THEME.textLight }}>{details || '—'}</td>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: THEME.textLight, whiteSpace: "nowrap" }}>{formatRelative(event.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 3px; }
      `}</style>
    </div>
  );
}
