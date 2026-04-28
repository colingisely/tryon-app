'use client'

/**
 * AppNav — barra de navegação global das páginas internas autenticadas
 * Brand System V7 · Deep Amethyst
 *
 * Uso:
 *   <AppNav current="dashboard" storeName={merchant.store_name} onSignOut={handleSignOut} />
 *
 * Props:
 *   - current:    qual página está ativa (destaque visual)
 *   - storeName:  nome da loja (mostrado à direita; some no mobile)
 *   - onSignOut:  callback do botão Sair
 *   - extraRight: slot opcional antes do storeName/Sair (ex: pill de créditos do studio)
 */

import { useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Layers,
  BarChart2,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import ReflexGem from '@/components/ui/ReflexGem'

type NavKey = 'dashboard' | 'studio' | 'analytics' | 'settings'

const NAV_ITEMS: { key: NavKey; label: string; href: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard',   href: '/dashboard', icon: <LayoutDashboard size={14} /> },
  { key: 'studio',    label: 'Estúdio Pro', href: '/studio',    icon: <Layers size={14} /> },
  { key: 'analytics', label: 'Analytics',   href: '/analytics', icon: <BarChart2 size={14} /> },
  { key: 'settings',  label: 'Configurações', href: '/settings', icon: <SettingsIcon size={14} /> },
]

export default function AppNav({
  current,
  storeName,
  onSignOut,
  extraRight,
}: {
  current:    NavKey
  storeName?: string
  onSignOut:  () => void
  extraRight?: React.ReactNode
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <nav
        className="app-nav sticky top-0 z-50 flex items-center justify-between"
        style={{
          height:               64,
          padding:             '0 40px',
          borderBottom:        '1px solid rgba(184,174,221,.09)',
          background:          'rgba(6,5,15,.92)',
          backdropFilter:      'blur(20px)',
          WebkitBackdropFilter:'blur(20px)',
        }}
      >
        {/* Left — brand + nav items */}
        <div className="flex items-center" style={{ gap: 24 }}>
          <Link href="/dashboard" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <ReflexGem size={18} uid="appnav" noReflection />
            <span className="app-nav-brand" style={{
              fontFamily:    "'Bricolage Grotesque', sans-serif",
              fontWeight:     700,
              fontSize:       14,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color:         '#EDEBF5',
            }}>
              Reflexy
            </span>
          </Link>

          <div className="app-nav-links flex items-center" style={{ gap: 4 }}>
            {NAV_ITEMS.map(item => {
              const active = item.key === current
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex items-center transition-all"
                  style={{
                    gap:           7,
                    padding:      '7px 14px',
                    borderRadius:  8,
                    fontFamily:   "'DM Sans', sans-serif",
                    fontSize:      13,
                    fontWeight:    active ? 500 : 400,
                    color:         active ? '#EDEBF5' : '#A09CC0',
                    background:    active ? 'rgba(43,18,80,.55)' : 'transparent',
                    textDecoration:'none',
                    whiteSpace:   'nowrap',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#EDEBF5' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#A09CC0' }}
                >
                  <span style={{ color: active ? '#0CC89E' : 'inherit', display: 'inline-flex' }}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right — extras + store name + Sair + hamburger */}
        <div className="app-nav-right flex items-center" style={{ gap: 10 }}>
          {extraRight}
          {storeName && (
            <span className="app-nav-storename" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#A09CC0' }}>
              {storeName}
            </span>
          )}
          <button
            type="button"
            onClick={onSignOut}
            className="app-nav-signout flex items-center transition-all"
            style={{
              background:  'rgba(184,174,221,.04)',
              border:      '1px solid rgba(184,174,221,.14)',
              borderRadius: 8,
              color:        '#A09CC0',
              fontFamily:  "'DM Sans', sans-serif",
              fontSize:     13,
              fontWeight:   500,
              padding:     '7px 14px',
              cursor:       'pointer',
              gap:          6,
              flexShrink:   0,
              whiteSpace:  'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(184,174,221,.30)'; e.currentTarget.style.color = '#EDEBF5' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,174,221,.14)'; e.currentTarget.style.color = '#A09CC0' }}
          >
            <LogOut size={16} /> Sair
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
            className="app-nav-hamburger"
            style={{
              display:     'none',
              background:  'rgba(184,174,221,.04)',
              border:      '1px solid rgba(184,174,221,.14)',
              borderRadius: 8,
              color:        '#A09CC0',
              padding:     '7px 9px',
              cursor:       'pointer',
            }}
          >
            <Menu size={16} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: 'rgba(6,5,15,.80)', backdropFilter: 'blur(8px)',
            animation: 'fadeIn .2s ease both',
          }}
        >
          <nav
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: 0, right: 0, bottom: 0,
              width: '82%', maxWidth: 300,
              background: '#0F0D1E',
              borderLeft: '1px solid rgba(184,174,221,.14)',
              display: 'flex', flexDirection: 'column',
              animation: 'slideInRight .25s ease both',
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{ padding: '18px 20px', borderBottom: '1px solid rgba(184,174,221,.10)' }}
            >
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#EDEBF5', letterSpacing: '-.01em' }}>
                Menu
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Fechar menu"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A09CC0', padding: 0 }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {NAV_ITEMS.map(item => {
                const active = item.key === current
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-2.5 transition-all w-full"
                    style={{
                      borderLeft:  `2px solid ${active ? '#0CC89E' : 'transparent'}`,
                      borderBottom:'1px solid rgba(184,174,221,.06)',
                      padding:    '14px 18px',
                      background:  active ? 'rgba(43,18,80,.55)' : 'transparent',
                      color:       active ? '#EDEBF5' : '#A09CC0',
                      textDecoration: 'none',
                    }}
                  >
                    <span style={{ color: active ? '#0CC89E' : '#A09CC0' }}>{item.icon}</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: active ? 500 : 400 }}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      )}

      <style>{`
        @keyframes slideInRight { from{opacity:0;transform:translateX(12px);} to{opacity:1;transform:translateX(0);} }
        @media (max-width: 900px) {
          .app-nav { padding:0 16px !important; }
          .app-nav-links { display:none !important; }
          .app-nav-storename { display:none !important; }
          .app-nav-signout { display:none !important; }
          .app-nav-hamburger { display:flex !important; }
        }
      `}</style>
    </>
  )
}
