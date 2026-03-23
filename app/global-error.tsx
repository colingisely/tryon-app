'use client'

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
      <linearGradient id="ge_F1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#B8AEDD"/><stop offset="100%" stopColor="#7050A0"/></linearGradient>
      <linearGradient id="ge_F4" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#EDEBF5" stopOpacity=".9"/><stop offset="100%" stopColor="#B8AEDD"/></linearGradient>
      <linearGradient id="ge_F2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#B8AEDD" stopOpacity=".7"/><stop offset="100%" stopColor="#7050A0" stopOpacity=".5"/></linearGradient>
      <linearGradient id="ge_F3" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#EDEBF5" stopOpacity=".6"/><stop offset="100%" stopColor="#B8AEDD" stopOpacity=".4"/></linearGradient>
      <linearGradient id="ge_P1" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#06050F" stopOpacity=".9"/><stop offset="100%" stopColor="#2B1250" stopOpacity=".7"/></linearGradient>
      <linearGradient id="ge_P2" x1="100%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stopColor="#06050F" stopOpacity=".85"/><stop offset="100%" stopColor="#2B1250" stopOpacity=".65"/></linearGradient>
      <linearGradient id="ge_Tbl" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stopColor="#EDEBF5" stopOpacity=".18"/><stop offset="100%" stopColor="#7050A0" stopOpacity=".28"/></linearGradient>
      <linearGradient id="ge_Str" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#B8AEDD" stopOpacity=".4"/><stop offset="100%" stopColor="#0CC89E" stopOpacity=".3"/></linearGradient>
    </defs>
    <polygon points="50,22 28,50 3,50 50,3" fill="url(#ge_F1)"/>
    <polygon points="50,22 72,50 97,50 50,3" fill="url(#ge_F4)"/>
    <polygon points="3,50 50,22 28,50" fill="url(#ge_F2)"/>
    <polygon points="97,50 50,22 72,50" fill="url(#ge_F3)"/>
    <polygon points="50,78 28,50 3,50 50,97" fill="url(#ge_P1)" opacity=".80"/>
    <polygon points="50,78 72,50 97,50 50,97" fill="url(#ge_P2)" opacity=".80"/>
    <polygon points="50,22 72,50 50,78 28,50" fill="url(#ge_Tbl)"/>
    <polygon points="50,3 97,50 50,97 3,50" fill="none" stroke="url(#ge_Str)" strokeWidth=".45"/>
    <line x1="3" y1="50" x2="97" y2="50" stroke="#0CC89E" strokeWidth=".8" opacity=".65"/>
  </svg>
)

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
          @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=IBM+Plex+Mono:wght@400;500&display=swap');
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
          padding: '2rem',
          position: 'relative',
          overflow: 'hidden',
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
          Algo deu errado
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
          Ocorreu um erro inesperado. Nossa equipe já foi notificada.
        </p>

        {/* Button */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <button
            onClick={reset}
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              padding: '0.75rem 2rem',
              background: '#2B1250',
              border: '1px solid rgba(112,80,160,.35)',
              borderRadius: '2px',
              color: '#EDEBF5',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px',
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
