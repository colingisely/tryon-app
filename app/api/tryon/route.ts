import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const FASHN_API_URL = "https://api.fashn.ai/v1/run";
const FASHN_API_KEY = process.env.FASHN_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// ─── Types ─────────────────────────────────────────────────────────────────

type GarmentCategory = "tops" | "bottoms" | "one-pieces";

interface GarmentAnalysis {
  category: GarmentCategory;
  description: string; // Used as prompt hint for Try-On Max
}

// ─── Credit Management ─────────────────────────────────────────────────────

async function validateAndDeductCredits(
  apiKey: string | null,
  mode: "fast" | "premium"
): Promise<{ success: boolean; error?: string; merchantId?: string }> {
  // If no API key provided, allow for testing (will be removed in production)
  if (!apiKey) {
    console.log("⚠️ No API key provided - allowing for testing");
    return { success: true };
  }

  if (!supabase) {
    console.log("⚠️ Supabase not configured - allowing for testing");
    return { success: true };
  }

  try {
    // 1. Find merchant by API key
    const { data: merchant, error: merchantError } = await supabase
      .from("merchants")
      .select("id, fast_credits_remaining, premium_credits_remaining, subscription_status")
      .eq("api_key", apiKey)
      .single();

    if (merchantError || !merchant) {
      return { success: false, error: "API key inválida" };
    }

    if (merchant.subscription_status !== "active" && merchant.subscription_status !== "trial") {
      return { success: false, error: "Assinatura inativa" };
    }

    // 2. Check if merchant has enough credits
    const creditsNeeded = mode === "premium" ? 1 : 1; // Both modes cost 1 credit for now
    const creditsAvailable = mode === "premium"
      ? merchant.premium_credits_remaining
      : merchant.fast_credits_remaining;

    if (creditsAvailable < creditsNeeded) {
      return {
        success: false,
        error: `Créditos ${mode === "premium" ? "Premium" : "Fast"} insuficientes. Você tem ${creditsAvailable}, precisa de ${creditsNeeded}.`,
      };
    }

    // 3. Deduct credits
    const updateField = mode === "premium"
      ? "premium_credits_remaining"
      : "fast_credits_remaining";
    const usedField = mode === "premium"
      ? "premium_credits_used_total"
      : "fast_credits_used_total";

    const { error: updateError } = await supabase
      .from("merchants")
      .update({
        [updateField]: creditsAvailable - creditsNeeded,
        [usedField]: merchant[usedField] + creditsNeeded,
      })
      .eq("id", merchant.id);

    if (updateError) {
      console.error("Error updating credits:", updateError);
      return { success: false, error: "Erro ao atualizar créditos" };
    }

    console.log(`✅ Credits deducted: ${creditsNeeded} ${mode} credits from merchant ${merchant.id}`);
    return { success: true, merchantId: merchant.id };
  } catch (error) {
    console.error("Error in credit validation:", error);
    return { success: false, error: "Erro ao validar créditos" };
  }
}

async function logUsage(
  merchantId: string | undefined,
  mode: "fast" | "premium",
  modelImageUrl: string,
  productImageUrl: string,
  resultImageUrl: string,
  req: Request
) {
  if (!merchantId || !supabase) return;

  try {
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await supabase.from("usage_logs").insert({
      merchant_id: merchantId,
      mode,
      credits_used: 1,
      model_image_url: modelImageUrl.substring(0, 500), // Truncate to avoid DB limits
      product_image_url: productImageUrl.substring(0, 500),
      result_image_url: resultImageUrl,
      ip_address: ipAddress,
      user_agent: userAgent.substring(0, 500),
    });

    console.log(`📊 Usage logged for merchant ${merchantId}`);
  } catch (error) {
    console.error("Error logging usage:", error);
  }
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
// 1 credit per image

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
    const { image, productImage, mode, apiKey } = await req.json();

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

    // Step 1: Validate API key and check credits
    const useFast = mode === "fast";
    const creditCheck = await validateAndDeductCredits(apiKey, useFast ? "fast" : "premium");

    if (!creditCheck.success) {
      return NextResponse.json(
        { error: creditCheck.error || "Erro ao validar créditos" },
        { status: 403, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Step 2: Analyze garment (category + styling prompt)
    const analysis = await analyzeGarment(productImage);
    console.log(`👗 Categoria: ${analysis.category}`);
    console.log(`💡 Prompt: ${analysis.description}`);

    // Step 3: Choose endpoint based on mode
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

    // Step 4: Log usage
    await logUsage(
      creditCheck.merchantId,
      useFast ? "fast" : "premium",
      image,
      productImage,
      resultData.resultUrl,
      req
    );

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
