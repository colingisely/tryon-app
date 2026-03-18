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

import { useEffect } from 'react';
import { CSS }       from './constants/styles';

import StickyCta       from './components/StickyCta';
import Navbar          from './components/Navbar';
import Hero            from './components/Hero';
import PrismSeparator  from './components/PrismSeparator';
import Problem         from './components/Problem';
import Facets          from './components/Facets';
import { HowItWorks, Comparison, Results, Pricing, Faq, FinalCta, Footer } from './components/sections';

export default function ReflexyLanding() {
  useEffect(() => {
    /* ── Injetar CSS global ── */
    const styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    /* ── Injetar Google Fonts ── */
    const pc1 = document.createElement('link');
    pc1.rel = 'preconnect';
    pc1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(pc1);

    const pc2 = document.createElement('link');
    pc2.rel = 'preconnect';
    pc2.href = 'https://fonts.gstatic.com';
    pc2.setAttribute('crossorigin', '');
    document.head.appendChild(pc2);

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&family=IBM+Plex+Mono:wght@300;400;500&display=swap';
    document.head.appendChild(fontLink);

    document.title = 'REFLEXY';

    return () => {
      document.head.removeChild(styleEl);
      document.head.removeChild(pc1);
      document.head.removeChild(pc2);
      document.head.removeChild(fontLink);
    };
  }, []);

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
