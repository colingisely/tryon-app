'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

const BG = '#08080f';
const PURPLE = '#a855f7';
const PURPLE_DARK = '#7c3aed';
const GLASS = 'rgba(255,255,255,0.03)';
const BORDER = 'rgba(255,255,255,0.07)';
const BORDER_PURPLE = 'rgba(168,85,247,0.25)';
const TEXT_DIM = 'rgba(255,255,255,0.45)';
const TEXT_MID = 'rgba(255,255,255,0.7)';

const Icons = {
  hanger: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3c0 1.1.6 2 1.5 2.5L12 8l1.5-.5A3 3 0 0 0 12 2z" /><path d="M2 20h20L12 8 2 20z" /></svg>),
  upload: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>),
  download: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>),
  retry: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>),
  logout: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>),
  person: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>),
  sparkles: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" /><path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z" /><path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" /></svg>),
};

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Aguardando imagens...");

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase!.auth.getUser();
        setUser(user);
      } catch (err) { console.error("Error:", err); } finally { setLoading(false); }
    };
    checkUser();
    const { data: authListener } = supabase!.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    if (!supabase) { setAuthError("Sistema de autenticação não configurado."); setAuthLoading(false); return; }
    try {
      const { error } = await supabase!.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message === "Email not confirmed") setAuthError("E-mail não confirmado. Verifique sua caixa de entrada.");
        else if (error.message === "Invalid login credentials") setAuthError("E-mail ou senha incorretos.");
        else setAuthError(error.message);
      }
    } catch (err: any) { setAuthError("Erro de conexão. Tente novamente."); } finally { setAuthLoading(false); }
  };

  const handleLogout = async () => { if (!supabase) return; await supabase!.auth.signOut(); setUser(null); };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "model" | "product") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { const b64 = reader.result as string; if (type === "model") setModelImage(b64); else setProductImage(b64); };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!modelImage || !productImage) return;
    setIsGenerating(true); setProgress(0); setResult(null); setStatusText("Iniciando processamento...");
    const messages = ["Analisando pecas...", "Detectando categoria...", "Otimizando prompt IA...", "Preservando detalhes do produto...", "Finalizando com qualidade maxima..."];
    let msgIdx = 0;
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) { clearInterval(progressInterval); return 95; }
        if (prev % 20 === 0 && msgIdx < messages.length) setStatusText(messages[msgIdx++]);
        return prev + 1;
      });
    }, 600);
    try {
      const response = await fetch("/api/tryon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: modelImage, productImage, mode: "premium" }) });
      clearInterval(progressInterval); setProgress(100); setStatusText("Concluido!");
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Erro ao gerar try-on"); }
      const data = await response.json();
      setResult(data.resultUrl);
    } catch (err: any) { alert(`Erro: ${err.message}`); clearInterval(progressInterval); setStatusText("Erro na geracao"); } finally { setIsGenerating(false); }
  };

  const handleDownload = async () => {
    if (!result) return;
    try {
      const response = await fetch(result); const blob = await response.blob(); const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `reflexy-studio-${Date.now()}.png`; a.click(); URL.revokeObjectURL(url);
    } catch (err) { alert("Erro ao baixar imagem"); }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 44, height: 44, border: '2px solid rgba(168,85,247,0.2)', borderTopColor: PURPLE, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: TEXT_DIM, fontSize: '14px' }}>Carregando...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif", padding: '20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', border: `1px solid ${BORDER}`, padding: '48px 40px', borderRadius: '24px', width: '100%', maxWidth: '420px', textAlign: 'center', position: 'relative', zIndex: 1, boxShadow: '0 0 60px rgba(139,92,246,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '32px' }}>
            <Image src="/logo-symbol.png" alt="Reflexy" width={32} height={32} />
            <span style={{ fontWeight: 700, fontSize: '20px', letterSpacing: '0.08em', color: '#fff' }}>REFLEXY</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '100px', padding: '5px 14px', marginBottom: '24px' }}>
            <span style={{ color: PURPLE }}>{Icons.sparkles}</span>
            <span style={{ fontSize: '12px', color: TEXT_MID, letterSpacing: '0.04em' }}>Estudio Profissional</span>
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>Acesso Exclusivo</h1>
          <p style={{ margin: '0 0 32px', color: TEXT_DIM, fontSize: '14px', lineHeight: 1.6 }}>Ferramenta de geracao de fotos profissionais com IA de alta fidelidade.</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
              style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: '10px', fontSize: '15px', color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
              style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: '10px', fontSize: '15px', color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            {authError && (
              <div style={{ color: '#f87171', fontSize: '13px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'left' }}>{authError}</div>
            )}
            <button type="submit" disabled={authLoading}
              style={{ width: '100%', padding: '14px', background: authLoading ? 'rgba(139,92,246,0.3)' : `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: authLoading ? 'not-allowed' : 'pointer', boxShadow: authLoading ? 'none' : '0 0 30px rgba(139,92,246,0.3)', fontFamily: 'inherit', marginTop: '4px' }}>
              {authLoading ? 'Entrando...' : 'Entrar no Estudio'}
            </button>
          </form>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: rgba(255,255,255,0.25); }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#fff', fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif" }}>
      <div style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '400px', background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      
      <header style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,8,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Image src="/logo-symbol.png" alt="Reflexy" width={24} height={24} />
          <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '0.08em' }}>REFLEXY</span>
          <span style={{ fontSize: '12px', color: TEXT_DIM, margin: '0 4px' }}>/</span>
          <span style={{ fontSize: '13px', color: TEXT_MID, fontWeight: 500 }}>Estudio Pro</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '100px', padding: '4px 12px 4px 8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: PURPLE, boxShadow: `0 0 6px ${PURPLE}` }} />
            <span style={{ fontSize: '12px', color: TEXT_MID }}>Premium Mode</span>
          </div>
          <span style={{ fontSize: '13px', color: TEXT_DIM }}>{user.email}</span>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: GLASS, border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: TEXT_MID, fontFamily: 'inherit' }}>
            {Icons.logout} Sair
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '100px', padding: '4px 14px', marginBottom: '16px' }}>
            <span style={{ color: PURPLE }}>{Icons.sparkles}</span>
            <span style={{ fontSize: '12px', color: TEXT_MID, letterSpacing: '0.04em' }}>Try-On Max — Qualidade Maxima</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '8px', background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Estudio Profissional
          </h1>
          <p style={{ color: TEXT_DIM, fontSize: '16px' }}>Geracao de fotos de alta fidelidade com IA — resultados em menos de 15 segundos.</p>
        </div>

        {!result ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
              {/* Model Card */}
              <div style={{ background: GLASS, border: `1px solid ${modelImage ? BORDER_PURPLE : BORDER}`, borderRadius: '20px', padding: '28px', backdropFilter: 'blur(20px)', transition: 'border-color 0.3s', boxShadow: modelImage ? '0 0 30px rgba(139,92,246,0.08)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PURPLE }}>{Icons.person}</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#fff' }}>Foto do Modelo</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: TEXT_DIM }}>Pessoa a ser vestida</p>
                  </div>
                  {modelImage && <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#22c55e', fontSize: '11px', fontWeight: 700 }}>✓</span></div>}
                </div>
                {modelImage ? (
                  <div onClick={() => setModelImage(null)} style={{ cursor: 'pointer', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src={modelImage} alt="Modelo" style={{ width: '100%', height: '280px', objectFit: 'contain', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'block' }} />
                    <p style={{ fontSize: '12px', color: TEXT_DIM, marginTop: '8px', textAlign: 'center' }}>Clique para trocar</p>
                  </div>
                ) : (
                  <div style={{ border: '1.5px dashed rgba(255,255,255,0.1)', borderRadius: '14px', padding: '40px 20px', textAlign: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'rgba(255,255,255,0.01)' }}>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "model")} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                    <div style={{ color: TEXT_DIM }}>{Icons.upload}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: TEXT_MID }}>Upload da Pessoa</div>
                    <div style={{ fontSize: '12px', color: TEXT_DIM }}>Foto de corpo inteiro recomendada</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '4px' }}>PNG, JPG — max. 10MB</div>
                  </div>
                )}
              </div>

              {/* Product Card */}
              <div style={{ background: GLASS, border: `1px solid ${productImage ? BORDER_PURPLE : BORDER}`, borderRadius: '20px', padding: '28px', backdropFilter: 'blur(20px)', transition: 'border-color 0.3s', boxShadow: productImage ? '0 0 30px rgba(139,92,246,0.08)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PURPLE }}>{Icons.hanger}</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#fff' }}>Foto do Produto</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: TEXT_DIM }}>Peca de roupa a vestir</p>
                  </div>
                  {productImage && <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#22c55e', fontSize: '11px', fontWeight: 700 }}>✓</span></div>}
                </div>
                {productImage ? (
                  <div onClick={() => setProductImage(null)} style={{ cursor: 'pointer', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src={productImage} alt="Produto" style={{ width: '100%', height: '280px', objectFit: 'contain', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'block' }} />
                    <p style={{ fontSize: '12px', color: TEXT_DIM, marginTop: '8px', textAlign: 'center' }}>Clique para trocar</p>
                  </div>
                ) : (
                  <div style={{ border: '1.5px dashed rgba(255,255,255,0.1)', borderRadius: '14px', padding: '40px 20px', textAlign: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'rgba(255,255,255,0.01)' }}>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "product")} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                    <div style={{ color: TEXT_DIM }}>{Icons.upload}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: TEXT_MID }}>Upload da Roupa</div>
                    <div style={{ fontSize: '12px', color: TEXT_DIM }}>Foto em cabide ou flat-lay</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '4px' }}>PNG, JPG — max. 10MB</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '12px', padding: '14px 20px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px' }}>💡</span>
              <span style={{ fontSize: '13px', color: TEXT_MID }}><strong style={{ color: '#fff' }}>Dica:</strong> Para melhores resultados, use fotos com fundo neutro e boa iluminacao. O modelo deve estar em posicao frontal e a roupa bem visivel.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {!isGenerating ? (
                <button onClick={handleGenerate} disabled={!modelImage || !productImage}
                  style={{ padding: '16px 56px', background: (!modelImage || !productImage) ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`, color: (!modelImage || !productImage) ? TEXT_DIM : '#fff', border: (!modelImage || !productImage) ? `1px solid ${BORDER}` : 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 600, cursor: (!modelImage || !productImage) ? 'not-allowed' : 'pointer', boxShadow: (!modelImage || !productImage) ? 'none' : '0 0 40px rgba(139,92,246,0.35)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{Icons.sparkles}</span>
                  Gerar Foto Profissional
                </button>
              ) : (
                <div style={{ width: '100%', maxWidth: '520px', textAlign: 'center' }}>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
                    <div style={{ height: '100%', background: `linear-gradient(90deg, ${PURPLE_DARK}, ${PURPLE})`, transition: 'width 0.4s ease', width: `${progress}%`, boxShadow: `0 0 10px ${PURPLE}` }} />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: PURPLE }}>{statusText}</div>
                  <div style={{ fontSize: '12px', color: TEXT_DIM, marginTop: '4px' }}>{progress}% concluido</div>
                </div>
              )}
              {(!modelImage || !productImage) && !isGenerating && (
                <p style={{ fontSize: '13px', color: TEXT_DIM, margin: 0 }}>
                  {!modelImage && !productImage ? 'Faca upload das duas imagens para continuar' : !modelImage ? 'Falta a foto do modelo' : 'Falta a foto do produto'}
                </p>
              )}
            </div>
          </>
        ) : (
          <div style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '24px', padding: '40px', textAlign: 'center', boxShadow: '0 0 60px rgba(139,92,246,0.1)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '100px', padding: '5px 14px', marginBottom: '24px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              <span style={{ fontSize: '12px', color: '#86efac', fontWeight: 600, letterSpacing: '0.04em' }}>Geracao concluida com sucesso</span>
            </div>
            <img src={result} alt="Resultado" style={{ maxWidth: '100%', maxHeight: '600px', borderRadius: '16px', marginBottom: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.15)', display: 'block', margin: '0 auto 32px' }} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={handleDownload} style={{ background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`, color: '#fff', padding: '13px 28px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', fontSize: '15px', boxShadow: '0 0 30px rgba(139,92,246,0.3)', fontFamily: 'inherit' }}>
                {Icons.download} Baixar em Alta Resolucao
              </button>
              <button onClick={() => { setResult(null); setModelImage(null); setProductImage(null); }} style={{ background: GLASS, color: TEXT_MID, padding: '13px 28px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', border: `1px solid ${BORDER}`, cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}>
                {Icons.retry} Criar Outra Foto
              </button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.25); }
        @media (max-width: 768px) { main { padding: 32px 20px !important; } header { padding: 0 20px !important; } }
      `}</style>
    </div>
  );
}
