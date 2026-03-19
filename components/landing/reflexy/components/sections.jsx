'use client';

// ── §04 HOW IT WORKS ──────────────────────────────────────────────────────────
export function HowItWorks() {
  return (
    <section className="sec" id="how">
      <div className="wrap">
        <p className="eyebrow">Como Funciona</p>
        <h2 className="display">Instale uma vez.<br />Funciona para sempre.</h2>
        <p className="editorial" style={{marginTop:'12px'}}>Instalação simples e direta no Shopify. Em menos de 5 minutos, sua loja já está pronta.</p>

        <div className="steps-grid">
          <div className="step">
            <div className="step-connector"></div>
            <div className="step-num">Passo 01</div>
            <div className="step-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color:'var(--dusk)'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <h3 className="step-title">Instale o plugin</h3>
            <p className="step-body">Adicione o Reflexy à sua loja Shopify em menos de 5 minutos diretamente pela App Store. A instalação é simples e acompanhada de um guia passo a passo.</p>
          </div>

          <div className="step">
            <div className="step-connector"></div>
            <div className="step-num">Passo 02</div>
            <div className="step-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color:'var(--dusk)'}}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <h3 className="step-title">Ative o provador</h3>
            <p className="step-body">O botão "Experimentar" aparece automaticamente nas páginas de produto. Seus clientes já podem usar — sem nenhuma ação adicional.</p>
          </div>

          <div className="step">
            <div className="step-num">Passo 03</div>
            <div className="step-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color:'var(--dusk)'}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <h3 className="step-title">Acompanhe os dados</h3>
            <p className="step-body">Acesse o painel e veja em tempo real como seus clientes interagem com cada peça. Inteligência disponível nas primeiras horas.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── §05 COMPARISON ────────────────────────────────────────────────────────────
export function Comparison() {
  return (
    <section className="sec" style={{background:'var(--onyx)'}}>
      <div className="wrap">
        <p className="eyebrow">Vantagem Competitiva</p>
        <h2 className="display">A maioria resolve uma camada.<br />Reflexy resolve três.</h2>

        <div style={{overflowX:'auto'}}>
          <table className="comp-table">
            <thead>
              <tr>
                <th>Funcionalidade</th>
                <th className="ours">Reflexy</th>
                <th>Concorrentes</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Provador virtual com IA</td><td className="ours"><span className="tick-yes">✓</span></td><td><span className="tick-yes">✓</span></td></tr>
              <tr><td>Geração de imagens profissionais 4K</td><td className="ours"><span className="tick-yes">✓</span></td><td><span className="tick-no">✗</span></td></tr>
              <tr><td>Analytics comportamental proprietário</td><td className="ours"><span className="tick-yes">✓</span></td><td><span className="tick-no">✗</span></td></tr>
              <tr><td>Dados de intenção de compra</td><td className="ours"><span className="tick-yes">✓</span></td><td><span className="tick-no">✗</span></td></tr>
              <tr><td>Painel unificado</td><td className="ours"><span className="tick-yes">✓</span></td><td><span className="tick-no">✗</span></td></tr>
              <tr><td>Integração nativa Shopify</td><td className="ours"><span className="tick-yes">✓</span></td><td><span className="tick-part">Parcial</span></td></tr>
              <tr><td>Modelo de dados proprietário</td><td className="ours"><span className="tick-yes">✓</span></td><td><span className="tick-no">✗</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ── §06 RESULTS ───────────────────────────────────────────────────────────────
export function Results() {
  return (
    <section className="sec">
      <div className="wrap">
        <p className="eyebrow">Resultados</p>
        <h2 className="display">Números que<br />falam por si.</h2>

        <div className="proof-grid">
          <div className="proof-cell">
            <div className="proof-number">+<span>38%</span></div>
            <div className="proof-label">Aumento médio em conversão*</div>
            <p className="proof-desc">Benchmark do setor de e-commerce de moda com provadores virtuais. O Reflexy foi desenhado para entregar essa transformação na sua operação.</p>
          </div>
          <div className="proof-cell">
            <div className="proof-number">−<span>52%</span></div>
            <div className="proof-label">Redução em devoluções*</div>
            <p className="proof-desc">Clientes que provam antes de comprar devolvem menos. Benchmark consolidado de lojas de moda que adotaram provadores virtuais com IA.</p>
          </div>
          <div className="proof-cell">
            <div className="proof-number" style={{fontFamily:'var(--f-m)',fontWeight:400,color:'var(--verdigris)'}}>&lt; 15<span style={{fontSize:'.5em',color:'var(--dusk)'}}>s</span></div>
            <div className="proof-label">Tempo de geração confirmado</div>
            <p className="proof-desc">O provador opera no modo balanced — simulação hiper-realista entregue em até 15 segundos. Rápido o suficiente para não interromper a decisão de compra.</p>
          </div>
          <div className="proof-cell">
            <div className="proof-number" style={{fontFamily:'var(--f-m)',fontWeight:400,color:'var(--verdigris)'}}>4K</div>
            <div className="proof-label">Resolução Studio Pro confirmada</div>
            <p className="proof-desc">O Studio Pro gera imagens profissionais em alta resolução, em até 60 segundos. Pronto para ads, catálogos e campanhas.</p>
          </div>
        </div>

        <div className="quote-block">
          <span className="quote-mark">"</span>
          <p className="quote-text">Os dados de analytics me mostraram que minha peça mais provada não era a mais vendida. Ajustei preço e descrição. Vendi 3× mais no mês seguinte.</p>
          <div className="quote-attr">
            <span className="quote-attr-name">Lojista de moda feminina</span>
            <span className="quote-attr-detail">São Paulo · 90 dias de uso</span>
          </div>
          <div className="quote-source">Depoimento com consentimento · early adopter · resultados individuais podem variar</div>
        </div>
      </div>
    </section>
  );
}

// ── §07 PRICING ───────────────────────────────────────────────────────────────
export function Pricing() {
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

  return (
    <section className="sec" id="pricing" style={{background:'var(--onyx)'}}>
      <div className="wrap">
        <p className="eyebrow">Planos</p>
        <h2 className="display">Do primeiro teste<br />à escala real.</h2>
        <p className="editorial" style={{marginTop:'12px'}}>Três planos. Um caminho claro.</p>

        {/* FREE ENTRY */}
        <div className="free-entry">
          <div className="free-entry-left">
            <div className="free-entry-title">Instale e veja o Reflexy na sua loja</div>
            <div className="free-entry-desc">10 provas reais por mês. Experiência completa do provador — sem assinatura.</div>
            <div className="free-entry-note">Marca Reflexy visível</div>
          </div>
          <a href="/signup" className="btn-g" style={{whiteSpace:'nowrap',flexShrink:0}}>Instalar agora</a>
        </div>

        {/* 3-PLAN GRID */}
        <div className="pricing-grid">
          <div className="plan">
            <div className="plan-badge">Starter</div>
            <div className="plan-name">Starter</div>
            <div className="plan-tagline">Para lojas que estão começando.</div>
            <div className="plan-price-row"><span className="plan-currency">$</span><span className="plan-price">19</span></div>
            <div className="plan-period">por mês</div>
            <div className="plan-div"></div>
            <div className="plan-features">
              <div className="plan-feat"><div className="plan-feat-dot"></div>100 provas por mês</div>
              <div className="plan-feat"><div className="plan-feat-dot"></div>5 renders Studio Pro/mês</div>
              <div className="plan-feat"><div className="plan-feat-dot"></div>Peças mais provadas por SKU</div>
              <div className="plan-feat"><div className="plan-feat-dot"></div>Tempo médio de interação por produto</div>
              <div className="plan-feat"><div className="plan-feat-dot"></div>Suporte padrão</div>
            </div>
            <button 
              onClick={() => handleCheckout('starter')}
              className="plan-cta ghost"
              style={{ width: '100%' }}
            >
              Assinar Starter
            </button>
          </div>

          <div className="plan featured">
            <div className="plan-badge">A escolha mais equilibrada</div>
            <div className="plan-name">Growth</div>
            <div className="plan-tagline">Para e-commerces em crescimento.</div>
            <div className="plan-price-row"><span className="plan-currency">$</span><span className="plan-price">39</span></div>
            <div className="plan-period">por mês</div>
            <div className="plan-div"></div>
            <div className="plan-features">
              <div className="plan-feat"><div className="plan-feat-dot"></div>300 provas por mês</div>
              <div className="plan-feat"><div className="plan-feat-dot"></div>10 renders Studio Pro/mês</div>
              <div className="plan-feat"><div className="plan-feat-dot"></div>Hesitação e abandono por produto</div>
              <div className="plan-feat"><div className="plan-feat-dot"></div>Analytics de tamanhos — engajamento por variante</div>
              <div className="plan-feat"><div className="plan-feat-dot"></div>Rastreamento de intenção de compra</div>
              <div className="plan-feat"><div className="plan-feat-dot"></div>Suporte prioritário</div>
            </div>
            <button 
              onClick={() => handleCheckout('growth')}
              className="plan-cta primary"
              style={{ width: '100%' }}
            >
              Assinar Growth
            </button>
          </div>

          <div className="plan">
            <div className="plan-badge">Pro</div>
            <div className="plan-name">Pro</div>
            <div className="plan-tagline">Para equipes que operam em escala.</div>
            <div className="plan-price-row"><span className="plan-currency">$</span><span className="plan-price">99</span></div>
            <div className="plan-period">por mês</div>
            <div className="plan-div"></div>
            <div className="plan-features">
              <div className="plan-feat"><div className="plan-feat-dot"></div>800 provas por mês</div>
              <div className="plan-feat"><div className="plan-feat-dot"></div>20 renders Studio Pro/mês</div>
              <div className="plan-feat"><div className="plan-feat-dot"></div>Funil completo — prova → carrinho → compra</div>
              <div className="plan-feat"><div className="plan-feat-dot"></div>Impacto do provador nas vendas</div>
              <div className="plan-feat"><div className="plan-feat-dot"></div>Jornada de sessão completa por produto</div>
              <div className="plan-feat"><div className="plan-feat-dot"></div>Suporte prioritário</div>
            </div>
            <button 
              onClick={() => handleCheckout('pro')}
              className="plan-cta ghost"
              style={{ width: '100%' }}
            >
              Assinar Pro
            </button>
          </div>
        </div>

        {/* PAY-AS-YOU-GO */}
        <div className="payg-row">
          <span className="payg-label">Uso adicional sob demanda</span>
          <div className="payg-trigger">
            ?
            <div className="payg-tooltip">
              <div className="tooltip-title">Excedente por plano</div>
              <div className="tooltip-row"><span className="tooltip-plan">Try-on · Starter</span><span className="tooltip-price">$0.17 / prova</span></div>
              <div className="tooltip-row"><span className="tooltip-plan">Try-on · Growth</span><span className="tooltip-price">$0.15 / prova</span></div>
              <div className="tooltip-row"><span className="tooltip-plan">Try-on · Pro</span><span className="tooltip-price">$0.13 / prova</span></div>
              <div className="tooltip-row"><span className="tooltip-plan">Try-on · Enterprise</span><span className="tooltip-price">$0.10 / prova</span></div>
              <div className="tooltip-row"><span className="tooltip-plan">Studio Pro · todos os planos</span><span className="tooltip-price" style={{color:'var(--verdigris)'}}>$0.15 / render</span></div>
              <div className="tooltip-note">Uso adicional cobrado apenas quando o limite mensal é excedido.</div>
            </div>
          </div>
          <span style={{fontFamily:'var(--f-m)',fontSize:'10px',color:'rgba(160,156,192,.4)',letterSpacing:'.1em'}}>— cobrado apenas quando necessário</span>
        </div>

        {/* ENTERPRISE */}
        <div className="enterprise-block">
          <div>
            <div className="ent-label">Enterprise</div>
            <h3 className="ent-title">Para operações de alto volume.</h3>
            <p className="ent-desc">Stack completo de analytics, limites flexíveis e suporte dedicado para operações de moda que exigem escala real e dados de conversão em produção.</p>
            <div className="ent-feats">
              <div className="ent-feat"><div className="ent-feat-dot"></div>1.000+ provas / mês</div>
              <div className="ent-feat"><div className="ent-feat-dot"></div>20 renders Studio Pro</div>
              <div className="ent-feat"><div className="ent-feat-dot"></div>Funil de conversão completo</div>
              <div className="ent-feat"><div className="ent-feat-dot"></div>Impacto do provador nas vendas</div>
              <div className="ent-feat"><div className="ent-feat-dot"></div>Integrações customizadas</div>
              <div className="ent-feat"><div className="ent-feat-dot"></div>Suporte dedicado</div>
              <div className="ent-feat"><div className="ent-feat-dot"></div>Limites flexíveis</div>
            </div>
          </div>
          <a href="/cdn-cgi/l/email-protection#50333f3e2431243f102235363c3528297e333f" className="btn-g" style={{whiteSpace:'nowrap',flexShrink:0}}>Falar com vendas</a>
        </div>
      </div>
    </section>
  );
}

// ── §08 FAQ ───────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {q:'Como o Reflexy se integra à minha loja Shopify?',              a:'A instalação é feita diretamente pela Shopify App Store. Após instalar, o plugin se integra ao seu catálogo. O processo é simples, acompanhado de um guia passo a passo, e leva menos de 5 minutos no total.'},
  {q:'O provador virtual funciona com qualquer tipo de roupa?',       a:'Sim. O sistema funciona com peças femininas, masculinas, acessórios e calçados. A IA é treinada para lidar com diferentes texturas, estampas e tipos de caimento. Para melhores resultados, recomendamos imagens da peça em fundo neutro com boa iluminação.'},
  {q:'Os dados dos meus clientes são seguros?',                       a:'Sim. As fotos enviadas pelos clientes são processadas em tempo real e não são armazenadas em nossos servidores após a geração da simulação. Todos os dados analíticos são anonimizados e agregados. Operamos em conformidade com a LGPD e GDPR.'},
  {q:'Posso cancelar a qualquer momento?',                            a:'Sim. Todos os planos são mensais e podem ser cancelados a qualquer momento diretamente pelo painel da Shopify, sem multa ou burocracia. O acesso continua ativo até o fim do período pago.'},
  {q:'O que acontece quando esgoto meus créditos?',                   a:'Ao atingir 80% do limite mensal, você recebe uma notificação. Ao atingir 100%, as gerações adicionais são cobradas sob demanda nas tarifas do seu plano — sem interrupção do serviço. Em caso de pendência, o acesso é suspenso após 3 dias e reativado automaticamente após confirmação do pagamento.'},
  {q:'Como funciona o Analytics de Conversão?',                       a:'O Reflexy rastreia toda a jornada do cliente na loja: do clique no botão de prova à adição ao carrinho e à compra confirmada. Cada evento é associado a um session_id anônimo, permitindo comparar conversão com provador versus sem provador. Os dados ficam disponíveis no painel por produto, tamanho e período — sem configuração adicional.'},
  {q:'O Reflexy funciona em outras plataformas além do Shopify?',     a:'Atualmente o Reflexy é otimizado para Shopify. Integrações com VTEX, WooCommerce e Nuvemshop estão no roadmap para 2026. Se você opera em outra plataforma, entre em contato — avaliamos integrações customizadas para Enterprise.'},
];

export function Faq() {
  const toggleFaq = (btn) => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  };

  return (
    <section className="sec" id="faq">
      <div className="wrap">
        <p className="eyebrow">FAQ</p>
        <h2 className="display">Perguntas frequentes.</h2>

        <div className="faq-list">
          {FAQ_ITEMS.map(({ q, a }, i) => (
            <div key={i} className="faq-item">
              <button className="faq-q" aria-expanded="false" onClick={e => toggleFaq(e.currentTarget)}>
                {q}<span className="faq-icon">+</span>
              </button>
              <div className="faq-a"><p className="faq-body">{a}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── §09 FINAL CTA ─────────────────────────────────────────────────────────────
export function FinalCta() {
  return (
    <section id="final-cta">
      {/* Ambient glow */}
      <div style={{position:'absolute',width:'400px',height:'400px',borderRadius:'50%',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'radial-gradient(circle,rgba(43,18,80,.5) 0%,transparent 70%)',pointerEvents:'none',animation:'glowB 8s ease-in-out infinite'}}></div>

      {/* Gem with caustic */}
      <svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{filter:'drop-shadow(0 0 20px rgba(112,80,160,.55))',animation:'gemS 90s linear infinite',position:'relative',zIndex:1}}>
        <defs>
          <linearGradient id="cF" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C4B8E4" stopOpacity=".9"/><stop offset="100%" stopColor="#7050A0" stopOpacity=".7"/></linearGradient>
          <linearGradient id="cT" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#E8E2F8" stopOpacity=".95"/><stop offset="100%" stopColor="#B090D8" stopOpacity=".8"/></linearGradient>
          <linearGradient id="cP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0CC89E" stopOpacity=".4"/><stop offset="100%" stopColor="#0CC89E" stopOpacity=".05"/></linearGradient>
          <clipPath id="cClip"><polygon points="50,3 97,50 50,97 3,50"/></clipPath>
          <linearGradient id="cCaustic" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="white" stopOpacity="0"/><stop offset="45%" stopColor="white" stopOpacity="0"/><stop offset="50%" stopColor="white" stopOpacity=".2"/><stop offset="55%" stopColor="white" stopOpacity="0"/><stop offset="100%" stopColor="white" stopOpacity="0"/></linearGradient>
        </defs>
        <polygon points="50,78 28,50 3,50 50,97" fill="url(#cP)"/><polygon points="50,78 72,50 97,50 50,97" fill="url(#cP)"/>
        <polygon points="50,22 28,50 3,50 50,3" fill="url(#cF)"/><polygon points="50,22 72,50 97,50 50,3" fill="url(#cF)"/>
        <polygon points="50,22 72,50 50,78 28,50" fill="url(#cT)"/>
        <circle cx="50" cy="50" r="2.5" fill="#EDE8F6" opacity=".95"/>
        <polygon points="50,3 97,50 50,97 3,50" fill="none" stroke="#B8AEDD" strokeWidth=".45" opacity=".4"/>
        <line x1="3" y1="50" x2="97" y2="50" stroke="#0CC89E" strokeWidth=".4" opacity=".4"/>
        <g clipPath="url(#cClip)">
          <rect x="-110" y="0" width="220" height="100" fill="url(#cCaustic)">
            <animateTransform attributeName="transform" type="translate" values="-40,0;140,0;140,0;-40,0" keyTimes="0;0.38;1;1" dur="9s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0 0 1 1;0 0 1 1"/>
          </rect>
        </g>
      </svg>

      <h2 className="display-xl" style={{position:'relative',zIndex:1,marginTop:'32px',maxWidth:'680px'}}>Comece a capturar o reflexo da sua conversão.</h2>
      <p className="cta-kicker" style={{position:'relative',zIndex:1}}>Instale em minutos. Veja os dados em horas. Tome decisões melhores a partir de hoje.</p>

      <div style={{display:'flex',gap:'16px',flexWrap:'wrap',justifyContent:'center',marginTop:'44px',position:'relative',zIndex:1}}>
        <a href="#pricing" className="btn-p">Começar gratuitamente <span style={{opacity:.6}}>→</span></a>
        <a href="/cdn-cgi/l/email-protection#385b57564c594c57784a5d5e545d4041165b57" className="btn-g">Falar com a equipe</a>
      </div>

      <p className="cta-note" style={{position:'relative',zIndex:1}}>Instalação simples em menos de 5 minutos · Cancele quando quiser</p>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
export function Footer() {
  return (
    <footer>
      <div>
        <div className="footer-brand">
          {/* Footer gem */}
          <svg width="22" height="22" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{filter:'drop-shadow(0 0 5px rgba(112,80,160,.4))'}}>
            <defs>
              <linearGradient id="ffF" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C4B8E4" stopOpacity=".9"/><stop offset="100%" stopColor="#7050A0" stopOpacity=".7"/></linearGradient>
              <linearGradient id="ffT" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#E8E2F8" stopOpacity=".9"/><stop offset="100%" stopColor="#B090D8" stopOpacity=".8"/></linearGradient>
              <linearGradient id="ffP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0CC89E" stopOpacity=".4"/><stop offset="100%" stopColor="#0CC89E" stopOpacity=".05"/></linearGradient>
            </defs>
            <polygon points="50,22 28,50 3,50 50,3" fill="url(#ffF)"/><polygon points="50,22 72,50 97,50 50,3" fill="url(#ffF)"/>
            <polygon points="50,78 28,50 3,50 50,97" fill="url(#ffP)"/><polygon points="50,78 72,50 97,50 50,97" fill="url(#ffP)"/>
            <polygon points="50,22 72,50 50,78 28,50" fill="url(#ffT)"/>
            <circle cx="50" cy="50" r="2.5" fill="#EDEBF5" opacity=".9"/>
            <line x1="3" y1="50" x2="97" y2="50" stroke="#B8AEDD" strokeWidth=".45" opacity=".35"/>
          </svg>
          <span className="footer-wm">REFLEXY</span>
        </div>
        <p className="footer-desc">Inteligência comportamental para e-commerce de moda. Plugin nativo Shopify.</p>
      </div>

      <div className="footer-links">
        <div>
          <p className="footer-col-title">Produto</p>
          <a className="footer-link" href="#features">Provador Virtual</a>
          <a className="footer-link" href="#features">Studio Pro</a>
          <a className="footer-link" href="#features">Analytics</a>
          <a className="footer-link" href="#pricing">Preços</a>
        </div>
        <div>
          <p className="footer-col-title">Empresa</p>
          <a className="footer-link" href="#">Sobre</a>
          <a className="footer-link" href="#">Blog</a>
          <a className="footer-link" href="#">Carreiras</a>
          <a className="footer-link" href="/cdn-cgi/l/email-protection#05666a6b7164716a4577606369607d7c2b666a">Contato</a>
        </div>
        <div>
          <p className="footer-col-title">Legal</p>
          <a className="footer-link" href="#">Privacidade</a>
          <a className="footer-link" href="#">Termos de Uso</a>
          <a className="footer-link" href="#">LGPD</a>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-status">
          <div className="status-dot"></div>
          All systems operational
        </div>
        <p className="footer-copy">© 2026 Reflexy. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
