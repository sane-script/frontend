import { useEffect, useRef, useState } from 'react';

// Animated number count-up. `format` renders the running value each frame.
export function CountUp({ value, format, duration = 700 }: {
  value: number;
  format: (n: number) => string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(from + (value - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{format(Math.round(display))}</>;
}

export function Spinner({ size = 22 }: { size?: number }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      border: '2.5px solid rgba(0,0,0,.12)', borderTopColor: '#1a1a1a',
      display: 'inline-block', animation: 'cdSpin .7s linear infinite',
    }} />
  );
}

export function LoadingPanel({ label = 'Loading…' }: { label?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 14, padding: '70px 0', color: '#a1a1aa', fontSize: 13.5,
    }}>
      <Spinner />
      {label}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
      background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b',
      borderRadius: 12, padding: '12px 16px', fontSize: 13.5, marginBottom: 18,
      animation: 'cdRise .3s ease both',
    }}>
      <span>{message}</span>
      <button
        onClick={onRetry}
        style={{
          border: '1px solid #fca5a5', background: '#fff', color: '#991b1b',
          borderRadius: 8, padding: '7px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Retry
      </button>
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 10, padding: '64px 20px', textAlign: 'center',
      background: '#fff', border: '1px dashed rgba(0,0,0,.12)', borderRadius: 16,
    }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 17, color: '#3f3f46' }}>{title}</div>
      {hint && <div style={{ fontSize: 13.5, color: '#a1a1aa', maxWidth: 360 }}>{hint}</div>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
