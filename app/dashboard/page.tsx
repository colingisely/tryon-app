"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
} from "recharts";

const THEME = {
  bg: "#0a0a0f",
  bgCard: "rgba(255,255,255,0.04)",
  bgCardHover: "rgba(255,255,255,0.07)",
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
};

interface MerchantData {
  email: string;
  store_name: string | null;
  store_url: string | null;
  api_key: string;
  plan_name: string;
  subscription_status: string;
  fast_credits_remaining: number;
  premium_credits_remaining: number;
  fast_credits_used_total: number;
  premium_credits_used_total: number;
}

interface DailyUsage {
  day: string;
  fast: number;
  premium: number;
}

interface TopProduct {
  name: string;
  tryons: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(15,15,25,0.95)",
        border: `1px solid ${THEME.borderPurple}`,
        borderRadius: 8,
        padding: "10px 14px",
        backdropFilter: "blur(12px)",
      }}>
        <p style={{ color: THEME.textMuted, fontSize: 12, margin: "0 0 6px" }}>{label}</p>
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

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeNav] = useState("dashboard");
  const [usageData, setUsageData] = useState<DailyUsage[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [weeklyTryons, setWeeklyTryons] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    if (!supabase) { router.push("/login"); return; }
    const { data: { user } } = await supabase!.auth.getUser();
    if (!user) { router.push("/login"); return; }
    await Promise.all([
      loadMerchantData(user.id),
      loadAnalyticsData(user.id),
    ]);
  }

  async function loadMerchantData(userId: string) {
    if (!supabase) return;
    try {
      const { data, error } = await supabase!
        .from("merchants")
        .select(`*, plans:plan_id (name)`)
        .eq("id", userId)
        .single();

      if (error) { await createMerchant(userId); return; }

      setMerchant({
        email: data.email,
        store_name: data.store_name,
        store_url: data.store_url,
        api_key: data.api_key,
        plan_name: data.plans?.name || "Free",
        subscription_status: data.subscription_status,
        fast_credits_remaining: data.fast_credits_remaining ?? 0,
        premium_credits_remaining: data.premium_credits_remaining ?? 0,
        fast_credits_used_total: data.fast_credits_used_total ?? 0,
        premium_credits_used_total: data.premium_credits_used_total ?? 0,
      });
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalyticsData(userId: string) {
    if (!supabase) return;
    try {
      const since = new Date();
      since.setDate(since.getDate() - 7);

      const { data: events } = await supabase!
        .from("analytics_events")
        .select("event_type, product_id, product_name, created_at")
        .eq("merchant_id", userId)
        .gte("created_at", since.toISOString())
        .limit(1000);

      if (!events) return;

      // Daily usage
      const dayMap: Record<string, { fast: number; premium: number }> = {};
      events.forEach((e: any) => {
        const day = e.created_at.substring(0, 10);
        if (!dayMap[day]) dayMap[day] = { fast: 0, premium: 0 };
        if (e.event_type === 'tryon_completed') dayMap[day].fast++;
        if (e.event_type === 'studio_pro_generated') dayMap[day].premium++;
      });

      const daily: DailyUsage[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().substring(0, 10);
        const label = d.toLocaleDateString('pt-BR', { weekday: 'short' });
        daily.push({ day: label.charAt(0).toUpperCase() + label.slice(1), fast: dayMap[key]?.fast || 0, premium: dayMap[key]?.premium || 0 });
      }
      setUsageData(daily);

      // Weekly tryons total
      const total = events.filter((e: any) => e.event_type === 'tryon_completed' || e.event_type === 'tryon_initiated').length;
      setWeeklyTryons(total);

      // Conversion rate
      const initiated = events.filter((e: any) => e.event_type === 'tryon_initiated').length;
      const completed = events.filter((e: any) => e.event_type === 'tryon_completed').length;
      setConversionRate(initiated > 0 ? Math.round((completed / initiated) * 100) : 0);

      // Top products
      const productMap: Record<string, { name: string; count: number }> = {};
      events.filter((e: any) => e.event_type === 'tryon_completed' && e.product_id).forEach((e: any) => {
        if (!productMap[e.product_id]) productMap[e.product_id] = { name: e.product_name || e.product_id, count: 0 };
        productMap[e.product_id].count++;
      });
      setTopProducts(Object.values(productMap).sort((a, b) => b.count - a.count).slice(0, 5).map(p => ({ name: p.name, tryons: p.count })));

    } catch (err) {
      console.error("Analytics error:", err);
    }
  }

  async function createMerchant(userId: string) {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) return;

      const { data: freePlan } = await supabase!
        .from("plans")
        .select("id, fast_credits_monthly, premium_credits_monthly")
        .eq("slug", "free")
        .single();

      if (!freePlan) return;

      const apiKey = `tk_${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`;

      const { error } = await supabase!.from("merchants").insert({
        id: userId,
        email: user.email!,
        api_key: apiKey,
        plan_id: freePlan.id,
        subscription_status: "active",
        fast_credits_remaining: freePlan.fast_credits_monthly,
        premium_credits_remaining: freePlan.premium_credits_monthly,
      });

      if (!error) await loadMerchantData(userId);
    } catch (err) {
      console.error("Error:", err);
    }
  }

  async function handleLogout() {
    if (!supabase) return;
    await supabase!.auth.signOut();
    router.push("/");
  }

  function copyApiKey() {
    if (!merchant) return;
    navigator.clipboard.writeText(merchant.api_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const fastTotal = merchant ? (merchant.fast_credits_remaining + merchant.fast_credits_used_total) || 1 : 1;
  const fastUsagePercent = merchant ? Math.round((merchant.fast_credits_used_total / fastTotal) * 100) : 0;
  const premiumTotal = merchant ? (merchant.premium_credits_remaining + merchant.premium_credits_used_total) || 1 : 1;
  const premiumUsagePercent = merchant ? Math.round((merchant.premium_credits_used_total / premiumTotal) * 100) : 0;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: THEME.bg }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: `2px solid rgba(139,92,246,0.2)`, borderTopColor: THEME.purple, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px", boxShadow: `0 0 20px ${THEME.purpleGlow}` }} />
          <p style={{ color: THEME.textMuted, fontSize: 14 }}>Carregando...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: THEME.bg }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: THEME.text }}>Erro ao carregar dados</h2>
          <p style={{ color: THEME.textMuted, marginBottom: 24, fontSize: 15 }}>Nao foi possivel carregar seus dados.</p>
          <button onClick={() => window.location.reload()} style={{ padding: "12px 24px", background: THEME.purple, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 15 }}>Recarregar</button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "⊞", href: "/dashboard" },
    { id: "analytics", label: "Analytics", icon: "◈", href: "/analytics" },
    { id: "studio", label: "Estudio Pro", icon: "◉", href: "/admin" },
    { id: "pricing", label: "Planos", icon: "◇", href: "/pricing" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: THEME.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: THEME.text }}>
      <div style={{ position: "fixed", top: -200, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Sidebar */}
      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 240, background: "rgba(10,10,20,0.95)", borderRight: `1px solid ${THEME.border}`, backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", zIndex: 100, padding: "24px 0" }}>
        <div style={{ padding: "0 24px 32px" }}>
          <img src="/logos/logo-horizontal-dark.png" alt="Reflexy" style={{ height: 28, width: "auto" }} />
        </div>
        <nav style={{ flex: 1, padding: "0 12px" }}>
          {navItems.map(item => (
            <Link key={item.id} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 8, marginBottom: 4, cursor: "pointer", background: activeNav === item.id ? THEME.bgGlass : "transparent", border: activeNav === item.id ? `1px solid ${THEME.borderPurple}` : "1px solid transparent", color: activeNav === item.id ? THEME.purpleLight : THEME.textMuted, fontSize: 14, fontWeight: activeNav === item.id ? 600 : 400 }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
        <div style={{ padding: "16px 16px 0", borderTop: `1px solid ${THEME.border}` }}>
          <div style={{ padding: "12px 14px", borderRadius: 8, background: THEME.bgCard, marginBottom: 8 }}>
            <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 2px" }}>Logado como</p>
            <p style={{ fontSize: 13, color: THEME.text, margin: 0, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{merchant.email}</p>
          </div>
          <button onClick={handleLogout} style={{ width: "100%", padding: "10px 14px", background: "transparent", color: THEME.textMuted, border: `1px solid ${THEME.border}`, borderRadius: 8, fontWeight: 500, fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>Sair</button>
        </div>
      </div>

      {/* Main content */}
      <main style={{ marginLeft: 240, padding: "40px 40px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.5px" }}>
                Ola, {merchant.store_name || merchant.email.split('@')[0]} 👋
              </h1>
              <p style={{ fontSize: 14, margin: 0, color: THEME.textMuted }}>Aqui esta o resumo da sua loja hoje.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", background: THEME.bgGlass, border: `1px solid ${THEME.borderPurple}`, borderRadius: 20 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: THEME.green, boxShadow: `0 0 8px ${THEME.green}` }} />
              <span style={{ fontSize: 13, color: THEME.purpleLight, fontWeight: 500 }}>Plano {merchant.plan_name} · Ativo</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Creditos Fast", value: merchant.fast_credits_remaining, sub: `${merchant.fast_credits_used_total} usados`, color: THEME.purple, percent: fastUsagePercent, icon: "⚡" },
            { label: "Creditos Premium", value: merchant.premium_credits_remaining, sub: `${merchant.premium_credits_used_total} usados`, color: THEME.blue, percent: premiumUsagePercent, icon: "✦" },
            { label: "Try-Ons Esta Semana", value: weeklyTryons, sub: "Ultimos 7 dias", color: THEME.green, percent: Math.min(weeklyTryons, 100), icon: "◈" },
            { label: "Taxa de Conversao", value: `${conversionRate}%`, sub: "Try-on → Completo", color: THEME.orange, percent: conversionRate, icon: "◇" },
          ].map((stat, i) => (
            <div key={i} style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: "22px 22px", backdropFilter: "blur(10px)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`, opacity: 0.6 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <p style={{ fontSize: 12, color: THEME.textMuted, margin: 0, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>{stat.label}</p>
                <span style={{ fontSize: 18, opacity: 0.7 }}>{stat.icon}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 6, color: THEME.text }}>{stat.value}</div>
              <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 12px" }}>{stat.sub}</p>
              <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${stat.percent}%`, background: `linear-gradient(90deg, ${stat.color}, ${stat.color}88)`, borderRadius: 2, transition: "width 1s ease" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>
          <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: "24px", backdropFilter: "blur(10px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Uso de Creditos</h3>
                <p style={{ fontSize: 12, color: THEME.textMuted, margin: 0 }}>Ultimos 7 dias</p>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: THEME.purple }} /><span style={{ fontSize: 12, color: THEME.textMuted }}>Fast</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: THEME.blue }} /><span style={{ fontSize: 12, color: THEME.textMuted }}>Premium</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={usageData.length > 0 ? usageData : [{ day: "—", fast: 0, premium: 0 }]}>
                <defs>
                  <linearGradient id="fastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.purple} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={THEME.purple} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="premiumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.blue} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={THEME.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: THEME.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: THEME.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="fast" name="Fast" stroke={THEME.purple} strokeWidth={2} fill="url(#fastGrad)" />
                <Area type="monotone" dataKey="premium" name="Premium" stroke={THEME.blue} strokeWidth={2} fill="url(#premiumGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: "24px", backdropFilter: "blur(10px)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Top Produtos</h3>
            <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 20px" }}>Mais provados esta semana</p>
            {topProducts.length === 0 ? (
              <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: THEME.textMuted, fontSize: 13, textAlign: "center" }}>
                Nenhum try-on<br />esta semana ainda
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: THEME.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: THEME.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="tryons" name="Try-ons" fill={THEME.purple} radius={[0, 4, 4, 0]}>
                    {topProducts.map((_, index) => (
                      <Cell key={index} fill={`rgba(139,92,246,${1 - index * 0.15})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* API Key + Install */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: "24px", backdropFilter: "blur(10px)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Sua API Key</h3>
            <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 16px" }}>Use esta chave para integrar o provador na sua loja</p>
            <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "12px 14px", background: "rgba(0,0,0,0.3)", borderRadius: 8, border: `1px solid ${THEME.border}`, marginBottom: 12 }}>
              <code style={{ flex: 1, fontFamily: "monospace", fontSize: 12, color: THEME.purpleLight, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {showApiKey ? merchant.api_key : "tk_••••••••••••••••••••••••••••••••"}
              </code>
              <button onClick={() => setShowApiKey(!showApiKey)} style={{ padding: "5px 10px", background: "transparent", color: THEME.textMuted, border: `1px solid ${THEME.border}`, borderRadius: 5, cursor: "pointer", fontSize: 11, whiteSpace: "nowrap", fontFamily: "inherit" }}>
                {showApiKey ? "Ocultar" : "Mostrar"}
              </button>
              <button onClick={copyApiKey} style={{ padding: "5px 10px", background: copied ? THEME.green : THEME.purple, color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", transition: "background 0.2s", fontFamily: "inherit" }}>
                {copied ? "✓ Copiado" : "Copiar"}
              </button>
            </div>
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 14, border: `1px solid ${THEME.border}` }}>
              <p style={{ fontSize: 11, color: THEME.textMuted, margin: "0 0 8px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>Instalacao Shopify</p>
              <pre style={{ fontSize: 11, color: THEME.purpleLight, margin: 0, overflow: "auto", lineHeight: 1.6, fontFamily: "monospace" }}>
{`<script>
  window.ReflexyConfig = {
    apiKey: "${showApiKey ? merchant.api_key : 'SUA_API_KEY'}",
  };
</script>
<script src="https://reflexy.co/virtual-tryon.js"></script>`}
              </pre>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: "24px", backdropFilter: "blur(10px)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Acoes Rapidas</h3>
            <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 20px" }}>Acesse as principais funcionalidades</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { title: "Ver Analytics Completo", desc: "Funil, produtos e comportamento dos clientes", href: "/analytics", color: THEME.blue, icon: "◈" },
                { title: "Estudio Profissional", desc: "Gere fotos de produto com IA em segundos", href: "/admin", color: THEME.purple, icon: "◉" },
                { title: "Fazer Upgrade de Plano", desc: "Mais creditos e recursos avancados", href: "/pricing", color: THEME.orange, icon: "◇" },
              ].map((action, i) => (
                <Link key={i} href={action.href} style={{ textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10, border: `1px solid ${THEME.border}`, background: "rgba(255,255,255,0.02)", cursor: "pointer" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${action.color}22`, border: `1px solid ${action.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: action.color, flexShrink: 0 }}>
                      {action.icon}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 2px", color: THEME.text }}>{action.title}</h4>
                      <p style={{ fontSize: 11, color: THEME.textMuted, margin: 0 }}>{action.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 3px; }
      `}</style>
    </div>
  );
}
