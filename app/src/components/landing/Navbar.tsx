interface NavbarProps {
  onGoApp: () => void;
}

export function Navbar({ onGoApp }: NavbarProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 50,
      padding: '20px 0',
      background: 'linear-gradient(to bottom, rgba(241,241,241,0.82), rgba(241,241,241,0))',
      backdropFilter: 'blur(3px)',
      WebkitBackdropFilter: 'blur(3px)',
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 28px',
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        alignItems: 'center',
        gap: 8,
      }}>
        <div style={{ gridColumn: 'span 4', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#1a1a1a" d="M12 2c1.6 2.2 3.4 3.2 6 3 -.2 2.6 .8 4.4 3 6 -2.2 1.6-3.2 3.4-3 6 -2.6-.2-4.4 .8-6 3 -1.6-2.2-3.4-3.2-6-3 .2-2.6-.8-4.4-3-6 2.2-1.6 3.2-3.4 3-6 2.6 .2 4.4-.8 6-3Z" />
          </svg>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 21, letterSpacing: '-.01em', color: '#1a1a1a' }}>
            insane-post
          </span>
        </div>

        <div className="cd-desk-nav" style={{
          gridColumn: '4 / span 6',
          display: 'flex',
          justifyContent: 'center',
          gap: 30,
        }}>
          <a href="#features" style={{ fontSize: '13.5px', color: '#3f3f46', textDecoration: 'none' }}>features</a>
          <a href="#how" style={{ fontSize: '13.5px', color: '#3f3f46', textDecoration: 'none' }}>integrations</a>
          <a href="#features" style={{ fontSize: '13.5px', color: '#3f3f46', textDecoration: 'none' }}>analytics</a>
          <a href="#how" style={{ fontSize: '13.5px', color: '#3f3f46', textDecoration: 'none' }}>docs</a>
        </div>

        <div style={{
          gridColumn: '10 / span 3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 14,
        }}>
          <button
            onClick={onGoApp}
            style={{ fontSize: '13.5px', color: '#1a1a1a', textDecoration: 'none', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
          >
            sign in
          </button>
          <button
            onClick={onGoApp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: '#1a1a1a',
              color: '#fff',
              border: 'none',
              borderRadius: '999px',
              padding: '10px 18px',
              fontSize: '13.5px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            get started <span style={{ fontSize: '14px' }}>&rarr;</span>
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cd-desk-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}