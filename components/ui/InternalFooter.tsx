'use client'

/**
 * InternalFooter — rodapé minimalista para páginas internas (dashboard, studio, etc.)
 * Brand System V5 · Deep Amethyst
 */

import Link from 'next/link'

const year = new Date().getFullYear()

export function InternalFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(184,174,221,.06)',
        marginTop: 64,
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          color: 'rgba(160,156,192,.35)',
          letterSpacing: '.01em',
        }}
      >
        © {year} Reflexy. Todos os direitos reservados.
      </span>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <Link
          href="/privacy"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            color: 'rgba(160,156,192,.35)',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#A09CC0')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(160,156,192,.50)')}
        >
          Política de Privacidade
        </Link>
        <span style={{ color: 'rgba(160,156,192,.15)', fontSize: 12 }}>·</span>
        <Link
          href="/terms"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            color: 'rgba(160,156,192,.35)',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#A09CC0')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(160,156,192,.50)')}
        >
          Termos de Uso
        </Link>
      </div>
    </footer>
  )
}
