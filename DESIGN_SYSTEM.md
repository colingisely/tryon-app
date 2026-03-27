# Reflexy — Design System
**Fonte única de verdade:** `app/landing.css`
**Última atualização:** Março 2026

---

## 1. Paleta de Cores

### Tokens base (`:root`)
| Token | Valor | Uso |
|---|---|---|
| `--abyss` | `#06050F` | Fundo de página — o mais escuro |
| `--onyx` | `#0F0D1E` | Fundo sticky bar, surface secundária |
| `--plum` | `#2B1250` | Brand escuro, hover de borda |
| `--mauve` | `#7050A0` | Brand médio, hover de botão primário |
| `--lavender` | `#B8AEDD` | Brand claro, focus ring |
| `--mist` | `#EDEBF5` | Texto primário |
| `--dusk` | `#B8B4D4` | Texto secundário / descrições |
| `--verdigris` | `#0CC89E` | Status ao vivo, saudável, positivo |
| `--rule` | `rgba(184,174,221,.14)` | Bordas sutis, divisores |
| `--rule-v` | `rgba(184,174,221,.26)` | Bordas visíveis |
| `--plum-glow` | `rgba(43,18,80,.55)` | Glow ambient escuro |

### Tokens estendidos (sistema novo)
| Token | Valor | Uso |
|---|---|---|
| `--primary` | `#7C3AED` | Roxo principal — CTAs, destaques |
| `--primary-mid` | `#9333EA` | Roxo médio — gradientes |
| `--primary-dim` | `rgba(124,58,237,.16)` | Fundo de pills e badges |
| `--primary-glow` | `rgba(124,58,237,.38)` | Glow de foco e hover |
| `--accent` | `#C084FC` | Roxo claro — gradientes, ícones activos |
| `--accent-soft` | `#DDD6FE` | Accent muito suave |
| `--peak` | `#F0EAFF` | Ponto mais claro dos gradientes |
| `--text` | `#F5F0FF` | Texto no novo sistema |
| `--muted` | `rgba(245,240,255,.55)` | Texto secundário no novo sistema |
| `--dim` | `rgba(245,240,255,.25)` | Texto terciário / labels muito suaves |
| `--glass-bg` | `rgba(255,255,255,.03)` | Fundo glassmorphism base |
| `--glass-bg-2` | `rgba(255,255,255,.07)` | Fundo glassmorphism ligeiramente visível |
| `--glass-border` | `rgba(255,255,255,.07)` | Borda glassmorphism padrão |
| `--glass-border-hi` | `rgba(124,58,237,.45)` | Borda glassmorphism em destaque |

### Raios de borda
| Token | Valor |
|---|---|
| `--r` | `14px` |
| `--r-lg` | `22px` |
| `--r-xl` | `30px` |

### Gradientes de texto recorrentes
```css
/* Gradiente principal (diagonal) */
background: linear-gradient(135deg, var(--peak) 0%, var(--accent) 45%, var(--primary) 100%);
-webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;

/* Gradiente horizontal */
background: linear-gradient(90deg, var(--peak) 0%, var(--accent) 55%, var(--primary-mid) 100%);
```

---

## 2. Tipografia

### Famílias de fonte
| Token | Família | Uso principal |
|---|---|---|
| `--f-d` | `'Bricolage Grotesque', sans-serif` | Headlines, títulos de seção |
| `--f-s` | `'Instrument Serif', serif` | Subtítulo italic hero, taglines emotivas |
| `--f-b` | `'DM Sans', sans-serif` | Corpo, labels, botões, nav links |
| `--f-m` | `'IBM Plex Mono', monospace` | Eyebrows, dados, preços, mono labels |

### Import (Google Fonts)
```html
<link href="https://fonts.googleapis.com/css2?
  family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,400;12..96,600;12..96,700&
  family=Instrument+Serif:ital@0;1&
  family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&
  family=IBM+Plex+Mono:wght@400;500;600&
  display=swap" rel="stylesheet">
```

### Classes de tipografia prontas
```css
/* Eyebrow — label de seção com linha decorativa */
.eyebrow {
  font-family: var(--f-m); font-size: 9px;
  letter-spacing: .30em; text-transform: uppercase;
  color: var(--verdigris); display: flex; align-items: center; gap: 14px;
}
.eyebrow::before { content: ''; width: 20px; height: 1px; background: var(--verdigris); opacity: .6; }

/* Display — título de seção */
.display {
  font-family: var(--f-d); font-weight: 700;
  font-size: clamp(24px, 3vw, 38px);
  letter-spacing: -.02em; line-height: 1.1;
}

/* Section tag — pill colorida no topo de seção */
.section-tag {
  font-family: var(--f-m); font-size: 11px; font-weight: 600;
  letter-spacing: .09em; text-transform: uppercase; color: var(--accent);
  border-radius: 100px; border: 1px solid rgba(124,58,237,.3);
  background: var(--primary-dim); padding: 4px 14px;
}

/* Section title */
.section-title {
  font-family: var(--f-d); font-weight: 300;
  font-size: clamp(22px, 2.4vw, 34px);
  letter-spacing: -.03em; line-height: 1.12;
}

/* Section sub */
.section-sub { font-size: 15px; color: var(--muted); line-height: 1.65; max-width: 500px; }

/* Editorial — italic serif */
.editorial {
  font-family: var(--f-s); font-style: italic;
  font-size: clamp(14px, 1.6vw, 18px); color: var(--dusk); line-height: 1.5;
}

/* Body text */
.body-text { font-family: var(--f-b); font-weight: 300; font-size: 15px; color: var(--dusk); line-height: 1.85; }
```

---

## 3. Layout

### Containers
```css
.wrap        { max-width: 1080px; margin: 0 auto; padding: 0 64px; }  /* hero / seções antigas */
.container   { max-width: 1280px; margin: 0 auto; padding: 0 32px; }  /* seções novas */
.container-sm{ max-width: 960px;  margin: 0 auto; padding: 0 32px; }  /* conteúdo estreito */
```

### Seção padrão
```css
.sec { padding: 80px 0; border-bottom: 1px solid var(--rule); }
```

### Breakpoints
```css
@media (max-width: 900px)  { /* hero gem reduzida */ }
@media (max-width: 768px)  { .wrap { padding: 0 24px } .sec { padding: 52px 0 } }
@media (max-width: 640px)  { /* hero mobile, cards em coluna, banners empilhados */ }
@media (max-width: 480px)  { /* navbar compacta */ }
```

---

## 4. Botões

Todos os botões usam `border-radius: 100px` (pill) sem exceção.

### `.btn-hero-primary` — CTA principal do hero
Glassmorphism + borda conic animada + shimmer. **Só usar no hero.**
```css
background: rgba(124,58,237,.18); backdrop-filter: blur(24px);
border: 1px solid rgba(192,132,252,.50); border-radius: 100px;
padding: 16px 36px; height: 54px; font-size: 15px; font-family: var(--f-b);
box-shadow: 0 0 32px rgba(124,58,237,.35), 0 0 80px rgba(124,58,237,.12);
animation: hero-btn-breathe 4s ease-in-out infinite;
/* ::before → borda conic-gradient girando (--angle) */
/* ::after  → shimmer diagonal sweep */
```

### `.btn-hero-ghost` — CTA secundário do hero
```css
background: rgba(255,255,255,.04); backdrop-filter: blur(12px);
border: 1px solid rgba(255,255,255,.14); border-radius: 100px;
padding: 16px 32px; height: 54px; color: rgba(237,235,245,.72);
```

### `.btn-p` — Botão primário genérico
```css
background: var(--primary); color: var(--mist);
border: 1px solid rgba(112,80,160,.35); border-radius: 100px;
font-family: var(--f-b); font-size: 13px; padding: 14px 28px;
filter: drop-shadow(0 0 24px rgba(43,18,80,.35));
/* hover: background → --mauve */
```

### `.btn-g` — Botão ghost genérico
```css
background: transparent; color: var(--lavender);
border: 1px solid var(--rule-v); border-radius: 100px;
font-family: var(--f-d); font-size: 11px; letter-spacing: .14em; text-transform: uppercase;
padding: 14px 28px;
```

### `.btn-plan-v2` — Botão nos cards de pricing
```css
width: 100%; padding: 14px; border-radius: 100px;
font-family: var(--f-b); font-size: 14px; font-weight: 400;
/* variante ghost: .btn-plan-v2-ghost → background glass, borda glass */
/* variante primary: .btn-plan-v2-primary → gradient primary→#4C1D95, glow */
```

### `.btn-free` — CTA do plano Preview (teal)
```css
background: rgba(12,200,158,.06); border: 1px solid rgba(12,200,158,.4);
color: var(--verdigris); border-radius: 100px;
font-family: var(--f-b); font-size: 14px; padding: 12px 28px;
/* hover: fundo mais denso, glow verde */
```

### `.nav-login` / `.nav-cta` — Botões da navbar
```css
/* .nav-login: ghost, border lavender 22%, padding 8px 18px */
/* .nav-cta: background --primary, border accent, glow, padding 9px 22px */
/* ambos: border-radius 100px, font-family var(--f-b), font-size 13px */
```

### Focus acessível
```css
.btn-p:focus-visible, .btn-g:focus-visible { outline: 2px solid var(--lavender); outline-offset: 3px; }
button:focus-visible { outline: 2px solid #B8AEDD; outline-offset: 3px; }
```

---

## 5. Componentes

### Navbar (`#navbar`)
- Posição: `fixed` top, `z-index: 8888`, altura `60px`
- Transparente por padrão → ao scroll: `background rgba(6,5,15,.85)` + `backdrop-filter: blur(20px)` + borda `--rule`
- Logo: gem SVG 28px + wordmark "REFLEXY" em `IBM Plex Mono` `letter-spacing: .20em`
- Links: centrados absolutamente (`position: absolute; left: 50%; transform: translateX(-50%)`)
- Ações: `margin-left: auto`, gap `10px`
- Mobile ≤768px: links ocultados, padding reduzido

### Glassmorphism (classe `.glass`)
```css
background: var(--glass-bg);
backdrop-filter: blur(24px) saturate(160%);
border: 1px solid var(--glass-border);
```

### Cards de seção (padrão)
```css
border-radius: var(--r-xl); /* 30px */
background: linear-gradient(145deg, rgba(124,58,237,.05) 0%, rgba(14,11,22,.6) 40%, rgba(192,132,252,.03) 100%);
border: 1px solid var(--glass-border);
backdrop-filter: blur(12px);
/* hover: translateY(-4px), border-color rgba(124,58,237,.3) */
/* hover::after: linha topo luminosa (gradient horizontal) */
```

### Stat strip glassmorphism (`.stat-row-glass`)
```css
padding: 20px 32px;
border: 1px solid var(--rule);
border-radius: 14px;
backdrop-filter: blur(24px);
background: rgba(15,13,30,.38);
```

### Plano Preview (`.free-entry-v2`)
Banner teal separado dos planos pagos:
```css
background: linear-gradient(145deg, rgba(12,200,158,.04) 0%, rgba(14,11,22,.55) 50%, rgba(12,200,158,.02) 100%);
border: 1px solid rgba(12,200,158,.18);
border-radius: var(--r-xl);
backdrop-filter: blur(12px);
/* ::before: linha topo verde gradiente */
/* hover: border-color rgba(12,200,158,.35) */
```

### Separador de seção (`.section-sep`)
```css
height: 1px;
background: linear-gradient(90deg, transparent 5%, rgba(124,58,237,.25) 30%, rgba(192,132,252,.15) 50%, ...);
/* ::after: ponto de luz que percorre da esquerda para a direita (animation: line-travel 3s) */
```

### Sticky CTA bar (`#sticky-cta`)
```css
position: fixed; bottom: 0; z-index: 9998;
background: var(--onyx); border-top: 1px solid var(--rule);
padding: 14px 64px;
opacity: 0; transform: translateY(8px); /* → .visible: opacity 1, transform none */
```

### Tooltip PAYG (`.payg-tooltip`)
```css
background: rgba(22,19,48,.95); border: 1px solid var(--rule-v);
padding: 20px 24px; border-radius: var(--r);
opacity: 0; /* → trigger:hover: opacity 1 */
/* ::after: seta inferior border-trick */
```

---

## 6. Efeitos Visuais

### Grain overlay (ruído de fundo)
Aplicado em `body::after` — svg fractalNoise com `opacity: .022`, `position: fixed`, cobre toda a tela. Não interferente.

### Orbs de fundo (`.orb`)
```css
position: absolute; border-radius: 50%; filter: blur(90px);
animation: orb-float 10s ease-in-out infinite;
/* 3 orbs: roxo grande topo-direita, lilás médio baixo-esquerda, roxo pequeno centro */
```

### Grid drift (`.hero__grid`)
```css
background-image: linear-gradient(rgba(124,58,237,.04) 1px, transparent 1px), ...;
background-size: 60px 60px;
mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%);
animation: grid-drift 20s ease-in-out infinite; /* translateY 0 → -20px */
```

### Partículas (`.particles` / `.particle`)
```css
position: absolute; inset: 0; overflow: hidden; pointer-events: none;
/* cada .particle: border-radius 50%, animation float-particle linear infinite */
/* sobem verticalmente com leve deriva lateral, fade in/out */
```

### Glow dot (`.glow-dot`) — ponto verde pulsante
```css
width: 7px; height: 7px; border-radius: 50%;
background: var(--verdigris);
box-shadow: 0 0 8px var(--verdigris), 0 0 16px rgba(12,200,158,.3);
animation: blink 2.4s ease-in-out infinite;
/* @keyframes blink: opacity 1 → .25 → 1 */
```
Usar ao lado de textos de status ativo ("ao vivo", "todos os sistemas operacionais").

### Scroll reveal
```css
.reveal       { opacity: 0; transform: translateY(36px); transition: opacity .7s, transform .7s cubic-bezier(.16,1,.3,1) }
.reveal-scale { opacity: 0; transform: scale(.92); }
.reveal-left  { opacity: 0; transform: translateX(-48px); }
.reveal-right { opacity: 0; transform: translateX(48px); }
/* ativados com .in-view ou .visible */
```

### Stagger (`.stagger-up`, `.stagger-scale`, `.stagger-left`)
Filhos entram em sequência com delays de 0.07s cada (via `nth-child` + `transition-delay`).
Também disponível via atributo `data-delay="1"` até `"6"`.

### Borda spin (`.spin-border` / `.g-border`)
```css
/* .spin-border: conic-gradient girando em ::before (4s linear) */
/* .g-border: gradient diagonal aparece no hover (opacity 0→1) */
```

### Counter animation
```html
<span data-target="38" data-suffix="%">38%</span>
```
JS detecta via `IntersectionObserver` e conta de 0 até `data-target` quando o elemento entra na tela.

---

## 7. Animações (`@keyframes`)

| Nome | Efeito | Usado em |
|---|---|---|
| `blink` | opacity 1→.25→1 | `.glow-dot` |
| `gemS` | ciclo de glow plum→lavender→verdigris | gem do hero |
| `gem-float` | translateY + rotate suave | container da gem |
| `glowB` | scale + opacity do orb atrás da gem | ambient glow |
| `pavP` | opacity do reflexo da gem | pavilhão gem |
| `orb-float` | translate(0,0)→(30px,-40px) | `.orb` |
| `grid-drift` | translateY 0→-20px | `.hero__grid` |
| `float-particle` | sobe 110vh + fade | `.particle` |
| `hero-btn-breathe` | box-shadow pulsa a cada 4s | `.btn-hero-primary` |
| `spin-angle` | `--angle` 0→360deg | botão conic border, `.spin-border` |
| `btn-shimmer` | shimmer diagonal no botão | `.btn-hero-primary::after` |
| `badge-breathe` | box-shadow pulsa a cada 3s | `.hero__badge` |
| `bar-grow` | scaleY 0→1 | barras dos mini-dashboards |
| `line-travel` | ponto de luz percorre `.section-sep` | `.section-sep::after` |
| `ring-pulse` | escala+opacidade dos anéis do CTA | `.cta-ring` |
| `slide-t` | translateX 0→-50% | carrossel de testimonials |
| `tryon-shimmer` | opacity 0→1→0 | frames do tryon strip |
| `vto-progress` | width 0→80% | barra de progresso Cinema Card |
| `vto-scanline` | top -4px→100% | linha de scan IA |
| `vto-cursor-click` | scale 1→.82→1 | cursor animado |
| `vto-img-reveal` | opacity+scale reveal | imagem de resultado |

### Preferência de movimento reduzido
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```

---

## 8. Símbolo da Marca — Gem SVG

Diamante octaédrico (100×100 viewBox, 8 polígonos + linhas):
- **Facetas superiores:** gradiente lavanda → mauve
- **Miolo (tabletop):** gradiente quase branco → lilás, com `feGaussianBlur` glow
- **Pavilhão inferior:** gradiente verde-teal sutil (`--verdigris` baixa opacidade)
- **Linha equatorial:** gradiente lavanda→teal (`.gem-axis` com dots luminosos nas extremidades)
- **Reflexo:** cópia `scaleY(-1)` com mask-image fade, `opacity: .65`
- **Efeito caustic:** rect branco animado que atravessa a gem (9s loop)
- **Animação principal:** `gemS` 90s linear — ciclo de glow muito lento

```css
filter: drop-shadow(0 0 28px rgba(112,80,160,.75)) drop-shadow(0 0 70px rgba(43,18,80,.55))
animation: gemS 90s linear infinite, gem-float 9s ease-in-out infinite
```

---

## 9. Regras Inegociáveis

- ❌ Nunca usar `border-radius` abaixo de `12px` em cards
- ❌ Botões sempre `border-radius: 100px` (pill) — nunca arredondado parcial
- ❌ Nunca usar branco puro `#FFF` — usar `--mist` ou `--peak`
- ❌ Nunca usar preto puro `#000` — usar `--abyss`
- ❌ Nunca declarar `@property --angle` mais de uma vez
- ❌ Nunca sobrescrever `.glow-dot` com cor diferente de `--verdigris`
- ❌ Nunca usar `font-family: inherit` em botões — sempre declarar explicitamente

