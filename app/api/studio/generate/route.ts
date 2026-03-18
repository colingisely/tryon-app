import { createClient } from '@/lib/supabase/client';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const modelPresetId = formData.get('modelPresetId');
    const modelFile = formData.get('modelFile');
    const productFile = formData.get('productFile');

    // 1. Verificar créditos
    const { data: merchant, error: mErr } = await supabase
      .from('merchants')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (mErr || !merchant || merchant.credits <= 0) {
      return NextResponse.json({ error: 'Créditos insuficientes' }, { status: 403 });
    }

    // 2. Simular chamada de IA (Aqui entraria a integração real com Replicate/OpenAI/etc)
    // Por enquanto, vamos retornar uma imagem de exemplo após um delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    const mockResultUrl = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80';

    // 3. Salvar no banco de dados
    const { data: gen, error: gErr } = await supabase
      .from('studio_generations')
      .insert({
        merchant_id: user.id,
        result_image_url: mockResultUrl,
        model_name: modelPresetId ? `Preset ${modelPresetId}` : 'Upload Customizado',
        status: 'done'
      })
      .select()
      .single();

    if (gErr) throw gErr;

    // 4. Decrementar crédito
    await supabase
      .from('merchants')
      .update({ credits: merchant.credits - 1 })
      .eq('id', user.id);

    return NextResponse.json({
      id: gen.id,
      url: gen.result_image_url,
      createdAt: gen.created_at,
      modelName: gen.model_name
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
