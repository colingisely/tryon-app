'use client';

import { useLanguage } from '../i18n/LanguageContext';

// ── §04 HOW IT WORKS ──────────────────────────────────────────────────────────
export function HowItWorks() {
  const { lang, t } = useLanguage();
  return (
    <section className="how" id="how">
      <div className="container">
        <div className="how__grid">
          <div>
            <div className="reveal">
              <div className="section-tag"><span className="section-tag-dot"></span>{t('how.tag')}</div>
            </div>
            <h2 className="section-title reveal" data-delay="1">
              {lang === 'en'
                ? <>Install once.<br /><span className="text-gradient">Works forever.</span></>
                : <>Instale uma vez.<br /><span className="text-gradient">Funciona para sempre.</span></>
              }
            </h2>
            <p className="section-sub reveal" data-delay="2">
              {t('how.sub')}
            </p>

            <div className="how__steps stagger-left">
              <div className="how__step">
                <div className="how__step-num">01</div>
                <div>
                  <div className="how__step-title">{t('how.step1Title')}</div>
                  <div className="how__step-body">{t('how.step1Body')}</div>
                  <div className="how__step-badge">{t('how.step1Badge')}</div>
                </div>
              </div>
              <div className="how__step">
                <div className="how__step-num">02</div>
                <div>
                  <div className="how__step-title">{t('how.step2Title')}</div>
                  <div className="how__step-body">{t('how.step2Body')}</div>
                  <div className="how__step-badge">{t('how.step2Badge')}</div>
                </div>
              </div>
              <div className="how__step">
                <div className="how__step-num">03</div>
                <div>
                  <div className="how__step-title">{t('how.step3Title')}</div>
                  <div className="how__step-body">{t('how.step3Body')}</div>
                  <div className="how__step-badge">{t('how.step3Badge')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="reveal-right" data-delay="2">
            <div className="dashboard spin-border">
              <div className="dash__topbar">
                <div className="dash__dot" style={{background:'#FF5F57'}}></div>
                <div className="dash__dot" style={{background:'#FEBC2E'}}></div>
                <div className="dash__dot" style={{background:'#28C840'}}></div>
                <span style={{marginLeft:'8px',fontFamily:"'IBM Plex Mono',monospace",fontSize:'11px',color:'var(--dim)'}}>{t('how.dashProduction')}</span>
                <div className="glow-dot" style={{marginLeft:'auto'}}></div>
                <span style={{fontSize:'11px',color:'var(--accent)',fontFamily:"'IBM Plex Mono',monospace",marginLeft:'6px'}}>LIVE</span>
              </div>
              <div className="dash__metrics">
                <div className="dash__metric">
                  <div className="dash__metric-val text-gradient" style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'20px',fontWeight:800}}>+38%</div>
                  <div className="dash__metric-label">{t('how.dashConversion')}</div>
                </div>
                <div className="dash__metric">
                  <div className="dash__metric-val" style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'20px',fontWeight:800,color:'rgba(74,222,128,.9)'}}>−52%</div>
                  <div className="dash__metric-label">{t('how.dashReturns')}</div>
                </div>
                <div className="dash__metric">
                  <div className="dash__metric-val" style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:'20px',fontWeight:800,color:'var(--accent)'}}>&lt;15s</div>
                  <div className="dash__metric-label">{t('how.dashGeneration')}</div>
                </div>
              </div>
              <div className="dash__chart">
                <div className="dash__chart-label">{t('how.dashChartLabel')}</div>
                <div className="dash__chart-bars" id="dashBars"></div>
              </div>
              <div className="dash__alerts">
                <div className="dash__alert-title">{t('how.dashInsightsTitle')}</div>
                <div className="dash__alert">
                  <div className="dash__alert-dot" style={{background:'rgba(74,222,128,.9)'}}></div>
                  <span className="dash__alert-text">{t('how.dashAlert1')}</span>
                  <span className="dash__alert-time">{t('how.dashAlert1Time')}</span>
                </div>
                <div className="dash__alert">
                  <div className="dash__alert-dot" style={{background:'#FEBC2E'}}></div>
                  <span className="dash__alert-text">{t('how.dashAlert2')}</span>
                  <span className="dash__alert-time">{t('how.dashAlert2Time')}</span>
                </div>
                <div className="dash__alert">
                  <div className="dash__alert-dot" style={{background:'rgba(124,58,237,.9)'}}></div>
                  <span className="dash__alert-text">{t('how.dashAlert3')}</span>
                  <span className="dash__alert-time">{t('how.dashAlert3Time')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── §05 COMPARISON ────────────────────────────────────────────────────────────
export function Comparison() {
  const { lang, t } = useLanguage();
  return (
    <section className="compare" id="compare">
      <div className="container">
        <div className="compare__header">
          <div className="reveal">
            <div className="section-tag"><span className="section-tag-dot"></span>{t('compare.tag')}</div>
          </div>
          <h2 className="section-title reveal" data-delay="1">
            {lang === 'en'
              ? <>Most tools solve one layer.<br /><span className="text-gradient">Reflexy solves three.</span></>
              : <>A maioria resolve uma camada.<br /><span className="text-gradient">Reflexy resolve três.</span></>
            }
          </h2>
        </div>
        <div className="compare-table-wrap reveal-scale">
          <table className="compare-table">
            <thead>
              <tr>
                <th>{t('compare.colFeature')}</th>
                <th className="reflexy-col">{t('compare.colReflexy')}</th>
                <th>{t('compare.colCompetitors')}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>{t('compare.row1')}</td><td className="reflexy-col"><span className="check-yes">✓</span></td><td><span className="check-yes">✓</span></td></tr>
              <tr><td>{t('compare.row2')}</td><td className="reflexy-col"><span className="check-yes">✓</span></td><td><span className="check-no">✗</span></td></tr>
              <tr><td>{t('compare.row3')}</td><td className="reflexy-col"><span className="check-yes">✓</span></td><td><span className="check-no">✗</span></td></tr>
              <tr><td>{t('compare.row4')}</td><td className="reflexy-col"><span className="check-yes">✓</span></td><td><span className="check-no">✗</span></td></tr>
              <tr><td>{t('compare.row5')}</td><td className="reflexy-col"><span className="check-yes">✓</span></td><td><span className="check-no">✗</span></td></tr>
              <tr><td>{t('compare.row6')}</td><td className="reflexy-col"><span className="check-yes">✓</span></td><td>{t('compare.row6Competitor')}</td></tr>
              <tr><td>{t('compare.row7')}</td><td className="reflexy-col"><span className="check-yes">✓</span></td><td><span className="check-no">✗</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ── §06 RESULTS ───────────────────────────────────────────────────────────────
export function Results() {
  const { lang, t } = useLanguage();
  return (
    <>
      {/* Metrics grid */}
      <section className="metrics" id="metrics">
        <div className="container">
          <div className="metrics__grid stagger-up">
            <div className="metric">
              <div className="metric__value">+<span data-target="38" data-suffix="%">38%</span></div>
              <div className="metric__label">{t('results.metric1Label')}</div>
              <div className="metric__sub">{t('results.metric1Sub')}</div>
              <div className="metric__sparkline" id="spark1"></div>
              <div className="metric__trend metric__trend--up">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 7L5 3L9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                {t('results.metric1Trend')}
              </div>
            </div>
            <div className="metric">
              <div className="metric__value">−<span data-target="52" data-suffix="%">52%</span></div>
              <div className="metric__label">{t('results.metric2Label')}</div>
              <div className="metric__sub">{t('results.metric2Sub')}</div>
              <div className="metric__sparkline" id="spark2"></div>
              <div className="metric__trend metric__trend--down">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 3L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                {t('results.metric2Trend')}
              </div>
            </div>
            <div className="metric">
              <div className="metric__value">&lt;<span data-target="15" data-suffix="s">15s</span></div>
              <div className="metric__label">{t('results.metric3Label')}</div>
              <div className="metric__sub">{t('results.metric3Sub')}</div>
              <div className="metric__sparkline" id="spark3"></div>
              <div className="metric__trend metric__trend--up">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 7L5 3L9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                {t('results.metric3Trend')}
              </div>
            </div>
            <div className="metric">
              <div className="metric__value"><span data-target="4" data-suffix="K">4K</span></div>
              <div className="metric__label">{t('results.metric4Label')}</div>
              <div className="metric__sub">{t('results.metric4Sub')}</div>
              <div className="metric__sparkline" id="spark4"></div>
              <div className="metric__trend metric__trend--up">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 7L5 3L9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                {t('results.metric4Trend')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-sep" />

      {/* Testimonials carousel */}
      <section className="testimonial-section">
        <div className="testimonial-section__header container">
          <div className="reveal">
            <div className="section-tag"><span className="section-tag-dot"></span>{t('results.testimonialTag')}</div>
          </div>
          <h2 className="section-title reveal" data-delay="1">
            {lang === 'en'
              ? <>Merchants who <span className="text-gradient">already use</span> Reflexy</>
              : <>Lojistas que <span className="text-gradient">já usam</span> o Reflexy</>
            }
          </h2>
        </div>
        <div style={{overflow:'hidden',position:'relative',padding:'20px 0'}}>
          <div style={{position:'absolute',top:0,bottom:0,left:0,width:'120px',background:'linear-gradient(to right,var(--bg),transparent)',zIndex:2,pointerEvents:'none'}}></div>
          <div style={{position:'absolute',top:0,bottom:0,right:0,width:'120px',background:'linear-gradient(to left,var(--bg),transparent)',zIndex:2,pointerEvents:'none'}}></div>
          <div className="testimonials__track">
            <div className="testimonial-card">
              <div className="testimonial-card__glow"></div>
              <div className="testimonial-stars">
                <span className="testimonial-star">★</span><span className="testimonial-star">★</span>
                <span className="testimonial-star">★</span><span className="testimonial-star">★</span><span className="testimonial-star">★</span>
              </div>
              <div className="testimonial-card__text">{t('results.t1Text')}</div>
              <div className="testimonial-card__author">
                <div style={{width:'38px',height:'38px',borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),var(--accent))',display:'grid',placeItems:'center',fontSize:'14px',fontWeight:700,color:'#fff',flexShrink:0}}>A</div>
                <div>
                  <div className="testimonial-card__name">{t('results.t1Name')}</div>
                  <div className="testimonial-card__role">{t('results.t1Role')}</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-card__glow"></div>
              <div className="testimonial-stars">
                <span className="testimonial-star">★</span><span className="testimonial-star">★</span>
                <span className="testimonial-star">★</span><span className="testimonial-star">★</span><span className="testimonial-star">★</span>
              </div>
              <div className="testimonial-card__text">{t('results.t2Text')}</div>
              <div className="testimonial-card__author">
                <div style={{width:'38px',height:'38px',borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),var(--accent))',display:'grid',placeItems:'center',fontSize:'14px',fontWeight:700,color:'#fff',flexShrink:0}}>R</div>
                <div>
                  <div className="testimonial-card__name">{t('results.t2Name')}</div>
                  <div className="testimonial-card__role">{t('results.t2Role')}</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-card__glow"></div>
              <div className="testimonial-stars">
                <span className="testimonial-star">★</span><span className="testimonial-star">★</span>
                <span className="testimonial-star">★</span><span className="testimonial-star">★</span><span className="testimonial-star">★</span>
              </div>
              <div className="testimonial-card__text">{t('results.t3Text')}</div>
              <div className="testimonial-card__author">
                <div style={{width:'38px',height:'38px',borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),var(--accent))',display:'grid',placeItems:'center',fontSize:'14px',fontWeight:700,color:'#fff',flexShrink:0}}>C</div>
                <div>
                  <div className="testimonial-card__name">{t('results.t3Name')}</div>
                  <div className="testimonial-card__role">{t('results.t3Role')}</div>
                </div>
              </div>
            </div>
            {/* Duplicates for infinite loop */}
            <div className="testimonial-card">
              <div className="testimonial-card__glow"></div>
              <div className="testimonial-stars">
                <span className="testimonial-star">★</span><span className="testimonial-star">★</span>
                <span className="testimonial-star">★</span><span className="testimonial-star">★</span><span className="testimonial-star">★</span>
              </div>
              <div className="testimonial-card__text">{t('results.t1Text')}</div>
              <div className="testimonial-card__author">
                <div style={{width:'38px',height:'38px',borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),var(--accent))',display:'grid',placeItems:'center',fontSize:'14px',fontWeight:700,color:'#fff',flexShrink:0}}>A</div>
                <div>
                  <div className="testimonial-card__name">{t('results.t1Name')}</div>
                  <div className="testimonial-card__role">{t('results.t1Role')}</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-card__glow"></div>
              <div className="testimonial-stars">
                <span className="testimonial-star">★</span><span className="testimonial-star">★</span>
                <span className="testimonial-star">★</span><span className="testimonial-star">★</span><span className="testimonial-star">★</span>
              </div>
              <div className="testimonial-card__text">{t('results.t2Text')}</div>
              <div className="testimonial-card__author">
                <div style={{width:'38px',height:'38px',borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),var(--accent))',display:'grid',placeItems:'center',fontSize:'14px',fontWeight:700,color:'#fff',flexShrink:0}}>R</div>
                <div>
                  <div className="testimonial-card__name">{t('results.t2Name')}</div>
                  <div className="testimonial-card__role">{t('results.t2Role')}</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-card__glow"></div>
              <div className="testimonial-stars">
                <span className="testimonial-star">★</span><span className="testimonial-star">★</span>
                <span className="testimonial-star">★</span><span className="testimonial-star">★</span><span className="testimonial-star">★</span>
              </div>
              <div className="testimonial-card__text">{t('results.t3Text')}</div>
              <div className="testimonial-card__author">
                <div style={{width:'38px',height:'38px',borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),var(--accent))',display:'grid',placeItems:'center',fontSize:'14px',fontWeight:700,color:'#fff',flexShrink:0}}>C</div>
                <div>
                  <div className="testimonial-card__name">{t('results.t3Name')}</div>
                  <div className="testimonial-card__role">{t('results.t3Role')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── §07 PRICING ───────────────────────────────────────────────────────────────
export function Pricing() {
  const { lang, t } = useLanguage();
  const handleCheckout = async (planSlug) => {
    if (!planSlug) {
      console.error('Plan slug is missing');
      return;
    }
    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  const checkOk = (
    <svg className="pricing-card-v2__check pricing-card-v2__check--ok" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.2" opacity="0.3"/>
      <path d="M5.5 9l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const checkNo = (
    <svg className="pricing-card-v2__check pricing-card-v2__check--no" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.2" opacity="0.3"/>
      <path d="M6 12l6-6M12 12L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  return (
    <section className="pricing" id="pricing">
      <div className="container">
        <div className="pricing__header">
          <div className="reveal">
            <div className="section-tag"><span className="section-tag-dot"></span>{t('pricing.tag')}</div>
          </div>
          <h2 className="section-title reveal" data-delay="1">
            {lang === 'en'
              ? <>From first test to <span className="text-gradient">real scale.</span></>
              : <>Do primeiro teste à <span className="text-gradient">escala real.</span></>
            }
          </h2>
          <p className="section-sub reveal" data-delay="2">
            {t('pricing.sub')}
          </p>
        </div>

        {/* Preview plan banner */}
        <div className="free-entry-v2 reveal">
          <div className="free-entry-v2__left">
            <div className="free-entry-v2__tag">
              <div className="glow-dot"></div>
              {t('pricing.previewTag')}
            </div>
            <div className="free-entry-v2__desc">{t('pricing.previewDesc')}</div>
            <ul className="free-entry-v2__feats">
              <li className="free-entry-v2__feat free-entry-v2__feat--ok">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {t('pricing.previewF1')}
              </li>
              <li className="free-entry-v2__feat free-entry-v2__feat--no">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3.5 3.5l6 6M9.5 3.5l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                {t('pricing.previewF2')}
              </li>
              <li className="free-entry-v2__feat free-entry-v2__feat--no">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3.5 3.5l6 6M9.5 3.5l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                {t('pricing.previewF3')}
              </li>
              <li className="free-entry-v2__feat free-entry-v2__feat--no">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3.5 3.5l6 6M9.5 3.5l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                {t('pricing.previewF4')}
              </li>
            </ul>
          </div>
          <a href="/signup" className="btn-free">
            {t('pricing.previewBtn')}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>

        <div className="pricing__cards stagger-scale">
          {/* Starter */}
          <div className="pricing-card-v2 pricing-card-v2--free">
            <div className="pricing-card-v2__glow"></div>
            <div className="pricing-card-v2__topbar"></div>
            <div className="pricing-card-v2__name">Starter</div>
            <div className="pricing-card-v2__desc">{t('pricing.starterDesc')}</div>
            <div className="pricing-card-v2__price">
              <span className="pricing-card-v2__amount">$19</span>
              <span className="pricing-card-v2__period">{t('pricing.period')}</span>
            </div>
            <div className="pricing-card-v2__divider"></div>
            <div className="pricing-card-v2__features">
              <div className="pricing-card-v2__feature">{checkOk}{t('pricing.starterF1')}</div>
              <div className="pricing-card-v2__feature">{checkOk}{t('pricing.starterF2')}</div>
              <div className="pricing-card-v2__feature">{checkOk}{t('pricing.starterF3')}</div>
              <div className="pricing-card-v2__feature">{checkOk}{t('pricing.starterF4')}</div>
              <div className="pricing-card-v2__feature">{checkNo}<span style={{color:'var(--dim)'}}>{t('pricing.starterF5')}</span></div>
              <div className="pricing-card-v2__feature">{checkNo}<span style={{color:'var(--dim)'}}>{t('pricing.starterF6')}</span></div>
            </div>
            <button
              onClick={() => handleCheckout('starter')}
              className="btn-plan-v2 btn-plan-v2-ghost"
            >
              {t('pricing.btnStarter')}
            </button>
          </div>

          {/* Growth (featured) */}
          <div className="pricing-card-v2 pricing-card-v2--pro">
            <div className="pricing-card-v2__glow"></div>
            <div className="pricing-card-v2__topbar"></div>
            <div className="pricing-card-v2__badge">{t('pricing.mostPopular')}</div>
            <div className="pricing-card-v2__name">Growth</div>
            <div className="pricing-card-v2__desc">{t('pricing.growthDesc')}</div>
            <div className="pricing-card-v2__price">
              <span className="pricing-card-v2__amount">$39</span>
              <span className="pricing-card-v2__period">{t('pricing.period')}</span>
            </div>
            <div className="pricing-card-v2__divider"></div>
            <div className="pricing-card-v2__features">
              <div className="pricing-card-v2__feature">{checkOk}{t('pricing.growthF1')}</div>
              <div className="pricing-card-v2__feature">{checkOk}{t('pricing.growthF2')}</div>
              <div className="pricing-card-v2__feature">{checkOk}{t('pricing.growthF3')}</div>
              <div className="pricing-card-v2__feature">{checkOk}{t('pricing.growthF4')}</div>
              <div className="pricing-card-v2__feature">{checkOk}{t('pricing.growthF5')}</div>
              <div className="pricing-card-v2__feature">{checkOk}{t('pricing.growthF6')}</div>
            </div>
            <button
              onClick={() => handleCheckout('growth')}
              className="btn-plan-v2 btn-plan-v2-primary"
            >
              {t('pricing.btnGrowth')}
            </button>
          </div>

          {/* Pro */}
          <div className="pricing-card-v2 pricing-card-v2--ent">
            <div className="pricing-card-v2__glow"></div>
            <div className="pricing-card-v2__topbar"></div>
            <div className="pricing-card-v2__name">Pro</div>
            <div className="pricing-card-v2__desc">{t('pricing.proDesc')}</div>
            <div className="pricing-card-v2__price">
              <span className="pricing-card-v2__amount">$99</span>
              <span className="pricing-card-v2__period">{t('pricing.period')}</span>
            </div>
            <div className="pricing-card-v2__divider"></div>
            <div className="pricing-card-v2__features">
              <div className="pricing-card-v2__feature">{checkOk}{t('pricing.proF1')}</div>
              <div className="pricing-card-v2__feature">{checkOk}{t('pricing.proF2')}</div>
              <div className="pricing-card-v2__feature">{checkOk}{t('pricing.proF3')}</div>
              <div className="pricing-card-v2__feature">{checkOk}{t('pricing.proF4')}</div>
              <div className="pricing-card-v2__feature">{checkOk}{t('pricing.proF5')}</div>
              <div className="pricing-card-v2__feature">{checkOk}{t('pricing.proF6')}</div>
            </div>
            <button
              onClick={() => handleCheckout('pro')}
              className="btn-plan-v2 btn-plan-v2-ghost"
            >
              {t('pricing.btnPro')}
            </button>
          </div>
        </div>

        {/* Pay-as-you-go note */}
        <div style={{marginTop:'32px',padding:'18px 36px',background:'var(--abyss)',border:'1px solid var(--glass-border)',borderRadius:'var(--r)',display:'flex',alignItems:'center',gap:'10px'}}>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'11px',letterSpacing:'.15em',textTransform:'uppercase',color:'var(--muted)'}}>{t('pricing.paygLabel')}</span>
          {/* Hover tooltip trigger */}
          <div className="payg-trigger">
            <span>?</span>
            <div className="payg-tooltip">
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',letterSpacing:'.2em',textTransform:'uppercase',color:'var(--accent)',marginBottom:'14px'}}>{t('pricing.paygTitle')}</div>
              {[
                {label:'Try-on · Starter',     price:'$0.17 / prova'},
                {label:'Try-on · Growth',      price:'$0.15 / prova'},
                {label:'Try-on · Pro',         price:'$0.13 / prova'},
                {label:'Try-on · Enterprise',  price:'$0.10 / prova'},
                {label:'Studio Pro · todos os planos', price:'$0.15 / render', accent:true},
              ].map((row,i,arr)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:i<arr.length-1?'1px solid var(--glass-border)':'none',fontSize:'13px'}}>
                  <span style={{color:'var(--muted)'}}>{row.label}</span>
                  <span style={{color:row.accent?'var(--accent)':'var(--text)',fontFamily:"'IBM Plex Mono',monospace",fontSize:'12px'}}>{row.price}</span>
                </div>
              ))}
              <div style={{marginTop:'12px',fontSize:'12px',color:'var(--muted)',lineHeight:1.6,borderTop:'1px solid var(--glass-border)',paddingTop:'12px'}}>{t('pricing.paygOverage')}</div>
            </div>
          </div>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'10px',color:'var(--dim)',letterSpacing:'.1em'}}>{t('pricing.paygCharged')}</span>
        </div>

        {/* Enterprise */}
        <div className="enterprise-card">
          <div>
            <div className="enterprise-card__tag">{t('pricing.enterpriseTag')}</div>
            <h3 className="enterprise-card__title">{t('pricing.enterpriseTitle')}</h3>
            <p className="enterprise-card__desc">{t('pricing.enterpriseDesc')}</p>
            <div className="enterprise-card__feats">
              {[t('pricing.enterpriseF1'),t('pricing.enterpriseF2'),t('pricing.enterpriseF3'),t('pricing.enterpriseF4'),t('pricing.enterpriseF5'),t('pricing.enterpriseF6'),t('pricing.enterpriseF7'),t('pricing.enterpriseF8')].map((f, i) => (
                <div key={i} className="enterprise-card__feat">
                  <div className="enterprise-card__feat-dot"></div>
                  {f}
                </div>
              ))}
            </div>
          </div>
          <a href="/cdn-cgi/l/email-protection#50333f3e2431243f102235363c3528297e333f" className="btn btn-ghost" style={{whiteSpace:'nowrap',flexShrink:0}}>{t('pricing.enterpriseBtn')}</a>
        </div>
      </div>
    </section>
  );
}

// ── §08 FAQ ───────────────────────────────────────────────────────────────────
export function Faq() {
  const { t } = useLanguage();

  const faqItems = [
    {q: t('faq.q1'), a: t('faq.a1')},
    {q: t('faq.q2'), a: t('faq.a2')},
    {q: t('faq.q3'), a: t('faq.a3')},
    {q: t('faq.q4'), a: t('faq.a4')},
    {q: t('faq.q5'), a: t('faq.a5')},
    {q: t('faq.q6'), a: t('faq.a6')},
    {q: t('faq.q7'), a: t('faq.a7')},
  ];

  const toggleFaq = (btn) => {
    const item = btn.closest('.faq-item-v2');
    const isOpen = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  };

  return (
    <section className="faq-section" id="faq">
      <div className="container">
        <div className="faq__header">
          <div className="reveal">
            <div className="section-tag"><span className="section-tag-dot"></span>{t('faq.tag')}</div>
          </div>
          <h2 className="section-title reveal" data-delay="1">{t('faq.title')}</h2>
        </div>

        <div className="faq__list">
          {faqItems.map(({ q, a }, i) => (
            <div key={i} className="faq-item-v2">
              <button className="faq-item-v2__header" aria-expanded="false" onClick={e => toggleFaq(e.currentTarget)}>
                {q}
                <svg className="faq-icon-v2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <div className="faq-item-v2__body"><p>{a}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── §09 FINAL CTA ─────────────────────────────────────────────────────────────
export function FinalCta() {
  const { t } = useLanguage();
  return (
    <section className="cta-section-v2">
      <div className="container-sm">
        <div className="cta-panel reveal-scale">
          <div className="cta-ring cta-ring--1"></div>
          <div className="cta-ring cta-ring--2"></div>
          <div className="particles" id="ctaParticles"></div>
          <h2 className="cta-panel__title">
            {t('cta.title')}<br />
            <span className="text-gradient">{t('cta.titleSpan')}</span>
          </h2>
          <p className="cta-panel__sub">{t('cta.sub')}</p>
          <div className="cta-panel__actions">
            <a href="#pricing" className="btn btn-primary-new btn-lg">
              {t('cta.btnPrimary')}
              <svg className="btn-icon" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="mailto:oi@reflexy.co" className="btn btn-ghost btn-lg">{t('cta.btnGhost')}</a>
          </div>
          <div className="cta-panel__note">{t('cta.note')}</div>
        </div>
      </div>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
export function Footer() {
  const { lang, switchLang, t } = useLanguage();
  return (
    <footer className="footer-v2">
      <div className="container">
        <div className="footer__grid stagger-up">
          <div className="footer__brand">
            <div className="footer__logo">
              <svg width="20" height="20" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{filter:'drop-shadow(0 0 5px rgba(112,80,160,.55))'}}>
                <defs>
                  <linearGradient id="fF1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C4B8E4" stopOpacity=".90"/><stop offset="100%" stopColor="#7050A0" stopOpacity=".70"/></linearGradient>
                  <linearGradient id="fF2" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#B8AEDD" stopOpacity=".70"/><stop offset="100%" stopColor="#4A2880" stopOpacity=".55"/></linearGradient>
                  <linearGradient id="fF3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9070C0" stopOpacity=".55"/><stop offset="100%" stopColor="#2B1250" stopOpacity=".80"/></linearGradient>
                  <linearGradient id="fF4" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D0C4EC" stopOpacity=".80"/><stop offset="100%" stopColor="#5A38A0" stopOpacity=".60"/></linearGradient>
                  <linearGradient id="fTbl" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#E8E2F8" stopOpacity=".95"/><stop offset="100%" stopColor="#B090D8" stopOpacity=".80"/></linearGradient>
                  <linearGradient id="fP1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0CC89E" stopOpacity=".38"/><stop offset="100%" stopColor="#0CC89E" stopOpacity=".05"/></linearGradient>
                  <linearGradient id="fStr" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C4B8E4" stopOpacity=".55"/><stop offset="50%" stopColor="#B8AEDD" stopOpacity=".35"/><stop offset="100%" stopColor="#7050A0" stopOpacity=".25"/></linearGradient>
                  <filter id="fGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                <polygon points="50,78 28,50 3,50 50,97" fill="url(#fP1)" opacity=".80"/>
                <polygon points="50,78 72,50 97,50 50,97" fill="url(#fP1)" opacity=".80"/>
                <polygon points="50,22 28,50 3,50 50,3" fill="url(#fF1)"/>
                <polygon points="50,22 72,50 97,50 50,3" fill="url(#fF4)"/>
                <polygon points="3,50 50,22 28,50" fill="url(#fF2)"/>
                <polygon points="97,50 50,22 72,50" fill="url(#fF3)"/>
                <polygon points="50,22 72,50 50,78 28,50" fill="url(#fTbl)" filter="url(#fGlow)"/>
                <circle cx="50" cy="50" r="2.5" fill="#EDE8F6" opacity=".95" filter="url(#fGlow)"/>
                <polygon points="50,3 97,50 50,97 3,50" fill="none" stroke="url(#fStr)" strokeWidth=".45"/>
              </svg>
              <span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:700,fontSize:'14px',letterSpacing:'.20em'}}>REFLEXY</span>
            </div>
            <div className="footer__tagline">{t('footer.tagline')}</div>
            <div className="footer__socials">
              <a href="#" className="footer__social" aria-label="Instagram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
                </svg>
              </a>
              <a href="#" className="footer__social" aria-label="LinkedIn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <div className="footer__col-title">{t('footer.colProduct')}</div>
            <ul className="footer__links-v2">
              <li><a href="#reflexy-section" className="footer__link-v2">{t('footer.linkVto')}</a></li>
              <li><a href="#reflexy-section" className="footer__link-v2">{t('footer.linkStudio')}</a></li>
              <li><a href="#reflexy-section" className="footer__link-v2">{t('footer.linkAnalytics')}</a></li>
              <li><a href="#pricing" className="footer__link-v2">{t('footer.linkPricing')}</a></li>
              <li><a href="https://tryonapp-2.myshopify.com/" className="footer__link-v2" target="_blank" rel="noopener noreferrer">{t('footer.linkDemoStore')}</a></li>
            </ul>
          </div>

          <div>
            <div className="footer__col-title">{t('footer.colCompany')}</div>
            <ul className="footer__links-v2">
              <li><a href="#" className="footer__link-v2">{t('footer.linkAbout')}</a></li>
              <li><a href="#" className="footer__link-v2">{t('footer.linkBlog')}</a></li>
              <li><a href="#" className="footer__link-v2">{t('footer.linkCareers')}</a></li>
              <li><a href="mailto:oi@reflexy.co" className="footer__link-v2">{t('footer.linkContact')}</a></li>
            </ul>
          </div>

          <div>
            <div className="footer__col-title">{t('footer.colLegal')}</div>
            <ul className="footer__links-v2">
              <li><a href="/privacy" className="footer__link-v2">{t('footer.linkPrivacy')}</a></li>
              <li><a href="/terms" className="footer__link-v2">{t('footer.linkTerms')}</a></li>
              <li><a href="#" className="footer__link-v2">LGPD</a></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom-v2">
          <div className="footer__copy-v2">{t('footer.copyright')}</div>
          <div className="lang-toggle">
            <button
              className={`lang-toggle__btn${lang === 'pt' ? ' active' : ''}`}
              onClick={() => switchLang('pt')}
            >PT</button>
            <button
              className={`lang-toggle__btn${lang === 'en' ? ' active' : ''}`}
              onClick={() => switchLang('en')}
            >EN</button>
          </div>
          <div className="footer__status-v2">
            <div className="glow-dot" style={{width:'6px',height:'6px'}}></div>
            {t('footer.status')}
          </div>
        </div>
      </div>
    </footer>
  );
}
