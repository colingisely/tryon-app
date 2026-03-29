'use client';
import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const VTO_STEPS     = ['Provar', 'Upload', 'IA', 'Resultado'];
const VTO_DURATIONS  = [2500, 2500, 2500, 3000];

const STP_STEPS     = ['Modelo', 'Produto', 'IA', '4K'];
const STP_DURATIONS  = [2500, 2500, 3500, 3000];

const ANL_STEPS     = ['Sessão', 'Hesitação', 'Insight', 'Relatório'];
const ANL_DURATIONS  = [2500, 2500, 2500, 3000];

const DASH_STEPS    = ['Funil', 'Tendência', 'SKUs', 'Impacto'];
const DASH_DURATIONS = [3000, 3000, 3000, 3000];

function makeTimer(setFn, durations) {
  let frame = 0, timer;
  const advance = () => {
    frame = (frame + 1) % 4;
    setFn(frame);
    timer = setTimeout(advance, durations[frame]);
  };
  timer = setTimeout(advance, durations[0]);
  return () => clearTimeout(timer);
}

export default function Facets() {
  const { t } = useLanguage();
  const [vtoFrame,    setVtoFrame]    = useState(0);
  const [studioFrame, setStudioFrame] = useState(0);
  const [anlFrame,    setAnlFrame]    = useState(0);
  const [dashFrame,   setDashFrame]   = useState(0);
  const [impactVal,   setImpactVal]   = useState(0);

  useEffect(() => makeTimer(setVtoFrame,    VTO_DURATIONS),  []);
  useEffect(() => makeTimer(setStudioFrame, STP_DURATIONS),  []);
  useEffect(() => makeTimer(setAnlFrame,    ANL_DURATIONS),  []);
  useEffect(() => makeTimer(setDashFrame,   DASH_DURATIONS), []);

  /* Count-up for Impacto frame */
  useEffect(() => {
    if (dashFrame !== 3) return;
    const target = 48320, dur = 2200;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      setImpactVal(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dashFrame]);

  return (
    <section className="solution" id="reflexy-section">
      <div className="deco-grid deco-grid--dots" style={{width:'140px',height:'140px',bottom:'60px',left:'30px',borderRadius:'12px'}}></div>
      <div className="container">
        <div className="solution__header">
          <div className="reveal">
            <div className="section-tag"><span className="section-tag-dot"></span>{t('facets.tag')}</div>
          </div>
          <h2 className="section-title text-gradient-h reveal" data-delay="1">
            {t('facets.title')}
          </h2>
          <p className="section-sub reveal" data-delay="2">
            {t('facets.sub')}
          </p>
        </div>

        <div className="facets__grid stagger-scale">

          {/* ── Facet 1: Try-on — Cinema Card (vertical) ──────────────────── */}
          <div className="facet-card facet-card--cinema-v">
            <div className="facet-card__glow"></div>

            <div className="facet-card__cinema-v">

              <div className="facet-card__top">
                <div className="facet-card__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="facet-card__num">{t('facets.f1Num')}</div>
                <div className="facet-card__title">{t('facets.f1Title')}</div>
                <div className="facet-card__body">{t('facets.f1Body')}</div>

                {/* Step dots */}
                <div className="vto-steps" style={{paddingTop:'14px'}}>
                  {VTO_STEPS.map((label, i) => (
                    <div key={i} className={`vto-step${vtoFrame === i ? ' active' : ''}`}>
                      <div className="vto-step__dot"></div>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="vto-demo vto-demo--full">

                {/* Title bar */}
                <div className="vto-demo__bar">
                  <div className="vto-demo__dot" style={{background:'#FF5F57'}}></div>
                  <div className="vto-demo__dot" style={{background:'#FEBC2E'}}></div>
                  <div className="vto-demo__dot" style={{background:'#28C840'}}></div>
                  <span className="vto-demo__bar-label">reflexy · provador</span>
                </div>

                {/* Frames container */}
                <div className="vto-demo__frames">

                  {/* ── Frame 0: Botão Experimentar ── */}
                  <div className={`vto-demo__frame${vtoFrame === 0 ? ' active' : ''}`}>
                    <div className="vto-f-btn">
                      <div className="vto-f-btn__product">
                        <div className="vto-f-btn__thumb">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/demo-modal-before.png" alt="Suéter Rosa de Pelos" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'7px'}} />
                        </div>
                        <div className="vto-f-btn__info">
                          <div className="vto-f-btn__name">Suéter Rosa de Pelos</div>
                          <div className="vto-f-btn__price">R$ 249,90</div>
                        </div>
                      </div>
                      <div className="vto-f-btn__divider"></div>
                      <button className="vto-f-btn__cta">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        Experimentar em mim
                      </button>
                      <div className="vto-cursor">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="rgba(124,58,237,.9)" strokeWidth="1.5"><path d="M5 3l14 9-7 1-4 7z"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* ── Frame 1: Upload da foto ── */}
                  <div className={`vto-demo__frame${vtoFrame === 1 ? ' active' : ''}`}>
                    <div className="vto-f-upload">
                      <div className="vto-f-upload__label">Escolha sua foto</div>
                      <div className="vto-f-upload__zone">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/demo-upload-before.png" alt="Foto do usuário" className="vto-f-upload__img" />
                        <div className="vto-f-upload__badge">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          Foto carregada
                        </div>
                      </div>
                      <button className="vto-f-btn__cta" style={{marginTop:'8px'}}>Continuar →</button>
                    </div>
                  </div>

                  {/* ── Frame 2: IA gerando ── */}
                  <div className={`vto-demo__frame${vtoFrame === 2 ? ' active' : ''}`}>
                    <div className="vto-f-ai">
                      <div className="vto-f-ai__wrap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/demo-upload-before.png" alt="" className="vto-f-ai__img" />
                        <div className="vto-f-ai__scan"></div>
                        <div className="vto-f-ai__overlay"></div>
                      </div>
                      <div className="vto-f-ai__progress-row">
                        <div className="vto-f-ai__bar-track">
                          <div className="vto-f-ai__bar"></div>
                        </div>
                        <span className="vto-f-ai__pct">80%</span>
                      </div>
                      <div className="vto-f-ai__status">
                        <div className="glow-dot" style={{width:'6px',height:'6px',flexShrink:0}}></div>
                        Processando com IA...
                      </div>
                    </div>
                  </div>

                  {/* ── Frame 3: Resultado ── */}
                  <div className={`vto-demo__frame${vtoFrame === 3 ? ' active' : ''}`}>
                    <div className="vto-f-result">
                      <div className="vto-f-result__wrap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/demo-result-after.png" alt="Resultado gerado pela IA" className="vto-f-result__img" />
                        <div className="vto-f-result__badge">
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          15s
                        </div>
                      </div>
                      <div className="vto-f-result__actions">
                        <button className="vto-f-result__btn vto-f-result__btn--primary">Baixar</button>
                        <button className="vto-f-result__btn">Tentar outra</button>
                      </div>
                    </div>
                  </div>

                </div>{/* /vto-demo__frames */}
              </div>{/* /vto-demo */}

            </div>{/* /facet-card__cinema-v */}
          </div>

          {/* ── Facet 2: Studio Pro — Cinema Card (vertical) ── */}
          <div className="facet-card facet-card--cinema-v">
            <div className="facet-card__glow"></div>
            <div className="facet-card__cinema-v">

              <div className="facet-card__top">
                <div className="facet-card__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
                  </svg>
                </div>
                <div className="facet-card__num">{t('facets.f2Num')}</div>
                <div className="facet-card__title">{t('facets.f2Title')}</div>
                <div className="facet-card__body">{t('facets.f2Body')}</div>
                <div className="vto-steps" style={{paddingTop:'14px'}}>
                  {STP_STEPS.map((label, i) => (
                    <div key={i} className={`vto-step${studioFrame === i ? ' active' : ''}`}>
                      <div className="vto-step__dot"></div>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom: mini-modal wide */}
              <div className="stp-demo">
                <div className="vto-demo__bar">
                  <div className="vto-demo__dot" style={{background:'#FF5F57'}}></div>
                  <div className="vto-demo__dot" style={{background:'#FEBC2E'}}></div>
                  <div className="vto-demo__dot" style={{background:'#28C840'}}></div>
                  <span className="vto-demo__bar-label">reflexy · studio pro</span>
                </div>

                <div className="vto-demo__frames stp-demo__frames">

                  {/* ── Frame 0: Selecionar modelo ── */}
                  <div className={`vto-demo__frame${studioFrame === 0 ? ' active' : ''}`}>
                    <div className="stp-f-select">
                      <div className="stp-f-select__label">1 · Selecione o modelo</div>
                      <div className="stp-f-select__row">
                        <div className="stp-f-select__main stp-f-select__main--active">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/demo-studio-model.png" alt="Modelo" />
                          <div className="stp-f-select__ring"></div>
                        </div>
                        <div className="stp-f-select__side">
                          <div className="stp-f-select__ghost"></div>
                          <div className="stp-f-select__ghost"></div>
                        </div>
                      </div>
                      <div className="vto-cursor stp-cursor">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="rgba(124,58,237,.9)" strokeWidth="1.5"><path d="M5 3l14 9-7 1-4 7z"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* ── Frame 1: Selecionar produto ── */}
                  <div className={`vto-demo__frame${studioFrame === 1 ? ' active' : ''}`}>
                    <div className="stp-f-select">
                      <div className="stp-f-select__label">2 · Selecione o produto</div>
                      <div className="stp-f-select__row">
                        <div className="stp-f-select__main stp-f-select__main--done">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/demo-studio-model.png" alt="Modelo" />
                          <div className="stp-f-select__check">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                        </div>
                        <div className="stp-f-select__main stp-f-select__main--active">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/demo-studio-product.png" alt="Produto" />
                          <div className="stp-f-select__ring"></div>
                        </div>
                      </div>
                      <div className="vto-cursor stp-cursor stp-cursor--right">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="rgba(124,58,237,.9)" strokeWidth="1.5"><path d="M5 3l14 9-7 1-4 7z"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* ── Frame 2: IA gerando 4K ── */}
                  <div className={`vto-demo__frame${studioFrame === 2 ? ' active' : ''}`}>
                    <div className="stp-f-ai">
                      <div className="stp-f-ai__combo">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/demo-studio-model.png" alt="" className="stp-f-ai__thumb" />
                        <div className="stp-f-ai__plus">+</div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/demo-studio-product.png" alt="" className="stp-f-ai__thumb" />
                        <div className="stp-f-ai__arrow">→</div>
                        <div className="stp-f-ai__spinner">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                        </div>
                      </div>
                      <div className="vto-f-ai__progress-row">
                        <div className="vto-f-ai__bar-track">
                          <div className="vto-f-ai__bar stp-bar"></div>
                        </div>
                        <span className="vto-f-ai__pct" style={{color:'rgba(74,222,128,.9)'}}>4K</span>
                      </div>
                      <div className="vto-f-ai__status">
                        <div className="glow-dot" style={{width:'6px',height:'6px',flexShrink:0}}></div>
                        Gerando em 4K...
                      </div>
                      <div className="stp-f-ai__time">~60s</div>
                    </div>
                  </div>

                  {/* ── Frame 3: Resultado 4K ── */}
                  <div className={`vto-demo__frame${studioFrame === 3 ? ' active' : ''}`}>
                    <div className="stp-f-result">
                      <div className="stp-f-result__wrap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/demo-studio-result.png" alt="Resultado 4K" className="stp-f-result__img" />
                        <div className="stp-f-result__badge-4k">4K</div>
                        <div className="stp-f-result__badge-time">✓ 60s</div>
                      </div>
                      <div className="vto-f-result__actions">
                        <button className="vto-f-result__btn vto-f-result__btn--primary">Baixar 4K</button>
                        <button className="vto-f-result__btn">Nova foto</button>
                      </div>
                    </div>
                  </div>

                </div>{/* /vto-demo__frames */}
              </div>{/* /stp-demo */}

            </div>{/* /facet-card__cinema-v */}
          </div>

          {/* ── Facet 3: Analytics — Cinema Card (horizontal) ── */}
          <div className="facet-card facet-card--wide facet-card--cinema">
            <div className="facet-card__glow"></div>
            <div className="facet-card__cinema-inner">

              <div className="facet-card__left">
                <div className="facet-card__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <div className="facet-card__num">{t('facets.f3Num')}</div>
                <div className="facet-card__title">{t('facets.f3Title')}</div>
                <div className="facet-card__body">{t('facets.f3Body')}</div>
                <div className="vto-steps" style={{paddingTop:'14px'}}>
                  {ANL_STEPS.map((label, i) => (
                    <div key={i} className={`vto-step${anlFrame === i ? ' active' : ''}`}>
                      <div className="vto-step__dot"></div>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="anl-demo">
                <div className="vto-demo__bar">
                  <div className="vto-demo__dot" style={{background:'#FF5F57'}}></div>
                  <div className="vto-demo__dot" style={{background:'#FEBC2E'}}></div>
                  <div className="vto-demo__dot" style={{background:'#28C840'}}></div>
                  <span className="vto-demo__bar-label">reflexy · analytics</span>
                  <div className="glow-dot" style={{width:'5px',height:'5px',marginLeft:'auto'}}></div>
                  <span style={{fontSize:'9px',color:'var(--accent)',fontFamily:"'IBM Plex Mono',monospace",marginLeft:'5px'}}>LIVE</span>
                </div>
                <div className="vto-demo__frames anl-demo__frames">

                  {/* ── Frame 0: Sessão ao vivo ── */}
                  <div className={`vto-demo__frame${anlFrame === 0 ? ' active' : ''}`}>
                    <div className="anl-f-session">
                      <div className="anl-f-session__header">
                        <div className="glow-dot" style={{width:'6px',height:'6px'}}></div>
                        <span>Cliente #4821 · sessão ativa</span>
                        <span className="anl-f-session__timer">23s</span>
                      </div>
                      <div className="anl-f-session__actions">
                        <div className="anl-f-session__action anl-f-session__action--1">
                          <span className="anl-f-session__icon anl-f-session__icon--green">✓</span>
                          <span>experimentou <strong>Suéter Rosa de Pelos</strong></span>
                          <span className="anl-f-session__time">14s</span>
                        </div>
                        <div className="anl-f-session__action anl-f-session__action--2">
                          <span className="anl-f-session__icon anl-f-session__icon--yellow">↔</span>
                          <span>comparou tamanho M e G</span>
                          <span className="anl-f-session__time">8s</span>
                        </div>
                        <div className="anl-f-session__action anl-f-session__action--3">
                          <span className="anl-f-session__icon anl-f-session__icon--purple">⚡</span>
                          <span>adicionou ao carrinho</span>
                          <span className="anl-f-session__time">1s</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Frame 1: Mapa de hesitação ── */}
                  <div className={`vto-demo__frame${anlFrame === 1 ? ' active' : ''}`}>
                    <div className="anl-f-heat">
                      <div className="anl-f-heat__product">Suéter Rosa de Pelos</div>
                      <div className="anl-f-heat__label">Tempo de atenção por atributo</div>
                      <div className="anl-f-heat__rows">
                        <div className="anl-f-heat__row">
                          <span>Tamanho M</span>
                          <div className="anl-f-heat__bar-track"><div className="anl-f-heat__bar" style={{'--w':'52%','--c':'rgba(124,58,237,.75)'}}></div></div>
                          <span className="anl-f-heat__pct">52s</span>
                        </div>
                        <div className="anl-f-heat__row">
                          <span>Tamanho G</span>
                          <div className="anl-f-heat__bar-track"><div className="anl-f-heat__bar" style={{'--w':'26%','--c':'rgba(192,132,252,.55)'}}></div></div>
                          <span className="anl-f-heat__pct">26s</span>
                        </div>
                        <div className="anl-f-heat__row">
                          <span>Cor Rosa</span>
                          <div className="anl-f-heat__bar-track"><div className="anl-f-heat__bar" style={{'--w':'78%','--c':'rgba(192,132,252,.85)'}}></div></div>
                          <span className="anl-f-heat__pct">78s</span>
                        </div>
                      </div>
                      <div className="anl-f-heat__badge">⚠ hesitou 14s na comparação de tamanhos</div>
                    </div>
                  </div>

                  {/* ── Frame 2: Insight automático ── */}
                  <div className={`vto-demo__frame${anlFrame === 2 ? ' active' : ''}`}>
                    <div className="anl-f-insight">
                      <div className="anl-f-insight__pill">⚡ INSIGHT AUTOMÁTICO</div>
                      <div className="anl-f-insight__title">Alta prova,<br/>baixa conversão</div>
                      <div className="anl-f-insight__body">Possível barreira: incerteza de tamanho</div>
                      <div className="anl-f-insight__suggestion">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(74,222,128,.9)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Sugestão: adicionar guia de medidas ao produto
                      </div>
                      <div className="anl-f-insight__affected">3 SKUs com padrão similar identificados</div>
                    </div>
                  </div>

                  {/* ── Frame 3: Relatório do SKU ── */}
                  <div className={`vto-demo__frame${anlFrame === 3 ? ' active' : ''}`}>
                    <div className="anl-f-report">
                      <div className="anl-f-report__header">Relatório do SKU · últimos 30 dias</div>
                      <div className="anl-f-report__card">
                        <div className="anl-f-report__name">Suéter Rosa de Pelos</div>
                        <div className="anl-f-report__metrics">
                          <div className="anl-f-report__metric">
                            <div className="anl-f-report__val">847</div>
                            <div className="anl-f-report__lbl">Provas</div>
                          </div>
                          <div className="anl-f-report__metric">
                            <div className="anl-f-report__val" style={{color:'var(--accent)'}}>+38%</div>
                            <div className="anl-f-report__lbl">Conversão</div>
                          </div>
                          <div className="anl-f-report__metric">
                            <div className="anl-f-report__val" style={{color:'rgba(74,222,128,.9)'}}>−52%</div>
                            <div className="anl-f-report__lbl">Devoluções</div>
                          </div>
                        </div>
                        <div className="anl-f-report__bar-track"><div className="anl-f-report__bar"></div></div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* ── Facet 4: Dashboard — Cinema Card (horizontal) ── */}
          <div className="facet-card facet-card--wide facet-card--cinema">
            <div className="facet-card__glow"></div>
            <div className="facet-card__cinema-inner">

              <div className="facet-card__left">
                <div className="facet-card__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </div>
                <div className="facet-card__num">{t('facets.f4Num')}</div>
                <div className="facet-card__title">{t('facets.f4Title')}</div>
                <div className="facet-card__body">{t('facets.f4Body')}</div>

                {/* Top SKU highlights */}
                <div style={{display:'flex',flexDirection:'column',gap:'6px',marginTop:'12px'}}>
                  <div className="dash-sku-row">
                    <span className="dash-sku-dot" style={{background:'rgba(74,222,128,.9)'}}></span>
                    <span className="dash-sku-name">Suéter Rosa de Pelos</span>
                    <span className="dash-sku-tag" style={{color:'rgba(74,222,128,.85)'}}>↑ 41%</span>
                  </div>
                  <div className="dash-sku-row">
                    <span className="dash-sku-dot" style={{background:'#FEBC2E'}}></span>
                    <span className="dash-sku-name">Jaqueta Oversized</span>
                    <span className="dash-sku-tag" style={{color:'rgba(254,188,46,.8)'}}>insight</span>
                  </div>
                  <div className="dash-sku-row">
                    <span className="dash-sku-dot" style={{background:'rgba(74,222,128,.9)'}}></span>
                    <span className="dash-sku-name">Vestido Midi</span>
                    <span className="dash-sku-tag" style={{color:'rgba(74,222,128,.85)'}}>−63% dev.</span>
                  </div>
                </div>

                {/* Step dots */}
                <div className="vto-steps" style={{paddingTop:'14px'}}>
                  {DASH_STEPS.map((label, i) => (
                    <div key={i} className={`vto-step${dashFrame === i ? ' active' : ''}`}>
                      <div className="vto-step__dot"></div>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: animated dashboard panel */}
              <div className="dash-cinema">
                <div className="vto-demo__bar">
                  <div className="vto-demo__dot" style={{background:'#FF5F57'}}></div>
                  <div className="vto-demo__dot" style={{background:'#FEBC2E'}}></div>
                  <div className="vto-demo__dot" style={{background:'#28C840'}}></div>
                  <span className="vto-demo__bar-label">reflexy · dashboard</span>
                  <div className="glow-dot" style={{width:'5px',height:'5px',marginLeft:'auto'}}></div>
                  <span style={{fontSize:'9px',color:'var(--accent)',fontFamily:"'IBM Plex Mono',monospace",marginLeft:'5px'}}>LIVE</span>
                </div>

                <div className="vto-demo__frames dash-cinema__frames">

                  {/* ── Frame 0: Funil de conversão ── */}
                  <div className={`vto-demo__frame${dashFrame === 0 ? ' active' : ''}`}>
                    <div className="dash-f-funnel">
                      <div className="dash-f-funnel__title">Funil de Conversão · últimos 30 dias</div>
                      <div className="dash-f-funnel__blocks">
                        <div className="dash-f-funnel__block">
                          <div className="dash-f-funnel__label-row">
                            <span className="dash-f-funnel__name">Provas virtuais</span>
                            <span className="dash-f-funnel__val">847</span>
                          </div>
                          <div className="dash-f-funnel__bar-track">
                            <div className="dash-f-funnel__bar" style={{'--w':'100%','--c':'linear-gradient(90deg,var(--primary),var(--accent))'}}></div>
                          </div>
                        </div>
                        <div className="dash-f-funnel__block">
                          <div className="dash-f-funnel__label-row">
                            <span className="dash-f-funnel__name">Adicionaram ao carrinho</span>
                            <span className="dash-f-funnel__val">412</span>
                          </div>
                          <div className="dash-f-funnel__bar-track">
                            <div className="dash-f-funnel__bar" style={{'--w':'48.6%','--c':'linear-gradient(90deg,rgba(124,58,237,.7),rgba(192,132,252,.5))'}}></div>
                          </div>
                        </div>
                        <div className="dash-f-funnel__block">
                          <div className="dash-f-funnel__label-row">
                            <span className="dash-f-funnel__name">Compraram</span>
                            <span className="dash-f-funnel__val">293</span>
                          </div>
                          <div className="dash-f-funnel__bar-track">
                            <div className="dash-f-funnel__bar" style={{'--w':'34.6%','--c':'linear-gradient(90deg,rgba(74,222,128,.8),rgba(74,222,128,.4))'}}></div>
                          </div>
                        </div>
                      </div>
                      <div className="dash-f-funnel__rate">Taxa de conversão: 34.6% · +38% vs sem provador</div>
                    </div>
                  </div>

                  {/* ── Frame 1: Tendência (sparkline) ── */}
                  <div className={`vto-demo__frame${dashFrame === 1 ? ' active' : ''}`}>
                    <div className="dash-f-chart">
                      <div className="dash-f-chart__title">Taxa de conversão ao longo do tempo</div>
                      <div className="dash-f-chart__svg-wrap">
                        <svg className="dash-f-chart__svg" viewBox="0 0 200 80" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="dashLineGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="rgba(124,58,237,.6)"/>
                              <stop offset="55%" stopColor="rgba(192,132,252,.9)"/>
                              <stop offset="100%" stopColor="rgba(74,222,128,.95)"/>
                            </linearGradient>
                            <linearGradient id="dashAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(124,58,237,.18)"/>
                              <stop offset="100%" stopColor="rgba(124,58,237,0)"/>
                            </linearGradient>
                          </defs>
                          {/* Area fill */}
                          <path className="dash-f-chart__area" d="M0,60 L30,58 L60,57 L90,55 L105,50 L130,38 L160,24 L200,14 L200,80 L0,80 Z" opacity=".5"/>
                          {/* Line */}
                          <path className="dash-f-chart__line" d="M0,60 L30,58 L60,57 L90,55 L105,50 L130,38 L160,24 L200,14"/>
                          {/* Activation dot */}
                          <circle cx="105" cy="50" r="3" fill="rgba(254,188,46,.9)"/>
                          <line x1="105" y1="15" x2="105" y2="50" stroke="rgba(254,188,46,.3)" strokeWidth="1" strokeDasharray="2,2"/>
                        </svg>
                        <div className="dash-f-chart__marker" style={{left:'50%',top:'22%'}}>⬆ Reflexy ativado</div>
                        <div className="dash-f-chart__badge">+38% com Reflexy</div>
                      </div>
                    </div>
                  </div>

                  {/* ── Frame 2: Top SKUs ── */}
                  <div className={`vto-demo__frame${dashFrame === 2 ? ' active' : ''}`}>
                    <div className="dash-f-skus">
                      <div className="dash-f-skus__title">Top SKUs por impacto do provador</div>
                      <div className="dash-f-skus__list">
                        <div className="dash-f-skus__row dash-f-skus__row--1">
                          <span className="dash-f-skus__dot" style={{background:'rgba(74,222,128,.9)'}}></span>
                          <span className="dash-f-skus__name">Suéter Rosa de Pelos</span>
                          <span className="dash-f-skus__tag" style={{color:'rgba(74,222,128,.9)'}}>+41% conv.</span>
                        </div>
                        <div className="dash-f-skus__row dash-f-skus__row--2">
                          <span className="dash-f-skus__dot" style={{background:'rgba(254,188,46,.85)'}}></span>
                          <span className="dash-f-skus__name">Jaqueta Oversized</span>
                          <span className="dash-f-skus__tag" style={{color:'rgba(254,188,46,.85)'}}>⚠ revisar preço</span>
                        </div>
                        <div className="dash-f-skus__row dash-f-skus__row--3">
                          <span className="dash-f-skus__dot" style={{background:'rgba(74,222,128,.9)'}}></span>
                          <span className="dash-f-skus__name">Vestido Midi</span>
                          <span className="dash-f-skus__tag" style={{color:'rgba(74,222,128,.9)'}}>−63% dev.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Frame 3: Impacto em receita (count-up) ── */}
                  <div className={`vto-demo__frame${dashFrame === 3 ? ' active' : ''}`}>
                    <div className="dash-f-impact">
                      <div className="dash-f-impact__label">Receita gerada pelo provador · mês atual</div>
                      <div className="dash-f-impact__val">
                        R$ {impactVal.toLocaleString('pt-BR')}
                      </div>
                      <div className="dash-f-impact__sub">↑ 23% vs mês anterior</div>
                    </div>
                  </div>

                </div>{/* /dash-cinema__frames */}
              </div>{/* /dash-cinema */}

            </div>
          </div>

        </div>

        <p className="reveal" style={{textAlign:'center',marginTop:'28px',fontSize:'13px',color:'var(--dim)',fontFamily:"'IBM Plex Mono',monospace"}}>
          {t('facets.integration')}
        </p>
      </div>
    </section>
  );
}
