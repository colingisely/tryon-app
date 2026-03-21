'use client'
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html>
      <body style={{
        margin: 0, minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'DM Sans, sans-serif', color: '#fff', textAlign: 'center', padding: '2rem',
      }}>
        <div style={{ marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.15em', color: '#a78bfa' }}>REFLEXY</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Erro crítico</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 400, marginBottom: '2rem' }}>
          Ocorreu um erro crítico. Tente recarregar a página.
        </p>
        <button onClick={reset} style={{
          padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          border: 'none', borderRadius: '0.5rem', color: '#fff', cursor: 'pointer',
          fontWeight: 600, fontSize: '1rem',
        }}>Recarregar</button>
      </body>
    </html>
  )
}
