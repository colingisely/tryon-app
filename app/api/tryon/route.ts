import { NextResponse } from "next/server";

const FASHN_API_URL = "https://api.fashn.ai/v1/run";
const FASHN_API_KEY = process.env.FASHN_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ─── Types ─────────────────────────────────────────────────────────────────

type GarmentCategory = "tops" | "bottoms" | "one-pieces";

interface GarmentAnalysis {
  category: GarmentCategory;
  description: string; // Used as prompt hint for Try-On Max
}

// ─── Garment Analysis via GPT Vision ───────────────────────────────────────
// Detects category AND generates a styling prompt for better results

async function analyzeGarment(imageUrl: string): Promise<GarmentAnalysis> {
  const defaultResult: GarmentAnalysis = {
    category: "tops",
    description: "",
  };

  if (!OPENAI_API_KEY) {
    console.log("⚠️ No OpenAI key, defaulting to tops");
    return defaultResult;
  }

  try {
    console.log("🔍 Analyzing garment with GPT Vision...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert fashion garment analyzer specializing in virtual try-on optimization. Analyze the product image and provide:
1. CATEGORY: exactly one of "tops", "bottoms", or "one-pieces"
2. PROMPT: a detailed styling instruction (max 25 words) describing how this garment should look on a person

Category rules:
- "tops" = upper body: t-shirts, shirts, blouses, sweaters, jackets, coats, vests, crop tops, tank tops, hoodies, cardigans, blazers
- "bottoms" = lower body: pants, jeans, trousers, shorts, skirts, leggings, bermudas, culottes
- "one-pieces" = full body: dresses, jumpsuits, rompers, overalls, bodysuits, gowns, coveralls

Prompt engineering rules (CRITICAL for quality):
- Describe the garment's KEY VISUAL DETAILS: color, pattern, texture, fabric type, embellishments
- Mention FIT and DRAPE: loose, fitted, oversized, cropped, high-waisted, wide-leg, etc.
- For tops: specify neckline, sleeve length, closure type (buttons, zipper, open)
- For bottoms: specify rise (high/mid/low), leg shape (straight, wide, skinny), length
- For one-pieces: describe silhouette, waistline, overall length
- ALWAYS include "preserve existing lower body" for tops, "preserve existing upper body" for bottoms
- NEVER mention removing background or changing scenery
- Focus on REALISTIC DRAPING and NATURAL FABRIC BEHAVIOR

Reply in this exact format (2 lines only):
CATEGORY: <category>
PROMPT: <detailed styling instruction>`,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageUrl, detail: "low" },
              },
              {
                type: "text",
                text: "Analyze this garment. Reply with CATEGORY and PROMPT only.",
              },
            ],
          },
        ],
        max_tokens: 80,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      console.log("⚠️ GPT Vision failed, using defaults");
      return defaultResult;
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content?.trim() || "";
    console.log("🤖 GPT Analysis:", answer);

    // Parse category
    let category: GarmentCategory = "tops";
    if (answer.toLowerCase().includes("bottoms")) category = "bottoms";
    else if (answer.toLowerCase().includes("one-pieces") || answer.toLowerCase().includes("one-piece"))
      category = "one-pieces";
    else if (answer.toLowerCase().includes("tops")) category = "tops";

    // Parse prompt
    let description = "";
    const promptMatch = answer.match(/PROMPT:\s*(.+)/i);
    if (promptMatch) {
      description = promptMatch[1].trim();
    }

    return { category, description };
  } catch (error) {
    console.log("⚠️ Garment analysis error:", error);
    return defaultResult;
  }
}

// ─── FASHN.ai Status Polling ────────────────────────────────────────────────

async function pollFashnStatus(predictionId: string, maxAttempts = 120): Promise<any> {
  const statusUrl = `https://api.fashn.ai/v1/status/${predictionId}`;

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(statusUrl, {
      headers: {
        Authorization: `Bearer ${FASHN_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.status === "completed") {
      return result;
    } else if (result.status === "failed") {
      throw new Error(result.error?.message || "Generation failed");
    }

    // Wait 2 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Timeout waiting for result");
}

// ─── Try-On Max (Premium Quality) ──────────────────────────────────────────
// Uses tryon-max model: 50s processing, up to 4K, enhanced fidelity
// 4 credits per image

async function tryOnMax(
  modelImage: string,
  garmentImage: string,
  prompt: string
): Promise<{ resultUrl: string; model: string }> {
  console.log("🏆 Using Try-On Max (premium quality, ~50s)...");
  console.log(`   Prompt: "${prompt || "(none)"}"`);

  const response = await fetch(FASHN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${FASHN_API_KEY}`,
    },
    body: JSON.stringify({
      model_name: "tryon-max",
      inputs: {
        model_image: modelImage,
        product_image: garmentImage,
        // Styling prompt from GPT analysis
        ...(prompt ? { prompt } : {}),
        // PNG for maximum quality
        output_format: "png",
        // Return URL for faster response
        return_base64: false,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.message || `FASHN API error: ${response.statusText}`);
  }

  const { id: predictionId } = await response.json();
  console.log("📋 Try-On Max Prediction ID:", predictionId);

  // Poll for result (Try-On Max takes ~50 seconds)
  console.log("⏳ Aguardando resultado (Try-On Max ~50s)...");
  const result = await pollFashnStatus(predictionId, 120);

  if (!result.output || !Array.isArray(result.output) || result.output.length === 0) {
    throw new Error("No output image returned from Try-On Max");
  }

  return { resultUrl: result.output[0], model: "tryon-max" };
}

// ─── Try-On v1.6 Quality (Fallback) ────────────────────────────────────────
// Uses tryon-v1.6 model: 12-17s processing, quality mode
// 1 credit per image

async function tryOnV16(
  modelImage: string,
  garmentImage: string,
  category: GarmentCategory
): Promise<{ resultUrl: string; model: string }> {
  console.log(`🔄 Fallback: Try-On v1.6 (quality mode, category: ${category})...`);

  const response = await fetch(FASHN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${FASHN_API_KEY}`,
    },
    body: JSON.stringify({
      model_name: "tryon-v1.6",
      inputs: {
        model_image: modelImage,
        garment_image: garmentImage,
      },
      // Quality mode: best v1.6 results (12-17s)
      mode: "quality",
      // Explicit category from GPT Vision
      category: category,
      // Better body shape and skin texture preservation
      segmentation_free: true,
      // Product photos from Shopify are typically flat-lay
      garment_photo_type: "flat-lay",
      // PNG for highest quality
      output_format: "png",
      return_base64: false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.message || `FASHN API error: ${response.statusText}`);
  }

  const { id: predictionId } = await response.json();
  console.log("📋 v1.6 Prediction ID:", predictionId);

  console.log("⏳ Aguardando resultado (v1.6 quality ~15s)...");
  const result = await pollFashnStatus(predictionId, 90);

  if (!result.output || !Array.isArray(result.output) || result.output.length === 0) {
    throw new Error("No output image returned from v1.6");
  }

  return { resultUrl: result.output[0], model: "tryon-v1.6" };
}

// ─── Main API Route ─────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { image, productImage, mode } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Imagem não enviada" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    if (!productImage) {
      return NextResponse.json(
        { error: "Imagem do produto não enviada" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    if (!FASHN_API_KEY) {
      return NextResponse.json(
        { error: "FASHN API key not configured" },
        { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    console.log("✅ Imagens recebidas do frontend");

    // Step 1: Analyze garment (category + styling prompt)
    const analysis = await analyzeGarment(productImage);
    console.log(`👗 Categoria: ${analysis.category}`);
    console.log(`💡 Prompt: ${analysis.description}`);

    // Step 2: Choose endpoint based on mode
    // Default: Try-On Max for best quality
    // Fallback: v1.6 quality if Max fails or if explicitly requested
    const useFast = mode === "fast";

    let resultData: { resultUrl: string; model: string };

    if (useFast) {
      // Fast mode: use v1.6 directly
      resultData = await tryOnV16(image, productImage, analysis.category);
    } else {
      // Premium mode (default): Try-On Max with v1.6 fallback
      try {
        resultData = await tryOnMax(image, productImage, analysis.description);
      } catch (maxError: any) {
        console.log("⚠️ Try-On Max failed, falling back to v1.6:", maxError?.message);
        resultData = await tryOnV16(image, productImage, analysis.category);
      }
    }

    console.log("✅ Resultado gerado com sucesso");
    console.log(`   Modelo: ${resultData.model} | Categoria: ${analysis.category}`);

    return NextResponse.json(
      {
        resultUrl: resultData.resultUrl,
        category: analysis.category,
        model: resultData.model,
        prompt: analysis.description,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (err: any) {
    console.error("❌ Erro no try-on:", err?.message || err);
    return NextResponse.json(
      { error: `Erro no try-on: ${err?.message || "erro desconhecido"}` },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
