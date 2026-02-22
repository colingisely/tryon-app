import { NextResponse } from "next/server";

const FASHN_API_URL = "https://api.fashn.ai/v1/run";
const FASHN_API_KEY = process.env.FASHN_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ─── Garment Category Detection via GPT Vision ─────────────────────────────

type GarmentCategory = "tops" | "bottoms" | "one-pieces";

async function detectGarmentCategory(imageUrl: string): Promise<GarmentCategory> {
  if (!OPENAI_API_KEY) {
    console.log("⚠️ No OpenAI key, defaulting to auto category");
    return "tops"; // safe default
  }

  try {
    console.log("🔍 Detecting garment category with GPT Vision...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are a fashion garment classifier. Analyze the product image and classify it into exactly ONE category. Reply with ONLY the category word, nothing else.

Categories:
- "tops" = upper body garments: t-shirts, shirts, blouses, sweaters, jackets, coats, vests, crop tops, tank tops, hoodies, cardigans
- "bottoms" = lower body garments: pants, jeans, trousers, shorts, skirts, leggings, bermudas
- "one-pieces" = full body garments: dresses, jumpsuits, rompers, overalls, bodysuits, full-length gowns

Rules:
- If the garment covers ONLY the upper body → "tops"
- If the garment covers ONLY the lower body → "bottoms"  
- If the garment covers BOTH upper AND lower body as one piece → "one-pieces"
- Jackets and coats are ALWAYS "tops" (they are outerwear for upper body)
- Sets/combos that are separate pieces: classify by the MAIN piece visible`
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "low"
                }
              },
              {
                type: "text",
                text: "What category is this garment? Reply with only: tops, bottoms, or one-pieces"
              }
            ]
          }
        ],
        max_tokens: 10,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      console.log("⚠️ GPT Vision failed, defaulting to auto");
      return "tops";
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content?.trim()?.toLowerCase() || "";

    // Validate the response
    if (answer.includes("bottoms")) return "bottoms";
    if (answer.includes("one-pieces") || answer.includes("one-piece")) return "one-pieces";
    if (answer.includes("tops")) return "tops";

    console.log("⚠️ Unexpected GPT response:", answer, "- defaulting to tops");
    return "tops";

  } catch (error) {
    console.log("⚠️ Category detection error, defaulting to tops:", error);
    return "tops";
  }
}

// ─── FASHN.ai Status Polling ────────────────────────────────────────────────

async function pollFashnStatus(predictionId: string, maxAttempts = 90): Promise<any> {
  const statusUrl = `https://api.fashn.ai/v1/status/${predictionId}`;
  
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(statusUrl, {
      headers: {
        'Authorization': `Bearer ${FASHN_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.status === 'completed') {
      return result;
    } else if (result.status === 'failed') {
      throw new Error(result.error?.message || 'Generation failed');
    }
    
    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Timeout waiting for result');
}

// ─── Main API Route ─────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { image, productImage } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Imagem não enviada" },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!productImage) {
      return NextResponse.json(
        { error: "Imagem do produto não enviada" },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!FASHN_API_KEY) {
      return NextResponse.json(
        { error: "FASHN API key not configured" },
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    console.log("✅ Imagens recebidas do frontend");

    // Step 1: Detect garment category using GPT Vision
    const category = await detectGarmentCategory(productImage);
    console.log(`👗 Categoria detectada: ${category}`);

    // Step 2: Call FASHN.ai with explicit category
    console.log(`🚀 Chamando FASHN.ai (quality mode, category: ${category})...`);

    const response = await fetch(FASHN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FASHN_API_KEY}`,
      },
      body: JSON.stringify({
        model_name: "tryon-v1.6",
        inputs: {
          model_image: image,
          garment_image: productImage,
        },
        // Quality mode: best results, preserves body/hands/face better
        mode: "quality",
        // EXPLICIT category from GPT Vision (tops/bottoms/one-pieces)
        // This tells FASHN exactly which body part to edit and which to preserve
        category: category,
        // Better body shape and skin texture preservation
        segmentation_free: true,
        // Product photos from Shopify are typically flat-lay or ghost mannequin
        garment_photo_type: "flat-lay",
        // PNG for highest quality output
        output_format: "png",
        // Return URL (not base64) for faster response
        return_base64: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `FASHN API error: ${response.statusText}`);
    }

    const { id: predictionId } = await response.json();
    console.log("📋 Prediction ID:", predictionId);

    // Poll for result (quality mode takes 12-17 seconds)
    console.log("⏳ Aguardando resultado (quality mode ~15s)...");
    const result = await pollFashnStatus(predictionId);

    if (!result.output || !Array.isArray(result.output) || result.output.length === 0) {
      throw new Error("No output image returned");
    }

    const resultUrl = result.output[0];
    console.log("✅ Resultado gerado com sucesso");
    console.log(`   Categoria: ${category} | Modo: quality | Tipo foto: flat-lay`);

    return NextResponse.json(
      { resultUrl, category },
      { 
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        } 
      }
    );

  } catch (err: any) {
    console.error("❌ Erro no try-on:", err?.message || err);
    return NextResponse.json(
      { error: `Erro no try-on: ${err?.message || "erro desconhecido"}` },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
