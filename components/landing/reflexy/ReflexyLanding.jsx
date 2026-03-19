/**
 * reflexy/ReflexyLanding.jsx
 *
 * Componente raiz. Injeta o CSS global e as fontes uma única vez,
 * e compõe todos os componentes da landing page em ordem.
 *
 * Notas de implementação:
 * - 'use client' é necessário para Next.js App Router.
 *   Remova esta linha para Pages Router ou React puro.
 * - O CSS em constants/styles.js é injetado globalmente (afeta html, body, :root).
 *   Em produção, mova o conteúdo para um arquivo .css global e remova a injeção via useEffect.
 * - Os links de e-mail usam obfuscação Cloudflare (/cdn-cgi/l/email-protection).
 *   Funcionam corretamente apenas em domínios roteados pelo Cloudflare.
 * - Para Next.js, substitua a injeção de fontes por next/font.
 */

'use client';

import StickyCta       from './components/StickyCta';
import Navbar          from './components/Navbar';
import Hero            from './components/Hero';
import PrismSeparator  from './components/PrismSeparator';
import Problem         from './components/Problem';
import Facets          from './components/Facets';
import { HowItWorks, Comparison, Results, Pricing, Faq, FinalCta, Footer } from './components/sections';

export default function ReflexyLanding() {

  return (
    <>
      <StickyCta />
      <Navbar />
      <Hero />
      <PrismSeparator />
      <Problem />
      <Facets />
      <HowItWorks />
      <Comparison />
      <Results />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </>
  );
}
