'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      if (!supabase) {
        router.push('/login');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Get merchant data
      const { data: merchant } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!merchant) {
        router.push('/dashboard');
        return;
      }

      // Get all events for this merchant
      const { data: events } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (events) {
        // Calculate stats
        const totalTryons = events.filter(e => e.event_type === 'tryon_completed').length;
        const totalInitiated = events.filter(e => e.event_type === 'tryon_initiated').length;
        const totalFailed = events.filter(e => e.event_type === 'tryon_failed').length;
        const uniqueSessions = new Set(events.map(e => e.session_id)).size;

        // Calculate average time spent
        const closedEvents = events.filter(e => e.event_type === 'modal_closed' && e.metadata?.time_spent_seconds);
        const avgTimeSpent = closedEvents.length > 0
          ? Math.round(closedEvents.reduce((sum, e) => sum + (e.metadata.time_spent_seconds || 0), 0) / closedEvents.length)
          : 0;

        // Calculate conversion rate (completed / initiated)
        const conversionRate = totalInitiated > 0 ? ((totalTryons / totalInitiated) * 100).toFixed(1) : '0.0';

        setStats({
          totalTryons,
          totalInitiated,
          totalFailed,
          uniqueSessions,
          avgTimeSpent,
          conversionRate
        });

        // Get top products
        const productMap: any = {};
        events.filter(e => e.product_id && e.event_type === 'tryon_completed').forEach(e => {
          if (!productMap[e.product_id]) {
            productMap[e.product_id] = {
              id: e.product_id,
              name: e.product_name || 'Unknown Product',
              image: e.product_image_url,
              count: 0
            };
          }
          productMap[e.product_id].count++;
        });

        const sortedProducts = Object.values(productMap).sort((a: any, b: any) => b.count - a.count).slice(0, 10);
        setTopProducts(sortedProducts);

        // Get recent events
        setRecentEvents(events.slice(0, 20));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  }

  function formatEventType(type: string) {
    const labels: any = {
      'tryon_initiated': 'Try-On Iniciado',
      'tryon_completed': 'Try-On Completo',
      'tryon_failed': 'Try-On Falhou',
      'modal_closed': 'Modal Fechado'
    };
    return labels[type] || type;
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-black">Analytics</h1>
            <p className="text-sm text-gray-600">Reflexo Comportamental dos seus clientes</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-black"
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Try-Ons Completos</p>
            <p className="text-3xl font-bold text-black">{stats?.totalTryons || 0}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Iniciados</p>
            <p className="text-3xl font-bold text-black">{stats?.totalInitiated || 0}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Taxa de Conversão</p>
            <p className="text-3xl font-bold text-black">{stats?.conversionRate}%</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Sessões Únicas</p>
            <p className="text-3xl font-bold text-black">{stats?.uniqueSessions || 0}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Tempo Médio</p>
            <p className="text-3xl font-bold text-black">{stats?.avgTimeSpent || 0}s</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Falhas</p>
            <p className="text-3xl font-bold text-red-600">{stats?.totalFailed || 0}</p>
          </div>
        </div>

        {/* Top Products */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Produtos Mais Provados</h2>
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Produto</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">Try-Ons</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-8 text-center text-gray-500">
                      Nenhum dado ainda. Aguardando primeiros try-ons...
                    </td>
                  </tr>
                ) : (
                  topProducts.map((product, idx) => (
                    <tr key={idx} className="border-b border-gray-200 last:border-0">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                          )}
                          <div>
                            <p className="font-medium text-black">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right font-bold text-black">{product.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Events */}
        <div>
          <h2 className="text-xl font-bold mb-4">Eventos Recentes</h2>
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Evento</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Produto</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">Quando</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500">
                      Nenhum evento registrado ainda.
                    </td>
                  </tr>
                ) : (
                  recentEvents.map((event, idx) => (
                    <tr key={idx} className="border-b border-gray-200 last:border-0">
                      <td className="p-4">
                        <span className="inline-block px-2 py-1 bg-white rounded text-sm border border-gray-300">
                          {formatEventType(event.event_type)}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">{event.product_name || '-'}</td>
                      <td className="p-4 text-right text-gray-500 text-sm">{formatDate(event.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
