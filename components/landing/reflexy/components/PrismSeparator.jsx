'use client';

import { useEffect } from 'react';

export default function PrismSeparator() {
  useEffect(() => {
    /* ── PRISM SEPARATOR — IntersectionObserver ── */
    const IO = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('on');
        IO.unobserve(e.target);
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.r, .rl').forEach(function(el) { IO.observe(el); });

    return () => IO.disconnect();
  }, []);

  return (
    <div className="prism-sep">

      <svg width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="r" style={{'--d':0, opacity:.55}}>
        <defs>
          <linearGradient id="psF" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C4B8E4" stopOpacity=".7"/><stop offset="100%" stopColor="#7050A0" stopOpacity=".5"/></linearGradient>
          <linearGradient id="psP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0CC89E" stopOpacity=".4"/><stop offset="100%" stopColor="#0CC89E" stopOpacity=".05"/></linearGradient>
          <linearGradient id="psT" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#E8E2F8" stopOpacity=".9"/><stop offset="100%" stopColor="#B090D8" stopOpacity=".7"/></linearGradient>
        </defs>
        <polygon points="50,22 28,50 3,50 50,3"  fill="url(#psF)"/>
        <polygon points="50,22 72,50 97,50 50,3"  fill="url(#psF)"/>
        <polygon points="50,78 28,50 3,50 50,97"  fill="url(#psP)"/>
        <polygon points="50,78 72,50 97,50 50,97" fill="url(#psP)"/>
        <polygon points="50,22 72,50 50,78 28,50" fill="url(#psT)"/>
        <circle cx="50" cy="50" r="2" fill="#EDE8F6" opacity=".8"/>
        <line x1="3" y1="50" x2="97" y2="50" stroke="#0CC89E" strokeWidth=".5" opacity=".45"/>
      </svg>

      <div className="prism-axis rl" style={{'--d':80, width:'360px'}}></div>

      <p className="prism-label r" style={{'--d':120}}>A luz atravessa a gema — e se divide em quatro reflexos</p>

    </div>
  );
}
