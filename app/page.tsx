"use client";

import Link from "next/link";

const THEME = {
  primary: "#667eea",
  primaryDark: "#764ba2",
  success: "#10b981",
  text: "#1e293b",
  textMuted: "#64748b",
};

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    description: "Perfeito para testar",
    features: [
      "100 try-ons rápidos/mês",
      "0 fotos Premium",
      'Logo "Powered by TryOn"',
      "Suporte por email",
    ],
    cta: "Começar Grátis",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "R$ 99",
    period: "/mês",
    description: "Para lojas em crescimento",
    features: [
      "500 try-ons rápidos/mês",
      "10 fotos Premium/mês",
      "Sem logo",
      "Suporte prioritário",
    ],
    cta: "Começar Agora",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "R$ 249",
    period: "/mês",
    description: "Para lojas estabelecidas",
    features: [
      "2.000 try-ons rápidos/mês",
      "50 fotos Premium/mês",
      "Sem logo",
      "Analytics avançado",
      "Suporte prioritário",
    ],
    cta: "Começar Agora",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "R$ 599",
    period: "/mês",
    description: "Para grandes operações",
    features: [
      "Try-ons ilimitados",
      "300 fotos Premium/mês",
      "White-label",
      "Suporte dedicado",
      "API customizada",
    ],
    cta: "Falar com Vendas",
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <header style={{
        background: "white",
        borderBottom: "1px solid #e2e8f0",
        padding: "20px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 1000,
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
          <Link href="/login" style={{
            padding: "10px 20px",
            color: THEME.text,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 15,
          }}>
            Entrar
          </Link>
          <Link href="/signup" style={{
            padding: "10px 24px",
            background: THEME.primary,
            color: "white",
            textDecoration: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 15,
            transition: "transform 0.2s",
          }}>
            Começar Grátis
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryDark} 100%)`,
        color: "white",
        padding: "120px 40px",
        textAlign: "center",
      }}>
        <h1 style={{
          fontSize: 56,
          fontWeight: 900,
          margin: "0 0 24px",
          lineHeight: 1.1,
        }}>
          Provador Virtual + Estúdio Profissional
        </h1>
        <p style={{
          fontSize: 22,
          margin: "0 auto 40px",
          maxWidth: 700,
          opacity: 0.95,
          lineHeight: 1.6,
        }}>
          Aumente suas vendas com provador virtual para clientes e gere fotos profissionais de produtos com IA
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup" style={{
            padding: "18px 40px",
            background: "white",
            color: THEME.primary,
            textDecoration: "none",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 18,
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          }}>
            🚀 Começar Grátis
          </Link>
          <a href="#pricing" style={{
            padding: "18px 40px",
            background: "rgba(255,255,255,0.2)",
            color: "white",
            textDecoration: "none",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 18,
            border: "2px solid white",
          }}>
            Ver Planos
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "100px 40px", background: "#f8fafc" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{
            fontSize: 42,
            fontWeight: 800,
            textAlign: "center",
            marginBottom: 60,
            color: THEME.text,
          }}>
            Tudo que você precisa em uma plataforma
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 32,
          }}>
            {[
              {
                icon: "👗",
                title: "Provador Virtual",
                description: "Seus clientes experimentam roupas virtualmente antes de comprar, reduzindo devoluções e aumentando conversão.",
              },
              {
                icon: "📸",
                title: "Fotos Profissionais",
                description: "Gere fotos de produtos com modelos reais usando IA. Economize milhares em sessões fotográficas.",
              },
              {
                icon: "⚡",
                title: "Instalação em 2 Minutos",
                description: "Copie e cole um código na sua loja Shopify. Sem complicação, sem desenvolvedor.",
              },
              {
                icon: "📊",
                title: "Analytics Completo",
                description: "Veja quantos clientes usaram o provador, quais produtos mais convertem e muito mais.",
              },
              {
                icon: "🎨",
                title: "Personalizável",
                description: "Adapte cores, textos e branding para combinar perfeitamente com sua loja.",
              },
              {
                icon: "🔒",
                title: "Seguro e Privado",
                description: "Fotos dos clientes não são armazenadas. Processamento seguro e privacidade garantida.",
              },
            ].map((feature, i) => (
              <div key={i} style={{
                background: "white",
                padding: 32,
                borderRadius: 16,
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{feature.icon}</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: THEME.text }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: 16, color: THEME.textMuted, lineHeight: 1.6, margin: 0 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: "100px 40px", background: "white" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{
            fontSize: 42,
            fontWeight: 800,
            textAlign: "center",
            marginBottom: 16,
            color: THEME.text,
          }}>
            Planos para todos os tamanhos
          </h2>
          <p style={{
            fontSize: 18,
            textAlign: "center",
            color: THEME.textMuted,
            marginBottom: 60,
          }}>
            Comece grátis e escale conforme sua loja cresce
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}>
            {plans.map((plan, i) => (
              <div key={i} style={{
                background: plan.highlighted ? `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryDark})` : "white",
                color: plan.highlighted ? "white" : THEME.text,
                padding: 40,
                borderRadius: 20,
                border: plan.highlighted ? "none" : "2px solid #e2e8f0",
                boxShadow: plan.highlighted ? "0 20px 40px rgba(102, 126, 234, 0.3)" : "0 4px 6px rgba(0,0,0,0.05)",
                position: "relative",
                transform: plan.highlighted ? "scale(1.05)" : "scale(1)",
              }}>
                {plan.highlighted && (
                  <div style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: THEME.success,
                    color: "white",
                    padding: "6px 20px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700,
                  }}>
                    MAIS POPULAR
                  </div>
                )}
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{plan.name}</h3>
                <p style={{
                  fontSize: 14,
                  opacity: 0.8,
                  marginBottom: 24,
                }}>
                  {plan.description}
                </p>
                <div style={{ marginBottom: 32 }}>
                  <span style={{ fontSize: 48, fontWeight: 900 }}>{plan.price}</span>
                  <span style={{ fontSize: 16, opacity: 0.8 }}>{plan.period}</span>
                </div>
                <Link href="/signup" style={{
                  display: "block",
                  padding: "16px",
                  background: plan.highlighted ? "white" : THEME.primary,
                  color: plan.highlighted ? THEME.primary : "white",
                  textDecoration: "none",
                  borderRadius: 12,
                  fontWeight: 700,
                  textAlign: "center",
                  marginBottom: 32,
                }}>
                  {plan.cta}
                </Link>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {plan.features.map((feature, j) => (
                    <li key={j} style={{
                      fontSize: 15,
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}>
                      <span style={{ fontSize: 18 }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryDark} 100%)`,
        color: "white",
        padding: "80px 40px",
        textAlign: "center",
      }}>
        <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 24 }}>
          Pronto para revolucionar sua loja?
        </h2>
        <p style={{ fontSize: 20, marginBottom: 40, opacity: 0.95 }}>
          Junte-se a centenas de lojistas que já aumentaram suas vendas com TryOn
        </p>
        <Link href="/signup" style={{
          padding: "18px 48px",
          background: "white",
          color: THEME.primary,
          textDecoration: "none",
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 18,
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          display: "inline-block",
        }}>
          Começar Grátis Agora
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        background: "#1e293b",
        color: "white",
        padding: "40px",
        textAlign: "center",
      }}>
        <p style={{ margin: 0, opacity: 0.7 }}>
          © 2026 TryOn. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
