import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const alt = 'Reflexy — O reflexo da sua conversão'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const gemSvg = readFileSync(join(process.cwd(), 'public/reflexy-gem.svg'))
  const gemSrc = `data:image/svg+xml;base64,${gemSvg.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#06050F',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 96px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Orb topo direita */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 700,
            height: 700,
            background: 'radial-gradient(circle, rgba(124,58,237,0.28) 0%, transparent 65%)',
            borderRadius: '50%',
          }}
        />
        {/* Orb baixo esquerda */}
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            left: -80,
            width: 460,
            height: 460,
            background: 'radial-gradient(circle, rgba(192,132,252,0.12) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={gemSrc} width={44} height={44} alt="" />
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#EDEBF5',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            REFLEXY
          </span>
        </div>

        {/* Título */}
        <div
          style={{
            fontSize: 68,
            fontWeight: 200,
            color: '#ffffff',
            lineHeight: 1.0,
            letterSpacing: '-0.04em',
            marginBottom: 6,
          }}
        >
          O reflexo da
        </div>
        <div
          style={{
            fontSize: 62,
            fontWeight: 400,
            fontStyle: 'italic',
            color: '#C084FC',
            letterSpacing: '-0.03em',
            lineHeight: 1.08,
            marginBottom: 36,
          }}
        >
          sua conversão.
        </div>

        {/* Descrição */}
        <div
          style={{
            fontSize: 19,
            color: 'rgba(184,180,212,0.75)',
            lineHeight: 1.6,
            maxWidth: 580,
            marginBottom: 52,
          }}
        >
          Provador virtual com IA, Studio Pro e Analytics comportamental — numa única plataforma nativa Shopify.
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 52 }}>
          {[
            ['+38%', 'Conversão'],
            ['−52%', 'Devoluções'],
            ['<15s', 'Geração IA'],
            ['4K', 'Studio Pro'],
          ].map(([val, label]) => (
            <div key={val} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 300,
                  color: '#C084FC',
                  letterSpacing: '-0.03em',
                }}
              >
                {val}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: 'rgba(184,180,212,0.45)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Shopify badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            right: 96,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 20px',
            background: 'rgba(124,58,237,0.14)',
            border: '1px solid rgba(124,58,237,0.32)',
            borderRadius: 100,
            fontSize: 13,
            color: 'rgba(192,132,252,0.9)',
          }}
        >
          Plugin nativo Shopify
        </div>
      </div>
    ),
    { ...size }
  )
}
