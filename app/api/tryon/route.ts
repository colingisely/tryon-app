import { NextResponse } from "next/server";

const FASHN_API_URL = "https://api.fashn.ai/v1/run";
const FASHN_API_KEY = process.env.FASHN_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function analyzeGarmentWithAI(garmentImageUrl: string): Promise<string> {
  try {
    console.log("🔍 Analisando roupa com Gemini Vision...");
    
    const response = await fetch("https://api.manus.im/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this garment image and provide a detailed description for a virtual try-on AI. Focus on:
1. Type of garment (shirt, sweater, jacket, dress, etc.)
2. Fit style (tight, fitted, regular, loose, oversized)
3. Texture (smooth, fuzzy, fluffy, knit, ribbed, etc.)
4. Material appearance (cotton, wool, fleece, denim, etc.)
5. Color and patterns
6. Key visual details

Provide a concise description in English (max 100 words) that will help the AI understand how this garment should look when worn. Be specific about texture and fit.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: garmentImageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.warn("⚠️ Gemini analysis failed, continuing without description");
      return "";
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content || "";
    
    console.log("✅ Descrição gerada:", description);
    return description;
  } catch (error) {
    console.warn("⚠️ Error analyzing garment:", error);
    return "";
  }
}

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
    
    // Analyze garment with AI
    const garmentDescription = await analyzeGarmentWithAI(productImage);
    
    console.log("🚀 Chamando FASHN.ai Virtual Try-On v1.6...");

    // Prepare FASHN.ai request body
    const fashnBody: any = {
      model_name: "tryon-v1.6",
      inputs: {
        model_image: image,
        garment_image: productImage,
      },
      mode: "balanced",
      output_format: "jpeg",
      return_base64: false,
    };

    // Add garment description if available
    if (garmentDescription) {
      fashnBody.inputs.garment_description = garmentDescription;
      console.log("📝 Usando descrição da roupa para melhorar resultado");
    }

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
      const errorData = await response.json();
      throw new Error(errorData.message || `FASHN API error: ${response.statusText}`);
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
