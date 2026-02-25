"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Barra de progresso animada
  useEffect(() => {
    if (loading) {
      setProgress(0);
      const startTime = Date.now();
      const estimatedTime = 20000; // 20 segundos estimados

      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        let newProgress: number;
        if (elapsed < estimatedTime * 0.6) {
          newProgress = (elapsed / (estimatedTime * 0.6)) * 70;
        } else if (elapsed < estimatedTime) {
          const remaining = (elapsed - estimatedTime * 0.6) / (estimatedTime * 0.4);
          newProgress = 70 + remaining * 20;
        } else {
          const extra = (elapsed - estimatedTime) / 30000;
          newProgress = Math.min(90 + extra * 8, 98);
        }
        setProgress(Math.min(Math.round(newProgress), 98));
      }, 200);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      if (resultImage) {
        setProgress(100);
        setTimeout(() => setProgress(0), 500);
      } else {
        setProgress(0);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [loading, resultImage]);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResultImage(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function generateLook() {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro no servidor");
      }

      if (!data || !data.result) {
        throw new Error("Sem imagem de retorno");
      }

      setResultImage(data.result);
    } catch (err: any) {
      console.error("Erro:", err);
      setError(err.message || "A IA ainda não retornou uma imagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadImage() {
    if (!resultImage) return;

    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "look-gerado.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao baixar:", err);
      // Fallback: tenta download direto
      const link = document.createElement("a");
      link.href = resultImage;
      link.download = "look-gerado.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <button
        onClick={() => setOpen(true)}
        className="px-6 py-3 bg-black text-white rounded-xl"
      >
        Experimentar look
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40">
          <div className="bg-white p-5 rounded-2xl w-full max-w-md relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Envie sua foto
            </h2>

            <label className="flex flex-col items-center justify-center cursor-pointer rounded-xl border-2 border-dashed border-gray-400 px-4 py-6 text-gray-700 hover:bg-gray-100 transition">
              <span className="text-sm font-medium">
                Clique para enviar sua foto
              </span>
              <span className="text-xs text-gray-500 mt-1">
                JPG ou PNG
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={generateLook}
              disabled={loading || !image}
              className="mt-4 w-full px-4 py-2 bg-black text-white rounded-xl disabled:opacity-50"
            >
              {loading ? "Gerando look..." : "Gerar look com IA"}
            </button>

            {/* Barra de progresso animada */}
            {loading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, #000 0%, #333 100%)",
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  {progress < 30
                    ? "Enviando sua foto..."
                    : progress < 70
                      ? "A IA está vestindo a roupa..."
                      : progress < 95
                        ? "Finalizando detalhes..."
                        : "Quase pronto..."}
                  {" "}
                  <span className="font-medium">{progress}%</span>
                </p>
              </div>
            )}

            {error && (
              <p className="mt-3 text-sm text-red-600 text-center">
                {error}
              </p>
            )}

            {!loading && !resultImage && image && (
              <img
                src={image}
                alt="Preview"
                className="mt-4 rounded-xl max-h-64 w-full object-contain"
              />
            )}

            {resultImage && (
              <>
                <img
                  src={resultImage}
                  alt="Resultado IA"
                  onClick={() => setZoomOpen(true)}
                  className="mt-4 rounded-xl border w-full max-h-64 object-contain cursor-pointer hover:opacity-90 transition"
                />

                <button
                  onClick={downloadImage}
                  className="mt-3 w-full px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition"
                >
                  ↓ Baixar imagem
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tela cheia com X discreto */}
      {zoomOpen && resultImage && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
          onClick={() => setZoomOpen(false)}
        >
          {/* Botão X discreto no canto */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoomOpen(false);
            }}
            className="absolute top-4 right-4 z-50 text-white/50 hover:text-white/80 transition text-3xl font-light"
            title="Fechar"
          >
            ✕
          </button>

          {/* Imagem em tela cheia */}
          <img
            src={resultImage}
            alt="Visualização ampliada"
            className="max-h-[95vh] max-w-[95vw] object-contain"
          />
        </div>
      )}
    </main>
  );
}
