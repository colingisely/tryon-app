import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkBillingAndDeduct, type GenerationType } from "@/lib/billing-check";

const FASHN_API_URL = "https://api.fashn.ai/v1/run";
const FASHN_API_KEY = process.env.FASHN_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey) as any
  : null;

// ─── Types ─────────────────────────────────────────────────────────────────

type GarmentCategory = "tops" | "bottoms" | "one-pieces";

interface GarmentAnalysis {
  category: GarmentCategory;
  description: string; // Used as prompt hint for Try-On Max
  garmentPhotoType: "flat-lay" | "model" | "auto";
  segmentationFree: boolean;
}

// ─── Merchant Lookup ────────────────────────────────────────────────────────

async function getMerchantByApiKey(apiKey: string): Promise<{ id: string; subscription_status: string } | null> {
  if (!supabase) return null;

  const { data: merchant, error } = await supabase
    .from("merchants")
    .select("id, subscription_status")
    .eq("api_key", apiKey)
    .single();

  if (error || !merchant) return null;
  return merchant;
}

// ─── Usage Logging ──────────────────────────────────────────────────────────

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

async function analyzeGarment(
  imageUrl: string,
  productTitle?: string,
  productDescription?: string
): Promise<GarmentAnalysis> {
  const defaultResult: GarmentAnalysis = {
    category: "tops",
    description: "",
    garmentPhotoType: "auto",
    segmentationFree: true,
  };

  if (!OPENAI_API_KEY) {
    console.log("⚠️ No OpenAI key, defaulting to tops");
    return defaultResult;
  }

  try {
    console.log("🔍 Analyzing garment with GPT Vision...");

    // Build optional context from product page
    const contextLines: string[] = [];
    if (productTitle) contextLines.push(`Product name: ${productTitle}`);
    if (productDescription) contextLines.push(`Description: ${productDescription.substring(0, 300)}`);
    const contextText = contextLines.length
      ? `\n\nAdditional context from the product page:\n${contextLines.join("\n")}`
      : "";

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
            content: `You are an expert fashion garment analyzer specializing in virtual try-on optimization. Analyze the product image (and optional page text) and provide:
1. CATEGORY: exactly one of "tops", "bottoms", or "one-pieces"
2. PHOTO_TYPE: how the garment is photographed — exactly one of "flat-lay", "model", or "auto"
3. SEGMENTATION_FREE: "true" or "false"
4. PROMPT: a detailed styling instruction (max 30 words) describing how this garment should look on a person

CATEGORY rules:
- "tops" = upper body only: t-shirts, shirts, blouses, sweaters, hoodies, cardigans, blazers, coats, jackets, vests, crop tops, tank tops
- "bottoms" = lower body only: pants, jeans, trousers, shorts, skirts, leggings, culottes, bermudas
- "one-pieces" = full body: dresses (short/midi/maxi/long), jumpsuits, rompers, overalls, gowns, bodysuits, coveralls

PHOTO_TYPE rules:
- "flat-lay" = garment laid flat on a surface, no person
- "model" = garment worn by a person or mannequin
- "auto" = unclear

SEGMENTATION_FREE rules:
- "true" for tops and one-pieces (preserves body proportions better)
- "false" for bottoms (better waist and hip segmentation)

PROMPT rules (CRITICAL for quality):
- Describe KEY VISUAL DETAILS: color, pattern, texture, fabric type
- Mention FIT and DRAPE: loose, fitted, oversized, cropped, high-waisted, wide-leg, etc.
- For tops: specify neckline, sleeve length — end with "preserve existing lower body and legs"
- For bottoms: specify rise, leg shape, length — end with "preserve existing upper body and top"
- For one-pieces/dresses: describe silhouette and length — end with "replace full outfit from shoulders to hem"
- Focus on REALISTIC DRAPING and NATURAL FABRIC BEHAVIOR

Reply in this exact format (4 lines only):
CATEGORY: <category>
PHOTO_TYPE: <photo_type>
SEGMENTATION_FREE: <true|false>
PROMPT: <detailed styling instruction>`,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageUrl, detail: "high" },
              },
              {
                type: "text",
                text: `Analyze this garment. Reply with CATEGORY, PHOTO_TYPE, SEGMENTATION_FREE, and PROMPT only.${contextText}`,
              },
            ],
          },
        ],
        max_tokens: 120,
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

    // Parse photo type
    let garmentPhotoType: "flat-lay" | "model" | "auto" = "auto";
    const photoMatch = answer.match(/PHOTO_TYPE:\s*(\S+)/i);
    if (photoMatch) {
      const pt = photoMatch[1].trim().toLowerCase();
      if (pt === "flat-lay") garmentPhotoType = "flat-lay";
      else if (pt === "model") garmentPhotoType = "model";
    }

    // Parse segmentation_free
    const segMatch = answer.match(/SEGMENTATION_FREE:\s*(true|false)/i);
    const segmentationFree = segMatch ? segMatch[1].toLowerCase() === "true" : category !== "bottoms";

    // Parse prompt
    let description = "";
    const promptMatch = answer.match(/PROMPT:\s*(.+)/i);
    if (promptMatch) {
      description = promptMatch[1].trim();
    }

    return { category, description, garmentPhotoType, segmentationFree };
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

  console.log("⏳ Aguardando resultado (tryon-max ~50s)...");
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
  category: GarmentCategory,
  mode: "fast" | "quality" = "quality",
  garmentPhotoType: "flat-lay" | "model" | "auto" = "auto",
  segmentationFree: boolean = true
): Promise<{ resultUrl: string; model: string }> {
  const fashnMode = mode === "fast" ? "balanced" : "quality";
  console.log(`🔄 Try-On v1.6 (${fashnMode} mode, category: ${category}, photo_type: ${garmentPhotoType}, seg_free: ${segmentationFree})...`);

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
        category: category,
        // Dynamic values from GPT analysis
        segmentation_free: segmentationFree,
        garment_photo_type: garmentPhotoType,
        // Mode: balanced for fast (8s), quality for premium fallback (12-17s)
        mode: fashnMode,
        // PNG for highest quality
        output_format: "png",
        return_base64: false,
        // Permissive moderation for fashion items
        moderation_level: "permissive",
      },
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
    const { image, productImage, mode, apiKey, productTitle, productDescription } = await req.json();

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

    // Step 1: Validate API key and get merchant
    let merchantId: string | undefined;

    if (apiKey) {
      if (!supabase) {
        console.log("⚠️ Supabase not configured - allowing for testing");
      } else {
        const merchant = await getMerchantByApiKey(apiKey);

        if (!merchant) {
          return NextResponse.json(
            { error: "API key inválida", code: "INVALID_API_KEY" },
            { status: 401, headers: { "Access-Control-Allow-Origin": "*" } }
          );
        }

        if (merchant.subscription_status !== "active" && merchant.subscription_status !== "trial") {
          return NextResponse.json(
            { error: "Assinatura inativa", code: "SUBSCRIPTION_INACTIVE" },
            { status: 403, headers: { "Access-Control-Allow-Origin": "*" } }
          );
        }

        merchantId = merchant.id;

        // ── BILLING CHECK ──────────────────────────────────────────────
        // Determina o tipo de geração com base no modo solicitado.
        // "tryon-max" or "premium" = Studio Pro (premium), qualquer outro modo = fast.
        const generationType: GenerationType = (mode === "tryon-max" || mode === "premium") ? "premium" : "fast";

        // checkBillingAndDeduct returns a deductCredit CALLBACK — it does NOT
        // deduct the credit immediately. The credit is only deducted when
        // billing.deductCredit() is called below, after successful generation.
        // If generation fails (throws), the outer catch block returns an error
        // WITHOUT ever calling deductCredit — so no credit is charged on failure.
        const billing = await checkBillingAndDeduct(merchantId, generationType);

        if (!billing.allowed) {
          return NextResponse.json(
            { error: billing.error!.message, code: billing.error!.code },
            { status: billing.error!.status, headers: { "Access-Control-Allow-Origin": "*" } }
          );
        }
        // ── FIM BILLING CHECK ───────────────────────────────────────────

        // Step 2: Analyze garment (category + styling prompt + photo type)
        const analysis = await analyzeGarment(productImage, productTitle, productDescription);
        console.log(`👗 Categoria: ${analysis.category} | foto: ${analysis.garmentPhotoType} | seg_free: ${analysis.segmentationFree}`);
        console.log(`💡 Prompt: ${analysis.description}`);

        // Step 3: Choose endpoint based on mode
        const useFast = mode !== "tryon-max" && mode !== "premium";
        let resultData: { resultUrl: string; model: string };

        if (useFast) {
          // Fast mode: use v1.6 in quality mode (~15s, best quality without tryon-max)
          resultData = await tryOnV16(image, productImage, analysis.category, "quality", analysis.garmentPhotoType, analysis.segmentationFree);
        } else {
          // Premium mode: Try-On Max (50s, 4K quality) with v1.6 quality fallback
          try {
            resultData = await tryOnMax(image, productImage, analysis.description);
          } catch (maxError: any) {
            console.log("⚠️ Try-On Max failed, falling back to v1.6 quality:", maxError?.message);
            resultData = await tryOnV16(image, productImage, analysis.category, "quality", analysis.garmentPhotoType, analysis.segmentationFree);
          }
        }

        console.log("✅ Resultado gerado com sucesso");
        console.log(`   Modelo: ${resultData.model} | Categoria: ${analysis.category}`);

        // Deduz o crédito SOMENTE após geração bem-sucedida.
        // Se qualquer erro ocorrer antes deste ponto (FASHN falhou, timeout,
        // etc.), o catch externo retorna 500 sem jamais chamar deductCredit.
        await billing.deductCredit();

        // Step 4: Log usage
        await logUsage(
          merchantId,
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
      }
    }

    // No API key provided — allow for testing (legacy behavior)
    console.log("⚠️ No API key provided - allowing for testing");

    const analysis = await analyzeGarment(productImage, productTitle, productDescription);
    console.log(`👗 Categoria: ${analysis.category} | foto: ${analysis.garmentPhotoType} | seg_free: ${analysis.segmentationFree}`);
    console.log(`💡 Prompt: ${analysis.description}`);

    const useFast = mode !== "tryon-max" && mode !== "premium";
    let resultData: { resultUrl: string; model: string };

    if (useFast) {
      resultData = await tryOnV16(image, productImage, analysis.category, "quality", analysis.garmentPhotoType, analysis.segmentationFree);
    } else {
      try {
        resultData = await tryOnMax(image, productImage, analysis.description);
      } catch (maxError: any) {
        console.log("⚠️ Try-On Max failed, falling back to v1.6 quality:", maxError?.message);
        resultData = await tryOnV16(image, productImage, analysis.category, "quality", analysis.garmentPhotoType, analysis.segmentationFree);
      }
    }

    console.log("✅ Resultado gerado com sucesso (sem API key)");

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
    // NOTE: reaching this block means billing.deductCredit() was never called,
    // so the merchant's credit was NOT consumed for this failed attempt.
    console.error("❌ Erro no try-on:", err?.message || err);
    return NextResponse.json(
      { error: `Erro no try-on: ${err?.message || "erro desconhecido"}`, credited: false },
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
