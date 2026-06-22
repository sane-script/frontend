import { useState, useEffect, useRef, useCallback } from 'react';
import { GUIDE_STEPS, type GuideStep, type GuideLocation } from './guideScript';

interface SaneGuideProps {
  onGoLanding: () => void;
  onSetTab: (tab: 'create' | 'accounts') => void;
}

type Phase = 'greeting' | 'running' | 'closed';

const W = 560;   // window width (≈2× the old 320)
const H = 300;   // approx height for clamping

const AVATAR = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="7" width="16" height="12" rx="4" fill="#9fff00" />
    <circle cx="9.5" cy="13" r="1.7" fill="#1a1a1a" />
    <circle cx="14.5" cy="13" r="1.7" fill="#1a1a1a" />
    <path d="M12 3v3" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="12" cy="2.5" r="1.5" fill="#1a1a1a" />
  </svg>
);

export function SaneGuide({ onGoLanding, onSetTab }: SaneGuideProps) {
  const [phase, setPhase] = useState<Phase>('greeting');
  const [stepIdx, setStepIdx] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>(() => ({
    x: Math.max(8, window.innerWidth - (W + 24)),
    y: Math.max(8, window.innerHeight - (H + 24)),
  }));
  const [spot, setSpot] = useState<DOMRect | null>(null);

  const step: GuideStep | undefined = GUIDE_STEPS[stepIdx];
  const typed = useTypewriter(phase === 'running' && step ? step.text : '');
  const isLast = stepIdx === GUIDE_STEPS.length - 1;

  // Navigate to the location a step belongs to. Stable identity for the effect.
  const navigateTo = useCallback((loc: GuideLocation) => {
    if (loc === 'landing') onGoLanding();
    else if (loc === 'accounts') onSetTab('accounts');
    else if (loc === 'create') onSetTab('create');
  }, [onGoLanding, onSetTab]);

  // Drive navigation from the step index — this is what auto-opens the right
  // tab, and it makes Back/Next symmetric (both just change stepIdx).
  useEffect(() => {
    if (phase === 'running' && step) navigateTo(step.location);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, stepIdx]);

  // Replay trigger from the sidebar button.
  useEffect(() => {
    const replay = () => { setPhase('running'); setStepIdx(0); setCollapsed(false); };
    window.addEventListener('sane:replay', replay);
    return () => window.removeEventListener('sane:replay', replay);
  }, []);

  // Track the spotlight target's rect (recompute after navigation/layout).
  const updateSpot = useCallback(() => {
    if (phase !== 'running' || !step?.target) { setSpot(null); return; }
    const el = document.querySelector(`[data-guide="${step.target}"]`);
    setSpot(el ? el.getBoundingClientRect() : null);
  }, [phase, step]);

  useEffect(() => {
    updateSpot();
    const id = window.setTimeout(updateSpot, 80);
    const id2 = window.setTimeout(updateSpot, 260); // after tab transition
    window.addEventListener('resize', updateSpot);
    window.addEventListener('scroll', updateSpot, true);
    return () => {
      window.clearTimeout(id); window.clearTimeout(id2);
      window.removeEventListener('resize', updateSpot);
      window.removeEventListener('scroll', updateSpot, true);
    };
  }, [updateSpot]);

  // Keep the window in-bounds on resize.
  useEffect(() => {
    const clamp = () => setPos(p => ({
      x: Math.min(Math.max(8, p.x), window.innerWidth - 64),
      y: Math.min(Math.max(8, p.y), window.innerHeight - 64),
    }));
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, []);

  // ── Dragging ───────────────────────────────────────────────────────────────
  const drag = useRef<{ dx: number; dy: number; moved: boolean } | null>(null);
  function onPointerDown(e: React.PointerEvent) {
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y, moved: false };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    drag.current.moved = true;
    const w = collapsed ? 64 : W;
    const h = collapsed ? 64 : H;
    setPos({
      x: Math.min(Math.max(4, e.clientX - drag.current.dx), window.innerWidth - w),
      y: Math.min(Math.max(4, e.clientY - drag.current.dy), window.innerHeight - h),
    });
  }
  function onPointerUp(e: React.PointerEvent) {
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
  }

  function next() {
    if (isLast) { setPhase('closed'); setCollapsed(true); return; }
    setStepIdx(i => Math.min(i + 1, GUIDE_STEPS.length - 1));
  }
  function back() { setStepIdx(i => Math.max(0, i - 1)); }
  function startGuide() { setPhase('running'); setStepIdx(0); }
  function dismiss() { setPhase('closed'); setCollapsed(true); }

  // ── Collapsed circle ─────────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={() => { if (!drag.current?.moved) { setCollapsed(false); if (phase === 'closed') setPhase('greeting'); } drag.current = null; }}
        style={{
          position: 'fixed', left: pos.x, top: pos.y, zIndex: 200,
          width: 64, height: 64, borderRadius: '50%', border: 'none', cursor: 'grab',
          background: '#1a1a1a', boxShadow: '0 10px 30px rgba(0,0,0,.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none',
          animation: 'cdRise .3s ease both',
        }}
        title="Open Sane guide"
      >
        {AVATAR}
      </button>
    );
  }

  const showSpotlight = phase === 'running' && !!spot;

  return (
    <>
      {/* Dimmer + spotlight cutout */}
      {phase === 'running' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, pointerEvents: 'none' }}>
          {showSpotlight && spot ? (
            <div style={{
              position: 'absolute',
              left: spot.left - 6, top: spot.top - 6,
              width: spot.width + 12, height: spot.height + 12,
              borderRadius: 12,
              boxShadow: '0 0 0 9999px rgba(15,15,20,.55)',
              border: '2px solid #9fff00',
              transition: 'all .25s ease',
            }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,15,20,.45)' }} />
          )}
        </div>
      )}

      {/* Sane window — ~2× the previous size */}
      <div
        style={{
          position: 'fixed', left: pos.x, top: pos.y, zIndex: 200,
          width: W, maxWidth: 'calc(100vw - 16px)',
          background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,.08)',
          boxShadow: '0 22px 60px rgba(0,0,0,.24)', overflow: 'hidden',
          animation: 'cdRise .3s ease both',
        }}
      >
        {/* Header (drag handle) */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '14px 16px', background: '#1a1a1a', cursor: 'grab', touchAction: 'none' }}
        >
          <span style={{ display: 'flex' }}>{AVATAR}</span>
          <div style={{ flex: 1, lineHeight: 1.2 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 16, color: '#fff' }}>Sane</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.55)' }}>your setup guide</div>
          </div>
          <button onClick={() => setCollapsed(true)} title="Minimize" style={hdrBtn}>—</button>
          <button onClick={dismiss} title="Close" style={hdrBtn}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: 22 }}>
          {phase === 'greeting' && (
            <>
              <p style={{ fontSize: 16, color: '#18181b', lineHeight: 1.6, margin: '0 0 20px' }}>
                Hi, I'm Sane 👋 Want me to walk you through connecting a network and posting your first update? It takes about a minute.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={startGuide} style={{ flex: 1, border: 'none', background: '#9fff00', color: '#000', borderRadius: 11, padding: '13px', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' }}>Yes, show me</button>
                <button onClick={dismiss} style={{ flex: 1, border: '1px solid rgba(0,0,0,.12)', background: '#fff', color: '#52525b', borderRadius: 11, padding: '13px', fontSize: 14.5, fontWeight: 600, cursor: 'pointer' }}>No thanks</button>
              </div>
            </>
          )}

          {phase === 'running' && step && (
            <>
              <p style={{ fontSize: 16, color: '#18181b', lineHeight: 1.65, margin: '0 0 22px', minHeight: 104 }}>
                {typed}<span style={{ opacity: typed.length < step.text.length ? 1 : 0, color: '#65a30d' }}>▍</span>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Step dots */}
                <div style={{ display: 'flex', gap: 5, flex: 1 }}>
                  {GUIDE_STEPS.map((_, i) => (
                    <span key={i} style={{ width: i === stepIdx ? 18 : 7, height: 7, borderRadius: 4, background: i === stepIdx ? '#9fff00' : i < stepIdx ? '#bbf451' : '#e4e4e7', transition: 'all .25s' }} />
                  ))}
                </div>
                <button onClick={dismiss} style={{ border: 'none', background: 'transparent', color: '#a1a1aa', fontSize: 13, cursor: 'pointer' }}>Skip</button>
                <button
                  onClick={back}
                  disabled={stepIdx === 0}
                  style={{ border: '1px solid rgba(0,0,0,.14)', background: '#fff', color: stepIdx === 0 ? '#cbcbd1' : '#3f3f46', borderRadius: 11, padding: '11px 16px', fontSize: 14, fontWeight: 600, cursor: stepIdx === 0 ? 'default' : 'pointer' }}
                >
                  ← Back
                </button>
                <button onClick={next} style={{ border: 'none', background: '#1a1a1a', color: '#fff', borderRadius: 11, padding: '11px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  {step.cta ?? 'Next'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const hdrBtn: React.CSSProperties = {
  border: 'none', background: 'rgba(255,255,255,.14)', color: '#fff',
  width: 28, height: 28, borderRadius: 7, cursor: 'pointer', fontSize: 14, lineHeight: 1, flex: 'none',
};

// Reveal text char-by-char. Resets whenever `text` changes.
function useTypewriter(text: string, speed = 16): string {
  const [out, setOut] = useState('');
  useEffect(() => {
    setOut('');
    if (!text) return;
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);
  return out;
}
