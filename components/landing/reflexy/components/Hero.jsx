'use client';

import { useLanguage } from '../i18n/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section id="hero">
      {/* Layered background */}
      <div className="hero__bg"></div>
      <div className="hero__grid"></div>

      {/* Floating orbs */}
      <div className="orb orb--1"></div>
      <div className="orb orb--2"></div>
      <div className="orb orb--3"></div>

      {/* Particles */}
      <div className="particles" id="heroParticles"></div>

      {/* ─── Large gem — right side ─── */}
      <div className="hero__gem">
        {/* Ambient glow behind gem */}
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'460px',height:'460px',borderRadius:'50%',background:'radial-gradient(circle,rgba(43,18,80,.55) 0%,rgba(112,80,160,.15) 45%,transparent 70%)',animation:'glowB 7s ease-in-out infinite',pointerEvents:'none',zIndex:0}}></div>

        <svg width="460" height="460" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
          style={{position:'relative',zIndex:1,overflow:'visible',animation:'gemS 90s linear infinite',filter:'drop-shadow(0 0 28px rgba(112,80,160,.75)) drop-shadow(0 0 70px rgba(43,18,80,.55))'}}>
          <defs>
            <linearGradient id="gF1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C4B8E4" stopOpacity=".92"/><stop offset="100%" stopColor="#7050A0" stopOpacity=".75"/></linearGradient>
            <linearGradient id="gF2" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#B8AEDD" stopOpacity=".75"/><stop offset="100%" stopColor="#4A2880" stopOpacity=".60"/></linearGradient>
            <linearGradient id="gF3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9070C0" stopOpacity=".60"/><stop offset="100%" stopColor="#2B1250" stopOpacity=".85"/></linearGradient>
            <linearGradient id="gF4" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D8CCEF" stopOpacity=".88"/><stop offset="100%" stopColor="#5A38A0" stopOpacity=".65"/></linearGradient>
            <linearGradient id="gTbl" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#EDE8F8" stopOpacity=".98"/><stop offset="100%" stopColor="#B090D8" stopOpacity=".85"/></linearGradient>
            <linearGradient id="gP1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0CC89E" stopOpacity=".45"/><stop offset="100%" stopColor="#0CC89E" stopOpacity=".06"/></linearGradient>
            <linearGradient id="gP2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7ADAC8" stopOpacity=".32"/><stop offset="100%" stopColor="#0CC89E" stopOpacity=".04"/></linearGradient>
            <linearGradient id="gStr" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#D4C8E8" stopOpacity=".65"/><stop offset="50%" stopColor="#C4BADF" stopOpacity=".45"/><stop offset="100%" stopColor="#8060B8" stopOpacity=".30"/></linearGradient>
            <filter id="gGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <clipPath id="gClip"><polygon points="50,3 97,50 50,97 3,50"/></clipPath>
            <linearGradient id="gCaustic" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0"/><stop offset="40%" stopColor="white" stopOpacity="0"/>
              <stop offset="50%" stopColor="white" stopOpacity=".22"/><stop offset="60%" stopColor="white" stopOpacity="0"/><stop offset="100%" stopColor="white" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <polygon points="50,78 28,50 3,50 50,97"  fill="url(#gP1)" opacity=".85"/>
          <polygon points="50,78 72,50 97,50 50,97"  fill="url(#gP2)" opacity=".85"/>
          <polygon points="50,22 28,50 3,50 50,3"    fill="url(#gF1)"/>
          <polygon points="50,22 72,50 97,50 50,3"   fill="url(#gF4)"/>
          <polygon points="3,50  50,22 28,50"         fill="url(#gF2)"/>
          <polygon points="97,50 50,22 72,50"         fill="url(#gF3)"/>
          <polygon points="50,22 72,50 50,78 28,50"  fill="url(#gTbl)" filter="url(#gGlow)"/>
          <circle cx="50" cy="50" r="2.8" fill="#EDE8F6" opacity=".98" filter="url(#gGlow)"/>
          <polygon points="50,3 97,50 50,97 3,50"    fill="none" stroke="url(#gStr)" strokeWidth=".45"/>
          <polygon points="50,22 72,50 50,78 28,50"  fill="none" stroke="#C4B8E4"    strokeWidth=".4"  opacity=".28"/>
          <line x1="50" y1="3"  x2="50" y2="22" stroke="#C4B8E4" strokeWidth=".35" opacity=".55"/>
          <line x1="3"  y1="50" x2="28" y2="50" stroke="#C4B8E4" strokeWidth=".35" opacity=".42"/>
          <line x1="97" y1="50" x2="72" y2="50" stroke="#C4B8E4" strokeWidth=".35" opacity=".42"/>
          <line x1="50" y1="22" x2="28" y2="50" stroke="#C4B8E4" strokeWidth=".30" opacity=".35"/>
          <line x1="50" y1="22" x2="72" y2="50" stroke="#C4B8E4" strokeWidth=".30" opacity=".35"/>
          <line x1="50" y1="78" x2="28" y2="50" stroke="#0CC89E" strokeWidth=".28" opacity=".30"/>
          <line x1="50" y1="78" x2="72" y2="50" stroke="#0CC89E" strokeWidth=".28" opacity=".30"/>
          <g clipPath="url(#gClip)">
            <rect x="-110" y="0" width="220" height="100" fill="url(#gCaustic)">
              <animateTransform attributeName="transform" type="translate" values="-40,0;140,0;140,0;-40,0" keyTimes="0;0.38;1;1" dur="9s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0 0 1 1;0 0 1 1"/>
            </rect>
            <rect x="-110" y="50" width="220" height="50" opacity="0">
              <animateTransform attributeName="transform" type="translate" values="-40,0;140,0;140,0;-40,0" keyTimes="0;0.38;1;1" dur="9s" begin="4.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0 0 1 1;0 0 1 1"/>
              <animate attributeName="opacity" values="0;0;.28;.28;0;0" keyTimes="0;0.1;0.2;0.35;0.45;1" dur="9s" begin="4.5s" repeatCount="indefinite"/>
            </rect>
          </g>
        </svg>

        {/* Girdle axis line */}
        <div className="gem-axis"></div>

        {/* Pavilion reflection */}
        <svg width="460" height="460" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
          style={{transform:'scaleY(-1)',maskImage:'linear-gradient(to bottom,rgba(0,0,0,.28) 0%,transparent 50%)',WebkitMaskImage:'linear-gradient(to bottom,rgba(0,0,0,.28) 0%,transparent 50%)',marginTop:'2px',animation:'pavP 8s ease-in-out infinite',filter:'drop-shadow(0 0 12px rgba(12,200,158,.18))',position:'relative',zIndex:1}}>
          <defs>
            <linearGradient id="rvF" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C4B8E4" stopOpacity=".65"/><stop offset="100%" stopColor="#7050A0" stopOpacity=".42"/></linearGradient>
            <linearGradient id="rvT" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#EDE8F8" stopOpacity=".75"/><stop offset="100%" stopColor="#B090D8" stopOpacity=".52"/></linearGradient>
          </defs>
          <polygon points="50,22 28,50 3,50 50,3"  fill="url(#rvF)"/>
          <polygon points="50,22 72,50 97,50 50,3" fill="url(#rvF)"/>
          <polygon points="50,22 72,50 50,78 28,50" fill="url(#rvT)" opacity=".72"/>
          <circle cx="50" cy="50" r="2.5" fill="#EDE8F6" opacity=".52"/>
          <polygon points="50,3 97,50 50,97 3,50" fill="none" stroke="#C4B8E4" strokeWidth=".4" opacity=".32"/>
        </svg>
      </div>

      {/* Left-to-right overlay */}
      <div className="hero__overlay"></div>

      {/* ─── HERO CONTENT ─── */}
      <div className="hero__content reveal">

        <div className="hero__badge">
          <div className="glow-dot"></div>
          {t('hero.badge')}
        </div>

        <h1 className="hero__title">
          {t('hero.titleLine1')}
          <span className="hero__title-sub">{t('hero.titleLine2')}</span>
        </h1>

        <p className="hero__desc">
          {t('hero.desc')}
        </p>

        <div className="hero__actions">
          <a href="#pricing" className="btn-hero-primary">
            {t('hero.btnPrimary')}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <a href="#how" className="btn-hero-ghost">
            {t('hero.btnGhost')}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
      </div>

      {/* Stats strip */}
      <div className="hero__stats stat-row-glass reveal" data-d="4">
        <div className="hero__stat">
          <div className="hero__stat-val">+<span data-target="38" data-suffix="%">38%</span></div>
          <div className="hero__stat-label">{t('hero.stat1Label')}</div>
        </div>
        <div className="hero__stat">
          <div className="hero__stat-val">−<span data-target="52" data-suffix="%">52%</span></div>
          <div className="hero__stat-label">{t('hero.stat2Label')}</div>
        </div>
        <div className="hero__stat">
          <div className="hero__stat-val">&lt;<span data-target="15" data-suffix="s">15s</span></div>
          <div className="hero__stat-label">{t('hero.stat3Label')}</div>
        </div>
        <div className="hero__stat">
          <div className="hero__stat-val"><span data-target="4" data-suffix="K">4K</span></div>
          <div className="hero__stat-label">{t('hero.stat4Label')}</div>
        </div>
      </div>
    </section>
  );
}
