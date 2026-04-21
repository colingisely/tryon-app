'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import ReflexGem from '@/components/ui/ReflexGem'

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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=IBM+Plex+Mono:wght@400;500&display=swap');
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

      <main
        style={{
          minHeight: '100vh',
          background: '#06050F',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px 24px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ maxWidth: 440, width: '100%', position: 'relative', zIndex: 1 }}>
          {/* Gem logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <ReflexGem size={48} uid="err" noReflection />
          </div>

          {/* Eyebrow */}
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.18em',
              color: '#0CC89E',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            ERRO · 500
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 24,
              fontWeight: 600,
              color: '#EDEBF5',
              margin: '0 0 8px',
              letterSpacing: '-0.01em',
            }}
          >
            Algo deu errado do nosso lado
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              color: '#A09CC0',
              lineHeight: 1.6,
              margin: '0 0 28px',
            }}
          >
            Tente de novo em segundos.
          </p>

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={reset}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                border: '1px solid rgba(112,80,160,.40)',
                borderRadius: 14,
                color: '#EDEBF5',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 14,
                filter: 'drop-shadow(0 0 20px rgba(43,18,80,.40))',
                transition: 'filter .2s',
              }}
            >
              Tentar novamente
            </button>
            <Link
              href="/dashboard"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                padding: '12px 28px',
                background: 'rgba(184,174,221,.04)',
                border: '1px solid rgba(184,174,221,.14)',
                borderRadius: 14,
                color: '#B8AEDD',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: 14,
                display: 'inline-block',
                transition: 'all .2s',
              }}
            >
              Ir para o Dashboard
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
