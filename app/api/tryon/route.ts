import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

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

    console.log("✅ Imagem recebida do frontend");

    // Use the product image from the request
    const productImageUrl = productImage;

    console.log("🚀 Chamando Replicate IDM-VTON com parâmetros otimizados...");

    const output = await replicate.run(
      "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
      {
        input: {
          human_img: image,
          garm_img: productImageUrl,
          garment_des: "fashionable top",
          // ✅ Novos parâmetros para melhorar qualidade
          auto_crop: true,      // Recorta automaticamente a área da roupa
          auto_mask: true,      // Gera máscara automática para melhor precisão
        },
      }
    );

    console.log("✅ Replicate respondeu:", typeof output);

    if (!output) {
      return NextResponse.json(
        { error: "IA não retornou imagem" },
        { status: 500 }
      );
    }

    let resultUrl: string;
    if (typeof output === "string") {
      resultUrl = output;
    } else if (typeof output === "object" && "url" in (output as any)) {
      resultUrl = (output as any).url();
    } else if (Array.isArray(output) && output[0]) {
      resultUrl = typeof output[0] === "string" ? output[0] : (output[0] as any).url();
    } else {
      resultUrl = String(output);
    }

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
