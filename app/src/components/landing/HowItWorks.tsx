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
          Four steps. <span style={{ color: '#8e8e8e' }}>One workflow.</span>
        </h2>
        <p style={{ color: '#71717a', fontSize: 16, margin: '0 0 48px', maxWidth: 520 }}>
          Connect once, create in one place, choose how it publishes, then watch it perform — without bouncing between apps.
        </p>
        <div className="cd-grid4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>

          <StepCard n={1} title="Connect" icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          }>
            Add your networks once in <strong>Accounts</strong>. Bluesky posts go out live; Facebook, Instagram, X, and TikTok run in simulated mode.
          </StepCard>

          <StepCard n={2} title="Create" icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          }>
            Write your post, attach media, and pick which networks it goes to — all from the <strong>Create</strong> tab. No copy-pasting between apps.
          </StepCard>

          <StepCard n={3} title="Choose" icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }>
            Click <strong>Post now</strong> to publish immediately, <strong>Schedule</strong> to pick a date and time, or <strong>Save draft</strong> to send it to the Review queue first.
          </StepCard>

          <StepCard n={4} title="Measure" icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
              <line x1="3" y1="20" x2="21" y2="20" />
            </svg>
          }>
            Track reach, engagement, follower growth, and clicks in <strong>Analytics</strong>. Export to CSV or PDF with one click.
          </StepCard>

        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .cd-grid4 { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          .cd-grid4 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function StepCard({ n, title, icon, children }: {
  n: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(0,0,0,.06)',
      borderRadius: 18,
      padding: 26,
      boxShadow: '0 2px 14px rgba(0,0,0,.03)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <span style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#1a1a1a', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 14, flex: 'none',
        }}>{n}</span>
        {icon}
      </div>
      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 20, margin: '0 0 8px', color: '#1a1a1a' }}>
        {title}
      </h3>
      <p style={{ color: '#52525b', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
        {children}
      </p>
    </div>
  );
}
