'use client';

export default function Hero() {
  return (
    <section id="hero">

      <p className="hero-tag">Plugin para Shopify · E-commerce de Moda</p>

      {/* GEM MARK */}
      <div className="hero-gem-wrap">
        <div className="hero-gem-glow"></div>

        <svg width="84" height="84" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="REFLEXY"
          style={{filter:'drop-shadow(0 0 20px rgba(112,80,160,.55)) drop-shadow(0 0 52px rgba(43,18,80,.35))',animation:'gemS 90s linear infinite',position:'relative',zIndex:2}}>
          <defs>
            <linearGradient id="hF1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C4B8E4" stopOpacity=".90"/><stop offset="100%" stopColor="#7050A0" stopOpacity=".70"/></linearGradient>
            <linearGradient id="hF2" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#B8AEDD" stopOpacity=".70"/><stop offset="100%" stopColor="#4A2880" stopOpacity=".55"/></linearGradient>
            <linearGradient id="hF3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9070C0" stopOpacity=".55"/><stop offset="100%" stopColor="#2B1250" stopOpacity=".80"/></linearGradient>
            <linearGradient id="hF4" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D0C4EC" stopOpacity=".80"/><stop offset="100%" stopColor="#5A38A0" stopOpacity=".60"/></linearGradient>
            <linearGradient id="hTbl" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#E8E2F8" stopOpacity=".95"/><stop offset="100%" stopColor="#B090D8" stopOpacity=".80"/></linearGradient>
            <linearGradient id="hP1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0CC89E" stopOpacity=".38"/><stop offset="100%" stopColor="#0CC89E" stopOpacity=".05"/></linearGradient>
            <linearGradient id="hP2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7ADAC8" stopOpacity=".25"/><stop offset="100%" stopColor="#0CC89E" stopOpacity=".03"/></linearGradient>
            <linearGradient id="hStr" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C4B8E4" stopOpacity=".55"/><stop offset="50%" stopColor="#B8AEDD" stopOpacity=".35"/><stop offset="100%" stopColor="#7050A0" stopOpacity=".25"/></linearGradient>
            <filter id="hGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <clipPath id="hClip"><polygon points="50,3 97,50 50,97 3,50"/></clipPath>
            <linearGradient id="hCaustic" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0"/><stop offset="42%" stopColor="white" stopOpacity="0"/>
              <stop offset="50%" stopColor="white" stopOpacity=".18"/><stop offset="58%" stopColor="white" stopOpacity="0"/><stop offset="100%" stopColor="white" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <polygon points="50,78 28,50 3,50 50,97" fill="url(#hP1)" opacity=".80"/>
          <polygon points="50,78 72,50 97,50 50,97" fill="url(#hP2)" opacity=".80"/>
          <polygon points="50,22 28,50 3,50 50,3" fill="url(#hF1)"/>
          <polygon points="50,22 72,50 97,50 50,3" fill="url(#hF4)"/>
          <polygon points="3,50 50,22 28,50" fill="url(#hF2)"/>
          <polygon points="97,50 50,22 72,50" fill="url(#hF3)"/>
          <polygon points="50,22 72,50 50,78 28,50" fill="url(#hTbl)" filter="url(#hGlow)"/>
          <circle cx="50" cy="50" r="2.5" fill="#EDE8F6" opacity=".95" filter="url(#hGlow)"/>
          <polygon points="50,3 97,50 50,97 3,50" fill="none" stroke="url(#hStr)" strokeWidth=".45"/>
          <polygon points="50,22 72,50 50,78 28,50" fill="none" stroke="#C4B8E4" strokeWidth=".4" opacity=".25"/>
          <line x1="50" y1="3" x2="50" y2="22" stroke="#C4B8E4" strokeWidth=".35" opacity=".45"/>
          <line x1="3" y1="50" x2="28" y2="50" stroke="#C4B8E4" strokeWidth=".35" opacity=".35"/>
          <line x1="97" y1="50" x2="72" y2="50" stroke="#C4B8E4" strokeWidth=".35" opacity=".35"/>
          <line x1="50" y1="22" x2="28" y2="50" stroke="#C4B8E4" strokeWidth=".30" opacity=".28"/>
          <line x1="50" y1="22" x2="72" y2="50" stroke="#C4B8E4" strokeWidth=".30" opacity=".28"/>
          <line x1="50" y1="78" x2="28" y2="50" stroke="#0CC89E" strokeWidth=".25" opacity=".22"/>
          <line x1="50" y1="78" x2="72" y2="50" stroke="#0CC89E" strokeWidth=".25" opacity=".22"/>
          <g clipPath="url(#hClip)">
            <rect x="-110" y="0" width="220" height="100" fill="url(#hCaustic)">
              <animateTransform attributeName="transform" type="translate" values="-40,0;140,0;140,0;-40,0" keyTimes="0;0.38;1;1" dur="9s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0 0 1 1;0 0 1 1"/>
            </rect>
            <rect x="-110" y="50" width="220" height="50" opacity="0">
              <animate attributeName="fill" values="#7ADAC8;#7ADAC8" dur="9s" repeatCount="indefinite"/>
              <animateTransform attributeName="transform" type="translate" values="-40,0;140,0;140,0;-40,0" keyTimes="0;0.38;1;1" dur="9s" begin="4.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0 0 1 1;0 0 1 1"/>
              <animate attributeName="opacity" values="0;0;.25;.25;0;0" keyTimes="0;0.1;0.2;0.35;0.45;1" dur="9s" begin="4.5s" repeatCount="indefinite"/>
            </rect>
          </g>
        </svg>

        {/* Girdle */}
        <div className="gem-axis-hero"></div>

        {/* Pavilion reflection */}
        <svg width="84" height="84" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
          style={{transform:'scaleY(-1)',WebkitMaskImage:'linear-gradient(to bottom,rgba(0,0,0,.35) 0%,transparent 62%)',maskImage:'linear-gradient(to bottom,rgba(0,0,0,.35) 0%,transparent 62%)',marginTop:'1px',animation:'pavP 8s ease-in-out infinite',filter:'drop-shadow(0 0 8px rgba(12,200,158,.18))'}}>
          <defs>
            <linearGradient id="rF" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C4B8E4" stopOpacity=".6"/><stop offset="100%" stopColor="#7050A0" stopOpacity=".4"/></linearGradient>
            <linearGradient id="rT" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#E8E2F8" stopOpacity=".7"/><stop offset="100%" stopColor="#B090D8" stopOpacity=".5"/></linearGradient>
          </defs>
          <polygon points="50,22 28,50 3,50 50,3" fill="url(#rF)"/>
          <polygon points="50,22 72,50 97,50 50,3" fill="url(#rF)"/>
          <polygon points="50,22 72,50 50,78 28,50" fill="url(#rT)" opacity=".7"/>
          <circle cx="50" cy="50" r="2.5" fill="#EDE8F6" opacity=".5"/>
          <polygon points="50,3 97,50 50,97 3,50" fill="none" stroke="#C4B8E4" strokeWidth=".4" opacity=".3"/>
        </svg>
      </div>

      {/* WORDMARK + ECHO */}
      <div style={{position:'relative'}}>
        <h1 className="hero-wm">REFLEXY</h1>
        <span className="hero-echo" aria-hidden="true">REFLEXY</span>
      </div>

      {/* DESCRIPTOR */}
      <p className="hero-desc">Inteligência comportamental para e-commerce de moda.</p>

      {/* HEADLINE */}
      <h2 className="hero-head">O reflexo da sua conversão.</h2>

      {/* SUBTITLE */}
      <p className="hero-sub">Provador virtual com IA, geração de imagens profissionais e analytics comportamental — numa única plataforma Shopify.</p>

      {/* CTAS */}
      <div className="hero-actions">
        <a href="#pricing" className="btn-p">Começar gratuitamente <span style={{opacity:.6}}>→</span></a>
        <a href="#features" className="btn-g">Ver como funciona</a>
      </div>

      {/* STAT BLOCK */}
      <div className="stat-row">
        <div style={{textAlign:'center'}}>
          <div className="stat-val data">+38%</div>
          <div className="stat-label">Aumento em conversão</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div className="stat-val neutral">−52%</div>
          <div className="stat-label">Redução em devoluções</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div className="stat-val compare">&lt; 15s</div>
          <div className="stat-label">Tempo de geração IA</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div className="stat-val compare">4K</div>
          <div className="stat-label">Resolução Studio Pro</div>
        </div>
      </div>

      {/* DISCLAIMER */}
      <p className="hero-disc">*Baseado em estudos de caso do setor de e-commerce de moda. Resultados individuais podem variar.</p>

    </section>
  );
}
