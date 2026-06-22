import { useState, useEffect } from 'react';
import { setStoredKey, wakeBackend } from '@/api/client';

// The shared access key. Checked locally so the gate never blocks on a cold
// backend — the server still validates X-App-Key on every real API route.
const ACCESS_KEY = 'insanescript';

interface AuthGateProps {
  onAuth: (key: string) => void;
}

export function AuthGate({ onAuth }: AuthGateProps) {
  const [value, setValue] = useState(ACCESS_KEY);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wake the (possibly sleeping) backend the moment the gate mounts, so it's
  // warm by the time the user finishes reading and connects an account.
  useEffect(() => { wakeBackend(); }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const k = value.trim();
    if (!k) return;
    if (k !== ACCESS_KEY) {
      setError('Wrong key — try again.');
      return;
    }
    wakeBackend();           // fire again on submit, just in case
    setStoredKey(k);
    onAuth(k);               // local accept — does NOT wait on the backend
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#EDEEF5',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <form
        onSubmit={submit}
        style={{
          background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 20,
          padding: '38px 34px', width: '100%', maxWidth: 400,
          boxShadow: '0 24px 60px rgba(0,0,0,.10)', animation: 'cdRise .5s ease both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#1a1a1a" d="M12 2c1.6 2.2 3.4 3.2 6 3 -.2 2.6 .8 4.4 3 6 -2.2 1.6-3.2 3.4-3 6 -2.6-.2-4.4 .8-6 3 -1.6-2.2-3.4-3.2-6-3 .2-2.6-.8-4.4-3-6 2.2-1.6 3.2-3.4 3-6 2.6 .2 4.4-.8 6-3Z" />
          </svg>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: '-.01em', color: '#1a1a1a' }}>
            insane-post
          </span>
        </div>

        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 19, margin: '0 0 6px', color: '#18181b' }}>
          Enter access key to continue
        </h1>
        <p style={{ color: '#71717a', fontSize: 13.5, margin: '0 0 18px', lineHeight: 1.5 }}>
          This is a private workspace. The key is pre-filled — just click Unlock.
        </p>

        <div style={{ position: 'relative', marginBottom: error ? 8 : 16 }}>
          <input
            type={show ? 'text' : 'password'}
            value={value}
            autoFocus
            onChange={e => { setValue(e.target.value); setError(null); }}
            placeholder="Access key"
            style={{
              width: '100%',
              border: `1px solid ${error ? '#dc2626' : 'rgba(0,0,0,.14)'}`,
              borderRadius: 11, padding: '12px 44px 12px 14px', fontSize: 14.5, color: '#18181b',
            }}
          />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            aria-label={show ? 'Hide key' : 'Show key'}
            style={{
              position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
              width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer',
              color: '#71717a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
            }}
          >
            {show ? (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            ) : (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        {error && (
          <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, lineHeight: 1.4 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          style={{
            width: '100%', border: 'none', background: '#9fff00', color: '#000',
            borderRadius: 11, padding: '13px 0', fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Unlock
        </button>

        {/* Honest heads-up — the client won't get this on the first try otherwise. */}
        <div style={{
          marginTop: 20, padding: '12px 14px', background: '#f4f4f5', borderRadius: 11,
          fontSize: 12, color: '#52525b', lineHeight: 1.55,
        }}>
          <strong style={{ color: '#3f3f46' }}>Heads up:</strong> connecting Facebook, Instagram,
          X and TikTok requires each platform's OAuth review, which is completed in production.
          In this demo, <strong style={{ color: '#3f6212' }}>Bluesky is fully live</strong>; the
          others run in simulation. <span style={{ fontStyle: 'italic' }}>— Sanecrit</span>
        </div>
      </form>
    </div>
  );
}
