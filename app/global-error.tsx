'use client'

import ReflexGem from '@/components/ui/ReflexGem'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=IBM+Plex+Mono:wght@400;500&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        `}</style>
      </head>
      <body
        style={{
          background: '#06050F',
          minHeight: '100vh',
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

        <div style={{ maxWidth: 440, width: '100%', position: 'relative', zIndex: 1 }}>
          {/* Gem logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <ReflexGem size={48} uid="ge" noReflection />
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
            Erro inesperado
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
            Já fomos notificados.
          </p>

          {/* Button */}
          <div>
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
          </div>
        </div>
      </body>
    </html>
  )
}
