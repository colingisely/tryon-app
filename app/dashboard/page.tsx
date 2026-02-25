"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const THEME = {
  primary: "#667eea",
  primaryDark: "#764ba2",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  text: "#1e293b",
  textMuted: "#64748b",
  border: "#e2e8f0",
  bg: "#f8fafc",
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

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

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
      // Get merchant data with plan info
      const { data, error } = await supabase!
        .from("merchants")
        .select(`
          *,
          plans:plan_id (name)
        `)
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error loading merchant:", error);
        // If merchant doesn't exist, create it
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

      // Get Free plan ID
      const { data: freePlan } = await supabase!
        .from("plans")
        .select("id, fast_credits_monthly, premium_credits_monthly")
        .eq("slug", "free")
        .single();

      if (!freePlan) {
        console.error("Free plan not found");
        return;
      }

      // Generate API key
      const apiKey = `tk_${Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')}`;

      // Create merchant
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

      if (error) {
        console.error("Error creating merchant:", error);
        return;
      }

      // Reload data
      await loadMerchantData(userId);
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
            width: 48,
            height: 48,
            border: `4px solid ${THEME.border}`,
            borderTopColor: THEME.primary,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px",
          }} />
          <p style={{ color: THEME.textMuted }}>Carregando...</p>
        </div>
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
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, color: THEME.text }}>
            Erro ao carregar dados
          </h2>
          <p style={{ color: THEME.textMuted, marginBottom: 24 }}>
            Não foi possível carregar seus dados. Por favor, tente novamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px",
              background: THEME.primary,
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: THEME.bg,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* Header */}
      <header style={{
        background: "white",
        borderBottom: `1px solid ${THEME.border}`,
        padding: "20px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryDark})`,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 800,
            fontSize: 20,
          }}>
            T
          </div>
          <span style={{ fontSize: 24, fontWeight: 800, color: THEME.text }}>TryOn</span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/admin" style={{
            padding: "10px 20px",
            color: THEME.text,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 15,
          }}>
            📸 Estúdio
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              background: "transparent",
              color: THEME.textMuted,
              border: "none",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        {/* Welcome Banner */}
        <div style={{
          background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryDark})`,
          color: "white",
          padding: 40,
          borderRadius: 20,
          marginBottom: 32,
        }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px" }}>
            Bem-vindo, {merchant.store_name || merchant.email}! 👋
          </h1>
          <p style={{ fontSize: 18, margin: 0, opacity: 0.9 }}>
            Plano: <strong>{merchant.plan_name}</strong> • Status: <strong>{merchant.subscription_status === "active" ? "Ativo" : "Inativo"}</strong>
          </p>
        </div>

        {/* Credits Overview */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
          marginBottom: 32,
        }}>
          <div style={{
            background: "white",
            padding: 32,
            borderRadius: 16,
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: THEME.textMuted, margin: "0 0 8px" }}>
              Créditos Fast
            </h3>
            <div style={{ fontSize: 36, fontWeight: 900, color: THEME.text, marginBottom: 8 }}>
              {merchant.fast_credits_remaining}
            </div>
            <p style={{ fontSize: 14, color: THEME.textMuted, margin: 0 }}>
              {merchant.fast_credits_used_total} usados no total
            </p>
          </div>

          <div style={{
            background: "white",
            padding: 32,
            borderRadius: 16,
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: THEME.textMuted, margin: "0 0 8px" }}>
              Créditos Premium
            </h3>
            <div style={{ fontSize: 36, fontWeight: 900, color: THEME.text, marginBottom: 8 }}>
              {merchant.premium_credits_remaining}
            </div>
            <p style={{ fontSize: 14, color: THEME.textMuted, margin: 0 }}>
              {merchant.premium_credits_used_total} usados no total
            </p>
          </div>
        </div>

        {/* API Key Section */}
        <div style={{
          background: "white",
          padding: 32,
          borderRadius: 16,
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: THEME.text }}>
            🔑 Sua API Key
          </h2>
          <p style={{ fontSize: 15, color: THEME.textMuted, marginBottom: 16 }}>
            Use esta chave para integrar o provador virtual na sua loja Shopify.
          </p>
          <div style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: 16,
            background: THEME.bg,
            borderRadius: 12,
            border: `2px solid ${THEME.border}`,
          }}>
            <code style={{
              flex: 1,
              fontFamily: "monospace",
              fontSize: 14,
              color: THEME.text,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {showApiKey ? merchant.api_key : "••••••••••••••••••••••••••••••••"}
            </code>
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              style={{
                padding: "8px 16px",
                background: "transparent",
                color: THEME.primary,
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              {showApiKey ? "Ocultar" : "Mostrar"}
            </button>
            <button
              onClick={copyApiKey}
              style={{
                padding: "8px 16px",
                background: THEME.primary,
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              {copied ? "✓ Copiado!" : "Copiar"}
            </button>
          </div>
        </div>

        {/* Installation Instructions */}
        <div style={{
          background: "white",
          padding: 32,
          borderRadius: 16,
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: THEME.text }}>
            📦 Como instalar na sua loja
          </h2>
          <ol style={{ paddingLeft: 20, color: THEME.text, lineHeight: 1.8 }}>
            <li>Acesse o painel admin da sua loja Shopify</li>
            <li>Vá em <strong>Online Store → Themes → Edit Code</strong></li>
            <li>Abra o arquivo <code>theme.liquid</code></li>
            <li>Cole este código antes do <code>&lt;/body&gt;</code>:</li>
          </ol>
          <pre style={{
            background: "#1e293b",
            color: "#e2e8f0",
            padding: 20,
            borderRadius: 12,
            overflow: "auto",
            fontSize: 13,
            marginTop: 16,
          }}>
{`<script>
  window.TryOnConfig = {
    apiKey: "${merchant.api_key}",
  };
</script>
<script src="https://tryon-app-tau.vercel.app/virtual-tryon.js"></script>`}
          </pre>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
        }}>
          <Link href="/admin" style={{
            background: "white",
            padding: 32,
            borderRadius: 16,
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            textDecoration: "none",
            display: "block",
            transition: "transform 0.2s",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: THEME.text, marginBottom: 8 }}>
              Estúdio Profissional
            </h3>
            <p style={{ fontSize: 14, color: THEME.textMuted, margin: 0 }}>
              Gere fotos profissionais com IA
            </p>
          </Link>

          <div style={{
            background: "white",
            padding: 32,
            borderRadius: 16,
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            opacity: 0.6,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: THEME.text, marginBottom: 8 }}>
              Analytics
            </h3>
            <p style={{ fontSize: 14, color: THEME.textMuted, margin: 0 }}>
              Em breve
            </p>
          </div>

          <div style={{
            background: "white",
            padding: 32,
            borderRadius: 16,
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            opacity: 0.6,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: THEME.text, marginBottom: 8 }}>
              Fazer Upgrade
            </h3>
            <p style={{ fontSize: 14, color: THEME.textMuted, margin: 0 }}>
              Em breve
            </p>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
