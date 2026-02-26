// lib/gemini.ts
// Integração com Google Gemini com retry automático

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY || ""
);

/**
 * Converte URL para base64 (para Gemini aceitar)
 */
async function urlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return base64;
  } catch (err) {
    console.error(`Erro ao converter URL ${url}:`, err);
    throw new Error(`Erro ao baixar imagem: ${url}`);
  }
}

/**
 * Gera prompt dinâmico baseado no tipo de roupa
 */
function generatePrompt(clothingType: string = "jacket"): string {
  const basePrompt = `You are an expert fashion photo editor.
Your task is to edit the clothing in a photograph while preserving everything else.

Use Image 1 as the base image.
Replace only the clothing worn by the person in Image 1 by dressing her with the ${clothingType} from Image 2.
Do not modify anything else: preserve the original person's face, body, skin tone, hair, facial expression, proportions, pose, camera angle, lighting, background, environment, reflections, shadows, image resolution, and overall photo quality exactly as in Image 1.
Apply the ${clothingType} with photorealistic accuracy, maintaining the original fabric texture, stitching, seams, color tones, logo placement, and material behavior exactly as shown in Image 2.
Critical requirement — arm positioning and fit:
Adapt the ${clothingType} naturally to the current arm position and posture of the person in Image 1.
Ensure correct lighting interaction.
The final result must look like a single authentic photograph.`;

  return basePrompt;
}

/**
 * Chama Gemini com retry automático
 */
export async function generateReflexy(
  userImageBase64: string,
  productImageUrl: string,
  clothingType: string = "jacket",
  maxRetries: number = 3
): Promise<string> {
  console.log(`🚀 Iniciando try-on (tentativas: ${maxRetries})...`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n🔄 Tentativa ${attempt}/${maxRetries}...`);

      // Converter URL do produto para base64
      console.log(`📥 Baixando imagem do produto...`);
      const productBase64 = await urlToBase64(productImageUrl);

      // Preparar imagens para Gemini
      const userImageData = {
        inlineData: {
          data: userImageBase64.split(",")[1], // Remove "data:image/png;base64,"
          mimeType: "image/jpeg",
        },
      };

      const productImageData = {
        inlineData: {
          data: productBase64,
          mimeType: "image/jpeg",
        },
      };

      // Gerar prompt
      const prompt = generatePrompt(clothingType);

      // Chamar Gemini
      console.log(`🤖 Chamando Gemini...`);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const response = await model.generateContent([
        { text: "Image 1 (base image):" },
        userImageData,
        { text: "Image 2 (product image):" },
        productImageData,
        { text: prompt },
      ]);

      // Verificar se retornou imagem
      const result = response.response;

      if (result.candidates && result.candidates[0]) {
        const content = result.candidates[0].content;

        // Procurar por imagem na resposta
        if (content.parts && content.parts.length > 0) {
          for (const part of content.parts) {
            // Se tem inlineData, é uma imagem
            if ((part as any).inlineData) {
              const imageData = (part as any).inlineData.data;
              const mimeType = (part as any).inlineData.mimeType;

              // Converter para data URL
              const dataUrl = `data:${mimeType};base64,${imageData}`;
              console.log(`✅ Sucesso na tentativa ${attempt}!`);
              return dataUrl;
            }
          }
        }
      }

      console.log(
        `⚠️ Tentativa ${attempt} retornou texto em vez de imagem`
      );

      if (attempt < maxRetries) {
        const waitTime = 2000 * attempt; // Backoff exponencial
        console.log(
          `⏳ Aguardando ${waitTime}ms antes de tentar novamente...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    } catch (err) {
      console.error(`❌ Erro na tentativa ${attempt}:`, err);

      if (attempt < maxRetries) {
        const waitTime = 2000 * attempt;
        console.log(
          `⏳ Aguardando ${waitTime}ms antes de tentar novamente...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } else {
        throw err;
      }
    }
  }

  throw new Error(
    `Gemini falhou após ${maxRetries} tentativas. Tente novamente.`
  );
}
