// @/components/ui/ReflexGem.tsx

const GEM_CSS = `
  .rfx-gem-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  .rfx-gem-glow {
    position: absolute;
    top: 50%; left: 50%;
    width: 240px; height: 240px;
    border-radius: 50%;
    transform: translate(-50%, -60%);
    pointer-events: none;
    background: radial-gradient(circle, rgba(43,18,80,.55) 0%, transparent 70%);
    animation: rfxGlowB 8s ease-in-out infinite;
  }
  @keyframes rfxGlowB {
    0%,100% { opacity: .7;  transform: translate(-50%,-50%) scale(1);   }
    50%     { opacity: 1;   transform: translate(-50%,-50%) scale(1.1); }
  }
  .rfx-gem {
    display: block;
    position: relative;
    z-index: 2;
    filter:
      drop-shadow(0 0 20px rgba(112,80,160,.55))
      drop-shadow(0 0 52px rgba(43,18,80,.35));
    animation: rfxGemS 90s linear infinite;
  }
  @keyframes rfxGemS {
    0%   { filter: drop-shadow(0 0 20px rgba(112,80,160,.55)) drop-shadow(0 0 52px rgba(43,18,80,.35)); }
    25%  { filter: drop-shadow(0 0 24px rgba(184,174,221,.45)) drop-shadow(0 0 56px rgba(43,18,80,.40)); }
    50%  { filter: drop-shadow(0 0 20px rgba(12,200,158,.28))  drop-shadow(0 0 52px rgba(43,18,80,.35)); }
    75%  { filter: drop-shadow(0 0 22px rgba(112,80,160,.60))  drop-shadow(0 0 54px rgba(43,18,80,.38)); }
    100% { filter: drop-shadow(0 0 20px rgba(112,80,160,.55)) drop-shadow(0 0 52px rgba(43,18,80,.35)); }
  }
  .rfx-axis {
    width: 120px; height: 1px;
    position: relative;
    z-index: 3;
    margin: -1px 0;
    background: linear-gradient(
      to right,
      transparent,
      rgba(184,174,221,.18) 15%,
      rgba(184,174,221,.60) 35%,
      rgba(12,200,158,.75)  50%,
      rgba(184,174,221,.60) 65%,
      rgba(184,174,221,.18) 85%,
      transparent
    );
  }
  .rfx-axis::before, .rfx-axis::after {
    content: ''; position: absolute;
    top: 50%; transform: translateY(-50%);
    width: 3px; height: 3px; border-radius: 50%;
  }
  .rfx-axis::before { left: 24%;  background: #B8AEDD; box-shadow: 0 0 4px #B8AEDD; }
  .rfx-axis::after  { right: 24%; background: #0CC89E; box-shadow: 0 0 4px #0CC89E; }
  .rfx-reflection {
    display: block;
    transform: scaleY(-1);
    margin-top: 1px;
    -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,.35) 0%, transparent 62%);
            mask-image: linear-gradient(to bottom, rgba(0,0,0,.35) 0%, transparent 62%);
    animation: rfxPavP 8s ease-in-out infinite;
    filter: drop-shadow(0 0 8px rgba(12,200,158,.18));
  }
  @keyframes rfxPavP {
    0%,100% { opacity: .7; }
    50%     { opacity: .9; }
  }
  @media (prefers-reduced-motion: reduce) {
    .rfx-gem-glow, .rfx-gem, .rfx-reflection { animation: none !important; }
  }
`

interface ReflexGemProps {
  size?: number
  uid: string
}

export default function ReflexGem({ size = 64, uid }: ReflexGemProps) {
  const id = (base: string) => `${base}-${uid}`

  return (
    <>
      <style>{GEM_CSS}</style>
      <div className="rfx-gem-wrap">

        <div className="rfx-gem-glow" />

        <svg
          className="rfx-gem"
          width={size} height={size}
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={id('hF1')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#C4B8E4" stopOpacity=".90"/>
              <stop offset="100%" stopColor="#7050A0" stopOpacity=".70"/>
            </linearGradient>
            <linearGradient id={id('hF2')} x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#B8AEDD" stopOpacity=".70"/>
              <stop offset="100%" stopColor="#4A2880" stopOpacity=".55"/>
            </linearGradient>
            <linearGradient id={id('hF3')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#9070C0" stopOpacity=".55"/>
              <stop offset="100%" stopColor="#2B1250" stopOpacity=".80"/>
            </linearGradient>
            <linearGradient id={id('hF4')} x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#D0C4EC" stopOpacity=".80"/>
              <stop offset="100%" stopColor="#5A38A0" stopOpacity=".60"/>
            </linearGradient>
            <linearGradient id={id('hTbl')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#E8E2F8" stopOpacity=".95"/>
              <stop offset="100%" stopColor="#B090D8" stopOpacity=".80"/>
            </linearGradient>
            <linearGradient id={id('hP1')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#0CC89E" stopOpacity=".38"/>
              <stop offset="100%" stopColor="#0CC89E" stopOpacity=".05"/>
            </linearGradient>
            <linearGradient id={id('hP2')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#7ADAC8" stopOpacity=".25"/>
              <stop offset="100%" stopColor="#0CC89E" stopOpacity=".03"/>
            </linearGradient>
            <linearGradient id={id('hStr')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#C4B8E4" stopOpacity=".55"/>
              <stop offset="50%"  stopColor="#B8AEDD" stopOpacity=".35"/>
              <stop offset="100%" stopColor="#7050A0" stopOpacity=".25"/>
            </linearGradient>
            <linearGradient id={id('hCaustic')} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="white" stopOpacity="0"/>
              <stop offset="42%"  stopColor="white" stopOpacity="0"/>
              <stop offset="50%"  stopColor="white" stopOpacity=".18"/>
              <stop offset="58%"  stopColor="white" stopOpacity="0"/>
              <stop offset="100%" stopColor="white" stopOpacity="0"/>
            </linearGradient>
            <filter id={id('hGlow')} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="b"/>
              <feMerge>
                <feMergeNode in="b"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <clipPath id={id('hClip')}>
              <polygon points="50,3 97,50 50,97 3,50"/>
            </clipPath>
          </defs>

          <polygon points="50,78 28,50  3,50 50,97" fill={`url(#${id('hP1')})`} opacity=".80"/>
          <polygon points="50,78 72,50 97,50 50,97" fill={`url(#${id('hP2')})`} opacity=".80"/>
          <polygon points="50,22 28,50  3,50 50,3" fill={`url(#${id('hF1')})`}/>
          <polygon points="50,22 72,50 97,50 50,3" fill={`url(#${id('hF4')})`}/>
          <polygon points=" 3,50 50,22 28,50"      fill={`url(#${id('hF2')})`}/>
          <polygon points="97,50 50,22 72,50"      fill={`url(#${id('hF3')})`}/>
          <polygon points="50,22 72,50 50,78 28,50" fill={`url(#${id('hTbl')})`} filter={`url(#${id('hGlow')})`}/>
          <circle cx="50" cy="50" r="2.5" fill="#EDE8F6" opacity=".95" filter={`url(#${id('hGlow')})`}/>
          <polygon points="50,3 97,50 50,97 3,50"   fill="none" stroke={`url(#${id('hStr')})`} strokeWidth=".45"/>
          <polygon points="50,22 72,50 50,78 28,50" fill="none" stroke="#C4B8E4" strokeWidth=".4" opacity=".25"/>
          <line x1="50" y1="3"  x2="50" y2="22" stroke="#C4B8E4" strokeWidth=".35" opacity=".45"/>
          <line x1=" 3" y1="50" x2="28" y2="50" stroke="#C4B8E4" strokeWidth=".35" opacity=".35"/>
          <line x1="97" y1="50" x2="72" y2="50" stroke="#C4B8E4" strokeWidth=".35" opacity=".35"/>
          <line x1="50" y1="22" x2="28" y2="50" stroke="#C4B8E4" strokeWidth=".30" opacity=".28"/>
          <line x1="50" y1="22" x2="72" y2="50" stroke="#C4B8E4" strokeWidth=".30" opacity=".28"/>
          <line x1="50" y1="78" x2="28" y2="50" stroke="#0CC89E" strokeWidth=".25" opacity=".22"/>
          <line x1="50" y1="78" x2="72" y2="50" stroke="#0CC89E" strokeWidth=".25" opacity=".22"/>

          <g clipPath={`url(#${id('hClip')})`}>
            <rect x="-110" y="0" width="220" height="100" fill={`url(#${id('hCaustic')})`}>
              <animateTransform
                attributeName="transform" type="translate"
                values="-40,0;140,0;140,0;-40,0"
                keyTimes="0;0.38;1;1"
                dur="9s" repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0 0 1 1;0 0 1 1"
              />
            </rect>
            <rect x="-110" y="50" width="220" height="50" opacity="0">
              <animate attributeName="fill" values="#7ADAC8;#7ADAC8" dur="9s" repeatCount="indefinite"/>
              <animateTransform
                attributeName="transform" type="translate"
                values="-40,0;140,0;140,0;-40,0"
                keyTimes="0;0.38;1;1"
                dur="9s" begin="4.5s" repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0 0 1 1;0 0 1 1"
              />
              <animate
                attributeName="opacity"
                values="0;0;.25;.25;0;0"
                keyTimes="0;0.1;0.2;0.35;0.45;1"
                dur="9s" begin="4.5s" repeatCount="indefinite"
              />
            </rect>
          </g>
        </svg>

        <div className="rfx-axis" />

        <svg
          className="rfx-reflection"
          width={size} height={size}
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={id('rF')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#C4B8E4" stopOpacity=".6"/>
              <stop offset="100%" stopColor="#7050A0" stopOpacity=".4"/>
            </linearGradient>
            <linearGradient id={id('rT')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#E8E2F8" stopOpacity=".7"/>
              <stop offset="100%" stopColor="#B090D8" stopOpacity=".5"/>
            </linearGradient>
          </defs>
          <polygon points="50,22 28,50  3,50 50,3" fill={`url(#${id('rF')})`}/>
          <polygon points="50,22 72,50 97,50 50,3" fill={`url(#${id('rF')})`}/>
          <polygon points="50,22 72,50 50,78 28,50" fill={`url(#${id('rT')})`} opacity=".7"/>
          <circle cx="50" cy="50" r="2.5" fill="#EDE8F6" opacity=".5"/>
          <polygon points="50,3 97,50 50,97 3,50" fill="none" stroke="#C4B8E4" strokeWidth=".4" opacity=".3"/>
        </svg>

      </div>
    </>
  )
}
