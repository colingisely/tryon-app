"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

const THEME = {
  bg: "#ffffff",
  text: "#333333",
  textMuted: "#666666",
  border: "#e0e0e0",
  buttonBg: "#000000",
  buttonText: "#ffffff",
  error: "#dc2626",
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
      background: THEME.bg,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: 20,
    }}>
      <div style={{
        background: THEME.bg,
        padding: "48px 40px",
        borderRadius: 8,
        border: `1px solid ${THEME.border}`,
        width: "100%",
        maxWidth: 400,
        boxSizing: "border-box",
      }}>
        <h1 style={{
          margin: "0 0 8px",
          fontSize: 28,
          fontWeight: 700,
          color: THEME.text,
          textAlign: "center",
          letterSpacing: "-0.5px",
        }}>
          Entrar
        </h1>
        <p style={{
          margin: "0 0 32px",
          color: THEME.textMuted,
          fontSize: 14,
          textAlign: "center",
        }}>
          Acesse sua conta para gerenciar sua loja
        </p>

        <form onSubmit={handleLogin}>
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
              autoComplete="email"
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
              Senha
            </span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
              transition: "background 0.2s",
              boxSizing: "border-box",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: THEME.textMuted }}>
          Não tem uma conta?{" "}
          <Link href="/signup" style={{ color: THEME.text, fontWeight: 600, textDecoration: "none" }}>
            Criar conta grátis
          </Link>
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/" style={{ color: THEME.textMuted, fontSize: 13, textDecoration: "none" }}>
            ← Voltar para home
          </Link>
        </div>
      </div>
    </div>
  );
}
