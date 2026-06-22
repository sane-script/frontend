import { useState } from 'react';
import { PlatformIcon } from '@/components/icons/PlatformIcon';
import { ALL_PLATFORMS } from '@/types';

export function Features() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const cardBase = {
    border: '1px solid rgba(0,0,0,.07)',
    borderRadius: 18,
    padding: 32,
  };

  return (
    <section id="features" style={{ background: '#fff', padding: '96px 28px', borderRadius: '40px 40px 0 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 600,
          fontSize: 'clamp(30px, 4vw, 52px)',
          letterSpacing: '-.02em',
          margin: '0 0 8px',
          color: '#1a1a1a',
        }}>
          Everything in <span style={{ color: '#8e8e8e' }}>one flow.</span>
        </h2>
        <p style={{ color: '#71717a', fontSize: 16, margin: '0 0 48px', maxWidth: 520 }}>
          Five networks behind one adapter, a calendar you can drag, and analytics that match your exports to the number.
        </p>
        <div className="cd-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Card 1 - Five networks */}
          <div
            style={{ ...cardBase, borderColor: hoverIdx === 0 ? '#9fff00' : 'rgba(0,0,0,.07)' }}
            onMouseEnter={() => setHoverIdx(0)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {ALL_PLATFORMS.map(p => <PlatformIcon key={p} platform={p} box={30} radius={8} />)}
            </div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 20, margin: '0 0 8px', color: '#1a1a1a' }}>Five networks, one flow</h3>
            <p style={{ color: '#52525b', fontSize: '14.5px', lineHeight: 1.55, margin: 0 }}>
              Facebook, Instagram, X, TikTok, and Bluesky behind a single adapter layer — extensible to more.
            </p>
          </div>

          {/* Card 2 - Calendar & queue */}
          <div
            style={{ ...cardBase, borderColor: hoverIdx === 1 ? '#9fff00' : 'rgba(0,0,0,.07)' }}
            onMouseEnter={() => setHoverIdx(1)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.7" style={{ marginBottom: 16 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 20, margin: '0 0 8px', color: '#1a1a1a' }}>Calendar &amp; queue</h3>
            <p style={{ color: '#52525b', fontSize: '14.5px', lineHeight: 1.55, margin: 0 }}>
              Week view, drag-to-reschedule, and publish-now — your whole pipeline at a glance.
            </p>
          </div>

          {/* Card 3 - Live analytics */}
          <div
            style={{ ...cardBase, borderColor: hoverIdx === 2 ? '#9fff00' : 'rgba(0,0,0,.07)' }}
            onMouseEnter={() => setHoverIdx(2)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.7" style={{ marginBottom: 16 }}>
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 20, margin: '0 0 8px', color: '#1a1a1a' }}>Live analytics</h3>
            <p style={{ color: '#52525b', fontSize: '14.5px', lineHeight: 1.55, margin: 0 }}>
              Charts that update within minutes of a post going live — reach, engagement, growth, clicks.
            </p>
          </div>

          {/* Card 4 - Exports that match */}
          <div
            style={{ ...cardBase, borderColor: hoverIdx === 3 ? '#9fff00' : 'rgba(0,0,0,.07)' }}
            onMouseEnter={() => setHoverIdx(3)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.7" style={{ marginBottom: 16 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6M9 15h6M9 18h6M9 12h2" />
            </svg>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 20, margin: '0 0 8px', color: '#1a1a1a' }}>Exports that match</h3>
            <p style={{ color: '#52525b', fontSize: '14.5px', lineHeight: 1.55, margin: 0 }}>
              CSV/PDF reports that mirror the on-screen numbers exactly — no reconciliation, ever.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cd-grid2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}