'use client';

import { useLanguage } from '../i18n/LanguageContext';

export default function Problem() {
  const { lang, t } = useLanguage();

  return (
    <section className="problem" id="problem">
      <div className="deco-grid deco-grid--dots" style={{width:'180px',height:'180px',top:'40px',right:'60px',borderRadius:'16px'}}></div>
      <div className="container">
        <div className="problem__header">
          <div className="reveal">
            <div className="section-tag"><span className="section-tag-dot"></span>{t('problem.tag')}</div>
          </div>
          <h2 className="section-title reveal" data-delay="1">
            {lang === 'en'
              ? <>Your customer doesn&apos;t buy because they&apos;re not <span className="text-gradient">sure.</span></>
              : <>Seu cliente não compra<br />porque não tem <span className="text-gradient">certeza.</span></>
            }
          </h2>
          <p className="section-sub reveal" data-delay="2">
            {t('problem.sub')}
          </p>
        </div>

        <div className="problem__grid stagger-scale">
          <div className="problem-card">
            <div className="problem-card__glow"></div>
            <div className="problem-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
              </svg>
            </div>
            <div className="problem-card__title">{t('problem.card1Title')}</div>
            <div className="problem-card__body">{t('problem.card1Body')}</div>
          </div>

          <div className="problem-card">
            <div className="problem-card__glow"></div>
            <div className="problem-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
            </div>
            <div className="problem-card__title">{t('problem.card2Title')}</div>
            <div className="problem-card__body">{t('problem.card2Body')}</div>
          </div>

          <div className="problem-card">
            <div className="problem-card__glow"></div>
            <div className="problem-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <div className="problem-card__title">{t('problem.card3Title')}</div>
            <div className="problem-card__body">{t('problem.card3Body')}</div>
          </div>

          <div className="problem-card">
            <div className="problem-card__glow"></div>
            <div className="problem-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div className="problem-card__title">{t('problem.card4Title')}</div>
            <div className="problem-card__body">{t('problem.card4Body')}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
