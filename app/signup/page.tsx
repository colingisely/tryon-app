"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Clean aesthetic matching the try-on modal
const THEME = {
  bg: "#ffffff",
  text: "#333333",
  textMuted: "#666666",
  textLight: "#999999",
  border: "#e0e0e0",
  buttonBg: "#000000",
  buttonText: "#ffffff",
  error: "#dc2626",
  success: "#16a34a",
};

const plans = [
  { name: "Free", slug: "free", price: "R$ 0", credits: "100 try-ons/mês" },
  { name: "Starter", slug: "starter", price: "R$ 99", credits: "500 rápidos + 10 premium" },
  { name: "Pro", slug: "pro", price: "R$ 249", credits: "2.000 rápidos + 50 premium", recommended: true },
  { name: "Enterprise", slug: "enterprise", price: "R$ 599", credits: "Ilimitado + 300 premium" },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!supabase) {
      setError("Sistema de autenticação não configurado.");
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase!.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Erro ao criar usuário.");
        setLoading(false);
        return;
      }

      router.push("/dashboard?welcome=true");
    } catch (err: any) {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: THEME.bg,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: "40px 20px",
    }}>
      {/* Header */}
      <div style={{
        maxWidth: 1000,
        margin: "0 auto 60px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <Link href="/" style={{
          fontSize: 24,
          fontWeight: 700,
          color: THEME.text,
          textDecoration: "none",
          letterSpacing: "-0.5px",
        }}>
          TryOn
        </Link>
        <Link href="/login" style={{
          color: THEME.textMuted,
          textDecoration: "none",
          fontSize: 15,
          fontWeight: 500,
        }}>
          Já tem conta? <span style={{ color: THEME.text, fontWeight: 600 }}>Entrar</span>
        </Link>
      </div>

      {/* Progress */}
      <div style={{ maxWidth: 600, margin: "0 auto 50px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          {["Escolha o plano", "Crie sua conta"].map((label, i) => (
            <div key={i} style={{
              flex: 1,
              textAlign: "center",
              fontSize: 13,
              fontWeight: 600,
              color: step > i ? THEME.text : THEME.textMuted,
            }}>
              {label}
            </div>
          ))}
        </div>
        <div style={{
          height: 2,
          background: THEME.border,
          borderRadius: 2,
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            background: THEME.text,
            width: `${(step / 2) * 100}%`,
            transition: "width 0.3s",
          }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: step === 1 ? 900 : 480, margin: "0 auto" }}>
        {step === 1 && (
          <div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 700,
              textAlign: "center",
              marginBottom: 12,
              color: THEME.text,
              letterSpacing: "-0.5px",
            }}>
              Escolha seu plano
            </h1>
            <p style={{
              fontSize: 16,
              textAlign: "center",
              color: THEME.textMuted,
              marginBottom: 48,
            }}>
              Comece grátis e faça upgrade quando precisar
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}>
              {plans.map((plan) => (
                <div
                  key={plan.slug}
                  onClick={() => setSelectedPlan(plan.slug)}
                  style={{
                    background: THEME.bg,
                    border: selectedPlan === plan.slug ? `2px solid ${THEME.text}` : `1px solid ${THEME.border}`,
                    padding: 24,
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    position: "relative",
                  }}
                >
                  {plan.recommended && (
                    <div style={{
                      position: "absolute",
                      top: -10,
                      right: 16,
                      background: THEME.text,
                      color: THEME.buttonText,
                      padding: "3px 10px",
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                    }}>
                      RECOMENDADO
                    </div>
                  )}
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: THEME.text }}>{plan.name}</h3>
                  <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: THEME.text }}>{plan.price}</div>
                  <p style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 16 }}>{plan.credits}</p>
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: `2px solid ${selectedPlan === plan.slug ? THEME.text : THEME.border}`,
                    background: selectedPlan === plan.slug ? THEME.text : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {selectedPlan === plan.slug && <span style={{ color: THEME.buttonText, fontSize: 12 }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              style={{
                display: "block",
                margin: "40px auto 0",
                padding: "14px 40px",
                background: THEME.buttonBg,
                color: THEME.buttonText,
                border: "none",
                borderRadius: 6,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Continuar →
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{
            background: THEME.bg,
            padding: 40,
            borderRadius: 8,
            border: `1px solid ${THEME.border}`,
          }}>
            <h1 style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 8,
              color: THEME.text,
              letterSpacing: "-0.5px",
            }}>
              Crie sua conta
            </h1>
            <p style={{
              fontSize: 14,
              color: THEME.textMuted,
              marginBottom: 32,
            }}>
              Plano selecionado: <strong style={{ color: THEME.text }}>{plans.find(p => p.slug === selectedPlan)?.name}</strong>
            </p>

            <form onSubmit={handleSignup}>
              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: THEME.text, marginBottom: 6 }}>
                  E-mail
                </span>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 6,
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                    background: THEME.bg,
                    color: THEME.text,
                  }}
                />
              </label>

              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: THEME.text, marginBottom: 6 }}>
                  Senha
                </span>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 6,
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                    background: THEME.bg,
                    color: THEME.text,
                  }}
                />
              </label>

              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: THEME.text, marginBottom: 6 }}>
                  Nome da loja
                </span>
                <input
                  type="text"
                  placeholder="Minha Loja"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 6,
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                    background: THEME.bg,
                    color: THEME.text,
                  }}
                />
              </label>

              <label style={{ display: "block", marginBottom: 24 }}>
                <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: THEME.text, marginBottom: 6 }}>
                  URL da loja (opcional)
                </span>
                <input
                  type="url"
                  placeholder="https://minhaloja.com"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 6,
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                    background: THEME.bg,
                    color: THEME.text,
                  }}
                />
              </label>

              {error && (
                <div style={{
                  color: THEME.error,
                  fontSize: 13,
                  marginBottom: 16,
                  fontWeight: 500,
                  padding: "10px 12px",
                  background: "#fef2f2",
                  borderRadius: 6,
                  border: "1px solid #fee2e2",
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: loading ? THEME.border : THEME.buttonBg,
                  color: THEME.buttonText,
                  border: "none",
                  borderRadius: 6,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  marginBottom: 12,
                }}
              >
                {loading ? "Criando conta..." : "Criar conta grátis"}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "transparent",
                  color: THEME.textMuted,
                  border: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                ← Voltar
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
