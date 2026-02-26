"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const THEME = {
  bg: "#ffffff",
  bgGray: "#fafafa",
  text: "#333333",
  textMuted: "#666666",
  textLight: "#999999",
  border: "#e0e0e0",
  buttonBg: "#000000",
  buttonText: "#ffffff",
  error: "#dc2626",
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

      if (!freePlan) {
        console.error("Free plan not found");
        return;
      }

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

      if (error) {
        console.error("Error creating merchant:", error);
        return;
      }

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
            width: 40,
            height: 40,
            border: `3px solid ${THEME.border}`,
            borderTopColor: THEME.text,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }} />
          <p style={{ color: THEME.textMuted, fontSize: 14 }}>Carregando...</p>
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
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: THEME.text }}>
            Erro ao carregar dados
          </h2>
          <p style={{ color: THEME.textMuted, marginBottom: 24, fontSize: 15 }}>
            Não foi possível carregar seus dados. Por favor, tente novamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px",
              background: THEME.buttonBg,
              color: THEME.buttonText,
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 15,
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
        background: THEME.bg,
        borderBottom: `1px solid ${THEME.border}`,
        padding: "20px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{
          fontSize: 22,
          fontWeight: 700,
          color: THEME.text,
          letterSpacing: "-0.5px",
        }}>
          Reflexy
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Link href="/analytics" style={{
            color: THEME.text,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 15,
          }}>
            Analytics
          </Link>
          <Link href="/admin" style={{
            color: THEME.text,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 15,
          }}>
            Estúdio
          </Link>
          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              color: THEME.textMuted,
              border: "none",
              fontWeight: 500,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>
        {/* Welcome */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px", color: THEME.text, letterSpacing: "-0.5px" }}>
            Bem-vindo, {merchant.store_name || merchant.email.split('@')[0]}
          </h1>
          <p style={{ fontSize: 15, margin: 0, color: THEME.textMuted }}>
            Plano: <strong style={{ color: THEME.text }}>{merchant.plan_name}</strong> • Status: <strong style={{ color: THEME.text }}>{merchant.subscription_status === "active" ? "Ativo" : "Inativo"}</strong>
          </p>
        </div>

        {/* Credits */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}>
          <div style={{
            background: THEME.bg,
            padding: 28,
            borderRadius: 8,
            border: `1px solid ${THEME.border}`,
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: THEME.textMuted, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Créditos Fast
            </h3>
            <div style={{ fontSize: 36, fontWeight: 800, color: THEME.text, marginBottom: 6 }}>
              {merchant.fast_credits_remaining}
            </div>
            <p style={{ fontSize: 13, color: THEME.textMuted, margin: 0 }}>
              {merchant.fast_credits_used_total} usados no total
            </p>
          </div>

          <div style={{
            background: THEME.bg,
            padding: 28,
            borderRadius: 8,
            border: `1px solid ${THEME.border}`,
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: THEME.textMuted, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Créditos Premium
            </h3>
            <div style={{ fontSize: 36, fontWeight: 800, color: THEME.text, marginBottom: 6 }}>
              {merchant.premium_credits_remaining}
            </div>
            <p style={{ fontSize: 13, color: THEME.textMuted, margin: 0 }}>
              {merchant.premium_credits_used_total} usados no total
            </p>
          </div>
        </div>

        {/* API Key */}
        <div style={{
          background: THEME.bg,
          padding: 28,
          borderRadius: 8,
          border: `1px solid ${THEME.border}`,
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: THEME.text }}>
            Sua API Key
          </h2>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginBottom: 16 }}>
            Use esta chave para integrar o provador virtual na sua loja Shopify.
          </p>
          <div style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: 14,
            background: THEME.bgGray,
            borderRadius: 6,
            border: `1px solid ${THEME.border}`,
          }}>
            <code style={{
              flex: 1,
              fontFamily: "monospace",
              fontSize: 13,
              color: THEME.text,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {showApiKey ? merchant.api_key : "••••••••••••••••••••••••••••••••"}
            </code>
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              style={{
                padding: "8px 14px",
                background: "transparent",
                color: THEME.text,
                border: `1px solid ${THEME.border}`,
                borderRadius: 4,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {showApiKey ? "Ocultar" : "Mostrar"}
            </button>
            <button
              onClick={copyApiKey}
              style={{
                padding: "8px 14px",
                background: THEME.buttonBg,
                color: THEME.buttonText,
                border: "none",
                borderRadius: 4,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {copied ? "✓ Copiado" : "Copiar"}
            </button>
          </div>
        </div>

        {/* Installation */}
        <div style={{
          background: THEME.bg,
          padding: 28,
          borderRadius: 8,
          border: `1px solid ${THEME.border}`,
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: THEME.text }}>
            Como instalar na sua loja
          </h2>
          <ol style={{ paddingLeft: 20, color: THEME.text, lineHeight: 1.8, fontSize: 15 }}>
            <li>Acesse o painel admin da sua loja Shopify</li>
            <li>Vá em <strong>Online Store → Themes → Edit Code</strong></li>
            <li>Abra o arquivo <code style={{ background: THEME.bgGray, padding: "2px 6px", borderRadius: 3 }}>theme.liquid</code></li>
            <li>Cole este código antes do <code style={{ background: THEME.bgGray, padding: "2px 6px", borderRadius: 3 }}>&lt;/body&gt;</code>:</li>
          </ol>
          <pre style={{
            background: "#1a1a1a",
            color: "#e0e0e0",
            padding: 18,
            borderRadius: 6,
            overflow: "auto",
            fontSize: 13,
            marginTop: 16,
            border: `1px solid ${THEME.border}`,
          }}>
{`<script>
  window.ReflexyConfig = {
    apiKey: "${merchant.api_key}",
  };
</script>
<script src="https://tryon-app-tau.vercel.app/virtual-tryon.js"></script>`}
          </pre>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}>
          <Link href="/admin" style={{
            background: THEME.bg,
            padding: 28,
            borderRadius: 8,
            border: `1px solid ${THEME.border}`,
            textDecoration: "none",
            display: "block",
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: THEME.text, marginBottom: 8 }}>
              Estúdio Profissional
            </h3>
            <p style={{ fontSize: 14, color: THEME.textMuted, margin: 0 }}>
              Gere fotos profissionais com IA
            </p>
          </Link>

          <div style={{
            background: THEME.bgGray,
            padding: 28,
            borderRadius: 8,
            border: `1px solid ${THEME.border}`,
            opacity: 0.5,
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: THEME.text, marginBottom: 8 }}>
              Analytics
            </h3>
            <p style={{ fontSize: 14, color: THEME.textMuted, margin: 0 }}>
              Em breve
            </p>
          </div>

          <div style={{
            background: THEME.bgGray,
            padding: 28,
            borderRadius: 8,
            border: `1px solid ${THEME.border}`,
            opacity: 0.5,
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: THEME.text, marginBottom: 8 }}>
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
