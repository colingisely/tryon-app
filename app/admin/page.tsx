"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// --- Design System Constants ---
const THEME = {
  primary: "#667eea",
  primaryDark: "#764ba2",
  bg: "#f8fafc",
  cardBg: "#ffffff",
  text: "#1e293b",
  textMuted: "#64748b",
  border: "#e2e8f0",
  success: "#10b981",
  error: "#ef4444",
  radius: "12px",
};

// --- Icons ---
const ICONS = {
  hanger: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3c0 1.1.6 2 1.5 2.5L12 8l1.5-.5A3 3 0 0 0 12 2z" />
      <path d="M2 20h20L12 8 2 20z" />
    </svg>
  ),
  upload: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  download: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  retry: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Try-on state
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Aguardando imagens...");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase!.auth.getUser();
        setUser(user);
      } catch (err) {
        console.error("Error checking user:", err);
      } finally {
        setLoading(false);
      }
    };
    checkUser();

    const { data: authListener } = supabase!.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    if (!supabase) {
      setAuthError("Sistema de autenticação não configurado. Contate o administrador.");
      setAuthLoading(false);
      return;
    }

    try {
      const { error } = await supabase!.auth.signInWithPassword({ email, password });
      if (error) {
        // Translate common Supabase errors to Portuguese
        if (error.message === "Email not confirmed") {
          setAuthError("E-mail não confirmado. Verifique sua caixa de entrada ou contate o administrador.");
        } else if (error.message === "Invalid login credentials") {
          setAuthError("E-mail ou senha incorretos.");
        } else {
          setAuthError(error.message);
        }
      }
    } catch (err: any) {
      setAuthError("Erro de conexão. Tente novamente.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase!.auth.signOut();
    setUser(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "model" | "product") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (type === "model") setModelImage(base64);
      else setProductImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!modelImage || !productImage) return;

    setIsGenerating(true);
    setProgress(0);
    setResult(null);
    setStatusText("Iniciando processamento...");

    const messages = [
      "Analisando peças...",
      "Detectando categoria...",
      "Otimizando prompt IA...",
      "Preservando detalhes do produto...",
      "Finalizando com qualidade máxima...",
    ];

    let msgIdx = 0;
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        if (prev % 20 === 0 && msgIdx < messages.length) {
          setStatusText(messages[msgIdx++]);
        }
        return prev + 1;
      });
    }, 600);

    try {
      const response = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: modelImage,
          productImage: productImage,
          mode: "premium",
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);
      setStatusText("Concluído!");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar try-on");
      }

      const data = await response.json();
      setResult(data.resultUrl);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
      clearInterval(progressInterval);
      setStatusText("Erro na geração");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    try {
      const response = await fetch(result);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tryon-premium-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Erro ao baixar imagem");
    }
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryDark} 100%)`,
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: "4px solid rgba(255,255,255,0.3)",
          borderTopColor: "white",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // --- LOGIN SCREEN ---
  if (!user) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryDark} 100%)`,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: 20,
        margin: 0,
      }}>
        <div style={{
          background: "white",
          padding: "48px 40px",
          borderRadius: 24,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          width: "100%",
          maxWidth: 420,
          textAlign: "center",
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
          }}>
            {ICONS.hanger}
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800, color: THEME.text }}>
            Estúdio Profissional
          </h1>
          <p style={{ margin: "0 0 32px", color: THEME.textMuted, fontSize: 15, lineHeight: 1.5 }}>
            Acesse a ferramenta exclusiva para geração de fotos de alta qualidade.
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
                WebkitAppearance: "none",
                appearance: "none" as any,
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
                WebkitAppearance: "none",
                appearance: "none" as any,
              }}
            />
            {authError && (
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
                {authError}
              </div>
            )}
            <button
              type="submit"
              disabled={authLoading}
              style={{
                width: "100%",
                padding: "16px",
                background: authLoading ? THEME.border : THEME.primary,
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: authLoading ? "not-allowed" : "pointer",
                transition: "transform 0.2s, background 0.2s",
                boxSizing: "border-box",
              }}
            >
              {authLoading ? "Entrando..." : "Entrar no Estúdio"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- STUDIO (AUTHENTICATED) ---
  return (
    <div style={{
      minHeight: "100vh",
      background: THEME.bg,
      color: THEME.text,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: "40px 20px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <header style={{ marginBottom: 48, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: 32, fontWeight: 800 }}>Estúdio Profissional</h1>
            <p style={{ margin: 0, color: THEME.textMuted, fontSize: 16 }}>Geração de fotos de alta fidelidade com Try-On Max</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 14, color: THEME.textMuted }}>{user.email}</span>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                background: "white",
                border: `1px solid ${THEME.border}`,
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {ICONS.logout} Sair
            </button>
          </div>
        </header>

        {!result ? (
          <>
            {/* Upload Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
              {/* Model Card */}
              <div style={{
                background: THEME.cardBg,
                padding: 32,
                borderRadius: 20,
                border: `1px solid ${THEME.border}`,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <span style={{ color: THEME.primary }}>{ICONS.upload}</span>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Foto do Modelo</h3>
                </div>
                {modelImage ? (
                  <div onClick={() => setModelImage(null)} style={{ cursor: "pointer" }}>
                    <img src={modelImage} alt="Modelo" style={{
                      width: "100%",
                      height: 300,
                      objectFit: "contain",
                      borderRadius: 12,
                      background: "#f1f5f9",
                    }} />
                    <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: 8, textAlign: "center" }}>Clique para trocar</p>
                  </div>
                ) : (
                  <div style={{
                    border: `2px dashed ${THEME.border}`,
                    borderRadius: 16,
                    padding: "40px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    minHeight: 200,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "model")}
                      style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                    />
                    <div style={{ color: THEME.textMuted, marginBottom: 12 }}>{ICONS.upload}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: THEME.text }}>Upload da Pessoa</div>
                    <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>Foto de corpo inteiro recomendada</div>
                  </div>
                )}
              </div>

              {/* Product Card */}
              <div style={{
                background: THEME.cardBg,
                padding: 32,
                borderRadius: 20,
                border: `1px solid ${THEME.border}`,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <span style={{ color: THEME.primary }}>{ICONS.hanger}</span>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Foto do Produto</h3>
                </div>
                {productImage ? (
                  <div onClick={() => setProductImage(null)} style={{ cursor: "pointer" }}>
                    <img src={productImage} alt="Produto" style={{
                      width: "100%",
                      height: 300,
                      objectFit: "contain",
                      borderRadius: 12,
                      background: "#f1f5f9",
                    }} />
                    <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: 8, textAlign: "center" }}>Clique para trocar</p>
                  </div>
                ) : (
                  <div style={{
                    border: `2px dashed ${THEME.border}`,
                    borderRadius: 16,
                    padding: "40px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    minHeight: 200,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "product")}
                      style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                    />
                    <div style={{ color: THEME.textMuted, marginBottom: 12 }}>{ICONS.hanger}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: THEME.text }}>Upload da Roupa</div>
                    <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>Foto em cabide ou flat-lay</div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, margin: "40px 0" }}>
              {!isGenerating ? (
                <button
                  onClick={handleGenerate}
                  disabled={!modelImage || !productImage}
                  style={{
                    padding: "18px 64px",
                    background: (!modelImage || !productImage) ? THEME.border : THEME.primary,
                    color: "white",
                    border: "none",
                    borderRadius: 16,
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: (!modelImage || !productImage) ? "not-allowed" : "pointer",
                    boxShadow: "0 10px 15px -3px rgba(102, 126, 234, 0.3)",
                    transition: "all 0.2s",
                    opacity: (!modelImage || !productImage) ? 0.5 : 1,
                  }}
                >
                  Gerar Foto Profissional
                </button>
              ) : (
                <div style={{ width: "100%", maxWidth: 500 }}>
                  <div style={{ height: 8, background: "#e2e8f0", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ height: "100%", background: THEME.primary, transition: "width 0.4s ease", width: `${progress}%` }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: THEME.primary, textAlign: "center" }}>{statusText}</div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{
            background: "white",
            padding: 40,
            borderRadius: 24,
            border: `2px solid ${THEME.primary}`,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
          }}>
            <img src={result} alt="Resultado" style={{
              maxWidth: "100%",
              maxHeight: 600,
              borderRadius: 16,
              marginBottom: 32,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            }} />
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              <button onClick={handleDownload} style={{
                background: THEME.success,
                color: "white",
                padding: "14px 32px",
                borderRadius: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 16,
              }}>
                {ICONS.download} Baixar em Alta Resolução
              </button>
              <button onClick={() => { setResult(null); setModelImage(null); setProductImage(null); }} style={{
                background: "#f1f5f9",
                color: THEME.text,
                padding: "14px 32px",
                borderRadius: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 16,
              }}>
                {ICONS.retry} Criar Outra Foto
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
