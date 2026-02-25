"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

const THEME = {
  primary: "#667eea",
  primaryDark: "#764ba2",
  text: "#1e293b",
  textMuted: "#64748b",
  border: "#e2e8f0",
  error: "#ef4444",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!supabase) {
      setError("Sistema de autenticação não configurado.");
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase!.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message === "Invalid login credentials") {
          setError("E-mail ou senha incorretos.");
        } else {
          setError(authError.message);
        }
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryDark} 100%)`,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: 20,
    }}>
      <div style={{
        background: "white",
        padding: "48px 40px",
        borderRadius: 24,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        width: "100%",
        maxWidth: 420,
        boxSizing: "border-box",
      }}>
        <div style={{
          width: 64,
          height: 64,
          background: "#f1f5f9",
          color: THEME.primary,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          fontSize: 32,
          fontWeight: 800,
        }}>
          T
        </div>

        <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800, color: THEME.text, textAlign: "center" }}>
          Bem-vindo de volta
        </h1>
        <p style={{ margin: "0 0 32px", color: THEME.textMuted, fontSize: 15, lineHeight: 1.5, textAlign: "center" }}>
          Acesse sua conta para gerenciar sua loja
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              width: "100%",
              padding: "16px",
              border: `2px solid ${THEME.border}`,
              borderRadius: 12,
              fontSize: 16,
              marginBottom: 16,
              outline: "none",
              boxSizing: "border-box",
              background: "white",
              color: THEME.text,
            }}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "16px",
              border: `2px solid ${THEME.border}`,
              borderRadius: 12,
              fontSize: 16,
              marginBottom: 16,
              outline: "none",
              boxSizing: "border-box",
              background: "white",
              color: THEME.text,
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
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "transform 0.2s, background 0.2s",
              boxSizing: "border-box",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: THEME.textMuted }}>
          Não tem uma conta?{" "}
          <Link href="/signup" style={{ color: THEME.primary, fontWeight: 600, textDecoration: "none" }}>
            Criar conta grátis
          </Link>
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <Link href="/" style={{ color: THEME.textMuted, fontSize: 14, textDecoration: "none" }}>
            ← Voltar para home
          </Link>
        </div>
      </div>
    </div>
  );
}
