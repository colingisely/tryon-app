export default function TermsPage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f', color: '#fff',
      fontFamily: 'DM Sans, sans-serif', padding: '4rem 2rem',
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <a href="/" style={{ color: '#a78bfa', textDecoration: 'none', fontSize: '0.9rem' }}>← Voltar</a>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Termos de Uso</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '3rem' }}>Última atualização: março de 2026</p>
        <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '1rem' }}>
          <p>Este documento está sendo atualizado. Por favor, volte em breve.</p>
        </div>
      </div>
    </div>
  )
}
