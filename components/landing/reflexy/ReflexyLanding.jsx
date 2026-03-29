/**
 * reflexy/ReflexyLanding.jsx
 *
 * Componente raiz. Injeta o CSS global e as fontes uma única vez,
 * e compõe todos os componentes da landing page em ordem.
 *
 * Notas de implementação:
 * - 'use client' é necessário para Next.js App Router.
 *   Remova esta linha para Pages Router ou React puro.
 * - O CSS em constants/styles.js é injetado globalmente (afeta html, body, :root).
 *   Em produção, mova o conteúdo para um arquivo .css global e remova a injeção via useEffect.
 * - Os links de e-mail usam obfuscação Cloudflare (/cdn-cgi/l/email-protection).
 *   Funcionam corretamente apenas em domínios roteados pelo Cloudflare.
 * - Para Next.js, substitua a injeção de fontes por next/font.
 */

'use client';

import { useEffect }   from 'react';
import StickyCta       from './components/StickyCta';
import Navbar          from './components/Navbar';
import Hero            from './components/Hero';
import Problem         from './components/Problem';
import Facets          from './components/Facets';
import { HowItWorks, Comparison, Results, Pricing, Faq, FinalCta, Footer } from './components/sections';
import { LanguageProvider } from './i18n/LanguageContext';

export default function ReflexyLanding() {

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ── MODULE 1: Scroll Reveal ──────────────────────────────────────────────
    const revealEls = document.querySelectorAll(
      '.reveal, .reveal-scale, .reveal-left, .reveal-right, .stagger-up, .stagger-scale, .stagger-left'
    );
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealEls.forEach((el) => revealObserver.observe(el));
    // Immediate reveal for elements already in viewport (hero)
    setTimeout(() => {
      document.querySelectorAll('.reveal, .stagger-up, .stagger-scale').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('visible');
          el.classList.add('in-view');
        }
      });
    }, 80);

    // ── MODULE 2: Particles ──────────────────────────────────────────────────
    function createParticles(containerId, count) {
      const container = document.getElementById(containerId);
      if (!container) return;
      for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const sz = (1.2 + Math.random() * 3.2).toFixed(1);
        const color = Math.random() > 0.5
          ? 'rgba(192,132,252,.52)'
          : 'rgba(124,58,237,.58)';
        const dur   = (7 + Math.random() * 13).toFixed(1);
        const delay = (Math.random() * 15).toFixed(1);
        p.style.cssText = `
          left:${(Math.random() * 90).toFixed(1)}%;
          top:${(20 + Math.random() * 80).toFixed(1)}%;
          width:${sz}px;height:${sz}px;
          background:${color};
          animation-duration:${dur}s;
          animation-delay:${delay}s
        `;
        container.appendChild(p);
      }
    }
    createParticles('heroParticles', 32);
    createParticles('ctaParticles',  18);

    // ── Dashboard bar charts ──────────────────────────────────────────────────
    function createBars(containerId, count) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const heights = [30,45,60,40,70,55,80,65,50,75,85,60,45,70,90,65,50,75,55,80,70,60,85,90,75,60,50,80,70,65];
      for (let i = 0; i < count; i++) {
        const bar = document.createElement('div');
        bar.className = containerId === 'miniDashBars' ? 'mini-dash__bar-item' : 'dash__bar';
        bar.style.height = `${heights[i % heights.length]}%`;
        bar.style.animationDelay = `${i * 0.05}s`;
        container.appendChild(bar);
      }
    }
    createBars('dashBars', 30);
    createBars('miniDashBars', 20);

    // ── Sparklines ───────────────────────────────────────────────────────────
    function createSparkline(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const heights = [20,35,25,45,40,60,50,70,65,80,75,90];
      heights.forEach((h, i) => {
        const bar = document.createElement('div');
        bar.className = 'metric__spark-bar';
        bar.style.height = `${h}%`;
        bar.style.animationDelay = `${i * 0.08}s`;
        container.appendChild(bar);
      });
    }
    createSparkline('spark1');
    createSparkline('spark2');
    createSparkline('spark3');
    createSparkline('spark4');

    // ── MODULE 3: Mouse Glow on cards ────────────────────────────────────────
    const glowEls = document.querySelectorAll('.problem-cell, .proof-cell, .plan, .problem-card, .facet-card, .pricing-card-v2');
    const glowHandlers = [];
    glowEls.forEach((el) => {
      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const glowEl = el.querySelector('.problem-card__glow, .facet-card__glow, .pricing-card-v2__glow');
        if (glowEl) {
          glowEl.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(124,58,237,.12), transparent 60%)`;
        } else {
          el.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(43,18,80,.14), transparent 58%)`;
        }
      };
      const onLeave = () => {
        const glowEl = el.querySelector('.problem-card__glow, .facet-card__glow, .pricing-card-v2__glow');
        if (!glowEl) el.style.background = '';
      };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      glowHandlers.push({ el, onMove, onLeave });
    });

    // ── MODULE 4: 3D Tilt on cards ───────────────────────────────────────────
    const tiltEls = document.querySelectorAll('.problem-cell, .proof-cell, .plan, .problem-card, .facet-card');
    const tiltHandlers = [];
    tiltEls.forEach((el) => {
      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
        const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
        el.style.transform = `perspective(800px) rotateX(${(-dy * 4.5).toFixed(2)}deg) rotateY(${(dx * 4.5).toFixed(2)}deg)`;
      };
      const onLeave = () => { el.style.transform = ''; };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      tiltHandlers.push({ el, onMove, onLeave });
    });

    // ── MODULE 5: Magnetic buttons ───────────────────────────────────────────
    const magnetEls = document.querySelectorAll('.btn-hero-primary, .plan-cta');
    const magnetHandlers = [];
    magnetEls.forEach((el) => {
      const onMove = (e) => {
        const r  = el.getBoundingClientRect();
        const cx = r.left + r.width  / 2;
        const cy = r.top  + r.height / 2;
        const tx = ((e.clientX - cx) * 0.22).toFixed(2);
        const ty = ((e.clientY - cy) * 0.22).toFixed(2);
        el.style.transform = `translate(${tx}px, ${ty}px)`;
      };
      const onLeave = () => { el.style.transform = ''; };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      magnetHandlers.push({ el, onMove, onLeave });
    });

    // ── MODULE 6: Counter animation on stats ─────────────────────────────────
    const counterEls = document.querySelectorAll('[data-target]');
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseFloat(el.dataset.target);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const dur    = 1500;
        const start  = performance.now();
        const tick   = (now) => {
          const t     = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = prefix + Math.round(target * eased) + suffix;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    counterEls.forEach((el) => counterObserver.observe(el));

    // ── CLEANUP ───────────────────────────────────────────────────────────────
    return () => {
      revealObserver.disconnect();
      counterObserver.disconnect();
      glowHandlers.forEach(({ el, onMove, onLeave }) => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      });
      tiltHandlers.forEach(({ el, onMove, onLeave }) => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      });
      magnetHandlers.forEach(({ el, onMove, onLeave }) => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      });
    };
  }, []);

  return (
    <LanguageProvider>
      <StickyCta />
      <Navbar />
      <Hero />
      <Problem />
      <div className="section-sep" />
      <Facets />
      <div className="section-sep" />
      <HowItWorks />
      <Comparison />
      <Results />
      <div className="section-sep" />
      <Pricing />
      <div className="section-sep" />
      <Faq />
      <FinalCta />
      <Footer />
    </LanguageProvider>
  );
}
