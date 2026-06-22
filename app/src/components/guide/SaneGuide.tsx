import { useState, useEffect, useRef, useCallback } from 'react';
import { GUIDE_STEPS, type GuideStep, type GuideGo } from './guideScript';

interface SaneGuideProps {
  onGoApp: () => void;
  onGoLanding: () => void;
  onSetTab: (tab: 'create' | 'accounts') => void;
}

type Phase = 'greeting' | 'running' | 'closed';

const AVATAR = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="7" width="16" height="12" rx="4" fill="#9fff00" />
    <circle cx="9.5" cy="13" r="1.6" fill="#1a1a1a" />
    <circle cx="14.5" cy="13" r="1.6" fill="#1a1a1a" />
    <path d="M12 3v3" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="12" cy="2.5" r="1.4" fill="#1a1a1a" />
  </svg>
);

export function SaneGuide({ onGoApp, onGoLanding, onSetTab }: SaneGuideProps) {
  const [phase, setPhase] = useState<Phase>('greeting');
  const [stepIdx, setStepIdx] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>(() => ({
    x: window.innerWidth - 340,
    y: window.innerHeight - 260,
  }));
  const [spot, setSpot] = useState<DOMRect | null>(null);

  const step: GuideStep | undefined = GUIDE_STEPS[stepIdx];
  const typed = useTypewriter(phase === 'running' && step ? step.text : '');

  // Replay trigger from the sidebar button.
  useEffect(() => {
    const replay = () => { setPhase('greeting'); setStepIdx(0); setCollapsed(false); };
    window.addEventListener('sane:replay', replay);
    return () => window.removeEventListener('sane:replay', replay);
  }, []);

  // Track the spotlight target element's rect.
  const updateSpot = useCallback(() => {
    if (phase !== 'running' || !step?.target) { setSpot(null); return; }
    const el = document.querySelector(`[data-guide="${step.target}"]`);
    setSpot(el ? el.getBoundingClientRect() : null);
  }, [phase, step]);

  useEffect(() => {
    updateSpot();
    const id = window.setTimeout(updateSpot, 60); // after navigation/render
    window.addEventListener('resize', updateSpot);
    window.addEventListener('scroll', updateSpot, true);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('resize', updateSpot);
      window.removeEventListener('scroll', updateSpot, true);
    };
  }, [updateSpot]);

  // Keep the window inside the viewport on resize.
  useEffect(() => {
    const clamp = () => setPos(p => ({
      x: Math.min(Math.max(8, p.x), window.innerWidth - 60),
      y: Math.min(Math.max(8, p.y), window.innerHeight - 60),
    }));
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, []);

  // ── Dragging (pointer events) ──────────────────────────────────────────────
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  function onPointerDown(e: React.PointerEvent) {
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const w = collapsed ? 56 : 320;
    const h = collapsed ? 56 : 220;
    setPos({
      x: Math.min(Math.max(4, e.clientX - drag.current.dx), window.innerWidth - w),
      y: Math.min(Math.max(4, e.clientY - drag.current.dy), window.innerHeight - h),
    });
  }
  function onPointerUp(e: React.PointerEvent) {
    drag.current = null;
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
  }

  function runGo(go?: GuideGo) {
    if (go === 'app') onGoApp();
    else if (go === 'landing') onGoLanding();
    else if (go === 'accounts') onSetTab('accounts');
    else if (go === 'create') onSetTab('create');
    else if (go === 'minimize') { setPhase('closed'); setCollapsed(true); }
  }

  function next() {
    if (!step) return;
    runGo(step.go);
    if (step.go === 'minimize') return;
    setStepIdx(i => Math.min(i + 1, GUIDE_STEPS.length - 1));
  }

  function startGuide() { setPhase('running'); setStepIdx(0); }
  function dismiss() { setPhase('closed'); setCollapsed(true); }

  // ── Collapsed circle ───────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={() => { if (!drag.current) { setCollapsed(false); if (phase === 'closed') setPhase('greeting'); } }}
        style={{
          position: 'fixed', left: pos.x, top: pos.y, zIndex: 200,
          width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'grab',
          background: '#1a1a1a', boxShadow: '0 10px 30px rgba(0,0,0,.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
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

      {/* Sane window */}
      <div
        style={{
          position: 'fixed', left: pos.x, top: pos.y, zIndex: 200,
          width: 320, maxWidth: 'calc(100vw - 16px)',
          background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,.08)',
          boxShadow: '0 18px 50px rgba(0,0,0,.22)', overflow: 'hidden',
          animation: 'cdRise .3s ease both',
        }}
      >
        {/* Header (drag handle) */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 12px', background: '#1a1a1a', cursor: 'grab', touchAction: 'none' }}
        >
          <span style={{ display: 'flex' }}>{AVATAR}</span>
          <span style={{ flex: 1, fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 14, color: '#fff' }}>Sane</span>
          <button onClick={() => setCollapsed(true)} title="Minimize" style={{ border: 'none', background: 'rgba(255,255,255,.14)', color: '#fff', width: 24, height: 24, borderRadius: 6, cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>—</button>
          <button onClick={dismiss} title="Close" style={{ border: 'none', background: 'rgba(255,255,255,.14)', color: '#fff', width: 24, height: 24, borderRadius: 6, cursor: 'pointer', fontSize: 12, lineHeight: 1 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: 16 }}>
          {phase === 'greeting' && (
            <>
              <p style={{ fontSize: 14, color: '#18181b', lineHeight: 1.55, margin: '0 0 16px' }}>
                Hi, I'm Sane 👋 Want me to guide you through posting your first update?
              </p>
              <div style={{ display: 'flex', gap: 9 }}>
                <button onClick={startGuide} style={{ flex: 1, border: 'none', background: '#9fff00', color: '#000', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Yes, show me</button>
                <button onClick={dismiss} style={{ flex: 1, border: '1px solid rgba(0,0,0,.12)', background: '#fff', color: '#52525b', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>No thanks</button>
              </div>
            </>
          )}

          {phase === 'running' && step && (
            <>
              <p style={{ fontSize: 14, color: '#18181b', lineHeight: 1.6, margin: '0 0 16px', minHeight: 70 }}>
                {typed}<span style={{ opacity: typed.length < step.text.length ? 1 : 0, color: '#9fff00' }}>▍</span>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontSize: 11.5, color: '#a1a1aa', flex: 1 }}>{stepIdx + 1} / {GUIDE_STEPS.length}</span>
                <button onClick={dismiss} style={{ border: 'none', background: 'transparent', color: '#a1a1aa', fontSize: 12.5, cursor: 'pointer' }}>Skip</button>
                <button onClick={next} style={{ border: 'none', background: '#1a1a1a', color: '#fff', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
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

// Reveal text char-by-char. Resets whenever `text` changes.
function useTypewriter(text: string, speed = 18): string {
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
