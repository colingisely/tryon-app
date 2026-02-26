// app/components/ReflexyWidget.tsx
// Widget do frontend - upload + polling

"use client";

import { useState, useRef } from "react";

interface ReflexyWidgetProps {
  productImageUrl: string;
  productName?: string;
  clothingType?: string;
}

export function ReflexyWidget({
  productImageUrl,
  productName = "Produto",
  clothingType = "jacket",
}: ReflexyWidgetProps) {
  const [status, setStatus] = useState<
    "idle" | "uploading" | "processing" | "done" | "error"
  >("idle");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(file: File) {
    setStatus("uploading");
    setError(null);
    setProgress("📤 Enviando sua foto...");

    try {
      // Validar tamanho
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        setError("Imagem muito grande. Máximo 5MB.");
        setStatus("error");
        setProgress("");
        return;
      }

      // Converter para base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;

        setProgress("🔄 Criando job de processamento...");

        // POST /api/tryon
        const response = await fetch("/api/tryon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userImage: base64,
            productImageUrl: productImageUrl,
            clothingType: clothingType,
          }),
        });

        if (!response.ok) {
          throw new Error("Erro ao enviar imagem");
        }

        const data = await response.json();
        const jobId = data.jobId;

        setProgress("⏳ Processando com IA (pode levar até 60s)...");
        setStatus("processing");

        // Iniciar polling
        await startPolling(jobId);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMsg);
      setStatus("error");
      setProgress("");
    }
  }

  async function startPolling(jobId: string) {
    const maxAttempts = 120; // 2 minutos
    let attempts = 0;

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(
          `/api/tryon/status?jobId=${jobId}`
        );
        const data = await response.json();

        if (data.status === "succeeded") {
          setResultImage(data.imageUrl);
          setStatus("done");
          setProgress("✅ Pronto!");
          clearInterval(pollInterval);
        } else if (data.status === "failed") {
          setError(data.error || "Erro ao processar");
          setStatus("error");
          setProgress("");
          clearInterval(pollInterval);
        } else {
          // Ainda processando
          setProgress(`⏳ Processando... (${attempts}s)`);
        }

        if (attempts >= maxAttempts) {
          setError("Processamento demorou muito");
          setStatus("error");
          setProgress("");
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("Erro ao verificar status:", err);
      }
    }, 1000); // Polling a cada 1 segundo
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 border rounded-lg bg-white shadow">
      <h2 className="text-2xl font-bold mb-4">👗 Provar {productName}</h2>

      {/* Upload */}
      {status === "idle" && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            📸 Enviar sua foto
          </button>

          <p className="text-sm text-gray-600 mt-2">
            Envie uma selfie clara para melhores resultados
          </p>
        </div>
      )}

      {/* Progress */}
      {(status === "uploading" || status === "processing") && (
        <div className="text-center">
          <p className="text-lg font-semibold mb-4">{progress}</p>
          <div className="animate-spin text-4xl">⏳</div>
        </div>
      )}

      {/* Resultado */}
      {status === "done" && resultImage && (
        <div>
          <p className="text-green-600 font-bold mb-4">✅ Pronto!</p>
          <img
            src={resultImage}
            alt="Try-on result"
            className="w-full rounded-lg mb-4 max-h-96 object-contain"
          />

          <button
            onClick={() => {
              const a = document.createElement("a");
              a.href = resultImage;
              a.download = "tryon-result.jpg";
              a.click();
            }}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition mb-2"
          >
            📥 Baixar imagem
          </button>

          <button
            onClick={() => {
              setStatus("idle");
              setResultImage(null);
              setProgress("");
            }}
            className="w-full bg-gray-600 text-white py-2 rounded-lg font-bold hover:bg-gray-700 transition"
          >
            🔄 Tentar outra foto
          </button>
        </div>
      )}

      {/* Erro */}
      {status === "error" && (
        <div>
          <p className="text-red-600 font-bold mb-4">❌ Erro</p>
          <p className="text-red-500 mb-4 text-sm">{error}</p>

          <button
            onClick={() => {
              setStatus("idle");
              setError(null);
              setProgress("");
            }}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            🔄 Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}
