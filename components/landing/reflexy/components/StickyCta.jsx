'use client';

import { useEffect } from 'react';

export default function StickyCta() {
  useEffect(() => {
    /* ── STICKY CTA — IntersectionObserver ── */
    const stickyCta = document.getElementById('sticky-cta');
    const hero = document.getElementById('hero');
    if (!stickyCta || !hero) return;

    const heroObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          stickyCta.classList.remove('visible');
        } else {
          stickyCta.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    heroObs.observe(hero);

    return () => heroObs.disconnect();
  }, []);

  return (
    <div id="sticky-cta" role="complementary" aria-label="Ação rápida">
      <span className="sticky-cta-text">Provador virtual com IA para sua loja Shopify</span>
      <a href="#pricing" className="btn-p">Começar gratuitamente <span aria-hidden="true">→</span></a>
    </div>
  );
}
