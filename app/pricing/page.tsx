"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const plans = [
  {
    slug: "free",
    name: "Free",
    priceBRL: 0,
    priceUSD: 0,
    fastCredits: 100,
    premiumCredits: 0,
    features: [
      "100 try-ons rápidos/mês",
      "Modo Premium: não incluso",
      'Logo "Powered by Reflexy"',
      "Suporte por email",
    ],
    cta: "Começar Grátis",
    highlight: false,
  },
  {
    slug: "starter",
    name: "Starter",
    priceBRL: 99,
    priceUSD: 19,
    fastCredits: 500,
    premiumCredits: 10,
    features: [
      "500 try-ons rápidos/mês",
      "10 fotos Premium/mês",
      "Sem logo Reflexy",
      "Suporte prioritário",
      "Analytics básico",
    ],
    cta: "Assinar Starter",
    highlight: false,
  },
  {
    slug: "pro",
    name: "Pro",
    priceBRL: 249,
    priceUSD: 49,
    fastCredits: 2000,
    premiumCredits: 50,
    features: [
      "2.000 try-ons rápidos/mês",
      "50 fotos Premium/mês",
      "Sem logo Reflexy",
      "Suporte prioritário",
      "Analytics avançado",
      "API access",
    ],
    cta: "Assinar Pro",
    highlight: true,
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    priceBRL: 599,
    priceUSD: 119,
    fastCredits: 999999,
    premiumCredits: 300,
    features: [
      "Try-ons rápidos ilimitados",
      "300 fotos Premium/mês",
      "White-label completo",
      "Suporte dedicado",
      "Analytics completo",
      "API customizada",
      "SLA garantido",
    ],
    cta: "Falar com Vendas",
    highlight: false,
  },
];

export default function PricingPage() {
  const [currency, setCurrency] = useState<"BRL" | "USD">("BRL");
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check for payment status in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "cancelled") {
      setMessage("Pagamento cancelado. Você pode tentar novamente quando quiser.");
    }

    // Get current user
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
      });
    }
  }, []);

  const handleSelectPlan = async (planSlug: string) => {
    if (planSlug === "free") {
      window.location.href = "/signup?plan=free";
      return;
    }

    if (planSlug === "enterprise") {
      window.location.href = "mailto:hello@reflexy.co?subject=Enterprise Plan";
      return;
    }

    if (!user) {
      window.location.href = `/signup?plan=${planSlug}`;
      return;
    }

    setLoading(planSlug);

    try {
      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planSlug,
          userId: user.id,
          userEmail: user.email,
          locale: currency === "BRL" ? "pt" : "en",
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage(data.error || "Erro ao processar pagamento. Tente novamente.");
      }
    } catch (error) {
      setMessage("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      color: "#ffffff",
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Header */}
      <header style={{
        padding: "20px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <img src="/logos/logo-horizontal-dark.png" alt="Reflexy" style={{ height: "32px", width: "auto" }} />
        </a>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {user ? (
            <a href="/dashboard" style={{
              padding: "8px 20px",
              background: "#7B2FFF",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
            }}>Dashboard</a>
          ) : (
            <>
              <a href="/login" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "14px" }}>Entrar</a>
              <a href="/signup" style={{
                padding: "8px 20px",
                background: "#7B2FFF",
                color: "#fff",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,
              }}>Criar conta</a>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "80px 40px 60px" }}>
        <div style={{
          display: "inline-block",
          padding: "6px 16px",
          background: "rgba(123,47,255,0.15)",
          border: "1px solid rgba(123,47,255,0.3)",
          borderRadius: "100px",
          fontSize: "13px",
          color: "#a78bfa",
          marginBottom: "24px",
          letterSpacing: "0.05em",
        }}>
          7 dias grátis em qualquer plano pago
        </div>
        <h1 style={{
          fontSize: "clamp(36px, 5vw, 56px)",
          fontWeight: 800,
          margin: "0 0 16px",
          letterSpacing: "-0.02em",
        }}>
          Planos simples.<br />
          <span style={{ color: "#7B2FFF" }}>Resultados reais.</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "18px", maxWidth: "500px", margin: "0 auto 40px" }}>
          Escolha o plano ideal para o tamanho da sua loja. Cancele quando quiser.
        </p>

        {/* Currency Toggle */}
        <div style={{
          display: "inline-flex",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "100px",
          padding: "4px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          {(["BRL", "USD"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              style={{
                padding: "8px 24px",
                borderRadius: "100px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                transition: "all 0.2s",
                background: currency === c ? "#7B2FFF" : "transparent",
                color: currency === c ? "#fff" : "rgba(255,255,255,0.5)",
              }}
            >
              {c === "BRL" ? "🇧🇷 BRL" : "🌍 USD"}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          maxWidth: "600px",
          margin: "0 auto 24px",
          padding: "16px 24px",
          background: "rgba(255,100,100,0.1)",
          border: "1px solid rgba(255,100,100,0.3)",
          borderRadius: "12px",
          color: "#ff8080",
          textAlign: "center",
          fontSize: "14px",
        }}>
          {message}
        </div>
      )}

      {/* Plans Grid */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 40px 100px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "20px",
      }}>
        {plans.map((plan) => (
          <div
            key={plan.slug}
            style={{
              background: plan.highlight
                ? "rgba(123,47,255,0.12)"
                : "rgba(255,255,255,0.04)",
              border: plan.highlight
                ? "1px solid rgba(123,47,255,0.5)"
                : "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              padding: "32px",
              position: "relative",
              backdropFilter: "blur(10px)",
              transition: "transform 0.2s",
            }}
          >
            {plan.highlight && (
              <div style={{
                position: "absolute",
                top: "-12px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#7B2FFF",
                color: "#fff",
                padding: "4px 16px",
                borderRadius: "100px",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
              }}>
                MAIS POPULAR
              </div>
            )}

            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>
                {plan.name}
              </h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontSize: "42px", fontWeight: 800, color: "#fff" }}>
                  {currency === "BRL"
                    ? plan.priceBRL === 0 ? "Grátis" : `R$${plan.priceBRL}`
                    : plan.priceUSD === 0 ? "Free" : `$${plan.priceUSD}`}
                </span>
                {(currency === "BRL" ? plan.priceBRL : plan.priceUSD) > 0 && (
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>/mês</span>
                )}
              </div>
            </div>

            {/* Credits */}
            <div style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>Try-ons Rápidos</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "13px" }}>
                  {plan.fastCredits >= 999999 ? "∞" : plan.fastCredits.toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>Fotos Premium</span>
                <span style={{ color: plan.premiumCredits > 0 ? "#a78bfa" : "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: "13px" }}>
                  {plan.premiumCredits === 0 ? "—" : plan.premiumCredits}
                </span>
              </div>
            </div>

            {/* Features */}
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {plan.features.map((feature, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "rgba(255,255,255,0.75)" }}>
                  <span style={{ color: "#7B2FFF", fontSize: "16px", flexShrink: 0 }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button
              onClick={() => handleSelectPlan(plan.slug)}
              disabled={loading === plan.slug}
              style={{
                width: "100%",
                padding: "14px",
                background: plan.highlight ? "#7B2FFF" : "rgba(255,255,255,0.08)",
                color: "#fff",
                border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.15)",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: loading === plan.slug ? "not-allowed" : "pointer",
                opacity: loading === plan.slug ? 0.7 : 1,
                transition: "all 0.2s",
                letterSpacing: "0.02em",
              }}
            >
              {loading === plan.slug ? "Processando..." : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ / Trust */}
      <div style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "0 40px 100px",
        textAlign: "center",
      }}>
        <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "40px", color: "#fff" }}>
          Perguntas frequentes
        </h2>
        {[
          { q: "Posso cancelar a qualquer momento?", a: "Sim. Não há fidelidade. Cancele quando quiser diretamente no dashboard." },
          { q: "Os créditos acumulam?", a: "Não. Os créditos são renovados mensalmente. Créditos não utilizados não passam para o mês seguinte." },
          { q: "Existe período de teste?", a: "Sim! Todo plano pago inclui 7 dias grátis. Você só é cobrado após o período de teste." },
          { q: "Como funciona o pagamento?", a: "Pagamento seguro via cartão de crédito (Stripe). Para clientes brasileiros, também aceitamos PIX e boleto." },
        ].map((item, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "12px",
            textAlign: "left",
          }}>
            <p style={{ fontWeight: 700, margin: "0 0 8px", color: "#fff", fontSize: "15px" }}>{item.q}</p>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: 1.6 }}>{item.a}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "32px 40px",
        textAlign: "center",
        color: "rgba(255,255,255,0.4)",
        fontSize: "13px",
      }}>
        <p style={{ margin: 0 }}>© 2025 Reflexy. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
