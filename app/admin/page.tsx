"use client";

import { useState } from "react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // Try-on state
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check (in production, use proper auth)
    if (password === "tryonapp2026") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Senha incorreta");
    }
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "model" | "product"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (type === "model") {
        setModelImage(base64);
      } else {
        setProductImage(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!modelImage || !productImage) {
      alert("Por favor, envie ambas as imagens");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setResult(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 1;
      });
    }, 500);

    try {
      const response = await fetch("/api/tryon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: modelImage,
          productImage: productImage,
          mode: "premium", // Always use Try-On Max in admin
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar try-on");
      }

      const data = await response.json();
      setResult(data.resultUrl);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
      clearInterval(progressInterval);
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
      a.download = `tryon-professional-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Erro ao baixar imagem");
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
        <div style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          width: "100%",
          maxWidth: "400px"
        }}>
          <h1 style={{ margin: "0 0 10px 0", fontSize: "28px", fontWeight: "700" }}>
            🎨 Estúdio Profissional
          </h1>
          <p style={{ margin: "0 0 30px 0", color: "#666", fontSize: "14px" }}>
            Gere fotos profissionais com Try-On Max
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "14px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "16px",
                marginBottom: "10px",
                boxSizing: "border-box"
              }}
            />
            {error && (
              <p style={{ color: "#e53e3e", fontSize: "14px", margin: "0 0 10px 0" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f7fafc",
      padding: "40px 20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ margin: "0 0 10px 0", fontSize: "32px", fontWeight: "700" }}>
            🎨 Estúdio Profissional
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
            Gere fotos profissionais de alta qualidade com Try-On Max (~1 minuto por foto)
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: result ? "1fr 1fr" : "1fr 1fr",
          gap: "20px",
          marginBottom: "30px"
        }}>
          {/* Model Upload */}
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "600" }}>
              📸 Foto do Modelo
            </h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "model")}
              style={{ marginBottom: "20px" }}
            />
            {modelImage && (
              <img
                src={modelImage}
                alt="Model"
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0"
                }}
              />
            )}
          </div>

          {/* Product Upload */}
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "600" }}>
              👗 Foto do Produto
            </h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "product")}
              style={{ marginBottom: "20px" }}
            />
            {productImage && (
              <img
                src={productImage}
                alt="Product"
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  border: "2px solid #e0e0e0"
                }}
              />
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !modelImage || !productImage}
            style={{
              padding: "16px 48px",
              background: isGenerating
                ? "#cbd5e0"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "18px",
              fontWeight: "600",
              cursor: isGenerating ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
            }}
          >
            {isGenerating ? "⏳ Gerando..." : "🚀 Gerar Foto Profissional"}
          </button>
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: "30px"
          }}>
            <div style={{
              width: "100%",
              height: "8px",
              background: "#e0e0e0",
              borderRadius: "4px",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${progress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                transition: "width 0.3s ease"
              }} />
            </div>
            <p style={{ textAlign: "center", marginTop: "10px", color: "#666" }}>
              {progress}% - Processando com Try-On Max...
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "600" }}>
              ✨ Resultado Profissional
            </h3>
            <img
              src={result}
              alt="Result"
              style={{
                width: "100%",
                maxWidth: "600px",
                margin: "0 auto 20px auto",
                display: "block",
                borderRadius: "8px",
                border: "2px solid #e0e0e0"
              }}
            />
            <div style={{ textAlign: "center" }}>
              <button
                onClick={handleDownload}
                style={{
                  padding: "12px 32px",
                  background: "#48bb78",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  marginRight: "10px"
                }}
              >
                ⬇️ Baixar Foto
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setModelImage(null);
                  setProductImage(null);
                }}
                style={{
                  padding: "12px 32px",
                  background: "#e0e0e0",
                  color: "#333",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                🔄 Nova Foto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
