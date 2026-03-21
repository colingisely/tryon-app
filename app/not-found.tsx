import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif',
      color: '#fff',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.15em', color: '#a78bfa' }}>
        REFLEXY
      </div>
      <div style={{ fontSize: 'clamp(6rem, 20vw, 10rem)', fontWeight: 800, lineHeight: 1, color: '#7c3aed', opacity: 0.3 }}>
        404
      </div>
      <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, margin: '1rem 0 0.5rem' }}>
        Página não encontrada
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', maxWidth: 420, marginBottom: '2.5rem' }}>
        A página que você procura não existe ou foi movida.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{
          padding: '0.75rem 1.75rem',
          background: 'rgba(124,58,237,0.15)',
          border: '1px solid rgba(124,58,237,0.4)',
          borderRadius: '0.5rem',
          color: '#a78bfa',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
        }}>
          Voltar ao início
        </Link>
        <Link href="/dashboard" style={{
          padding: '0.75rem 1.75rem',
          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          border: 'none',
          borderRadius: '0.5rem',
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
        }}>
          Ir para o Dashboard
        </Link>
      </div>
    </div>
  )
}
