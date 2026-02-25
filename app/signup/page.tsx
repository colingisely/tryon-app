"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

const THEME = {
  primary: "#667eea",
  primaryDark: "#764ba2",
  success: "#10b981",
  text: "#1e293b",
  textMuted: "#64748b",
  border: "#e2e8f0",
  error: "#ef4444",
};

const plans = [
  { name: "Free", slug: "free", price: "R$ 0", recommended: false },
  { name: "Starter", slug: "starter", price: "R$ 99", recommended: false },
  { name: "Pro", slug: "pro", price: "R$ 249", recommended: true },
  { name: "Enterprise", slug: "enterprise", price: "R$ 599", recommended: false },
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
      // 1. Create auth user
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

      // 2. Create merchant record (will be done via database trigger or API)
      // For now, we'll redirect to dashboard and let it handle the setup
      
      router.push("/dashboard?welcome=true");
    } catch (err: any) {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: "40px 20px",
    }}>
      {/* Header */}
      <div style={{
        maxWidth: 1000,
        margin: "0 auto 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <Link href="/" style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          textDecoration: "none",
        }}>
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
        </Link>
        <Link href="/login" style={{
          color: THEME.textMuted,
          textDecoration: "none",
          fontSize: 15,
          fontWeight: 600,
        }}>
          Já tem conta? <span style={{ color: THEME.primary }}>Entrar</span>
        </Link>
      </div>

      {/* Progress Indicator */}
      <div style={{ maxWidth: 600, margin: "0 auto 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          {["Escolha o plano", "Crie sua conta"].map((label, i) => (
            <div key={i} style={{
              flex: 1,
              textAlign: "center",
              fontSize: 14,
              fontWeight: 600,
              color: step > i ? THEME.primary : THEME.textMuted,
            }}>
              {label}
            </div>
          ))}
        </div>
        <div style={{
          height: 4,
          background: "#e2e8f0",
          borderRadius: 4,
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            background: THEME.primary,
            width: `${(step / 2) * 100}%`,
            transition: "width 0.3s",
          }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: step === 1 ? 1000 : 500, margin: "0 auto" }}>
        {step === 1 && (
          <div>
            <h1 style={{
              fontSize: 36,
              fontWeight: 800,
              textAlign: "center",
              marginBottom: 16,
              color: THEME.text,
            }}>
              Escolha seu plano
            </h1>
            <p style={{
              fontSize: 18,
              textAlign: "center",
              color: THEME.textMuted,
              marginBottom: 48,
            }}>
              Comece grátis e faça upgrade quando precisar
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 20,
            }}>
              {plans.map((plan) => (
                <div
                  key={plan.slug}
                  onClick={() => setSelectedPlan(plan.slug)}
                  style={{
                    background: selectedPlan === plan.slug ? `linear-gradient(135deg, ${THEME.primary}, ${THEME.primaryDark})` : "white",
                    color: selectedPlan === plan.slug ? "white" : THEME.text,
                    padding: 32,
                    borderRadius: 16,
                    border: selectedPlan === plan.slug ? "none" : `2px solid ${THEME.border}`,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    position: "relative",
                  }}
                >
                  {plan.recommended && (
                    <div style={{
                      position: "absolute",
                      top: -10,
                      right: 20,
                      background: THEME.success,
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      RECOMENDADO
                    </div>
                  )}
                  <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{plan.name}</h3>
                  <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>{plan.price}</div>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: selectedPlan === plan.slug ? "none" : `2px solid ${THEME.border}`,
                    background: selectedPlan === plan.slug ? "white" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                  }}>
                    {selectedPlan === plan.slug && <span style={{ color: THEME.primary, fontSize: 16 }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              style={{
                display: "block",
                margin: "40px auto 0",
                padding: "16px 48px",
                background: THEME.primary,
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: 18,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Continuar →
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{
            background: "white",
            padding: 48,
            borderRadius: 24,
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          }}>
            <h1 style={{
              fontSize: 32,
              fontWeight: 800,
              marginBottom: 8,
              color: THEME.text,
            }}>
              Crie sua conta
            </h1>
            <p style={{
              fontSize: 16,
              color: THEME.textMuted,
              marginBottom: 32,
            }}>
              Plano selecionado: <strong>{plans.find(p => p.slug === selectedPlan)?.name}</strong>
            </p>

            <form onSubmit={handleSignup}>
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "16px",
                  border: `2px solid ${THEME.border}`,
                  borderRadius: 12,
                  fontSize: 16,
                  marginBottom: 16,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <input
                type="password"
                placeholder="Senha (mínimo 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: "100%",
                  padding: "16px",
                  border: `2px solid ${THEME.border}`,
                  borderRadius: 12,
                  fontSize: 16,
                  marginBottom: 16,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <input
                type="text"
                placeholder="Nome da loja"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "16px",
                  border: `2px solid ${THEME.border}`,
                  borderRadius: 12,
                  fontSize: 16,
                  marginBottom: 16,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <input
                type="url"
                placeholder="URL da loja (ex: https://minhaloja.com)"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px",
                  border: `2px solid ${THEME.border}`,
                  borderRadius: 12,
                  fontSize: 16,
                  marginBottom: 16,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />

              {error && (
                <div style={{
                  color: THEME.error,
                  fontSize: 14,
                  marginBottom: 16,
                  fontWeight: 500,
                  padding: "12px",
                  background: "#fef2f2",
                  borderRadius: 8,
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
                  padding: "16px",
                  background: loading ? THEME.border : THEME.primary,
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  marginBottom: 16,
                }}
              >
                {loading ? "Criando conta..." : "Criar conta grátis"}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "transparent",
                  color: THEME.textMuted,
                  border: "none",
                  fontSize: 15,
                  fontWeight: 600,
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
