'use client';

import { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function StickyCta() {
  const { t } = useLanguage();

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
    <div id="sticky-cta" role="complementary" aria-label={t('stickyCta.ariaLabel')}>
      <span className="sticky-cta-text">{t('stickyCta.text')}</span>
      <a href="#pricing" className="btn-p">{t('stickyCta.button')} <span aria-hidden="true">→</span></a>
    </div>
  );
}
