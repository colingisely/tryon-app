import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Vercel: allow up to 300s so the tryon-max poll loop (~50s) doesn't hit the
// default 10s function timeout and cause a silent 500.
export const maxDuration = 300;

const FASHN_API_URL = 'https://api.fashn.ai/v1/run';
const FASHN_API_KEY = process.env.FASHN_API_KEY;

// ─── Convert File/Blob to base64 data URI ────────────────────────────────────

async function fileToDataUri(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return `data:${file.type || 'image/jpeg'};base64,${base64}`;
}

// ─── Fetch a preset public URL and convert to base64 data URI ───────────────
// FASHN.ai requires the image to be accessible from its servers. Fetching
// it here and converting to base64 guarantees delivery regardless of CORS
// or network restrictions on the preset CDN URL.

async function urlToDataUri(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch preset model image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return `data:${contentType.split(';')[0]};base64,${base64}`;
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

    if (result.status === 'completed') {
      return result;
    } else if (result.status === 'failed') {
      throw new Error(result.error?.message || 'Generation failed');
    }

    // Wait 2 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error('Timeout waiting for result');
}

// ─── Try-On Max (Premium Quality) ──────────────────────────────────────────

async function tryOnMax(modelImage: string, garmentImage: string): Promise<string> {
  console.log('Studio Pro: Using Try-On Max (tryon-max, ~50s)...');

  const response = await fetch(FASHN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${FASHN_API_KEY}`,
    },
    body: JSON.stringify({
      model_name: 'tryon-max',
      inputs: {
        model_image: modelImage,
        product_image: garmentImage,
        // 'auto' lets FASHN detect top/bottom/one-piece automatically;
        // omitting this field was causing FASHN to reject the request.
        category: 'auto',
        output_format: 'png',
        return_base64: false,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `FASHN API error: ${response.statusText}`);
  }

  const { id: predictionId } = await response.json();
  console.log('Try-On Max Prediction ID:', predictionId);

  const result = await pollFashnStatus(predictionId, 120);

  if (!result.output || !Array.isArray(result.output) || result.output.length === 0) {
    throw new Error('No output image returned from Try-On Max');
  }

  return result.output[0];
}

// ─── Main Route ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await req.formData();

    // Model image: either a File upload or a preset public URL string
    const modelFileEntry = formData.get('modelFile');
    const modelUrlEntry  = formData.get('model') as string | null;
    const modelPresetId  = formData.get('modelPresetId') as string | null;

    // Product image: File upload
    const productFileEntry = formData.get('productFile');

    if (!modelFileEntry && !modelUrlEntry) {
      return NextResponse.json({ error: 'Imagem do modelo não enviada' }, { status: 400 });
    }
    if (!productFileEntry) {
      return NextResponse.json({ error: 'Imagem do produto não enviada' }, { status: 400 });
    }
    if (!FASHN_API_KEY) {
      return NextResponse.json({ error: 'FASHN API key not configured' }, { status: 500 });
    }

    // Resolve model image:
    //   - Uploaded File  → read arrayBuffer → base64 data URI
    //   - Preset URL     → fetch on server  → base64 data URI
    // Converting preset URLs to base64 ensures FASHN.ai can always access
    // the image even when the CDN URL has CORS restrictions or is private.
    let finalModelImage: string;
    if (modelFileEntry && modelFileEntry instanceof File) {
      finalModelImage = await fileToDataUri(modelFileEntry);
    } else if (modelUrlEntry && modelUrlEntry.startsWith('http')) {
      // BUG FIX: fetch preset URL server-side and convert to base64 instead of
      // passing the raw URL, which FASHN.ai may not be able to reach.
      finalModelImage = await urlToDataUri(modelUrlEntry);
    } else {
      return NextResponse.json({ error: 'Imagem do modelo inválida' }, { status: 400 });
    }

    // Resolve product image: File → base64 data URI
    let finalProductImage: string;
    if (productFileEntry && productFileEntry instanceof File) {
      finalProductImage = await fileToDataUri(productFileEntry);
    } else {
      return NextResponse.json({ error: 'Imagem do produto inválida' }, { status: 400 });
    }

    // 1. Verificar créditos premium
    // BUG FIX: use (merchant.premium_credits_remaining ?? 0) so that a NULL
    // value in the DB column does not falsely trigger the "insufficient credits"
    // guard (null <= 0 is true in JS, which blocked valid users).
    const { data: merchant, error: mErr } = await supabase
      .from('merchants')
      .select('premium_credits_remaining')
      .eq('id', user.id)
      .single();

    if (mErr || !merchant) {
      return NextResponse.json({ error: 'Merchant não encontrado' }, { status: 403 });
    }

    const creditsRemaining = merchant.premium_credits_remaining ?? 0;
    if (creditsRemaining <= 0) {
      return NextResponse.json({ error: 'Créditos premium insuficientes' }, { status: 403 });
    }

    // 2. Chamar FASHN.ai com tryon-max (geração real)
    console.log('Studio Pro: iniciando geração com tryon-max...');
    const resultUrl = await tryOnMax(finalModelImage, finalProductImage);
    console.log('Studio Pro: imagem gerada com sucesso');

    // 3. Decrementar crédito premium — do this before the DB insert so the
    //    credit is always consumed for a successful generation even if the
    //    history log write fails.
    await supabase
      .from('merchants')
      .update({ premium_credits_remaining: creditsRemaining - 1 })
      .eq('id', user.id);

    // 4. Salvar no banco de dados (studio_generations)
    // BUG FIX: do NOT throw if this insert fails — the studio_generations table
    // may not exist yet (it is absent from supabase-schema.sql). Return the
    // image URL regardless so the user gets their result.
    let genId: string | null = null;
    let genCreatedAt: string | null = null;
    let genModelName: string = modelPresetId ? `Preset ${modelPresetId}` : 'Upload Customizado';

    const { data: gen, error: gErr } = await supabase
      .from('studio_generations')
      .insert({
        merchant_id: user.id,
        result_image_url: resultUrl,
        model_name: genModelName,
        status: 'done',
      })
      .select()
      .single();

    if (gErr) {
      // Log the error but don't fail — missing table or RLS denial must not
      // prevent the user from receiving the generated image.
      console.error('studio_generations insert failed (non-fatal):', gErr.message);
    } else if (gen) {
      genId        = gen.id;
      genCreatedAt = gen.created_at;
      genModelName = gen.model_name ?? genModelName;
    }

    return NextResponse.json({
      id:        genId ?? `gen_${Date.now()}`,
      imageUrl:  resultUrl,
      url:       resultUrl,
      createdAt: genCreatedAt ?? new Date().toISOString(),
      modelName: genModelName,
    });

  } catch (error: any) {
    console.error('[studio/generate] Unhandled error:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
