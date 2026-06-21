interface HeroProps {
  heroQuery: string;
  onHeroInput: (v: string) => void;
  onGoApp: () => void;
}

export function Hero({ heroQuery, onHeroInput, onGoApp }: HeroProps) {
  return (
    <section style={{
      position: 'relative',
      minHeight: '138vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflow: 'hidden',
      background: '#EDEEF5',
    }}>
      {/* Animated gradient mesh */}
      <div style={{
        position: 'absolute',
        top: '14vh',
        left: 0,
        width: '100%',
        height: '118vh',
        zIndex: 0,
        pointerEvents: 'none',
        filter: 'blur(48px)',
        opacity: 0.95,
      }}>
        <div style={{
          position: 'absolute',
          top: '8%',
          left: '6%',
          width: '42vw',
          height: '42vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, #cdd6ff, transparent 65%)',
          animation: 'cdFloat1 28s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '2%',
          right: '4%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, #c9d2ff, transparent 65%)',
          animation: 'cdFloat2 26s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '42%',
          left: '30%',
          width: '46vw',
          height: '46vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, #9fff00, transparent 62%)',
          opacity: 0.32,
          animation: 'cdFloat3 30s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '18%',
          width: '34vw',
          height: '34vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, #e7c9ff, transparent 65%)',
          animation: 'cdFloat4 24s ease-in-out infinite',
        }} />
      </div>

      {/* Top gradient mask */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 120,
        zIndex: 1,
        background: 'linear-gradient(to bottom, #EDEEF5, transparent)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1280,
        width: '100%',
        margin: '0 auto',
        padding: '0 28px',
        position: 'relative',
        zIndex: 10,
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: 16,
      }}>
        <div style={{ gridColumn: '2 / span 10', paddingTop: '30vh' }}>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            fontSize: 'clamp(38px, 6.4vw, 84px)',
            lineHeight: 1.02,
            letterSpacing: '-.025em',
            margin: 0,
            color: '#1a1a1a',
            animation: 'cdRise .8s ease both',
          }}>
            insane-post publishes <span style={{ color: '#8e8e8e' }}>everything</span><br />
            <span style={{ color: '#8e8e8e' }}>to every network, and shows you</span><br />
            <span style={{ color: '#8e8e8e' }}>what </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'clamp(34px, 5vw, 62px)',
              height: 'clamp(26px, 3.4vw, 42px)',
              border: '2.5px solid #1a1a1a',
              borderRadius: '999px',
              verticalAlign: 'middle',
              margin: '0 .12em',
            }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#1a1a1a', display: 'block' }} />
            </span>
            <span style={{ color: '#1a1a1a' }}> actually works.</span>
          </h1>

          <div style={{
            marginTop: 34,
            maxWidth: 560,
            background: '#fff',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,.05)',
            padding: '5px 5px 5px 18px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,.06)',
            animation: 'cdRise .8s ease .15s both',
          }}>
            <input
              value={heroQuery}
              onChange={e => onHeroInput(e.target.value)}
              placeholder="Draft a post or drop a link\u2026"
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 15, color: '#1a1a1a' }}
            />
            <button
              onClick={onGoApp}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: '#1a1a1a',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Edge anchors */}
      <div style={{
        position: 'absolute',
        right: 24,
        top: '48%',
        zIndex: 10,
        background: 'rgba(255,255,255,.6)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(0,0,0,.06)',
        borderRadius: '999px',
        padding: '8px 14px',
        fontSize: '12.5px',
        color: '#3f3f46',
        display: 'flex',
        gap: 6,
        alignItems: 'center',
      }}>
        en <span style={{ opacity: 0.5 }}>&#8997;</span>
      </div>
      <div style={{
        position: 'absolute',
        left: 28,
        bottom: 34,
        zIndex: 10,
        fontSize: '12.5px',
        color: '#71717a',
        letterSpacing: '.02em',
      }}>
        2026
      </div>
      <div style={{
        position: 'absolute',
        right: 28,
        bottom: 34,
        zIndex: 10,
        fontSize: '12.5px',
        color: '#71717a',
        letterSpacing: '.02em',
      }}>
        multi-network publishing
      </div>
    </section>
  );
}