'use client'
import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif', color: '#fff', textAlign: 'center', padding: '2rem',
    }}>
      <div style={{ marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.15em', color: '#a78bfa' }}>REFLEXY</div>
      <div style={{ fontSize: 'clamp(6rem, 20vw, 10rem)', fontWeight: 800, lineHeight: 1, color: '#ef4444', opacity: 0.25 }}>500</div>
      <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, margin: '1rem 0 0.5rem' }}>Algo deu errado</h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', maxWidth: 420, marginBottom: '2.5rem' }}>
        Ocorreu um erro inesperado. Nossa equipe já foi notificada.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={reset} style={{
          padding: '0.75rem 1.75rem', background: 'rgba(124,58,237,0.15)',
          border: '1px solid rgba(124,58,237,0.4)', borderRadius: '0.5rem',
          color: '#a78bfa', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
        }}>Tentar novamente</button>
        <Link href="/dashboard" style={{
          padding: '0.75rem 1.75rem', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          borderRadius: '0.5rem', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem',
        }}>Ir para o Dashboard</Link>
      </div>
    </div>
  )
}
