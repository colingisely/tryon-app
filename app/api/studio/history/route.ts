import { createClient } from '@/lib/supabase/client';

import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('studio_generations')
    .select('id, result_image_url, created_at, model_name')
    .eq('merchant_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mapear para o formato esperado pelo frontend
  const history = data.map((item: any) => ({
    id: item.id,
    url: item.result_image_url,
    createdAt: new Date(item.created_at),
    modelName: item.model_name || 'Modelo'
  }));

  return NextResponse.json(history);
}
