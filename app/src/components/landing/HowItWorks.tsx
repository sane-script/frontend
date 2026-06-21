export function HowItWorks() {
  return (
    <section id="how" style={{ background: '#EDEEF5', padding: '96px 28px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 600,
          fontSize: 'clamp(30px, 4vw, 52px)',
          letterSpacing: '-.02em',
          margin: '0 0 8px',
          color: '#1a1a1a',
        }}>
          Three steps. <span style={{ color: '#8e8e8e' }}>One calendar.</span>
        </h2>
        <p style={{ color: '#71717a', fontSize: 16, margin: '0 0 48px', maxWidth: 520 }}>
          From draft to published to measured — without leaving the tab or copy-pasting between five apps.
        </p>
        <div className="cd-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {/* Card 1 - Approve */}
          <div style={{
            background: '#fff',
            border: '1px solid rgba(0,0,0,.06)',
            borderRadius: 18,
            padding: 28,
            boxShadow: '0 2px 14px rgba(0,0,0,.03)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: '#1a1a1a',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 15,
              }}>1</span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="m9 11 3 3L22 4" />
              </svg>
            </div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 21, margin: '0 0 8px', color: '#1a1a1a' }}>Approve</h3>
            <p style={{ color: '#52525b', fontSize: '14.5px', lineHeight: 1.55, margin: 0 }}>
              Draft or import content, review it, approve with one click.
            </p>
          </div>

          {/* Card 2 - Schedule */}
          <div style={{
            background: '#fff',
            border: '1px solid rgba(0,0,0,.06)',
            borderRadius: 18,
            padding: 28,
            boxShadow: '0 2px 14px rgba(0,0,0,.03)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: '#1a1a1a',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 15,
              }}>2</span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
                <path d="M16 2v4M8 2v4M3 10h18" />
                <circle cx="18" cy="18" r="4" />
                <path d="M18 16.5V18l1 1" />
              </svg>
            </div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 21, margin: '0 0 8px', color: '#1a1a1a' }}>Schedule</h3>
            <p style={{ color: '#52525b', fontSize: '14.5px', lineHeight: 1.55, margin: 0 }}>
              Drop it on the calendar; reschedule by dragging. It publishes on time.
            </p>
          </div>

          {/* Card 3 - Measure */}
          <div style={{
            background: '#fff',
            border: '1px solid rgba(0,0,0,.06)',
            borderRadius: 18,
            padding: 28,
            boxShadow: '0 2px 14px rgba(0,0,0,.03)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: '#1a1a1a',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 15,
              }}>3</span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <rect x="7" y="11" width="3" height="6" />
                <rect x="12" y="7" width="3" height="10" />
                <rect x="17" y="13" width="3" height="4" />
              </svg>
            </div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 21, margin: '0 0 8px', color: '#1a1a1a' }}>Measure</h3>
            <p style={{ color: '#52525b', fontSize: '14.5px', lineHeight: 1.55, margin: 0 }}>
              Reach, engagement, follower growth, and clicks — exportable to CSV/PDF.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cd-grid3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}