"use client";

import Link from "next/link";

const THEME = {
  bg: "#ffffff",
  text: "#333333",
  textMuted: "#666666",
  textLight: "#999999",
  border: "#e0e0e0",
  buttonBg: "#000000",
  buttonText: "#ffffff",
};

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    description: "Perfeito para testar",
    features: [
      "100 try-ons rápidos/mês",
      "0 fotos Premium",
      'Logo "Powered by TryOn"',
      "Suporte por email",
    ],
  },
  {
    name: "Starter",
    price: "R$ 99",
    description: "Para lojas em crescimento",
    features: [
      "500 try-ons rápidos/mês",
      "10 fotos Premium/mês",
      "Sem logo",
      "Suporte prioritário",
    ],
  },
  {
    name: "Pro",
    price: "R$ 249",
    description: "Para lojas estabelecidas",
    features: [
      "2.000 try-ons rápidos/mês",
      "50 fotos Premium/mês",
      "Sem logo",
      "Analytics avançado",
      "Suporte prioritário",
    ],
    recommended: true,
  },
  {
    name: "Enterprise",
    price: "R$ 599",
    description: "Para grandes operações",
    features: [
      "Try-ons ilimitados",
      "300 fotos Premium/mês",
      "White-label",
      "Suporte dedicado",
      "API customizada",
    ],
  },
];

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", background: THEME.bg }}>
      {/* Header */}
      <header style={{
        background: THEME.bg,
        borderBottom: `1px solid ${THEME.border}`,
        padding: "20px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}>
        <div style={{
          fontSize: 22,
          fontWeight: 700,
          color: THEME.text,
          letterSpacing: "-0.5px",
        }}>
          TryOn
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Link href="/login" style={{
            color: THEME.textMuted,
            textDecoration: "none",
            fontSize: 15,
            fontWeight: 500,
          }}>
            Entrar
          </Link>
          <Link href="/signup" style={{
            padding: "10px 20px",
            background: THEME.buttonBg,
            color: THEME.buttonText,
            textDecoration: "none",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
          }}>
            Começar Grátis
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        padding: "100px 40px 80px",
        textAlign: "center",
        maxWidth: 900,
        margin: "0 auto",
      }}>
        <h1 style={{
          fontSize: 56,
          fontWeight: 800,
          color: THEME.text,
          marginBottom: 24,
          letterSpacing: "-1.5px",
          lineHeight: 1.1,
        }}>
          Provador Virtual para Shopify
        </h1>
        <p style={{
          fontSize: 20,
          color: THEME.textMuted,
          marginBottom: 40,
          lineHeight: 1.6,
          maxWidth: 700,
          margin: "0 auto 40px",
        }}>
          Aumente suas vendas permitindo que clientes vejam como as roupas ficam neles antes de comprar. Instalação em 2 minutos.
        </p>
        <Link href="/signup" style={{
          display: "inline-block",
          padding: "16px 32px",
          background: THEME.buttonBg,
          color: THEME.buttonText,
          textDecoration: "none",
          borderRadius: 6,
          fontSize: 16,
          fontWeight: 600,
        }}>
          Começar Grátis →
        </Link>
      </section>

      {/* Features */}
      <section style={{
        padding: "80px 40px",
        background: "#fafafa",
        borderTop: `1px solid ${THEME.border}`,
        borderBottom: `1px solid ${THEME.border}`,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{
            fontSize: 36,
            fontWeight: 700,
            color: THEME.text,
            textAlign: "center",
            marginBottom: 60,
            letterSpacing: "-0.5px",
          }}>
            Como funciona
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 40,
          }}>
            {[
              { title: "1. Instale o plugin", desc: "Adicione o código na sua loja Shopify em menos de 2 minutos" },
              { title: "2. Cliente envia foto", desc: "Seus clientes fazem upload de uma foto deles mesmos" },
              { title: "3. IA gera resultado", desc: "Nossa IA cria uma imagem realista da roupa no cliente" },
            ].map((item, i) => (
              <div key={i} style={{
                padding: 32,
                background: THEME.bg,
                borderRadius: 8,
                border: `1px solid ${THEME.border}`,
              }}>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: THEME.text,
                  marginBottom: 12,
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: 15,
                  color: THEME.textMuted,
                  lineHeight: 1.6,
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{
        padding: "100px 40px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{
            fontSize: 36,
            fontWeight: 700,
            color: THEME.text,
            textAlign: "center",
            marginBottom: 16,
            letterSpacing: "-0.5px",
          }}>
            Planos e Preços
          </h2>
          <p style={{
            fontSize: 18,
            color: THEME.textMuted,
            textAlign: "center",
            marginBottom: 60,
          }}>
            Escolha o plano ideal para o tamanho da sua loja
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
          }}>
            {plans.map((plan) => (
              <div
                key={plan.name}
                style={{
                  background: THEME.bg,
                  border: plan.recommended ? `2px solid ${THEME.text}` : `1px solid ${THEME.border}`,
                  borderRadius: 8,
                  padding: 32,
                  position: "relative",
                }}
              >
                {plan.recommended && (
                  <div style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: THEME.text,
                    color: THEME.buttonText,
                    padding: "4px 12px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}>
                    RECOMENDADO
                  </div>
                )}
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: THEME.text,
                  marginBottom: 8,
                }}>
                  {plan.name}
                </h3>
                <div style={{
                  fontSize: 40,
                  fontWeight: 800,
                  color: THEME.text,
                  marginBottom: 8,
                }}>
                  {plan.price}
                  <span style={{ fontSize: 16, fontWeight: 500, color: THEME.textMuted }}>/mês</span>
                </div>
                <p style={{
                  fontSize: 14,
                  color: THEME.textMuted,
                  marginBottom: 24,
                }}>
                  {plan.description}
                </p>
                <ul style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 24px",
                }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{
                      fontSize: 14,
                      color: THEME.text,
                      marginBottom: 12,
                      paddingLeft: 20,
                      position: "relative",
                    }}>
                      <span style={{
                        position: "absolute",
                        left: 0,
                        color: THEME.text,
                      }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" style={{
                  display: "block",
                  textAlign: "center",
                  padding: "12px",
                  background: plan.recommended ? THEME.buttonBg : "transparent",
                  color: plan.recommended ? THEME.buttonText : THEME.text,
                  border: plan.recommended ? "none" : `1px solid ${THEME.border}`,
                  borderRadius: 6,
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 600,
                }}>
                  Começar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "40px",
        borderTop: `1px solid ${THEME.border}`,
        textAlign: "center",
        color: THEME.textMuted,
        fontSize: 14,
      }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontWeight: 700, color: THEME.text }}>TryOn</span> — Provador Virtual para Shopify
        </div>
        <div>
          © 2026 TryOn. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
