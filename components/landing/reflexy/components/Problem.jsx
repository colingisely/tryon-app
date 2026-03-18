'use client';

export default function Problem() {
  return (
    <section className="sec" id="problem">
      <div className="wrap">
        <p className="eyebrow">O Problema</p>
        <h2 className="display">Seu cliente não compra<br />porque não tem certeza.</h2>
        <p className="editorial" style={{marginTop:'12px'}}>O e-commerce de moda enfrenta quatro obstáculos estruturais que custam receita todos os dias.</p>

        <div className="problem-grid">
          <div className="problem-cell">
            <div className="problem-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color:'var(--dusk)'}}><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
            </div>
            <h3 className="problem-title">Altas taxas de devolução</h3>
            <p className="problem-body">Tamanho errado, caimento diferente do esperado. O cliente compra sem certeza e devolve quando descobre a realidade.</p>
          </div>

          <div className="problem-cell">
            <div className="problem-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color:'var(--dusk)'}}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h3 className="problem-title">Baixa confiança na compra</h3>
            <p className="problem-body">Sem poder experimentar, o cliente hesita. A dúvida vira abandono de carrinho. Você perde a venda no momento da decisão.</p>
          </div>

          <div className="problem-cell">
            <div className="problem-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color:'var(--dusk)'}}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <h3 className="problem-title">Custo alto de fotografia</h3>
            <p className="problem-body">Ensaios profissionais são caros, lentos e inescaláveis para catálogos grandes. Cada nova peça exige nova produção.</p>
          </div>

          <div className="problem-cell">
            <div className="problem-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color:'var(--dusk)'}}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
            <h3 className="problem-title">Dados superficiais</h3>
            <p className="problem-body">Cliques e vendas não revelam intenção. Você não sabe o que o cliente queria — só o que comprou ou não comprou.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
