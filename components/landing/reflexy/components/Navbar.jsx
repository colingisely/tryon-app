'use client';

import { useEffect } from 'react';

export default function Navbar() {
  useEffect(() => {
    /* ── NAVBAR ── */
    const navbar     = document.getElementById('navbar');
    const hamburger  = document.getElementById('nav-hamburger');
    const mobileMenu = document.getElementById('nav-mobile');
    const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

    function onScroll() {
      if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 24);

      // Active link highlight based on scroll position
      const sections = ['problem', 'reflexy-section', 'how', 'pricing', 'faq'];
      let current = '';
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) current = id;
      });
      document.querySelectorAll('.nav-links a').forEach(a => {
        const href = a.getAttribute('href').replace('#', '');
        a.classList.toggle('active', href === current);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function hamburgerClick() {
      if (!mobileMenu || !hamburger) return;
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    }
    if (hamburger) hamburger.addEventListener('click', hamburgerClick);

    mobileLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (!mobileMenu || !hamburger) return;
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (hamburger) hamburger.removeEventListener('click', hamburgerClick);
    };
  }, []);

  return (
    <>
      <nav id="navbar" aria-label="Navegação principal">
        <div className="nav-inner">

          {/* Brand */}
          <a href="#hero" className="nav-brand" aria-label="REFLEXY — início">
            <svg width="20" height="20" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{filter:'drop-shadow(0 0 6px rgba(112,80,160,.5))'}}>
              <defs>
                <linearGradient id="nF" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C4B8E4" stopOpacity=".9"/><stop offset="100%" stopColor="#7050A0" stopOpacity=".7"/></linearGradient>
                <linearGradient id="nT" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#E8E2F8" stopOpacity=".95"/><stop offset="100%" stopColor="#B090D8" stopOpacity=".8"/></linearGradient>
                <linearGradient id="nP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0CC89E" stopOpacity=".4"/><stop offset="100%" stopColor="#0CC89E" stopOpacity=".05"/></linearGradient>
              </defs>
              <polygon points="50,22 28,50 3,50 50,3" fill="url(#nF)"/>
              <polygon points="50,22 72,50 97,50 50,3" fill="url(#nF)"/>
              <polygon points="50,78 28,50 3,50 50,97" fill="url(#nP)"/>
              <polygon points="50,78 72,50 97,50 50,97" fill="url(#nP)"/>
              <polygon points="50,22 72,50 50,78 28,50" fill="url(#nT)"/>
              <circle cx="50" cy="50" r="2.5" fill="#EDEBF5" opacity=".9"/>
              <polygon points="50,3 97,50 50,97 3,50" fill="none" stroke="#B8AEDD" strokeWidth=".5" opacity=".35"/>
            </svg>
            <span className="nav-wm">REFLEXY</span>
          </a>

          {/* Desktop links */}
          <ul className="nav-links" role="list">
            <li><a href="#problem">O Problema</a></li>
            <li><a href="#reflexy-section">A Solução</a></li>
            <li><a href="#how">Como Funciona</a></li>
            <li><a href="#pricing">Planos</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>

          {/* Desktop CTA */}
          <a href="#pricing" className="nav-cta">Começar grátis <span style={{opacity:.6}}>→</span></a>

          {/* Mobile hamburger */}
          <button className="nav-hamburger" id="nav-hamburger" aria-label="Menu" aria-expanded="false" aria-controls="nav-mobile">
            <span></span><span></span><span></span>
          </button>

        </div>
      </nav>

      {/* Mobile menu */}
      <div className="nav-mobile" id="nav-mobile" role="navigation" aria-label="Menu mobile">
        <a href="#problem" className="nav-mobile-link">O Problema</a>
        <a href="#reflexy-section" className="nav-mobile-link">A Solução</a>
        <a href="#how" className="nav-mobile-link">Como Funciona</a>
        <a href="#pricing" className="nav-mobile-link">Planos</a>
        <a href="#faq" className="nav-mobile-link">FAQ</a>
        <a href="#pricing" className="nav-cta-mobile">Começar gratuitamente →</a>
      </div>
    </>
  );
}
