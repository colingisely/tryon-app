import { NextResponse } from "next/server";

const FASHN_API_URL = "https://api.fashn.ai/v1/run";
const FASHN_API_KEY = process.env.FASHN_API_KEY;

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

    console.log("✅ Imagem recebida do frontend");
    console.log("🚀 Chamando FASHN.ai Virtual Try-On v1.6 (quality mode)...");

    // Submit request to FASHN.ai with quality mode for best results
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
        // Auto-detect garment category (tops, bottoms, one-pieces)
        category: "auto",
        // Better body shape and skin texture preservation
        segmentation_free: true,
        // Auto-detect garment photo type
        garment_photo_type: "auto",
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
    console.log("✅ URL do resultado:", resultUrl);

    return NextResponse.json({ resultUrl }, { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      } 
    });

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
