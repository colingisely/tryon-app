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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
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

// Mock data for charts (will be replaced with real analytics data)
const usageData = [
  { day: "Seg", fast: 12, premium: 2 },
  { day: "Ter", fast: 19, premium: 4 },
  { day: "Qua", fast: 8, premium: 1 },
  { day: "Qui", fast: 25, premium: 6 },
  { day: "Sex", fast: 31, premium: 8 },
  { day: "Sáb", fast: 18, premium: 3 },
  { day: "Dom", fast: 14, premium: 2 },
];

const conversionData = [
  { name: "Visualizaram", value: 100, color: THEME.purple },
  { name: "Fizeram Try-On", value: 62, color: THEME.purpleLight },
  { name: "Adicionaram ao Carrinho", value: 38, color: THEME.blue },
  { name: "Compraram", value: 21, color: THEME.green },
];

const topProducts = [
  { name: "Vestido Floral", tryons: 48 },
  { name: "Blusa Listrada", tryons: 36 },
  { name: "Calça Jeans", tryons: 29 },
  { name: "Jaqueta Couro", tryons: 22 },
  { name: "Saia Midi", tryons: 18 },
];

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
  const [activeNav, setActiveNav] = useState("dashboard");

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    if (!supabase) {
      router.push("/login");
      return;
    }
    const { data: { user } } = await supabase!.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    await loadMerchantData(user.id);
  }

  async function loadMerchantData(userId: string) {
    if (!supabase) return;
    try {
      const { data, error } = await supabase!
        .from("merchants")
        .select(`*, plans:plan_id (name)`)
        .eq("id", userId)
        .single();

      if (error) {
        await createMerchant(userId);
        return;
      }

      setMerchant({
        email: data.email,
        store_name: data.store_name,
        store_url: data.store_url,
        api_key: data.api_key,
        plan_name: data.plans?.name || "Free",
        subscription_status: data.subscription_status,
        fast_credits_remaining: data.fast_credits_remaining,
        premium_credits_remaining: data.premium_credits_remaining,
        fast_credits_used_total: data.fast_credits_used_total,
        premium_credits_used_total: data.premium_credits_used_total,
      });
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
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

      const apiKey = `tk_${Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')}`;

      const { error } = await supabase!
        .from("merchants")
        .insert({
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

  const fastUsagePercent = merchant
    ? Math.round((merchant.fast_credits_used_total / (merchant.fast_credits_remaining + merchant.fast_credits_used_total || 1)) * 100)
    : 0;

  const premiumUsagePercent = merchant
    ? Math.round((merchant.premium_credits_used_total / (merchant.premium_credits_remaining + merchant.premium_credits_used_total || 1)) * 100)
    : 0;

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: THEME.bg,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 44,
            height: 44,
            border: `2px solid rgba(139,92,246,0.2)`,
            borderTopColor: THEME.purple,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
            boxShadow: `0 0 20px ${THEME.purpleGlow}`,
          }} />
          <p style={{ color: THEME.textMuted, fontSize: 14 }}>Carregando...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: THEME.bg,
      }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: THEME.text }}>Erro ao carregar dados</h2>
          <p style={{ color: THEME.textMuted, marginBottom: 24, fontSize: 15 }}>Não foi possível carregar seus dados.</p>
          <button onClick={() => window.location.reload()} style={{
            padding: "12px 24px",
            background: THEME.purple,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 15,
          }}>Recarregar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: THEME.bg,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: THEME.text,
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "fixed",
        top: -200,
        left: "50%",
        transform: "translateX(-50%)",
        width: 800,
        height: 400,
        background: "radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Sidebar */}
      <div style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: 240,
        background: "rgba(10,10,20,0.95)",
        borderRight: `1px solid ${THEME.border}`,
        backdropFilter: "blur(20px)",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        padding: "24px 0",
      }}>
        {/* Logo */}
        <div style={{ padding: "0 24px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo-symbol-white.png" alt="Reflexy" style={{ width: 28, height: 28 }} onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }} />
            <span style={{
              fontSize: 20,
              fontWeight: 700,
              color: THEME.text,
              letterSpacing: "-0.5px",
            }}>Reflexy</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0 12px" }}>
          {[
            { id: "dashboard", label: "Dashboard", icon: "⊞", href: "/dashboard" },
            { id: "analytics", label: "Analytics", icon: "◈", href: "/analytics" },
            { id: "studio", label: "Estúdio Pro", icon: "◉", href: "/admin" },
            { id: "pricing", label: "Planos", icon: "◇", href: "/pricing" },
          ].map(item => (
            <Link key={item.id} href={item.href} style={{ textDecoration: "none" }}>
              <div
                onClick={() => setActiveNav(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  borderRadius: 8,
                  marginBottom: 4,
                  cursor: "pointer",
                  background: activeNav === item.id ? THEME.bgGlass : "transparent",
                  border: activeNav === item.id ? `1px solid ${THEME.borderPurple}` : "1px solid transparent",
                  color: activeNav === item.id ? THEME.purpleLight : THEME.textMuted,
                  fontSize: 14,
                  fontWeight: activeNav === item.id ? 600 : 400,
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div style={{
          padding: "16px 16px 0",
          borderTop: `1px solid ${THEME.border}`,
        }}>
          <div style={{
            padding: "12px 14px",
            borderRadius: 8,
            background: THEME.bgCard,
            marginBottom: 8,
          }}>
            <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 2px" }}>Logado como</p>
            <p style={{ fontSize: 13, color: THEME.text, margin: 0, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {merchant.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "transparent",
              color: THEME.textMuted,
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
              fontWeight: 500,
              fontSize: 13,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* Main content */}
      <main style={{
        marginLeft: 240,
        padding: "40px 40px",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.5px" }}>
                Olá, {merchant.store_name || merchant.email.split('@')[0]} 👋
              </h1>
              <p style={{ fontSize: 14, margin: 0, color: THEME.textMuted }}>
                Aqui está o resumo da sua loja hoje.
              </p>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              background: THEME.bgGlass,
              border: `1px solid ${THEME.borderPurple}`,
              borderRadius: 20,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: THEME.green, boxShadow: `0 0 8px ${THEME.green}` }} />
              <span style={{ fontSize: 13, color: THEME.purpleLight, fontWeight: 500 }}>
                Plano {merchant.plan_name} • Ativo
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 28,
        }}>
          {[
            {
              label: "Créditos Fast",
              value: merchant.fast_credits_remaining,
              sub: `${merchant.fast_credits_used_total} usados`,
              color: THEME.purple,
              percent: fastUsagePercent,
              icon: "⚡",
            },
            {
              label: "Créditos Premium",
              value: merchant.premium_credits_remaining,
              sub: `${merchant.premium_credits_used_total} usados`,
              color: THEME.blue,
              percent: premiumUsagePercent,
              icon: "✦",
            },
            {
              label: "Try-Ons Esta Semana",
              value: usageData.reduce((a, b) => a + b.fast + b.premium, 0),
              sub: "+18% vs semana anterior",
              color: THEME.green,
              percent: 72,
              icon: "◈",
            },
            {
              label: "Taxa de Conversão",
              value: "21%",
              sub: "Try-on → Compra",
              color: THEME.orange,
              percent: 21,
              icon: "◇",
            },
          ].map((stat, i) => (
            <div key={i} style={{
              background: THEME.bgCard,
              border: `1px solid ${THEME.border}`,
              borderRadius: 12,
              padding: "22px 22px",
              backdropFilter: "blur(10px)",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
                opacity: 0.6,
              }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <p style={{ fontSize: 12, color: THEME.textMuted, margin: 0, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>
                  {stat.label}
                </p>
                <span style={{ fontSize: 18, opacity: 0.7 }}>{stat.icon}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 6, color: THEME.text }}>
                {stat.value}
              </div>
              <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 12px" }}>{stat.sub}</p>
              {/* Progress bar */}
              <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                <div style={{
                  height: "100%",
                  width: `${stat.percent}%`,
                  background: `linear-gradient(90deg, ${stat.color}, ${stat.color}88)`,
                  borderRadius: 2,
                  transition: "width 1s ease",
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 20,
          marginBottom: 24,
        }}>
          {/* Usage Area Chart */}
          <div style={{
            background: THEME.bgCard,
            border: `1px solid ${THEME.border}`,
            borderRadius: 12,
            padding: "24px",
            backdropFilter: "blur(10px)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Uso de Créditos</h3>
                <p style={{ fontSize: 12, color: THEME.textMuted, margin: 0 }}>Últimos 7 dias</p>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: THEME.purple }} />
                  <span style={{ fontSize: 12, color: THEME.textMuted }}>Fast</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: THEME.blue }} />
                  <span style={{ fontSize: 12, color: THEME.textMuted }}>Premium</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={usageData}>
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

          {/* Conversion Funnel */}
          <div style={{
            background: THEME.bgCard,
            border: `1px solid ${THEME.border}`,
            borderRadius: 12,
            padding: "24px",
            backdropFilter: "blur(10px)",
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Funil de Conversão</h3>
            <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 20px" }}>Esta semana</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {conversionData.map((item, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: THEME.textMuted }}>{item.name}</span>
                    <span style={{ fontSize: 12, color: item.color, fontWeight: 600 }}>{item.value}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                    <div style={{
                      height: "100%",
                      width: `${item.value}%`,
                      background: item.color,
                      borderRadius: 3,
                      boxShadow: `0 0 8px ${item.color}66`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 24,
        }}>
          {/* Top Products Bar Chart */}
          <div style={{
            background: THEME.bgCard,
            border: `1px solid ${THEME.border}`,
            borderRadius: 12,
            padding: "24px",
            backdropFilter: "blur(10px)",
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Produtos Mais Provados</h3>
            <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 20px" }}>Top 5 esta semana</p>
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
          </div>

          {/* API Key + Install */}
          <div style={{
            background: THEME.bgCard,
            border: `1px solid ${THEME.border}`,
            borderRadius: 12,
            padding: "24px",
            backdropFilter: "blur(10px)",
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Sua API Key</h3>
            <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 16px" }}>
              Use esta chave para integrar o provador na sua loja
            </p>
            <div style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              padding: "12px 14px",
              background: "rgba(0,0,0,0.3)",
              borderRadius: 8,
              border: `1px solid ${THEME.border}`,
              marginBottom: 12,
            }}>
              <code style={{
                flex: 1,
                fontFamily: "monospace",
                fontSize: 12,
                color: THEME.purpleLight,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {showApiKey ? merchant.api_key : "tk_••••••••••••••••••••••••••••••••"}
              </code>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                style={{
                  padding: "5px 10px",
                  background: "transparent",
                  color: THEME.textMuted,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 5,
                  cursor: "pointer",
                  fontSize: 11,
                  whiteSpace: "nowrap",
                }}
              >
                {showApiKey ? "Ocultar" : "Mostrar"}
              </button>
              <button
                onClick={copyApiKey}
                style={{
                  padding: "5px 10px",
                  background: copied ? THEME.green : THEME.purple,
                  color: "#fff",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  transition: "background 0.2s",
                }}
              >
                {copied ? "✓ Copiado" : "Copiar"}
              </button>
            </div>

            <div style={{
              background: "rgba(0,0,0,0.3)",
              borderRadius: 8,
              padding: 14,
              border: `1px solid ${THEME.border}`,
            }}>
              <p style={{ fontSize: 11, color: THEME.textMuted, margin: "0 0 8px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Instalação Shopify
              </p>
              <pre style={{
                fontSize: 11,
                color: THEME.purpleLight,
                margin: 0,
                overflow: "auto",
                lineHeight: 1.6,
                fontFamily: "monospace",
              }}>
{`<script>
  window.ReflexyConfig = {
    apiKey: "${showApiKey ? merchant.api_key : 'SUA_API_KEY'}",
  };
</script>
<script src="https://reflexy.co/virtual-tryon.js"></script>`}
              </pre>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}>
          {[
            {
              title: "Estúdio Profissional",
              desc: "Gere fotos de produto com IA em segundos",
              href: "/admin",
              color: THEME.purple,
              icon: "◉",
              active: true,
            },
            {
              title: "Ver Analytics",
              desc: "Comportamento dos clientes em tempo real",
              href: "/analytics",
              color: THEME.blue,
              icon: "◈",
              active: true,
            },
            {
              title: "Fazer Upgrade",
              desc: "Mais créditos e recursos avançados",
              href: "/pricing",
              color: THEME.orange,
              icon: "◇",
              active: true,
            },
          ].map((action, i) => (
            <Link key={i} href={action.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: THEME.bgCard,
                border: `1px solid ${THEME.border}`,
                borderRadius: 12,
                padding: "20px 22px",
                cursor: "pointer",
                transition: "all 0.2s",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.border = `1px solid ${action.color}44`;
                (e.currentTarget as HTMLDivElement).style.background = `rgba(${action.color === THEME.purple ? '139,92,246' : action.color === THEME.blue ? '59,130,246' : '245,158,11'},0.06)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.border = `1px solid ${THEME.border}`;
                (e.currentTarget as HTMLDivElement).style.background = THEME.bgCard;
              }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${action.color}22`,
                  border: `1px solid ${action.color}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: action.color,
                  flexShrink: 0,
                }}>
                  {action.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 3px", color: THEME.text }}>{action.title}</h4>
                  <p style={{ fontSize: 12, color: THEME.textMuted, margin: 0 }}>{action.desc}</p>
                </div>
              </div>
            </Link>
          ))}
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
