'use client';

import { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function Navbar() {
  const { t } = useLanguage();

  useEffect(() => {
    const nav = document.getElementById('navbar');

    function onScroll() {
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <nav id="navbar" aria-label={t('nav.ariaLabel')}>
      <div className="nav-inner">

        {/* Logo */}
        <a href="#hero" className="nav-brand">
          <svg width="22" height="22" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{filter:'drop-shadow(0 0 6px rgba(112,80,160,.6))'}}>
            <defs>
              <linearGradient id="nF1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C4B8E4" stopOpacity=".90"/><stop offset="100%" stopColor="#7050A0" stopOpacity=".70"/></linearGradient>
              <linearGradient id="nF2" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#B8AEDD" stopOpacity=".70"/><stop offset="100%" stopColor="#4A2880" stopOpacity=".55"/></linearGradient>
              <linearGradient id="nF3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9070C0" stopOpacity=".55"/><stop offset="100%" stopColor="#2B1250" stopOpacity=".80"/></linearGradient>
              <linearGradient id="nF4" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D0C4EC" stopOpacity=".80"/><stop offset="100%" stopColor="#5A38A0" stopOpacity=".60"/></linearGradient>
              <linearGradient id="nTbl" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#E8E2F8" stopOpacity=".95"/><stop offset="100%" stopColor="#B090D8" stopOpacity=".80"/></linearGradient>
              <linearGradient id="nP1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0CC89E" stopOpacity=".38"/><stop offset="100%" stopColor="#0CC89E" stopOpacity=".05"/></linearGradient>
              <linearGradient id="nStr" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C4B8E4" stopOpacity=".55"/><stop offset="50%" stopColor="#B8AEDD" stopOpacity=".35"/><stop offset="100%" stopColor="#7050A0" stopOpacity=".25"/></linearGradient>
              <filter id="nGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <polygon points="50,78 28,50 3,50 50,97" fill="url(#nP1)" opacity=".80"/>
            <polygon points="50,78 72,50 97,50 50,97" fill="url(#nP1)" opacity=".80"/>
            <polygon points="50,22 28,50 3,50 50,3" fill="url(#nF1)"/>
            <polygon points="50,22 72,50 97,50 50,3" fill="url(#nF4)"/>
            <polygon points="3,50 50,22 28,50" fill="url(#nF2)"/>
            <polygon points="97,50 50,22 72,50" fill="url(#nF3)"/>
            <polygon points="50,22 72,50 50,78 28,50" fill="url(#nTbl)" filter="url(#nGlow)"/>
            <circle cx="50" cy="50" r="2.5" fill="#EDE8F6" opacity=".95" filter="url(#nGlow)"/>
            <polygon points="50,3 97,50 50,97 3,50" fill="none" stroke="url(#nStr)" strokeWidth=".45"/>
          </svg>
          <span className="nav-brand__text">REFLEXY</span>
        </a>

        {/* Desktop links — absolutely centered */}
        <ul className="nav-links">
          <li><a href="#problem">{t('nav.problem')}</a></li>
          <li><a href="#reflexy-section">{t('nav.solution')}</a></li>
          <li><a href="#how">{t('nav.how')}</a></li>
          <li><a href="#pricing">{t('nav.pricing')}</a></li>
          <li><a href="#faq">{t('nav.faq')}</a></li>
        </ul>

        {/* Action buttons */}
        <div className="nav-actions">
          <a href="/login" className="nav-login">{t('nav.login')}</a>
        </div>
      </div>
    </nav>
  );
}
