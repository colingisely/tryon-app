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

  // Try-on state
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Aguardando imagens...");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-container">
        <style jsx>{`
          .login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryDark} 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
          }
          .login-card {
            background: white;
            padding: 48px 40px;
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            width: 100%;
            max-width: 420px;
            text-align: center;
          }
          .icon-box {
            width: 64px;
            height: 64px;
            background: #f1f5f9;
            color: ${THEME.primary};
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
          }
          h1 { margin: 0 0 8px; font-size: 28px; font-weight: 800; color: ${THEME.text}; }
          p { margin: 0 0 32px; color: ${THEME.textMuted}; font-size: 15px; line-height: 1.5; }
          input {
            width: 100%;
            padding: 16px;
            border: 2px solid ${THEME.border};
            border-radius: 12px;
            font-size: 16px;
            margin-bottom: 16px;
            transition: all 0.2s;
            outline: none;
          }
          input:focus { border-color: ${THEME.primary}; box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1); }
          .error { color: ${THEME.error}; font-size: 14px; margin-bottom: 16px; font-weight: 500; }
          button {
            width: 100%;
            padding: 16px;
            background: ${THEME.primary};
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.2s, background 0.2s;
          }
          button:hover { background: ${THEME.primaryDark}; transform: translateY(-1px); }
          button:active { transform: translateY(0); }
        `}</style>
        <div className="login-card">
          <div className="icon-box">{ICONS.hanger}</div>
          <h1>Estúdio Profissional</h1>
          <p>Acesse a ferramenta exclusiva para geração de fotos de alta qualidade.</p>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {authError && <div className="error">{authError}</div>}
            <button type="submit">Entrar no Estúdio</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <style jsx>{`
        .admin-container {
          min-height: 100vh;
          background: ${THEME.bg};
          color: ${THEME.text};
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px 20px;
        }
        .content { max-width: 1100px; margin: 0 auto; }
        header { margin-bottom: 48px; display: flex; align-items: center; justify-content: space-between; }
        .header-text h1 { margin: 0 0 4px; font-size: 32px; font-weight: 800; }
        .header-text p { margin: 0; color: ${THEME.textMuted}; font-size: 16px; }
        .user-info { display: flex; align-items: center; gap: 16px; }
        .user-email { font-size: 14px; color: ${THEME.textMuted}; }
        .btn-logout {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border: 1px solid ${THEME.border};
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-logout:hover { background: #fef2f2; color: ${THEME.error}; border-color: #fee2e2; }

        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
        .card {
          background: ${THEME.cardBg};
          padding: 32px;
          border-radius: 20px;
          border: 1px solid ${THEME.border};
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .card-header h3 { margin: 0; font-size: 18px; font-weight: 700; }
        .icon-small { color: ${THEME.primary}; }

        .upload-zone {
          border: 2px dashed ${THEME.border};
          border-radius: 16px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .upload-zone:hover { border-color: ${THEME.primary}; background: #f8fafc; }
        .upload-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .upload-icon { color: ${THEME.textMuted}; margin-bottom: 12px; }
        .upload-text { font-size: 14px; font-weight: 600; color: ${THEME.text}; }
        .upload-hint { font-size: 12px; color: ${THEME.textMuted}; margin-top: 4px; }

        .preview-img {
          width: 100%;
          height: 300px;
          object-fit: contain;
          border-radius: 12px;
          background: #f1f5f9;
        }

        .action-bar {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          margin: 40px 0;
        }
        .btn-generate {
          padding: 18px 64px;
          background: ${isGenerating ? THEME.border : THEME.primary};
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 700;
          cursor: ${isGenerating ? "not-allowed" : "pointer"};
          box-shadow: 0 10px 15px -3px rgba(102, 126, 234, 0.3);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .btn-generate:not(:disabled):hover { background: ${THEME.primaryDark}; transform: translateY(-2px); }

        .progress-container { width: 100%; max-width: 500px; }
        .progress-track { height: 8px; background: #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 8px; }
        .progress-fill { height: 100%; background: ${THEME.primary}; transition: width 0.4s ease; }
        .status-text { font-size: 14px; font-weight: 600; color: ${THEME.primary}; text-align: center; }

        .result-section {
          background: white;
          padding: 40px;
          border-radius: 24px;
          border: 2px solid ${THEME.primary};
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          text-align: center;
          animation: slideUp 0.5s ease-out;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .result-img {
          max-width: 100%;
          max-height: 600px;
          border-radius: 16px;
          margin-bottom: 32px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .result-actions { display: flex; justify-content: center; gap: 16px; }
        .btn-download {
          background: ${THEME.success};
          color: white;
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
          cursor: pointer;
        }
        .btn-new {
          background: #f1f5f9;
          color: ${THEME.text};
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="content">
        <header>
          <div className="header-text">
            <h1>Estúdio Profissional</h1>
            <p>Geração de fotos de alta fidelidade com Try-On Max</p>
          </div>
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <button className="btn-logout" onClick={handleLogout}>
              {ICONS.logout} Sair
            </button>
          </div>
        </header>

        {!result ? (
          <>
            <div className="grid">
              {/* Model Card */}
              <div className="card">
                <div className="card-header">
                  <span className="icon-small">{ICONS.upload}</span>
                  <h3>Foto do Modelo</h3>
                </div>
                {modelImage ? (
                  <div className="preview-container" onClick={() => setModelImage(null)}>
                    <img src={modelImage} className="preview-img" alt="Modelo" />
                    <p style={{ fontSize: "12px", color: THEME.textMuted, marginTop: "8px", textAlign: "center" }}>Clique para trocar</p>
                  </div>
                ) : (
                  <div className="upload-zone">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "model")} />
                    <div className="upload-icon">{ICONS.upload}</div>
                    <div className="upload-text">Upload da Pessoa</div>
                    <div className="upload-hint">Foto de corpo inteiro recomendada</div>
                  </div>
                )}
              </div>

              {/* Product Card */}
              <div className="card">
                <div className="card-header">
                  <span className="icon-small">{ICONS.hanger}</span>
                  <h3>Foto do Produto</h3>
                </div>
                {productImage ? (
                  <div className="preview-container" onClick={() => setProductImage(null)}>
                    <img src={productImage} className="preview-img" alt="Produto" />
                    <p style={{ fontSize: "12px", color: THEME.textMuted, marginTop: "8px", textAlign: "center" }}>Clique para trocar</p>
                  </div>
                ) : (
                  <div className="upload-zone">
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "product")} />
                    <div className="upload-icon">{ICONS.hanger}</div>
                    <div className="upload-text">Upload da Roupa</div>
                    <div className="upload-hint">Foto em cabide ou flat-lay</div>
                  </div>
                )}
              </div>
            </div>

            <div className="action-bar">
              {!isGenerating ? (
                <button 
                  className="btn-generate" 
                  onClick={handleGenerate}
                  disabled={!modelImage || !productImage}
                  style={{ opacity: (!modelImage || !productImage) ? 0.5 : 1 }}
                >
                  🚀 Gerar Foto Profissional
                </button>
              ) : (
                <div className="progress-container">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="status-text">{statusText}</div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="result-section">
            <img src={result} className="result-img" alt="Resultado" />
            <div className="result-actions">
              <button className="btn-download" onClick={handleDownload}>
                {ICONS.download} Baixar em Alta Resolução
              </button>
              <button className="btn-new" onClick={() => { setResult(null); setModelImage(null); setProductImage(null); }}>
                {ICONS.retry} Criar Outra Foto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
