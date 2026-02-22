import { NextResponse } from "next/server";

const FASHN_API_URL = "https://api.fashn.ai/v1/run";
const FASHN_API_KEY = process.env.FASHN_API_KEY;

async function pollFashnStatus(predictionId: string, maxAttempts = 60): Promise<any> {
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

function ensureBase64Prefix(base64Data: string): string {
  // If already has prefix, return as is
  if (base64Data.startsWith('data:image/')) {
    return base64Data;
  }
  
  // Add prefix
  return `data:image/jpeg;base64,${base64Data}`;
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

    console.log("✅ Imagens recebidas do frontend");
    
    // Ensure base64 images have correct prefix
    const userImage = ensureBase64Prefix(image);
    const garmentImage = productImage.startsWith('http') 
      ? productImage 
      : ensureBase64Prefix(productImage);
    
    console.log("🚀 Chamando FASHN.ai Virtual Try-On v1.6...");

    // Prepare FASHN.ai request body
    const fashnBody = {
      model_name: "tryon-v1.6",
      inputs: {
        model_image: userImage,
        garment_image: garmentImage,
      },
      mode: "balanced",
      output_format: "jpeg",
      return_base64: false,
    };

    // Submit request to FASHN.ai
    const response = await fetch(FASHN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FASHN_API_KEY}`,
      },
      body: JSON.stringify(fashnBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ FASHN API error:", errorText);
      throw new Error(`FASHN API error (${response.status}): ${errorText}`);
    }

    const { id: predictionId } = await response.json();
    console.log("📋 Prediction ID:", predictionId);

    // Poll for result
    console.log("⏳ Aguardando resultado...");
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
