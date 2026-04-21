'use client'

import Link from 'next/link'
import { useEffect } from 'react'

const GemMark = ({ size = 96 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: 'drop-shadow(0 0 18px rgba(112,80,160,0.55)) drop-shadow(0 0 6px rgba(12,200,158,0.3))' }}
  >
    <defs>
      <linearGradient id="err_F1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#B8AEDD"/><stop offset="100%" stopColor="#7050A0"/></linearGradient>
      <linearGradient id="err_F4" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#EDEBF5" stopOpacity=".9"/><stop offset="100%" stopColor="#B8AEDD"/></linearGradient>
      <linearGradient id="err_F2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#B8AEDD" stopOpacity=".7"/><stop offset="100%" stopColor="#7050A0" stopOpacity=".5"/></linearGradient>
      <linearGradient id="err_F3" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#EDEBF5" stopOpacity=".6"/><stop offset="100%" stopColor="#B8AEDD" stopOpacity=".4"/></linearGradient>
      <linearGradient id="err_P1" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#06050F" stopOpacity=".9"/><stop offset="100%" stopColor="#2B1250" stopOpacity=".7"/></linearGradient>
      <linearGradient id="err_P2" x1="100%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stopColor="#06050F" stopOpacity=".85"/><stop offset="100%" stopColor="#2B1250" stopOpacity=".65"/></linearGradient>
      <linearGradient id="err_Tbl" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stopColor="#EDEBF5" stopOpacity=".18"/><stop offset="100%" stopColor="#7050A0" stopOpacity=".28"/></linearGradient>
      <linearGradient id="err_Str" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#B8AEDD" stopOpacity=".4"/><stop offset="100%" stopColor="#0CC89E" stopOpacity=".3"/></linearGradient>
    </defs>
    <polygon points="50,22 28,50 3,50 50,3" fill="url(#err_F1)"/>
    <polygon points="50,22 72,50 97,50 50,3" fill="url(#err_F4)"/>
    <polygon points="3,50 50,22 28,50" fill="url(#err_F2)"/>
    <polygon points="97,50 50,22 72,50" fill="url(#err_F3)"/>
    <polygon points="50,78 28,50 3,50 50,97" fill="url(#err_P1)" opacity=".80"/>
    <polygon points="50,78 72,50 97,50 50,97" fill="url(#err_P2)" opacity=".80"/>
    <polygon points="50,22 72,50 50,78 28,50" fill="url(#err_Tbl)"/>
    <polygon points="50,3 97,50 50,97 3,50" fill="none" stroke="url(#err_Str)" strokeWidth=".45"/>
    <line x1="3" y1="50" x2="97" y2="50" stroke="#0CC89E" strokeWidth=".8" opacity=".65"/>
  </svg>
)

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06050F; }
      `}</style>

      {/* Grain texture overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0.022,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />

      <div
        style={{
          minHeight: '100vh',
          background: '#06050F',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial glow behind gem */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -60%)',
            width: '480px',
            height: '480px',
            background: 'radial-gradient(circle, rgba(43,18,80,.42) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Gem mark */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: '1.5rem' }}>
          <GemMark size={96} />
        </div>

        {/* Eyebrow label */}
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.75rem',
            fontWeight: 500,
            letterSpacing: '0.18em',
            color: '#0CC89E',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            position: 'relative',
            zIndex: 1,
          }}
        >
          ERRO · 500
        </div>

        {/* Large 500 */}
        <div
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 'clamp(6rem, 20vw, 10rem)',
            fontWeight: 700,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #EDEBF5 0%, #B8AEDD 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.75rem',
            position: 'relative',
            zIndex: 1,
            letterSpacing: '-0.02em',
          }}
        >
          500
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 'clamp(1.4rem, 3.5vw, 2.25rem)',
            fontWeight: 600,
            color: '#EDEBF5',
            margin: '0 0 0.75rem',
            letterSpacing: '-0.01em',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Algo deu errado do nosso lado
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '1rem',
            color: '#A09CC0',
            maxWidth: 420,
            marginBottom: '2.5rem',
            lineHeight: 1.6,
            position: 'relative',
            zIndex: 1,
          }}
        >
          Tente de novo em segundos.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '0.875rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <button
            onClick={reset}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              padding: '16px 56px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
              border: '1px solid rgba(112,80,160,.40)',
              borderRadius: 14,
              color: '#EDEBF5',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 16,
              filter: 'drop-shadow(0 0 24px rgba(43,18,80,.45))',
              transition: 'filter .2s',
            }}
          >
            Tentar novamente
          </button>
          <Link
            href="/dashboard"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              padding: '16px 56px',
              background: 'rgba(184,174,221,.04)',
              border: '1px solid rgba(184,174,221,.14)',
              borderRadius: 14,
              color: '#B8AEDD',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: 16,
              display: 'inline-block',
              transition: 'all .2s',
            }}
          >
            Ir para o Dashboard
          </Link>
        </div>
      </div>
    </>
  )
}
