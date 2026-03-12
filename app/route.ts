import { NextResponse } from 'next/server';

const HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>REFLEXY — O reflexo da sua conversão</title>
  <meta name="description" content="Provador virtual com IA, geração de imagens profissionais e analytics comportamental para e-commerce de moda. Integração nativa Shopify.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet">

<style>
/* ═══════════════════════════════════════════════
   TOKENS
═══════════════════════════════════════════════ */
:root {
  --abyss:    #06050F;
  --onyx:     #0F0D1E;
  --onyx-mid: #181530;
  --plum:     #2B1250;
  --mauve:    #7050A0;
  --lavender: #B8AEDD;
  --mist:     #EDEBF5;
  --verdigris:#0CC89E;
  --verd-dim: rgba(12,200,158,.12);
  --dusk:     #A09CC0;
  --rule:     rgba(184,174,221,.12);
  --rule-v:   rgba(184,174,221,.22);
  --plum-glow:rgba(43,18,80,.55);

  --f-d: 'Bricolage Grotesque', sans-serif;
  --f-s: 'Instrument Serif', serif;
  --f-b: 'DM Sans', sans-serif;
  --f-m: 'IBM Plex Mono', monospace;
}

*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth;overflow-x:hidden}
body{
  background:var(--abyss);
  color:var(--mist);
  font-family:var(--f-b);
  font-weight:400;
  line-height:1.6;
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
}

/* grain */
body::after{
  content:'';position:fixed;inset:0;
  background:url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(%23g)' opacity='1'/></svg>");
  opacity:.022;pointer-events:none;z-index:9000;
}

/* ═══════════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════════ */
.wrap{max-width:1080px;margin:0 auto;padding:0 56px}
@media(max-width:768px){.wrap{padding:0 24px}}

/* ═══════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════ */
nav{
  position:fixed;top:0;left:0;right:0;
  z-index:800;
  padding:0 56px;
  height:64px;
  display:flex;align-items:center;justify-content:space-between;
  background:rgba(6,5,15,.80);
  border-bottom:1px solid var(--rule);
  backdrop-filter:blur(20px) saturate(1.4);
  -webkit-backdrop-filter:blur(20px) saturate(1.4);
  transition:background .3s;
}
.nav-brand{display:flex;align-items:center;gap:12px;text-decoration:none}
.nav-wm{font-family:var(--f-d);font-weight:700;font-size:17px;letter-spacing:.18em;text-transform:uppercase;color:var(--mist)}
.nav-links{display:flex;align-items:center;gap:36px}
.nav-links a{font-family:var(--f-d);font-size:12px;font-weight:500;letter-spacing:.08em;color:var(--dusk);text-decoration:none;transition:color .2s}
.nav-links a:hover{color:var(--mist)}
.nav-cta{
  font-family:var(--f-d);font-weight:600;font-size:11px;letter-spacing:.14em;
  text-transform:uppercase;padding:10px 22px;
  background:var(--plum);color:var(--mist);
  border:1px solid rgba(184,174,221,.15);
  text-decoration:none;transition:background .2s;
}
.nav-cta:hover{background:var(--mauve)}
@media(max-width:768px){
  nav{padding:0 24px}
  .nav-links{display:none}
}

/* ═══════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════ */
.r{opacity:0;transform:translateY(24px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1);transition-delay:calc(var(--d,0)*1ms)}
.r.on{opacity:1;transform:none}
.rf{opacity:0;transition:opacity .8s cubic-bezier(.16,1,.3,1);transition-delay:calc(var(--d,0)*1ms)}
.rf.on{opacity:1}
.rl{opacity:0;transform:scaleX(0);transform-origin:left;transition:opacity .5s ease,transform .9s cubic-bezier(.16,1,.3,1);transition-delay:calc(var(--d,0)*1ms)}
.rl.on{opacity:1;transform:scaleX(1)}

/* ═══════════════════════════════════════════════
   SHARED COMPONENTS
═══════════════════════════════════════════════ */
.eyebrow{
  font-family:var(--f-m);font-size:10px;letter-spacing:.3em;
  text-transform:uppercase;color:var(--verdigris);
  display:flex;align-items:center;gap:14px;margin-bottom:20px;
}
.eyebrow::before{content:'';display:block;width:20px;height:1px;background:var(--verdigris);opacity:.6}

.display{font-family:var(--f-d);font-weight:700;font-size:clamp(30px,4.5vw,52px);letter-spacing:-.02em;line-height:1.08;color:var(--mist)}
.display-xl{font-family:var(--f-d);font-weight:700;font-size:clamp(38px,6.5vw,76px);letter-spacing:-.025em;line-height:1.02;color:var(--mist)}
.editorial{font-family:var(--f-s);font-style:italic;font-size:clamp(18px,2.5vw,26px);font-weight:400;color:var(--dusk);line-height:1.45}
.body-text{font-size:15px;line-height:1.8;color:var(--dusk);font-weight:400}
.data-text{font-family:var(--f-m);font-size:11px;letter-spacing:.18em;color:var(--verdigris)}

/* axis rule — the mirror between sections */
.prism-axis{
  width:100%;height:1px;
  background:linear-gradient(to right,transparent,rgba(184,174,221,.08) 10%,var(--lavender) 30%,var(--verdigris) 50%,var(--lavender) 70%,rgba(184,174,221,.08) 90%,transparent);
  opacity:.35;
  position:relative;
}
.prism-axis::before,.prism-axis::after{
  content:'';position:absolute;top:50%;transform:translateY(-50%);
  width:4px;height:4px;border-radius:50%;
}
.prism-axis::before{left:28%;background:var(--lavender);box-shadow:0 0 5px var(--lavender)}
.prism-axis::after{right:28%;background:var(--verdigris);box-shadow:0 0 5px var(--verdigris)}

.sec{padding:112px 0;border-bottom:1px solid var(--rule);position:relative}

/* Buttons */
.btn-p{
  display:inline-flex;align-items:center;gap:10px;
  font-family:var(--f-d);font-weight:600;font-size:12px;letter-spacing:.12em;text-transform:uppercase;
  padding:15px 32px;background:var(--plum);color:var(--mist);
  border:1px solid rgba(184,174,221,.15);text-decoration:none;
  transition:background .25s,border-color .25s;position:relative;overflow:hidden;
}
.btn-p::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,.07) 50%,transparent 60%);transform:translateX(-100%);transition:transform .5s}
.btn-p:hover::after{transform:translateX(100%)}
.btn-p:hover{background:var(--mauve)}
.btn-g{
  display:inline-flex;align-items:center;gap:10px;
  font-family:var(--f-d);font-weight:500;font-size:12px;letter-spacing:.12em;text-transform:uppercase;
  padding:14px 32px;background:transparent;color:var(--lavender);
  border:1px solid var(--rule-v);text-decoration:none;
  transition:border-color .25s,color .25s;
}
.btn-g:hover{border-color:var(--lavender);color:var(--mist)}

/* ═══════════════════════════════════════════════
   GEM MARK (reusable SVG component via JS)
═══════════════════════════════════════════════ */
.gem-wrap{
  position:relative;display:inline-flex;
  flex-direction:column;align-items:center;
}
.gem-glow{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  border-radius:50%;pointer-events:none;
  background:radial-gradient(circle,var(--plum-glow) 0%,transparent 70%);
  animation:glowB 8s ease-in-out infinite;
}
@keyframes glowB{0%,100%{opacity:.7;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}}

/* ═══════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════ */
#hero{
  min-height:100vh;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  padding:120px 24px 80px;
  text-align:center;position:relative;overflow:hidden;
  border-bottom:1px solid var(--rule);
}
#hero::before{
  content:'';position:absolute;inset:0;
  background:
    radial-gradient(ellipse 70% 60% at 50% 30%,rgba(43,18,80,.50) 0%,transparent 65%),
    radial-gradient(ellipse 40% 30% at 50% 80%,rgba(12,200,158,.04) 0%,transparent 60%);
  pointer-events:none;
}
/* scanlines */
#hero::after{
  content:'';position:absolute;inset:0;
  background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(112,80,160,.012) 3px,rgba(112,80,160,.012) 4px);
  pointer-events:none;animation:scan 14s linear infinite;
}
@keyframes scan{from{transform:translateY(0)}to{transform:translateY(4px)}}

.hero-gem-wrap{
  position:relative;margin-bottom:40px;
  display:flex;flex-direction:column;align-items:center;
}
.hero-gem-glow{
  position:absolute;top:50%;left:50%;
  width:240px;height:240px;border-radius:50%;
  transform:translate(-50%,-60%);pointer-events:none;
  background:radial-gradient(circle,rgba(43,18,80,.55) 0%,transparent 70%);
  animation:glowB 8s ease-in-out infinite;
}

.gem-axis-hero{
  width:120px;height:1px;
  background:linear-gradient(to right,transparent,rgba(184,174,221,.18) 15%,rgba(184,174,221,.6) 35%,rgba(12,200,158,.75) 50%,rgba(184,174,221,.6) 65%,rgba(184,174,221,.18) 85%,transparent);
  position:relative;margin:-1px 0;
}
.gem-axis-hero::before,.gem-axis-hero::after{
  content:'';position:absolute;top:50%;transform:translateY(-50%);
  width:3px;height:3px;border-radius:50%;
}
.gem-axis-hero::before{left:24%;background:var(--lavender);box-shadow:0 0 4px var(--lavender)}
.gem-axis-hero::after{right:24%;background:var(--verdigris);box-shadow:0 0 4px var(--verdigris)}

.hero-wm{
  font-family:var(--f-d);font-weight:700;
  font-size:clamp(44px,8vw,92px);
  letter-spacing:.22em;text-transform:uppercase;
  line-height:1;margin-top:36px;
  background:linear-gradient(160deg,var(--mist) 0%,rgba(237,235,245,.82) 55%,var(--lavender) 100%);
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
}
.hero-echo{
  font-family:var(--f-d);font-weight:700;
  font-size:clamp(44px,8vw,92px);
  letter-spacing:.22em;text-transform:uppercase;line-height:1;
  display:block;transform:scaleY(-1);
  background:linear-gradient(to bottom,rgba(184,174,221,.20) 0%,transparent 55%);
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
  margin-top:2px;
  -webkit-mask-image:linear-gradient(to bottom,rgba(0,0,0,.55) 0%,transparent 50%);
  mask-image:linear-gradient(to bottom,rgba(0,0,0,.55) 0%,transparent 50%);
}
.hero-tag{
  font-family:var(--f-m);font-size:10px;letter-spacing:.3em;
  text-transform:uppercase;color:var(--dusk);
  margin-bottom:28px;
}
.hero-head{
  font-family:var(--f-d);font-weight:700;
  font-size:clamp(28px,4vw,48px);
  letter-spacing:-.02em;line-height:1.1;
  margin-top:28px;max-width:680px;
}
.hero-sub{
  font-family:var(--f-s);font-style:italic;
  font-size:clamp(16px,2vw,21px);
  color:var(--dusk);margin-top:20px;max-width:560px;
}
.hero-actions{
  display:flex;gap:16px;flex-wrap:wrap;
  justify-content:center;margin-top:44px;
}

/* metrics strip */
.metrics-strip{
  width:100%;max-width:860px;
  margin-top:72px;
  display:grid;grid-template-columns:repeat(4,1fr);
  border:1px solid var(--rule);
  background:var(--onyx);
}
.ms-item{
  padding:24px 28px;
  border-right:1px solid var(--rule);
  display:flex;flex-direction:column;gap:4px;
}
.ms-item:last-child{border-right:none}
.ms-val{
  font-family:var(--f-d);font-weight:700;
  font-size:clamp(22px,3vw,32px);
  letter-spacing:-.02em;line-height:1;color:var(--mist);
}
.ms-val.v{font-family:var(--f-m);font-size:clamp(18px,2.5vw,26px);font-weight:400;color:var(--verdigris)}
.ms-label{font-family:var(--f-m);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--dusk)}

/* ═══════════════════════════════════════════════
   PRISM SEPARATOR — transition between worlds
═══════════════════════════════════════════════ */
.prism-sep{
  padding:56px 0;
  display:flex;flex-direction:column;align-items:center;gap:20px;
  border-bottom:1px solid var(--rule);
  position:relative;overflow:hidden;
}
.prism-sep::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(to bottom,transparent,rgba(43,18,80,.15),transparent);
  pointer-events:none;
}
.prism-label{
  font-family:var(--f-m);font-size:10px;letter-spacing:.3em;
  text-transform:uppercase;color:rgba(184,174,221,.45);
}

/* ═══════════════════════════════════════════════
   PROBLEM
═══════════════════════════════════════════════ */
.problem-grid{
  display:grid;grid-template-columns:1fr 1fr;
  gap:1px;background:var(--rule);
  border:1px solid var(--rule);margin-top:64px;
}
.problem-cell{
  background:var(--abyss);
  padding:44px;
  display:flex;flex-direction:column;gap:16px;
  position:relative;overflow:hidden;
  transition:background .3s;
}
.problem-cell:hover{background:var(--onyx)}
.problem-cell::before{
  content:'';position:absolute;top:0;left:0;
  width:100%;height:2px;
  background:linear-gradient(to right,var(--plum),transparent 70%);
  opacity:0;transition:opacity .3s;
}
.problem-cell:hover::before{opacity:1}
.problem-num{
  font-family:var(--f-m);font-size:10px;
  letter-spacing:.2em;color:var(--dusk);
}
.problem-icon{
  width:36px;height:36px;
  border:1px solid var(--rule-v);
  display:flex;align-items:center;justify-content:center;
  font-size:16px;
}
.problem-title{
  font-family:var(--f-d);font-weight:600;
  font-size:17px;letter-spacing:-.01em;
}
.problem-body{font-size:14px;color:var(--dusk);line-height:1.75}

/* ═══════════════════════════════════════════════
   SOLUTION INTRO — "a luz atravessa a gema"
═══════════════════════════════════════════════ */
.solution-intro{
  display:grid;grid-template-columns:1fr 1fr;
  gap:80px;align-items:center;
}
.sol-gem-stage{
  display:flex;flex-direction:column;align-items:center;
  position:relative;
}
/* refraction lines emanating from gem */
.refraction-lines{
  position:absolute;
  top:50%;left:50%;
  width:280px;height:280px;
  transform:translate(-50%,-50%);
  pointer-events:none;
}

/* ═══════════════════════════════════════════════
   4 REFLECTIONS
═══════════════════════════════════════════════ */
.reflection{
  display:grid;align-items:center;
  gap:72px;padding:96px 0;
  border-bottom:1px solid var(--rule);
}
.reflection.two-col{grid-template-columns:1fr 1fr}
.reflection.reversed{direction:rtl}
.reflection.reversed > *{direction:ltr}

.ref-num{
  font-family:var(--f-m);font-size:10px;
  letter-spacing:.25em;color:var(--verdigris);margin-bottom:12px;
}
.ref-label{
  font-family:var(--f-m);font-size:11px;letter-spacing:.2em;
  text-transform:uppercase;color:var(--lavender);margin-bottom:16px;
  display:flex;align-items:center;gap:10px;
}
.ref-label::before{content:'';display:block;width:16px;height:1px;background:var(--lavender);opacity:.5}
.ref-title{
  font-family:var(--f-d);font-weight:700;
  font-size:clamp(24px,3.5vw,40px);
  letter-spacing:-.02em;line-height:1.1;
  margin-bottom:14px;
}
.ref-editorial{
  font-family:var(--f-s);font-style:italic;
  font-size:clamp(16px,1.8vw,20px);
  color:var(--lavender);line-height:1.5;
  margin-bottom:24px;font-weight:400;
}
.ref-body{font-size:15px;color:var(--dusk);line-height:1.8;margin-bottom:32px}

.ref-checks{display:flex;flex-direction:column;gap:12px}
.ref-check{
  display:flex;gap:12px;align-items:flex-start;
  font-size:14px;color:var(--dusk);line-height:1.6;
}
.ref-check-dot{
  width:5px;height:5px;border-radius:50%;
  background:var(--verdigris);margin-top:8px;flex-shrink:0;
  box-shadow:0 0 6px var(--verdigris);
}

/* Reflection visual panels */
.ref-panel{
  background:var(--onyx);
  border:1px solid var(--rule);
  border-top:1px solid var(--mauve);
  padding:44px;
  display:flex;flex-direction:column;
  gap:24px;min-height:340px;
  position:relative;overflow:hidden;
}
.ref-panel::before{
  content:'';position:absolute;top:0;left:0;
  width:100%;height:1px;
  background:linear-gradient(to right,var(--mauve),transparent 60%);
  opacity:.5;
}
/* panel ambient */
.ref-panel::after{
  content:'';position:absolute;
  pointer-events:none;border-radius:50%;
  background:radial-gradient(circle,rgba(43,18,80,.35) 0%,transparent 70%);
}

/* Try-on panel */
.tryon-panel::after{
  width:200px;height:200px;
  top:-60px;right:-40px;
}
/* Studio panel */
.studio-panel::after{
  width:180px;height:180px;
  bottom:-50px;left:-30px;
  background:radial-gradient(circle,rgba(12,200,158,.08) 0%,transparent 70%);
}
/* Analytics panel */
.analytics-panel::after{
  width:160px;height:160px;
  top:50%;right:-20px;transform:translateY(-50%);
}

.panel-eyebrow{
  font-family:var(--f-m);font-size:10px;letter-spacing:.22em;
  text-transform:uppercase;color:var(--verdigris);
}
.panel-title{
  font-family:var(--f-d);font-weight:600;
  font-size:18px;color:var(--mist);letter-spacing:-.01em;
}

/* Mock UI elements inside panels */
.mock-bar{height:4px;background:var(--rule);border-radius:2px;overflow:hidden;position:relative}
.mock-bar-fill{
  position:absolute;top:0;left:0;height:100%;border-radius:2px;
  background:linear-gradient(to right,var(--plum),var(--lavender));
  animation:barFill 2.5s ease-out forwards;
}
@keyframes barFill{from{width:0}to{width:var(--w,70%)}}

.mock-grid{
  display:grid;grid-template-columns:repeat(3,1fr);
  gap:8px;
}
.mock-cell{
  aspect-ratio:1;background:var(--onyx-mid);
  border:1px solid var(--rule);
  display:flex;align-items:center;justify-content:center;
  font-size:8px;font-family:var(--f-m);color:var(--dusk);
  letter-spacing:.1em;
}
.mock-cell.hi{
  background:linear-gradient(135deg,rgba(43,18,80,.8),rgba(112,80,160,.4));
  border-color:rgba(184,174,221,.2);color:var(--lavender);
}

.mock-chart{
  display:flex;align-items:flex-end;gap:6px;height:80px;
}
.bar-c{
  flex:1;border-radius:2px 2px 0 0;
  background:rgba(184,174,221,.12);
  position:relative;
  animation:barUp .8s cubic-bezier(.16,1,.3,1) both;
  animation-delay:calc(var(--bi,0)*80ms);
}
@keyframes barUp{from{transform:scaleY(0);transform-origin:bottom}to{transform:scaleY(1);transform-origin:bottom}}
.bar-c.active{background:linear-gradient(to top,var(--plum),var(--mauve))}
.bar-c.data{background:linear-gradient(to top,rgba(12,200,158,.3),rgba(12,200,158,.5))}

.mock-stat{
  display:flex;align-items:baseline;gap:6px;
}
.stat-big{
  font-family:var(--f-d);font-weight:700;
  font-size:clamp(26px,3.5vw,38px);
  letter-spacing:-.02em;color:var(--mist);
}
.stat-big.v{color:var(--verdigris);font-family:var(--f-m);font-size:clamp(22px,2.8vw,30px);font-weight:400}
.stat-unit{font-family:var(--f-m);font-size:10px;color:var(--dusk);letter-spacing:.15em;text-transform:uppercase}

.mock-timeline{display:flex;flex-direction:column;gap:8px}
.tl-row{display:flex;gap:12px;align-items:center;font-size:12px}
.tl-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.tl-dot.done{background:var(--verdigris);box-shadow:0 0 6px var(--verdigris)}
.tl-dot.pend{background:var(--rule-v)}
.tl-label{font-family:var(--f-m);font-size:11px;color:var(--dusk);letter-spacing:.08em}
.tl-val{margin-left:auto;font-family:var(--f-m);font-size:11px;color:var(--lavender)}

/* ═══════════════════════════════════════════════
   HOW IT WORKS
═══════════════════════════════════════════════ */
.steps-grid{
  display:grid;grid-template-columns:repeat(3,1fr);
  gap:1px;background:var(--rule);
  border:1px solid var(--rule);
  margin-top:64px;
}
.step{
  background:var(--abyss);padding:44px 40px;
  position:relative;overflow:hidden;
}
.step::before{
  content:'';position:absolute;bottom:0;left:0;
  width:100%;height:2px;
  background:linear-gradient(to right,var(--plum),transparent 70%);
  opacity:0;transition:opacity .3s;
}
.step:hover{background:var(--onyx)}
.step:hover::before{opacity:1}
.step-num{
  font-family:var(--f-m);font-size:10px;
  letter-spacing:.25em;color:var(--verdigris);
  margin-bottom:20px;
}
.step-icon{
  width:48px;height:48px;
  background:var(--onyx-mid);
  border:1px solid var(--rule-v);
  display:flex;align-items:center;justify-content:center;
  font-size:20px;margin-bottom:20px;
}
.step-title{font-family:var(--f-d);font-weight:600;font-size:18px;letter-spacing:-.01em;margin-bottom:12px}
.step-body{font-size:14px;color:var(--dusk);line-height:1.75}
.step-connector{
  position:absolute;top:44px;right:-1px;
  width:2px;height:24px;
  background:linear-gradient(to bottom,var(--verdigris),transparent);
  opacity:.4;
}

/* ═══════════════════════════════════════════════
   COMPETITIVE TABLE
═══════════════════════════════════════════════ */
.comp-table{
  width:100%;border-collapse:collapse;
  margin-top:56px;
}
.comp-table th{
  font-family:var(--f-d);font-weight:600;
  font-size:12px;letter-spacing:.08em;
  text-transform:uppercase;
  padding:16px 24px;
  border-bottom:1px solid var(--rule-v);
  text-align:left;color:var(--dusk);
}
.comp-table th:first-child{color:var(--mist)}
.comp-table th.ours{
  color:var(--lavender);
  background:rgba(43,18,80,.25);
  border-top:1px solid var(--mauve);
}
.comp-table td{
  padding:15px 24px;
  border-bottom:1px solid var(--rule);
  font-size:14px;color:var(--dusk);
  font-weight:400;
}
.comp-table td:first-child{color:var(--mist);font-weight:500;font-family:var(--f-d);font-size:13px;letter-spacing:.03em}
.comp-table td.ours{background:rgba(43,18,80,.15)}
.comp-table tr:last-child td{border-bottom:none}
.comp-table tr:hover td{background:rgba(184,174,221,.03)}
.comp-table tr:hover td.ours{background:rgba(43,18,80,.22)}
.tick-yes{color:var(--verdigris);font-size:15px}
.tick-no{color:rgba(184,174,221,.25);font-size:13px}
.tick-part{color:var(--dusk);font-size:13px}

/* ═══════════════════════════════════════════════
   SOCIAL PROOF — data-driven
═══════════════════════════════════════════════ */
.proof-grid{
  display:grid;grid-template-columns:1fr 1fr;
  gap:1px;background:var(--rule);
  border:1px solid var(--rule);
  margin-top:64px;
}
.proof-cell{
  background:var(--onyx);padding:44px;
  border-top:1px solid var(--mauve);
  position:relative;
}
.proof-cell::before{
  content:'';position:absolute;top:0;left:0;
  width:100%;height:1px;
  background:linear-gradient(to right,var(--mauve),transparent 60%);
  opacity:.4;
}
.proof-number{
  font-family:var(--f-d);font-weight:700;
  font-size:clamp(36px,5vw,56px);
  letter-spacing:-.03em;line-height:1;
  color:var(--mist);margin-bottom:8px;
}
.proof-number span{color:var(--lavender)}
.proof-label{font-family:var(--f-m);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--dusk);margin-bottom:16px}
.proof-desc{font-size:14px;color:var(--dusk);line-height:1.7}

/* quote block */
.quote-block{
  margin-top:56px;
  padding:44px 52px;
  background:var(--onyx);
  border:1px solid var(--rule);
  border-left:2px solid var(--mauve);
  position:relative;
}
.quote-mark{
  position:absolute;top:32px;left:40px;
  font-family:var(--f-s);font-size:64px;
  color:var(--plum);line-height:1;
  font-style:italic;opacity:.6;
}
.quote-text{
  font-family:var(--f-s);font-style:italic;
  font-size:clamp(17px,2.2vw,22px);
  color:var(--lavender);line-height:1.55;
  padding-left:24px;font-weight:400;
}
.quote-attr{
  margin-top:20px;padding-left:24px;
  font-family:var(--f-m);font-size:10px;
  letter-spacing:.2em;text-transform:uppercase;
  color:var(--dusk);
  display:flex;align-items:center;gap:12px;
}
.quote-attr::before{content:'';display:block;width:16px;height:1px;background:var(--dusk)}

/* ═══════════════════════════════════════════════
   PRICING — novo sistema
═══════════════════════════════════════════════ */

/* Free entry card */
.free-entry{
  display:flex;align-items:center;justify-content:space-between;
  padding:28px 36px;
  border:1px solid var(--rule);
  background:var(--abyss);
  margin-top:56px;
  gap:32px;
}
.free-entry-left{display:flex;flex-direction:column;gap:6px}
.free-entry-title{
  font-family:var(--f-d);font-weight:600;
  font-size:16px;letter-spacing:-.01em;color:var(--mist);
}
.free-entry-desc{font-size:13px;color:var(--dusk);line-height:1.6}
.free-entry-note{
  font-family:var(--f-m);font-size:10px;
  letter-spacing:.18em;text-transform:uppercase;
  color:rgba(160,156,192,.45);margin-top:4px;
}

/* 3-plan table */
.pricing-grid{
  display:grid;grid-template-columns:repeat(3,1fr);
  gap:1px;background:var(--rule);
  border:1px solid var(--rule);
  margin-top:1px;
}
.plan{
  background:var(--abyss);
  padding:44px 36px;
  display:flex;flex-direction:column;
  position:relative;
  transition:background .2s;
}
.plan:hover{background:rgba(15,13,30,.7)}

.plan.featured{
  background:var(--onyx);
  border:2px solid var(--mauve);
  margin:-1px;
  z-index:2;
}
.plan.featured::before{
  content:'';position:absolute;top:0;left:0;
  width:100%;height:2px;
  background:linear-gradient(to right,var(--mauve),var(--lavender) 50%,var(--mauve));
  opacity:.7;
}

.plan-badge{
  font-family:var(--f-m);font-size:9px;
  letter-spacing:.22em;text-transform:uppercase;
  color:var(--lavender);
  padding:4px 12px;
  border:1px solid rgba(184,174,221,.3);
  background:rgba(184,174,221,.06);
  display:inline-block;width:fit-content;
  margin-bottom:24px;
}
.plan.featured .plan-badge{
  color:var(--verdigris);
  border-color:rgba(12,200,158,.35);
  background:rgba(12,200,158,.06);
}

.plan-name{
  font-family:var(--f-d);font-weight:700;
  font-size:20px;letter-spacing:.04em;text-transform:uppercase;
  margin-bottom:6px;color:var(--mist);
}
.plan-tagline{font-size:13px;color:var(--dusk);margin-bottom:32px;line-height:1.5}

.plan-price-row{display:flex;align-items:baseline;gap:6px;margin-bottom:4px}
.plan-price{
  font-family:var(--f-d);font-weight:700;
  font-size:clamp(32px,4vw,46px);
  letter-spacing:-.03em;line-height:1;color:var(--mist);
}
.plan-currency{
  font-family:var(--f-d);font-weight:400;
  font-size:18px;color:var(--dusk);
}
.plan-period{
  font-family:var(--f-m);font-size:10px;
  letter-spacing:.15em;color:var(--dusk);
  margin-bottom:8px;
}
.plan-value{
  font-family:var(--f-m);font-size:11px;
  letter-spacing:.12em;color:var(--verdigris);
  margin-bottom:28px;
  opacity:.8;
}
.plan.featured .plan-value{opacity:1}

.plan-div{height:1px;background:var(--rule);margin-bottom:24px}

.plan-features{
  display:flex;flex-direction:column;gap:12px;
  flex:1;margin-bottom:32px;
}
.plan-feat{
  display:flex;gap:12px;align-items:flex-start;
  font-size:14px;color:var(--mist);line-height:1.5;font-weight:400;
}
.plan-feat-dot{
  width:5px;height:5px;border-radius:50%;
  background:var(--verdigris);
  box-shadow:0 0 5px rgba(12,200,158,.5);
  margin-top:8px;flex-shrink:0;
}

.plan-cta{
  display:block;text-align:center;
  font-family:var(--f-d);font-weight:600;font-size:12px;
  letter-spacing:.14em;text-transform:uppercase;
  padding:15px 20px;text-decoration:none;
  transition:background .2s,border-color .2s,color .2s;
}
.plan-cta.primary{
  background:var(--plum);color:var(--mist);
  border:1px solid rgba(184,174,221,.2);
}
.plan-cta.primary:hover{background:var(--mauve)}
.plan-cta.ghost{
  background:transparent;color:var(--lavender);
  border:1px solid var(--rule-v);
}
.plan-cta.ghost:hover{border-color:var(--lavender);color:var(--mist)}

/* Pay-as-you-go row */
.payg-row{
  margin-top:1px;
  padding:18px 36px;
  background:var(--abyss);
  border:1px solid var(--rule);
  border-top:none;
  display:flex;align-items:center;gap:10px;
}
.payg-label{
  font-family:var(--f-m);font-size:11px;
  letter-spacing:.15em;text-transform:uppercase;
  color:var(--dusk);
}
.payg-trigger{
  display:inline-flex;align-items:center;justify-content:center;
  width:16px;height:16px;border-radius:50%;
  border:1px solid var(--rule-v);
  font-family:var(--f-m);font-size:9px;
  color:var(--lavender);cursor:pointer;
  position:relative;
  transition:border-color .2s;
}
.payg-trigger:hover{border-color:var(--lavender)}
.payg-tooltip{
  position:absolute;bottom:calc(100% + 10px);left:50%;
  transform:translateX(-50%);
  width:300px;
  background:var(--onyx-mid);
  border:1px solid var(--rule-v);
  padding:20px 24px;
  pointer-events:none;
  opacity:0;
  transition:opacity .2s;
  z-index:100;
  text-align:left;
}
.payg-trigger:hover .payg-tooltip{opacity:1;pointer-events:auto}
.payg-tooltip::after{
  content:'';position:absolute;top:100%;left:50%;
  transform:translateX(-50%);
  border:6px solid transparent;
  border-top-color:var(--rule-v);
}
.tooltip-title{
  font-family:var(--f-m);font-size:10px;
  letter-spacing:.2em;text-transform:uppercase;
  color:var(--verdigris);margin-bottom:14px;
}
.tooltip-row{
  display:flex;justify-content:space-between;
  padding:7px 0;border-bottom:1px solid var(--rule);
  font-size:13px;
}
.tooltip-row:last-child{border-bottom:none}
.tooltip-plan{color:var(--dusk);font-family:var(--f-b)}
.tooltip-price{color:var(--mist);font-family:var(--f-m);font-size:12px}
.tooltip-note{
  margin-top:12px;font-size:12px;color:var(--dusk);
  line-height:1.6;font-style:italic;
  border-top:1px solid var(--rule);padding-top:12px;
}

/* Enterprise block */
.enterprise-block{
  margin-top:32px;
  display:grid;grid-template-columns:1fr auto;
  gap:40px;align-items:center;
  padding:40px 44px;
  background:var(--onyx);
  border:1px solid var(--rule);
  border-left:2px solid var(--plum);
  position:relative;overflow:hidden;
}
.enterprise-block::before{
  content:'';position:absolute;top:0;left:0;
  width:100%;height:1px;
  background:linear-gradient(to right,var(--mauve),transparent 50%);
  opacity:.35;
}
.enterprise-block::after{
  content:'';position:absolute;
  right:-60px;top:50%;transform:translateY(-50%);
  width:200px;height:200px;border-radius:50%;
  background:radial-gradient(circle,rgba(43,18,80,.35) 0%,transparent 70%);
  pointer-events:none;
}
.ent-label{
  font-family:var(--f-m);font-size:10px;
  letter-spacing:.25em;text-transform:uppercase;
  color:var(--verdigris);margin-bottom:10px;
}
.ent-title{
  font-family:var(--f-d);font-weight:700;
  font-size:clamp(20px,2.5vw,28px);
  letter-spacing:-.01em;margin-bottom:10px;
}
.ent-desc{font-size:14px;color:var(--dusk);line-height:1.7;max-width:560px;margin-bottom:20px}
.ent-feats{
  display:flex;flex-wrap:wrap;gap:8px 24px;
}
.ent-feat{
  display:flex;gap:8px;align-items:center;
  font-family:var(--f-m);font-size:11px;
  letter-spacing:.08em;color:var(--dusk);
}
.ent-feat-dot{width:4px;height:4px;border-radius:50%;background:var(--verdigris);flex-shrink:0}

/* ═══════════════════════════════════════════════
   FAQ
═══════════════════════════════════════════════ */
.faq-list{
  display:flex;flex-direction:column;
  border:1px solid var(--rule);
  margin-top:56px;
}
.faq-item{border-bottom:1px solid var(--rule)}
.faq-item:last-child{border-bottom:none}
.faq-q{
  width:100%;display:flex;align-items:center;justify-content:space-between;
  padding:24px 32px;background:none;border:none;cursor:pointer;
  font-family:var(--f-d);font-weight:500;font-size:15px;
  letter-spacing:-.01em;color:var(--mist);text-align:left;
  transition:background .2s;
}
.faq-q:hover{background:var(--onyx)}
.faq-icon{
  width:20px;height:20px;
  border:1px solid var(--rule-v);
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
  font-size:14px;color:var(--lavender);
  transition:transform .3s;
}
.faq-item.open .faq-icon{transform:rotate(45deg)}
.faq-a{
  max-height:0;overflow:hidden;
  transition:max-height .35s cubic-bezier(.4,0,.2,1);
}
.faq-item.open .faq-a{max-height:240px}
.faq-body{
  padding:0 32px 24px;
  font-size:14px;color:var(--dusk);line-height:1.8;
}

/* ═══════════════════════════════════════════════
   FINAL CTA
═══════════════════════════════════════════════ */
#final-cta{
  padding:120px 0;
  display:flex;flex-direction:column;
  align-items:center;text-align:center;
  position:relative;overflow:hidden;
}
#final-cta::before{
  content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse 60% 70% at 50% 50%,rgba(43,18,80,.45) 0%,transparent 70%);
  pointer-events:none;
}
.cta-kicker{
  font-family:var(--f-s);font-style:italic;
  font-size:clamp(15px,2vw,20px);
  color:var(--dusk);margin-top:20px;max-width:520px;
}
.cta-note{
  margin-top:24px;font-family:var(--f-m);
  font-size:10px;letter-spacing:.2em;text-transform:uppercase;
  color:rgba(160,156,192,.5);
}

/* ═══════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════ */
footer{
  padding:56px;
  display:grid;
  grid-template-columns:1fr 2fr 1fr;
  gap:40px;align-items:start;
  border-top:1px solid var(--rule);
}
.footer-brand{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.footer-wm{font-family:var(--f-d);font-weight:700;font-size:15px;letter-spacing:.2em;text-transform:uppercase;color:var(--mist)}
.footer-desc{font-size:13px;color:var(--dusk);line-height:1.7;max-width:240px}
.footer-links{display:grid;grid-template-columns:repeat(3,1fr);gap:12px 32px}
.footer-col-title{font-family:var(--f-d);font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--lavender);margin-bottom:14px}
.footer-link{display:block;font-size:13px;color:var(--dusk);text-decoration:none;padding:3px 0;transition:color .2s}
.footer-link:hover{color:var(--mist)}
.footer-bottom{display:flex;flex-direction:column;align-items:flex-end;gap:8px}
.footer-copy{font-family:var(--f-m);font-size:10px;color:rgba(160,156,192,.45);letter-spacing:.12em}
.footer-status{display:flex;align-items:center;gap:7px;font-family:var(--f-m);font-size:10px;color:var(--verdigris);letter-spacing:.15em}
.status-dot{width:6px;height:6px;border-radius:50%;background:var(--verdigris);animation:blink 2.5s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}

@media(max-width:768px){
  .problem-grid,.solution-intro,.reflection.two-col,.proof-grid,.pricing-grid,.steps-grid,.footer-links{grid-template-columns:1fr}
  footer{grid-template-columns:1fr;padding:44px 24px}
  .metrics-strip{grid-template-columns:repeat(2,1fr)}
  .ms-item:nth-child(2){border-right:none}
  .reflection{padding:64px 0}
  nav{padding:0 24px}
  .comp-table th:nth-child(3),.comp-table td:nth-child(3){display:none}
}
</style>
</head>
<body>

<!-- ═══════════════ NAV ═══════════════ -->
<nav id="main-nav">
  <a class="nav-brand" href="#">
    <svg width="26" height="26" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="nF" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#C4B8E4" stop-opacity=".9"/><stop offset="100%" stop-color="#7050A0" stop-opacity=".7"/></linearGradient>
        <linearGradient id="nT" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E8E2F8" stop-opacity=".95"/><stop offset="100%" stop-color="#B090D8" stop-opacity=".8"/></linearGradient>
        <linearGradient id="nP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0CC89E" stop-opacity=".4"/><stop offset="100%" stop-color="#0CC89E" stop-opacity=".05"/></linearGradient>
        <clipPath id="nClip"><polygon points="50,3 97,50 50,97 3,50"/></clipPath>
        <linearGradient id="nCaustic" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="white" stop-opacity="0"/><stop offset="45%" stop-color="white" stop-opacity="0"/><stop offset="50%" stop-color="white" stop-opacity=".2"/><stop offset="55%" stop-color="white" stop-opacity="0"/><stop offset="100%" stop-color="white" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <polygon points="50,3 97,50 50,97 3,50" fill="none" stroke="#B8AEDD" stroke-width=".6" opacity=".35"/>
      <polygon points="50,22 28,50 3,50 50,3" fill="url(#nF)"/>
      <polygon points="50,22 72,50 97,50 50,3" fill="url(#nF)"/>
      <polygon points="50,78 28,50 3,50 50,97" fill="url(#nP)"/>
      <polygon points="50,78 72,50 97,50 50,97" fill="url(#nP)"/>
      <polygon points="50,22 72,50 50,78 28,50" fill="url(#nT)"/>
      <circle cx="50" cy="50" r="2.5" fill="#EDEBF5" opacity=".9"/>
      <line x1="3" y1="50" x2="97" y2="50" stroke="#B8AEDD" stroke-width=".4" opacity=".35"/>
      <g clip-path="url(#nClip)">
        <rect x="-110" y="0" width="220" height="100" fill="url(#nCaustic)">
          <animateTransform attributeName="transform" type="translate" values="-40,0;140,0;140,0;-40,0" keyTimes="0;0.38;1;1" dur="9s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0 0 1 1;0 0 1 1"/>
        </rect>
      </g>
    </svg>
    <span class="nav-wm">Reflexy</span>
  </a>
  <div class="nav-links">
    <a href="#features">Funcionalidades</a>
    <a href="#how">Como funciona</a>
    <a href="#pricing">Planos</a>
    <a href="#faq">FAQ</a>
  </div>
  <a href="#pricing" class="nav-cta">Começar grátis</a>
</nav>


<!-- ═══════════════ HERO ═══════════════ -->
<section id="hero">

  <p class="hero-tag r" style="--d:80;padding-top:20px">Plugin para Shopify · E-commerce de Moda</p>

  <!-- GEM MARK -->
  <div class="hero-gem-wrap r" style="--d:160">
    <div class="hero-gem-glow"></div>
    <svg width="112" height="112" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="REFLEXY" style="filter:drop-shadow(0 0 20px rgba(112,80,160,.55)) drop-shadow(0 0 52px rgba(43,18,80,.35));animation:gemS 90s linear infinite">
      <defs>
        <linearGradient id="hF1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#C4B8E4" stop-opacity=".90"/><stop offset="100%" stop-color="#7050A0" stop-opacity=".70"/></linearGradient>
        <linearGradient id="hF2" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#B8AEDD" stop-opacity=".70"/><stop offset="100%" stop-color="#4A2880" stop-opacity=".55"/></linearGradient>
        <linearGradient id="hF3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9070C0" stop-opacity=".55"/><stop offset="100%" stop-color="#2B1250" stop-opacity=".80"/></linearGradient>
        <linearGradient id="hF4" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D0C4EC" stop-opacity=".80"/><stop offset="100%" stop-color="#5A38A0" stop-opacity=".60"/></linearGradient>
        <linearGradient id="hTbl" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E8E2F8" stop-opacity=".95"/><stop offset="100%" stop-color="#B090D8" stop-opacity=".80"/></linearGradient>
        <linearGradient id="hP1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0CC89E" stop-opacity=".38"/><stop offset="100%" stop-color="#0CC89E" stop-opacity=".05"/></linearGradient>
        <linearGradient id="hP2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7ADAC8" stop-opacity=".25"/><stop offset="100%" stop-color="#0CC89E" stop-opacity=".03"/></linearGradient>
        <linearGradient id="hStr" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#C4B8E4" stop-opacity=".55"/><stop offset="50%" stop-color="#B8AEDD" stop-opacity=".35"/><stop offset="100%" stop-color="#7050A0" stop-opacity=".25"/></linearGradient>
        <filter id="hGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <clipPath id="hClip"><polygon points="50,3 97,50 50,97 3,50"/></clipPath>
        <linearGradient id="hCaustic" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="white" stop-opacity="0"/><stop offset="42%" stop-color="white" stop-opacity="0"/><stop offset="50%" stop-color="white" stop-opacity=".18"/><stop offset="58%" stop-color="white" stop-opacity="0"/><stop offset="100%" stop-color="white" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <polygon points="50,78 28,50 3,50 50,97" fill="url(#hP1)" opacity=".80"/>
      <polygon points="50,78 72,50 97,50 50,97" fill="url(#hP2)" opacity=".80"/>
      <polygon points="50,22 28,50 3,50 50,3" fill="url(#hF1)"/>
      <polygon points="50,22 72,50 97,50 50,3" fill="url(#hF4)"/>
      <polygon points="3,50 50,22 28,50" fill="url(#hF2)"/>
      <polygon points="97,50 50,22 72,50" fill="url(#hF3)"/>
      <polygon points="50,22 72,50 50,78 28,50" fill="url(#hTbl)" filter="url(#hGlow)"/>
      <circle cx="50" cy="50" r="2.5" fill="#EDE8F6" opacity=".95" filter="url(#hGlow)"/>
      <polygon points="50,3 97,50 50,97 3,50" fill="none" stroke="url(#hStr)" stroke-width=".45"/>
      <polygon points="50,22 72,50 50,78 28,50" fill="none" stroke="#C4B8E4" stroke-width=".4" opacity=".25"/>
      <line x1="50" y1="3" x2="50" y2="22" stroke="#C4B8E4" stroke-width=".35" opacity=".45"/>
      <line x1="3" y1="50" x2="28" y2="50" stroke="#C4B8E4" stroke-width=".35" opacity=".35"/>
      <line x1="97" y1="50" x2="72" y2="50" stroke="#C4B8E4" stroke-width=".35" opacity=".35"/>
      <line x1="50" y1="22" x2="28" y2="50" stroke="#C4B8E4" stroke-width=".30" opacity=".28"/>
      <line x1="50" y1="22" x2="72" y2="50" stroke="#C4B8E4" stroke-width=".30" opacity=".28"/>
      <line x1="50" y1="78" x2="28" y2="50" stroke="#0CC89E" stroke-width=".25" opacity=".22"/>
      <line x1="50" y1="78" x2="72" y2="50" stroke="#0CC89E" stroke-width=".25" opacity=".22"/>
      <g clip-path="url(#hClip)">
        <rect x="-110" y="0" width="220" height="100" fill="url(#hCaustic)">
          <animateTransform attributeName="transform" type="translate" values="-40,0;140,0;140,0;-40,0" keyTimes="0;0.38;1;1" dur="9s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0 0 1 1;0 0 1 1"/>
        </rect>
        <rect x="-110" y="50" width="220" height="50">
          <animate attributeName="fill" values="#7ADAC8;#7ADAC8" dur="9s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="-40,0;140,0;140,0;-40,0" keyTimes="0;0.38;1;1" dur="9s" begin="4.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0 0 1 1;0 0 1 1"/>
          <animate attributeName="opacity" values="0;0;.25;.25;0;0" keyTimes="0;0.1;0.2;0.35;0.45;1" dur="9s" begin="4.5s" repeatCount="indefinite"/>
        </rect>
      </g>
    </svg>

    <!-- Girdle -->
    <div class="gem-axis-hero rl" style="--d:300"></div>

    <!-- Pavilion reflection -->
    <svg width="112" height="112" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="transform:scaleY(-1);-webkit-mask-image:linear-gradient(to bottom,rgba(0,0,0,.35) 0%,transparent 62%);mask-image:linear-gradient(to bottom,rgba(0,0,0,.35) 0%,transparent 62%);margin-top:1px;animation:pavP 8s ease-in-out infinite;filter:drop-shadow(0 0 8px rgba(12,200,158,.18))">
      <defs>
        <linearGradient id="rF" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#C4B8E4" stop-opacity=".6"/><stop offset="100%" stop-color="#7050A0" stop-opacity=".4"/></linearGradient>
        <linearGradient id="rT" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E8E2F8" stop-opacity=".7"/><stop offset="100%" stop-color="#B090D8" stop-opacity=".5"/></linearGradient>
      </defs>
      <polygon points="50,22 28,50 3,50 50,3" fill="url(#rF)"/>
      <polygon points="50,22 72,50 97,50 50,3" fill="url(#rF)"/>
      <polygon points="50,22 72,50 50,78 28,50" fill="url(#rT)" opacity=".7"/>
      <circle cx="50" cy="50" r="2.5" fill="#EDE8F6" opacity=".5"/>
      <polygon points="50,3 97,50 50,97 3,50" fill="none" stroke="#C4B8E4" stroke-width=".4" opacity=".3"/>
    </svg>
  </div>

  <style>
    @keyframes gemS{0%{filter:drop-shadow(0 0 20px rgba(112,80,160,.55)) drop-shadow(0 0 52px rgba(43,18,80,.35))}25%{filter:drop-shadow(0 0 24px rgba(184,174,221,.45)) drop-shadow(0 0 56px rgba(43,18,80,.4))}50%{filter:drop-shadow(0 0 20px rgba(12,200,158,.28)) drop-shadow(0 0 52px rgba(43,18,80,.35))}75%{filter:drop-shadow(0 0 22px rgba(112,80,160,.6)) drop-shadow(0 0 54px rgba(43,18,80,.38))}100%{filter:drop-shadow(0 0 20px rgba(112,80,160,.55)) drop-shadow(0 0 52px rgba(43,18,80,.35))}}
    @keyframes pavP{0%,100%{opacity:.7}50%{opacity:.9}}
  </style>

  <h1 class="hero-head r" style="--d:220">O reflexo da<br>sua conversão.</h1>
  <p class="hero-sub r" style="--d:300">Provador virtual com IA, geração de imagens profissionais e analytics comportamental — numa única plataforma Shopify.</p>

  <div class="hero-actions r" style="--d:380">
    <a href="#pricing" class="btn-p">Começar gratuitamente <span style="opacity:.6">→</span></a>
    <a href="#features" class="btn-g">Ver como funciona</a>
  </div>

  <div class="metrics-strip rf" style="--d:500">
    <div class="ms-item">
      <span class="ms-val">+38%</span>
      <span class="ms-label">Aumento em conversão*</span>
    </div>
    <div class="ms-item">
      <span class="ms-val">−52%</span>
      <span class="ms-label">Redução em devoluções*</span>
    </div>
    <div class="ms-item">
      <span class="ms-val v">&lt; 15s</span>
      <span class="ms-label">Tempo de geração IA</span>
    </div>
    <div class="ms-item">
      <span class="ms-val v">4K</span>
      <span class="ms-label">Imagens geradas / mês</span>
    </div>
  </div>
  <p style="font-family:var(--f-m);font-size:10px;color:rgba(160,156,192,.38);letter-spacing:.1em;margin-top:12px;text-align:left;max-width:860px">*Baseado em estudos de caso do setor de e-commerce de moda. Resultados individuais podem variar.</p>

</section>


<!-- ═══════════════ PRISM SEP ═══════════════ -->
<div class="prism-sep">
  <svg width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="r" style="--d:0;opacity:.55">
    <defs><linearGradient id="psF" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#C4B8E4" stop-opacity=".7"/><stop offset="100%" stop-color="#7050A0" stop-opacity=".5"/></linearGradient><linearGradient id="psP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0CC89E" stop-opacity=".4"/><stop offset="100%" stop-color="#0CC89E" stop-opacity=".05"/></linearGradient><linearGradient id="psT" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E8E2F8" stop-opacity=".9"/><stop offset="100%" stop-color="#B090D8" stop-opacity=".7"/></linearGradient></defs>
    <polygon points="50,22 28,50 3,50 50,3" fill="url(#psF)"/>
    <polygon points="50,22 72,50 97,50 50,3" fill="url(#psF)"/>
    <polygon points="50,78 28,50 3,50 50,97" fill="url(#psP)"/>
    <polygon points="50,78 72,50 97,50 50,97" fill="url(#psP)"/>
    <polygon points="50,22 72,50 50,78 28,50" fill="url(#psT)"/>
    <circle cx="50" cy="50" r="2" fill="#EDE8F6" opacity=".8"/>
    <line x1="3" y1="50" x2="97" y2="50" stroke="#0CC89E" stroke-width=".5" opacity=".45"/>
  </svg>
  <div class="prism-axis rl" style="--d:80;width:360px"></div>
  <p class="prism-label r" style="--d:120">A luz atravessa a gema — e se divide em quatro reflexos</p>
</div>


<!-- ═══════════════ PROBLEM ═══════════════ -->
<section class="sec" id="problem">
  <div class="wrap">
    <p class="eyebrow r">O Problema</p>
    <h2 class="display r" style="--d:80">Seu cliente não compra<br>porque não tem certeza.</h2>
    <p class="editorial r" style="--d:120" style="margin-top:16px;max-width:580px">O e-commerce de moda enfrenta quatro obstáculos estruturais que custam receita todos os dias.</p>

    <div class="problem-grid">
      <div class="problem-cell r" style="--d:0">
        <span class="problem-num">01</span>
        <div class="problem-icon">↩</div>
        <h3 class="problem-title">Altas taxas de devolução</h3>
        <p class="problem-body">Tamanho errado, caimento diferente do esperado. O cliente compra sem certeza e devolve quando descobre a realidade.</p>
      </div>
      <div class="problem-cell r" style="--d:80">
        <span class="problem-num">02</span>
        <div class="problem-icon">?</div>
        <h3 class="problem-title">Baixa confiança na compra</h3>
        <p class="problem-body">Sem poder experimentar, o cliente hesita. A dúvida vira abandono de carrinho. Você perde a venda no momento da decisão.</p>
      </div>
      <div class="problem-cell r" style="--d:120">
        <span class="problem-num">03</span>
        <div class="problem-icon">📷</div>
        <h3 class="problem-title">Custo alto de fotografia</h3>
        <p class="problem-body">Ensaios profissionais são caros, lentos e inescaláveis para catálogos grandes. Cada novo produto exige nova produção.</p>
      </div>
      <div class="problem-cell r" style="--d:160">
        <span class="problem-num">04</span>
        <div class="problem-icon">◈</div>
        <h3 class="problem-title">Dados superficiais</h3>
        <p class="problem-body">Cliques e vendas não revelam intenção. Você não sabe o que o cliente queria — só o que ele comprou ou não comprou.</p>
      </div>
    </div>
  </div>
</section>


<!-- ═══════════════ SOLUTION INTRO ═══════════════ -->
<section class="sec" id="features" style="border-bottom:none;padding-bottom:0">
  <div class="wrap">
    <p class="eyebrow r">A Solução</p>
    <div class="solution-intro">
      <div>
        <h2 class="display r" style="--d:60">Quatro reflexos.<br>Uma plataforma.</h2>
        <p class="editorial r" style="--d:120;margin-top:20px">Reflexy resolve simultaneamente o que nenhuma outra solução resolve: experiência visual, produção de imagem e inteligência comportamental.</p>
        <p class="body-text r" style="--d:160;margin-top:20px">Como a luz que atravessa uma gema se fragmenta em facetas distintas, Reflexy transforma cada interação do cliente em quatro camadas de inteligência — cada uma mais profunda que a anterior.</p>
        <div style="margin-top:32px;display:flex;flex-direction:column;gap:10px" class="r" style="--d:200">
          <div style="display:flex;align-items:center;gap:12px;font-family:var(--f-m);font-size:11px;color:var(--dusk);letter-spacing:.12em">
            <span style="color:var(--verdigris)">01</span> Reflexo Visual — Virtual Try-On
          </div>
          <div style="display:flex;align-items:center;gap:12px;font-family:var(--f-m);font-size:11px;color:var(--dusk);letter-spacing:.12em">
            <span style="color:var(--verdigris)">02</span> Reflexo do Produto — Studio Pro
          </div>
          <div style="display:flex;align-items:center;gap:12px;font-family:var(--f-m);font-size:11px;color:var(--dusk);letter-spacing:.12em">
            <span style="color:var(--verdigris)">03</span> Reflexo Comportamental — Analytics
          </div>
          <div style="display:flex;align-items:center;gap:12px;font-family:var(--f-m);font-size:11px;color:var(--dusk);letter-spacing:.12em">
            <span style="color:var(--verdigris)">04</span> Reflexo Estratégico — Dashboard
          </div>
        </div>
      </div>
      <!-- Large gem centered -->
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative">
        <div style="position:absolute;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(43,18,80,.4) 0%,transparent 70%);pointer-events:none;animation:glowB 8s ease-in-out infinite"></div>
        <svg width="200" height="200" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="r" style="--d:0;filter:drop-shadow(0 0 28px rgba(112,80,160,.6)) drop-shadow(0 0 64px rgba(43,18,80,.4));animation:gemS 90s linear infinite">
          <defs>
            <linearGradient id="sF1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#C4B8E4" stop-opacity=".9"/><stop offset="100%" stop-color="#7050A0" stop-opacity=".7"/></linearGradient>
            <linearGradient id="sF4" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D0C4EC" stop-opacity=".8"/><stop offset="100%" stop-color="#5A38A0" stop-opacity=".6"/></linearGradient>
            <linearGradient id="sF2" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#B8AEDD" stop-opacity=".7"/><stop offset="100%" stop-color="#4A2880" stop-opacity=".55"/></linearGradient>
            <linearGradient id="sF3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9070C0" stop-opacity=".55"/><stop offset="100%" stop-color="#2B1250" stop-opacity=".8"/></linearGradient>
            <linearGradient id="sTbl" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E8E2F8" stop-opacity=".95"/><stop offset="100%" stop-color="#B090D8" stop-opacity=".8"/></linearGradient>
            <linearGradient id="sP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0CC89E" stop-opacity=".38"/><stop offset="100%" stop-color="#0CC89E" stop-opacity=".05"/></linearGradient>
            <linearGradient id="sStr" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#C4B8E4" stop-opacity=".55"/><stop offset="100%" stop-color="#7050A0" stop-opacity=".2"/></linearGradient>
            <filter id="sGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <clipPath id="sClip"><polygon points="50,3 97,50 50,97 3,50"/></clipPath>
            <linearGradient id="sCaustic" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="white" stop-opacity="0"/><stop offset="42%" stop-color="white" stop-opacity="0"/><stop offset="50%" stop-color="white" stop-opacity=".15"/><stop offset="58%" stop-color="white" stop-opacity="0"/><stop offset="100%" stop-color="white" stop-opacity="0"/></linearGradient>
          </defs>
          <polygon points="50,78 28,50 3,50 50,97" fill="url(#sP)" opacity=".8"/>
          <polygon points="50,78 72,50 97,50 50,97" fill="url(#sP)" opacity=".7"/>
          <polygon points="50,22 28,50 3,50 50,3" fill="url(#sF1)"/>
          <polygon points="50,22 72,50 97,50 50,3" fill="url(#sF4)"/>
          <polygon points="3,50 50,22 28,50" fill="url(#sF2)"/>
          <polygon points="97,50 50,22 72,50" fill="url(#sF3)"/>
          <polygon points="50,22 72,50 50,78 28,50" fill="url(#sTbl)" filter="url(#sGlow)"/>
          <circle cx="50" cy="50" r="3" fill="#EDE8F6" opacity=".95" filter="url(#sGlow)"/>
          <polygon points="50,3 97,50 50,97 3,50" fill="none" stroke="url(#sStr)" stroke-width=".45"/>
          <polygon points="50,22 72,50 50,78 28,50" fill="none" stroke="#C4B8E4" stroke-width=".4" opacity=".22"/>
          <line x1="50" y1="3" x2="50" y2="22" stroke="#C4B8E4" stroke-width=".4" opacity=".4"/>
          <line x1="50" y1="22" x2="28" y2="50" stroke="#C4B8E4" stroke-width=".3" opacity=".25"/>
          <line x1="50" y1="22" x2="72" y2="50" stroke="#C4B8E4" stroke-width=".3" opacity=".25"/>
          <line x1="50" y1="78" x2="28" y2="50" stroke="#0CC89E" stroke-width=".28" opacity=".2"/>
          <line x1="50" y1="78" x2="72" y2="50" stroke="#0CC89E" stroke-width=".28" opacity=".2"/>
          <g clip-path="url(#sClip)">
            <rect x="-110" y="0" width="220" height="100" fill="url(#sCaustic)">
              <animateTransform attributeName="transform" type="translate" values="-40,0;140,0;140,0;-40,0" keyTimes="0;0.38;1;1" dur="9s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0 0 1 1;0 0 1 1"/>
            </rect>
          </g>
          <!-- 4 refraction rays from nucleus downward -->
          <line x1="50" y1="52" x2="28" y2="90" stroke="#0CC89E" stroke-width=".5" opacity=".25"/>
          <line x1="50" y1="52" x2="38" y2="94" stroke="#B8AEDD" stroke-width=".4" opacity=".2"/>
          <line x1="50" y1="52" x2="62" y2="94" stroke="#B8AEDD" stroke-width=".4" opacity=".2"/>
          <line x1="50" y1="52" x2="72" y2="90" stroke="#0CC89E" stroke-width=".5" opacity=".25"/>
        </svg>
        <!-- axis line -->
        <div style="width:200px;height:1px;background:linear-gradient(to right,transparent,rgba(184,174,221,.18) 15%,rgba(184,174,221,.55) 35%,rgba(12,200,158,.7) 50%,rgba(184,174,221,.55) 65%,rgba(184,174,221,.18) 85%,transparent);margin:-1px 0;opacity:.5"></div>
      </div>
    </div>
  </div>
</section>


<!-- ═══════════════ REFLECTION 01 ═══════════════ -->
<section style="border-bottom:1px solid var(--rule);overflow:hidden">
  <div class="wrap">
    <div class="reflection two-col">
      <div class="r" style="--d:0">
        <div class="ref-num">Faceta 01 / 04</div>
        <div class="ref-label">Reflexo Visual</div>
        <h2 class="ref-title">Provador Virtual com IA</h2>
        <p class="ref-editorial">"Seu cliente se vê usando a peça antes de comprar."</p>
        <p class="ref-body">Em até 15 segundos, uma simulação hiper-realista gerada por IA elimina a dúvida e aumenta a confiança na decisão de compra. O cliente faz upload de uma foto e vê a peça em si mesmo — com precisão de fit, cor e caimento.</p>
        <div class="ref-checks">
          <div class="ref-check"><div class="ref-check-dot"></div>Geração em até 15 segundos</div>
          <div class="ref-check"><div class="ref-check-dot"></div>Funciona com qualquer peça do catálogo</div>
          <div class="ref-check"><div class="ref-check-dot"></div>Reduz devoluções por insegurança de fit</div>
          <div class="ref-check"><div class="ref-check-dot"></div>Diferenciação competitiva imediata</div>
        </div>
      </div>
      <div class="ref-panel tryon-panel r" style="--d:100">
        <div class="panel-eyebrow">Virtual Try-On · reflexy_visual_01</div>
        <div class="panel-title">Simulação ao vivo</div>
        <div style="flex:1;display:flex;flex-direction:column;gap:16px;justify-content:center">
          <div style="padding:16px;background:rgba(43,18,80,.35);border:1px solid rgba(184,174,221,.12);border-radius:1px">
            <div style="font-family:var(--f-m);font-size:10px;color:var(--dusk);letter-spacing:.15em;margin-bottom:10px">UPLOAD → GERAÇÃO</div>
            <div class="mock-bar"><div class="mock-bar-fill" style="--w:82%"></div></div>
            <div style="display:flex;justify-content:space-between;margin-top:6px;font-family:var(--f-m);font-size:10px;color:var(--dusk)"><span>processando...</span><span style="color:var(--verdigris)">~15s</span></div>
          </div>
          <div class="mock-stat">
            <span class="stat-big v">+38%</span>
            <span class="stat-unit">conversão · benchmark setor*</span>
          </div>
          <div class="mock-stat">
            <span class="stat-big">2.4K</span>
            <span class="stat-unit">provas / dia</span>
          </div>
        </div>
        <div style="height:1px;background:linear-gradient(to right,var(--verdigris),transparent);opacity:.25"></div>
        <div style="font-family:var(--f-m);font-size:10px;color:var(--verdigris);letter-spacing:.15em">● LIVE — shopify integration active</div>
      </div>
    </div>
  </div>
</section>


<!-- ═══════════════ REFLECTION 02 ═══════════════ -->
<section style="border-bottom:1px solid var(--rule);overflow:hidden;background:var(--onyx)">
  <div class="wrap">
    <div class="reflection two-col reversed">
      <div class="r" style="--d:0">
        <div class="ref-num">Faceta 02 / 04</div>
        <div class="ref-label">Reflexo do Produto</div>
        <h2 class="ref-title">Studio Pro — Imagens 4K com IA</h2>
        <p class="ref-editorial">"Transforme qualquer peça em imagem profissional — sem ensaio fotográfico."</p>
        <p class="ref-body">Ideal para dropshipping, lançamentos rápidos e escala de produção de criativos. Gere imagens 4K sem modelo, sem estúdio e sem custo fixo — em até 60 segundos. Pronto para ads, e-commerce e campanhas.</p>
        <div class="ref-checks">
          <div class="ref-check"><div class="ref-check-dot"></div>Imagens hiper-realistas em 4K</div>
          <div class="ref-check"><div class="ref-check-dot"></div>Geração em até 60 segundos</div>
          <div class="ref-check"><div class="ref-check-dot"></div>Sem modelo, sem estúdio, sem custo fixo</div>
          <div class="ref-check"><div class="ref-check-dot"></div>Escala ilimitada de produção</div>
          <div class="ref-check"><div class="ref-check-dot"></div>Pronto para ads, e-commerce e campanhas</div>
        </div>
      </div>
      <div class="ref-panel studio-panel r" style="--d:100">
        <div class="panel-eyebrow">Studio Pro · reflexy_product_02</div>
        <div class="panel-title">Geração de imagem</div>
        <div class="mock-grid">
          <div class="mock-cell hi">4K</div>
          <div class="mock-cell">pronto</div>
          <div class="mock-cell hi">ADV</div>
          <div class="mock-cell">pronto</div>
          <div class="mock-cell hi">CAT</div>
          <div class="mock-cell">pronto</div>
          <div class="mock-cell">—</div>
          <div class="mock-cell hi">ADS</div>
          <div class="mock-cell">pronto</div>
        </div>
        <div class="mock-stat" style="margin-top:8px">
          <span class="stat-big v" style="font-size:clamp(20px,2.5vw,28px)">4.2K</span>
          <span class="stat-unit">imgs / mês</span>
        </div>
        <div style="height:1px;background:linear-gradient(to right,var(--verdigris),transparent);opacity:.2"></div>
        <div style="font-family:var(--f-m);font-size:10px;color:var(--dusk);letter-spacing:.15em">zero custo fixo · até 60s por imagem</div>
      </div>
    </div>
  </div>
</section>


<!-- ═══════════════ REFLECTION 03 ═══════════════ -->
<section style="border-bottom:1px solid var(--rule);overflow:hidden">
  <div class="wrap">
    <div class="reflection two-col">
      <div class="r" style="--d:0">
        <div class="ref-num">Faceta 03 / 04</div>
        <div class="ref-label">Reflexo Comportamental</div>
        <h2 class="ref-title">Analytics de Intenção</h2>
        <p class="ref-editorial">"O que o cliente prova, hesita, abandona — tudo vira inteligência."</p>
        <p class="ref-body">Reflexy captura o que nenhuma métrica tradicional captura: o comportamento real durante a jornada de prova. Quais peças foram mais experimentadas, quanto tempo o cliente interagiu com cada SKU, onde a hesitação aconteceu — e quais tamanhos geraram intenção real de compra.</p>
        <div class="ref-checks">
          <div class="ref-check"><div class="ref-check-dot"></div>Peças mais provadas por produto e por SKU</div>
          <div class="ref-check"><div class="ref-check-dot"></div>Tamanhos com maior engajamento e abandono</div>
          <div class="ref-check"><div class="ref-check-dot"></div>Detecção de hesitação — tempo de consideração por sessão</div>
          <div class="ref-check"><div class="ref-check-dot"></div>Sinal de intenção de compra — rastreamento de add_to_cart</div>
          <div class="ref-check"><div class="ref-check-dot"></div>Dados anonimizados — LGPD e GDPR</div>
        </div>
      </div>
      <div class="ref-panel analytics-panel r" style="--d:100">
        <div class="panel-eyebrow">Analytics · reflexy_intent_03</div>
        <div class="panel-title">Dados de intenção</div>
        <div class="mock-chart">
          <div class="bar-c" style="--bi:0;height:45%"></div>
          <div class="bar-c active" style="--bi:1;height:82%"></div>
          <div class="bar-c" style="--bi:2;height:38%"></div>
          <div class="bar-c active" style="--bi:3;height:91%"></div>
          <div class="bar-c data" style="--bi:4;height:65%"></div>
          <div class="bar-c" style="--bi:5;height:28%"></div>
          <div class="bar-c data" style="--bi:6;height:74%"></div>
          <div class="bar-c active" style="--bi:7;height:88%"></div>
        </div>
        <div class="mock-timeline">
          <div class="tl-row"><div class="tl-dot done"></div><span class="tl-label">Prova iniciada</span><span class="tl-val">2.4K / dia</span></div>
          <div class="tl-row"><div class="tl-dot done"></div><span class="tl-label">Adicionou ao carrinho</span><span class="tl-val">38.2%</span></div>
          <div class="tl-row"><div class="tl-dot done"></div><span class="tl-label">Hesitação detectada</span><span class="tl-val">21.7%</span></div>
          <div class="tl-row"><div class="tl-dot pend"></div><span class="tl-label">Abandono pós-prova</span><span class="tl-val" style="color:rgba(255,120,120,.7)">14.1%</span></div>
        </div>
      </div>
    </div>
  </div>
</section>


<!-- ═══════════════ REFLECTION 04 ═══════════════ -->
<section style="border-bottom:1px solid var(--rule);overflow:hidden;background:var(--onyx)">
  <div class="wrap">
    <div class="reflection two-col reversed">
      <div class="r" style="--d:0">
        <div class="ref-num">Faceta 04 / 04</div>
        <div class="ref-label">Reflexo Estratégico</div>
        <h2 class="ref-title">Clareza para Decisões</h2>
        <p class="ref-editorial">"Não apenas o que vendeu. O que foi provado, considerado — e onde a decisão foi tomada."</p>
        <p class="ref-body">Com os quatro reflexos integrados, você enxerga o funil completo: da prova ao carrinho, do carrinho à compra. Sessões com provador comparadas às sem provador. Produtos com alta prova e baixa conversão revelam exatamente onde a decisão trava.</p>
        <div class="ref-checks">
          <div class="ref-check"><div class="ref-check-dot"></div>Funil completo — prova → carrinho → compra por produto</div>
          <div class="ref-check"><div class="ref-check-dot"></div>Impacto do provador nas vendas — lift mensurável</div>
          <div class="ref-check"><div class="ref-check-dot"></div>Sessões com provador vs. sem provador</div>
          <div class="ref-check"><div class="ref-check-dot"></div>Jornada de cada sessão reconstruída</div>
        </div>
      </div>
      <div class="ref-panel r" style="--d:100">
        <div class="panel-eyebrow">Dashboard · reflexy_strategy_04</div>
        <div class="panel-title">Visão consolidada</div>
        <div style="display:flex;flex-direction:column;gap:14px;flex:1;justify-content:center">
          <div style="padding:14px 16px;background:rgba(43,18,80,.4);border:1px solid rgba(184,174,221,.1)">
            <div style="font-family:var(--f-m);font-size:10px;color:var(--verdigris);letter-spacing:.15em;margin-bottom:6px">FUNIL PROVADOR → COMPRA</div>
            <div style="font-family:var(--f-d);font-weight:600;font-size:14px;color:var(--mist)">Vestido Floral · ref. 0291</div>
            <div style="font-size:12px;color:var(--dusk);margin-top:4px">342 provas · 118 add_to_cart (34%) · 67 compras (19%)</div>
          </div>
          <div style="padding:14px 16px;background:rgba(43,18,80,.4);border:1px solid rgba(184,174,221,.1)">
            <div style="font-family:var(--f-m);font-size:10px;color:var(--lavender);letter-spacing:.15em;margin-bottom:6px">IMPACTO DO PROVADOR</div>
            <div style="font-family:var(--f-d);font-weight:600;font-size:14px;color:var(--mist)">Sessões com prova vs. sem prova</div>
            <div style="font-size:12px;color:var(--dusk);margin-top:4px">Conversão com provador: 19% · Sem provador: 2.4%</div>
          </div>
          <div class="mock-stat">
            <span class="stat-big v">2.4K</span>
            <span class="stat-unit">sessões de prova / dia</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


<!-- ═══════════════ HOW IT WORKS ═══════════════ -->
<section class="sec" id="how">
  <div class="wrap">
    <p class="eyebrow r">Como Funciona</p>
    <h2 class="display r" style="--d:60">Instale uma vez.<br>Funciona para sempre.</h2>
    <p class="editorial r" style="--d:100;margin-top:12px">Instalação simples e direta no Shopify. Em menos de 5 minutos, sua loja já está pronta.</p>

    <div class="steps-grid">
      <div class="step r" style="--d:0">
        <div class="step-connector"></div>
        <div class="step-num">Passo 01</div>
        <div class="step-icon">⬡</div>
        <h3 class="step-title">Instale o plugin</h3>
        <p class="step-body">Adicione o Reflexy à sua loja Shopify em menos de 5 minutos diretamente pela App Store. A instalação é simples e acompanhada de um guia passo a passo.</p>
      </div>
      <div class="step r" style="--d:80">
        <div class="step-connector"></div>
        <div class="step-num">Passo 02</div>
        <div class="step-icon">◈</div>
        <h3 class="step-title">Ative o provador</h3>
        <p class="step-body">O botão "Experimentar" aparece automaticamente nas páginas de produto. Seus clientes já podem usar — sem nenhuma ação adicional.</p>
      </div>
      <div class="step r" style="--d:160">
        <div class="step-num">Passo 03</div>
        <div class="step-icon">▣</div>
        <h3 class="step-title">Acompanhe os dados</h3>
        <p class="step-body">Acesse o dashboard e veja em tempo real como seus clientes interagem com cada peça. Inteligência disponível nas primeiras horas.</p>
      </div>
    </div>
  </div>
</section>


<!-- ═══════════════ COMPETITIVE ═══════════════ -->
<section class="sec" style="background:var(--onyx)">
  <div class="wrap">
    <p class="eyebrow r">Vantagem Competitiva</p>
    <h2 class="display r" style="--d:60">A maioria resolve uma camada.<br>Reflexy resolve três.</h2>

    <div class="rf" style="--d:120;overflow-x:auto">
      <table class="comp-table">
        <thead>
          <tr>
            <th>Funcionalidade</th>
            <th class="ours">Reflexy</th>
            <th>Concorrentes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Provador virtual com IA</td>
            <td class="ours"><span class="tick-yes">✓</span></td>
            <td><span class="tick-yes">✓</span></td>
          </tr>
          <tr>
            <td>Geração de imagens profissionais 4K</td>
            <td class="ours"><span class="tick-yes">✓</span></td>
            <td><span class="tick-no">✗</span></td>
          </tr>
          <tr>
            <td>Analytics comportamental proprietário</td>
            <td class="ours"><span class="tick-yes">✓</span></td>
            <td><span class="tick-no">✗</span></td>
          </tr>
          <tr>
            <td>Dados de intenção de compra</td>
            <td class="ours"><span class="tick-yes">✓</span></td>
            <td><span class="tick-no">✗</span></td>
          </tr>
          <tr>
            <td>Dashboard unificado</td>
            <td class="ours"><span class="tick-yes">✓</span></td>
            <td><span class="tick-no">✗</span></td>
          </tr>
          <tr>
            <td>Integração nativa Shopify</td>
            <td class="ours"><span class="tick-yes">✓</span></td>
            <td><span class="tick-part">Parcial</span></td>
          </tr>
          <tr>
            <td>Modelo de dados proprietário</td>
            <td class="ours"><span class="tick-yes">✓</span></td>
            <td><span class="tick-no">✗</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>


<!-- ═══════════════ PROOF ═══════════════ -->
<section class="sec">
  <div class="wrap">
    <p class="eyebrow r">Resultados</p>
    <h2 class="display r" style="--d:60">Números que<br>falam por si.</h2>

    <div class="proof-grid">
      <div class="proof-cell r" style="--d:0">
        <div class="proof-number">+<span>38%</span></div>
        <div class="proof-label">Aumento médio em conversão*</div>
        <p class="proof-desc">Benchmark do setor de e-commerce de moda com provadores virtuais. O Reflexy foi desenhado para entregar essa transformação na sua operação.</p>
      </div>
      <div class="proof-cell r" style="--d:80">
        <div class="proof-number">−<span>52%</span></div>
        <div class="proof-label">Redução em devoluções*</div>
        <p class="proof-desc">Clientes que provam antes de comprar devolvem menos. Benchmark consolidado de lojas de moda que adotaram provadores virtuais com IA.</p>
      </div>
      <div class="proof-cell r" style="--d:120">
        <div class="proof-number" style="font-family:var(--f-m);font-weight:400;color:var(--verdigris)">&lt; 15<span style="font-size:.5em;color:var(--dusk)">s</span></div>
        <div class="proof-label">Tempo de geração confirmado</div>
        <p class="proof-desc">O provador opera no modo balanced — resultado hiper-realista entregue em até 15 segundos. Rápido o suficiente para não interromper a decisão de compra.</p>
      </div>
      <div class="proof-cell r" style="--d:160">
        <div class="proof-number" style="font-family:var(--f-m);font-weight:400;color:var(--verdigris)">4K</div>
        <div class="proof-label">Resolução Studio Pro confirmada</div>
        <p class="proof-desc">O Studio Pro opera no modo tryon-max — imagens profissionais em alta resolução, em até 60 segundos. Pronto para ads, catálogos e campanhas.</p>
      </div>
    </div>

    <div class="quote-block rf" style="--d:200">
      <span class="quote-mark">"</span>
      <p class="quote-text">Os dados de analytics me mostraram que minha peça mais provada não era a mais vendida. Isso me fez repensar preço e descrição do produto. Vendi 3× mais no mês seguinte.</p>
      <div class="quote-attr">Lojista de moda feminina · São Paulo · 90 dias de uso</div>
    </div>
  </div>
</section>


<!-- ═══════════════ PRICING ═══════════════ -->
<section class="sec" id="pricing" style="background:var(--onyx)">
  <div class="wrap">
    <p class="eyebrow r">Planos</p>
    <h2 class="display r" style="--d:60">Do primeiro teste<br>à escala real.</h2>
    <p class="editorial r" style="--d:100;margin-top:12px">Três planos. Um caminho claro.</p>

    <!-- SECTION 1: FREE ENTRY -->
    <div class="free-entry r" style="--d:140">
      <div class="free-entry-left">
        <div class="free-entry-title">Instale e veja o Reflexy na sua loja</div>
        <div class="free-entry-desc">10 try-ons reais por mês. Experiência completa do provador — sem assinatura.</div>
        <div class="free-entry-note">Marca Reflexy visível</div>
      </div>
      <a href="#" class="btn-g" style="white-space:nowrap;flex-shrink:0">Instalar agora</a>
    </div>

    <!-- SECTION 2: 3-PLAN TABLE -->
    <div class="pricing-grid rf" style="--d:180">

      <div class="plan">
        <div class="plan-badge">Starter</div>
        <div class="plan-name">Starter</div>
        <div class="plan-tagline">Para lojas que estão começando.</div>
        <div class="plan-price-row">
          <span class="plan-currency">$</span>
          <span class="plan-price">19</span>
        </div>
        <div class="plan-period">por mês</div>
        <div class="plan-value">&nbsp;</div>
        <div class="plan-div"></div>
        <div class="plan-features">
          <div class="plan-feat"><div class="plan-feat-dot"></div>100 try-ons por mês</div>
          <div class="plan-feat"><div class="plan-feat-dot"></div>5 renders Studio Pro/mês</div>
          <div class="plan-feat"><div class="plan-feat-dot"></div>Peças mais provadas por SKU</div>
          <div class="plan-feat"><div class="plan-feat-dot"></div>Tempo médio de interação por produto</div>
          <div class="plan-feat"><div class="plan-feat-dot"></div>Suporte padrão</div>
        </div>
        <a href="#" class="plan-cta ghost">Assinar Starter</a>
      </div>

      <div class="plan featured">
        <div class="plan-badge">A escolha mais equilibrada</div>
        <div class="plan-name">Growth</div>
        <div class="plan-tagline">Para e-commerces em crescimento.</div>
        <div class="plan-price-row">
          <span class="plan-currency">$</span>
          <span class="plan-price">39</span>
        </div>
        <div class="plan-period">por mês</div>
        <div class="plan-value">&nbsp;</div>
        <div class="plan-div"></div>
        <div class="plan-features">
          <div class="plan-feat"><div class="plan-feat-dot"></div>300 try-ons por mês</div>
          <div class="plan-feat"><div class="plan-feat-dot"></div>10 renders Studio Pro/mês</div>
          <div class="plan-feat"><div class="plan-feat-dot"></div>Hesitação e abandono por produto</div>
          <div class="plan-feat"><div class="plan-feat-dot"></div>Analytics de tamanhos — engajamento por variante</div>
          <div class="plan-feat"><div class="plan-feat-dot"></div>Rastreamento de intenção de compra</div>
          <div class="plan-feat"><div class="plan-feat-dot"></div>Suporte prioritário</div>
        </div>
        <a href="#" class="plan-cta primary">Assinar Growth</a>
      </div>

      <div class="plan">
        <div class="plan-badge">Pro</div>
        <div class="plan-name">Pro</div>
        <div class="plan-tagline">Para equipes que operam em escala.</div>
        <div class="plan-price-row">
          <span class="plan-currency">$</span>
          <span class="plan-price">99</span>
        </div>
        <div class="plan-period">por mês</div>
        <div class="plan-value">&nbsp;</div>
        <div class="plan-div"></div>
        <div class="plan-features">
          <div class="plan-feat"><div class="plan-feat-dot"></div>800 try-ons por mês</div>
          <div class="plan-feat"><div class="plan-feat-dot"></div>20 renders Studio Pro/mês</div>
          <div class="plan-feat"><div class="plan-feat-dot"></div>Funil completo — prova → carrinho → compra</div>
          <div class="plan-feat"><div class="plan-feat-dot"></div>Impacto do provador nas vendas</div>
          <div class="plan-feat"><div class="plan-feat-dot"></div>Jornada de sessão completa por produto</div>
          <div class="plan-feat"><div class="plan-feat-dot"></div>Suporte prioritário</div>
        </div>
        <a href="#" class="plan-cta ghost">Assinar Pro</a>
      </div>

    </div>

    <!-- SECTION 3: PAY-AS-YOU-GO -->
    <div class="payg-row rf" style="--d:220">
      <span class="payg-label">Uso adicional sob demanda</span>
      <div class="payg-trigger">
        ?
        <div class="payg-tooltip">
          <div class="tooltip-title">Excedente por plano</div>
          <div class="tooltip-row">
            <span class="tooltip-plan">Try-on · Starter</span>
            <span class="tooltip-price">$0.17 / prova</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-plan">Try-on · Growth</span>
            <span class="tooltip-price">$0.15 / prova</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-plan">Try-on · Pro</span>
            <span class="tooltip-price">$0.13 / prova</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-plan">Try-on · Enterprise</span>
            <span class="tooltip-price">$0.10 / prova</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-plan">Studio Pro · todos os planos</span>
            <span class="tooltip-price" style="color:var(--verdigris)">$0.15 / render</span>
          </div>
          <div class="tooltip-note">Uso adicional cobrado apenas quando o limite mensal é excedido.</div>
        </div>
      </div>
      <span style="font-family:var(--f-m);font-size:10px;color:rgba(160,156,192,.4);letter-spacing:.1em">— cobrado apenas quando necessário</span>
    </div>

    <!-- SECTION 4: ENTERPRISE -->
    <div class="enterprise-block rf" style="--d:260">
      <div>
        <div class="ent-label">Enterprise</div>
        <h3 class="ent-title">Para operações de alto volume.</h3>
        <p class="ent-desc">Stack completo de analytics, limites flexíveis e suporte dedicado para operações de moda que exigem escala real e dados de conversão em produção.</p>
        <div class="ent-feats">
          <div class="ent-feat"><div class="ent-feat-dot"></div>1.000+ try-ons / mês</div>
          <div class="ent-feat"><div class="ent-feat-dot"></div>20 renders Studio Pro</div>
          <div class="ent-feat"><div class="ent-feat-dot"></div>Funil de conversão completo</div>
          <div class="ent-feat"><div class="ent-feat-dot"></div>Impacto do provador nas vendas</div>
          <div class="ent-feat"><div class="ent-feat-dot"></div>Integrações customizadas</div>
          <div class="ent-feat"><div class="ent-feat-dot"></div>Suporte dedicado</div>
          <div class="ent-feat"><div class="ent-feat-dot"></div>Limites flexíveis</div>
        </div>
      </div>
      <a href="/cdn-cgi/l/email-protection#48202d242427083a2d2e242d3031662b27" class="btn-g" style="white-space:nowrap;flex-shrink:0">Falar com vendas</a>
    </div>

  </div>
</section>


<!-- ═══════════════ FAQ ═══════════════ -->
<section class="sec" id="faq">
  <div class="wrap">
    <p class="eyebrow r">FAQ</p>
    <h2 class="display r" style="--d:60">Perguntas frequentes.</h2>

    <div class="faq-list rf" style="--d:120">

      <div class="faq-item">
        <button class="faq-q" onclick="toggleFaq(this)">
          Como o Reflexy se integra à minha loja Shopify?
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-a"><p class="faq-body">A instalação é feita diretamente pela Shopify App Store. Após instalar, o plugin se integra ao seu catálogo. O processo é simples, acompanhado de um guia passo a passo, e leva menos de 5 minutos no total.</p></div>
      </div>

      <div class="faq-item">
        <button class="faq-q" onclick="toggleFaq(this)">
          O provador virtual funciona com qualquer tipo de roupa?
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-a"><p class="faq-body">Sim. O sistema funciona com peças femininas, masculinas, acessórios e calçados. A IA é treinada para lidar com diferentes texturas, estampas e tipos de caimento. Para melhores resultados, recomendamos imagens do produto em fundo neutro com boa iluminação.</p></div>
      </div>

      <div class="faq-item">
        <button class="faq-q" onclick="toggleFaq(this)">
          Os dados dos meus clientes são seguros?
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-a"><p class="faq-body">Sim. As fotos enviadas pelos clientes são processadas em tempo real e não são armazenadas em nossos servidores após a geração da simulação. Todos os dados analíticos são anonimizados e agregados. Operamos em conformidade com a LGPD e GDPR.</p></div>
      </div>

      <div class="faq-item">
        <button class="faq-q" onclick="toggleFaq(this)">
          Posso cancelar a qualquer momento?
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-a"><p class="faq-body">Sim. Todos os planos são mensais e podem ser cancelados a qualquer momento diretamente pelo painel da Shopify, sem multa ou burocracia. O acesso continua ativo até o fim do período pago.</p></div>
      </div>

      <div class="faq-item">
        <button class="faq-q" onclick="toggleFaq(this)">
          O que acontece quando esgoto meus créditos?
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-a"><p class="faq-body">Ao atingir 80% do limite mensal, você recebe uma notificação. Ao atingir 100%, uma segunda notificação confirma que as gerações adicionais serão cobradas sob demanda nas tarifas do seu plano — sem interrupção do serviço. Caso haja pendência de pagamento, o acesso às funcionalidades é suspenso após 3 dias de atraso e reativado automaticamente após a confirmação do pagamento.</p></div>
      </div>

      <div class="faq-item">
        <button class="faq-q" onclick="toggleFaq(this)">
          Como funciona o Analytics de Conversão?
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-a"><p class="faq-body">O Reflexy rastreia toda a jornada do cliente na loja: do clique no botão de prova à adição ao carrinho e à compra confirmada. Cada evento é associado a um session_id anônimo, permitindo comparar a taxa de conversão de sessões com provador versus sem provador. Esses dados ficam disponíveis no dashboard por produto, por tamanho e por período — sem nenhuma configuração adicional.</p></div>
      </div>

      <div class="faq-item">
        <button class="faq-q" onclick="toggleFaq(this)">
          O Reflexy funciona em outras plataformas além do Shopify?
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-a"><p class="faq-body">Atualmente o Reflexy é otimizado para Shopify. Integrações com VTEX, WooCommerce e Nuvemshop estão no roadmap para 2025. Se você opera em outra plataforma, entre em contato — avaliamos integrações customizadas para Enterprise.</p></div>
      </div>

    </div>
  </div>
</section>


<!-- ═══════════════ FINAL CTA ═══════════════ -->
<section id="final-cta">
  <div style="position:absolute;width:400px;height:400px;border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(43,18,80,.5) 0%,transparent 70%);pointer-events:none;animation:glowB 8s ease-in-out infinite"></div>

  <svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="r" style="--d:0;filter:drop-shadow(0 0 20px rgba(112,80,160,.55));animation:gemS 90s linear infinite;position:relative;z-index:1">
    <defs>
      <linearGradient id="cF" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#C4B8E4" stop-opacity=".9"/><stop offset="100%" stop-color="#7050A0" stop-opacity=".7"/></linearGradient>
      <linearGradient id="cT" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E8E2F8" stop-opacity=".95"/><stop offset="100%" stop-color="#B090D8" stop-opacity=".8"/></linearGradient>
      <linearGradient id="cP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0CC89E" stop-opacity=".4"/><stop offset="100%" stop-color="#0CC89E" stop-opacity=".05"/></linearGradient>
      <clipPath id="cClip"><polygon points="50,3 97,50 50,97 3,50"/></clipPath>
      <linearGradient id="cCaustic" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="white" stop-opacity="0"/><stop offset="45%" stop-color="white" stop-opacity="0"/><stop offset="50%" stop-color="white" stop-opacity=".2"/><stop offset="55%" stop-color="white" stop-opacity="0"/><stop offset="100%" stop-color="white" stop-opacity="0"/></linearGradient>
    </defs>
    <polygon points="50,78 28,50 3,50 50,97" fill="url(#cP)"/><polygon points="50,78 72,50 97,50 50,97" fill="url(#cP)"/>
    <polygon points="50,22 28,50 3,50 50,3" fill="url(#cF)"/><polygon points="50,22 72,50 97,50 50,3" fill="url(#cF)"/>
    <polygon points="50,22 72,50 50,78 28,50" fill="url(#cT)"/>
    <circle cx="50" cy="50" r="2.5" fill="#EDE8F6" opacity=".95"/>
    <polygon points="50,3 97,50 50,97 3,50" fill="none" stroke="#B8AEDD" stroke-width=".45" opacity=".4"/>
    <line x1="3" y1="50" x2="97" y2="50" stroke="#0CC89E" stroke-width=".4" opacity=".4"/>
    <g clip-path="url(#cClip)">
      <rect x="-110" y="0" width="220" height="100" fill="url(#cCaustic)">
        <animateTransform attributeName="transform" type="translate" values="-40,0;140,0;140,0;-40,0" keyTimes="0;0.38;1;1" dur="9s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0 0 1 1;0 0 1 1"/>
      </rect>
    </g>
  </svg>

  <h2 class="display-xl r" style="--d:80;position:relative;z-index:1;margin-top:32px;max-width:680px">Comece a capturar o reflexo da sua conversão.</h2>
  <p class="cta-kicker r" style="--d:140;position:relative;z-index:1">Instale em minutos. Veja os dados em horas. Tome decisões melhores a partir de hoje.</p>

  <div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-top:44px;position:relative;z-index:1" class="r" style="--d:200">
    <a href="#" class="btn-p">Começar gratuitamente <span style="opacity:.6">→</span></a>
    <a href="/cdn-cgi/l/email-protection#9df5f8f1f1f2ddeff8fbf1f8e5e4b3fef2" class="btn-g">Falar com a equipe</a>
  </div>

  <p class="cta-note r" style="--d:260;position:relative;z-index:1">Instalação simples em menos de 5 minutos · Cancele quando quiser</p>
</section>


<!-- ═══════════════ FOOTER ═══════════════ -->
<footer>
  <div>
    <div class="footer-brand">
      <svg width="22" height="22" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 0 5px rgba(112,80,160,.4))">
        <defs><linearGradient id="ffF" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#C4B8E4" stop-opacity=".9"/><stop offset="100%" stop-color="#7050A0" stop-opacity=".7"/></linearGradient><linearGradient id="ffT" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E8E2F8" stop-opacity=".9"/><stop offset="100%" stop-color="#B090D8" stop-opacity=".8"/></linearGradient><linearGradient id="ffP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0CC89E" stop-opacity=".4"/><stop offset="100%" stop-color="#0CC89E" stop-opacity=".05"/></linearGradient></defs>
        <polygon points="50,22 28,50 3,50 50,3" fill="url(#ffF)"/><polygon points="50,22 72,50 97,50 50,3" fill="url(#ffF)"/>
        <polygon points="50,78 28,50 3,50 50,97" fill="url(#ffP)"/><polygon points="50,78 72,50 97,50 50,97" fill="url(#ffP)"/>
        <polygon points="50,22 72,50 50,78 28,50" fill="url(#ffT)"/>
        <circle cx="50" cy="50" r="2.5" fill="#EDEBF5" opacity=".9"/>
        <line x1="3" y1="50" x2="97" y2="50" stroke="#B8AEDD" stroke-width=".45" opacity=".35"/>
      </svg>
      <span class="footer-wm">REFLEXY</span>
    </div>
    <p class="footer-desc">Inteligência comportamental para e-commerce de moda. Plugin nativo Shopify.</p>
  </div>

  <div class="footer-links">
    <div>
      <p class="footer-col-title">Produto</p>
      <a class="footer-link" href="#features">Provador Virtual</a>
      <a class="footer-link" href="#features">Studio Pro</a>
      <a class="footer-link" href="#features">Analytics</a>
      <a class="footer-link" href="#pricing">Preços</a>
    </div>
    <div>
      <p class="footer-col-title">Empresa</p>
      <a class="footer-link" href="#">Sobre</a>
      <a class="footer-link" href="#">Blog</a>
      <a class="footer-link" href="#">Carreiras</a>
      <a class="footer-link" href="/cdn-cgi/l/email-protection#d6beb3babab996a4b3b0bab3aeaff8b5b9">Contato</a>
    </div>
    <div>
      <p class="footer-col-title">Legal</p>
      <a class="footer-link" href="#">Privacidade</a>
      <a class="footer-link" href="#">Termos de Uso</a>
      <a class="footer-link" href="#">LGPD</a>
    </div>
  </div>

  <div class="footer-bottom">
    <div class="footer-status">
      <div class="status-dot"></div>
      All systems operational
    </div>
    <p class="footer-copy">© 2025 Reflexy. Todos os direitos reservados.</p>
  </div>
</footer>


<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><script>
/* ── FAQ ─────────────────────────────────── */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

/* ── NAV SCROLL ──────────────────────────── */
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  nav.style.background = window.scrollY > 40
    ? 'rgba(6,5,15,.95)'
    : 'rgba(6,5,15,.80)';
}, { passive: true });

/* ── SCROLL REVEAL ───────────────────────── */
(function () {
  const IO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('on');
      IO.unobserve(e.target);
    });
  }, { threshold: 0.10 });

  document.querySelectorAll('.r, .rf, .rl').forEach(el => IO.observe(el));

  /* Hero fires on load */
  const heroEls = document.querySelectorAll('#hero .r, #hero .rf, #hero .rl');
  heroEls.forEach((el, i) => {
    const delay = parseInt(el.style.getPropertyValue('--d') || el.getAttribute('style')?.match(/--d:(\\d+)/)?.[1] || 0);
    setTimeout(() => el.classList.add('on'), delay);
  });
})();
</script>

</body>
</html>`;

export async function GET() {
  return new NextResponse(HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
