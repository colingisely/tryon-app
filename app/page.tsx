import type { Metadata } from 'next';
import ReflexyLanding from '@/components/landing/reflexy/ReflexyLanding';

export const metadata: Metadata = {
  title: 'REFLEXY — O reflexo da sua conversão',
  description: 'Provador virtual com IA, geração de imagens profissionais e analytics comportamental para e-commerce de moda. Integração nativa Shopify.',
};

export default function Page() {
  return <ReflexyLanding />;
}
