interface FooterCTAProps {
  onGoApp: () => void;
}

export function FooterCTA({ onGoApp }: FooterCTAProps) {
  return (
    <section style={{
      background: '#1a1a1a',
      color: '#EDEEF5',
      borderRadius: '40px 40px 0 0',
      padding: '80px 28px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(34px, 5vw, 68px)',
          letterSpacing: '-.025em',
          margin: '0 0 28px',
          lineHeight: 1.04,
        }}>
          Start publishing in two minutes.
        </h2>
        <button
          onClick={onGoApp}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#9fff00',
            color: '#000',
            border: 'none',
            borderRadius: '999px',
            padding: '14px 26px',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          get started <span>&rarr;</span>
        </button>
        <div style={{
          display: 'flex',
          gap: 26,
          justifyContent: 'center',
          marginTop: 48,
          flexWrap: 'wrap',
          fontSize: '13.5px',
          color: '#a1a1aa',
        }}>
          <a href="#features" style={{ color: '#a1a1aa', textDecoration: 'none' }}>features</a>
          <a href="#how" style={{ color: '#a1a1aa', textDecoration: 'none' }}>integrations</a>
          <a href="#features" style={{ color: '#a1a1aa', textDecoration: 'none' }}>analytics</a>
          <a href="#how" style={{ color: '#a1a1aa', textDecoration: 'none' }}>docs</a>
          <span onClick={onGoApp} style={{ color: '#9fff00', cursor: 'pointer' }}>open the app</span>
        </div>
        <div style={{ marginTop: 36, fontSize: '12.5px', color: '#71717a' }}>
          &copy; 2026 insane-post
        </div>
      </div>
    </section>
  );
}