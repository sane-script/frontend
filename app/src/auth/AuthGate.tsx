import { useState } from 'react';
import { verifyKey, setStoredKey } from '@/api/client';

interface AuthGateProps {
  onAuth: (key: string) => void;
}

export function AuthGate({ onAuth }: AuthGateProps) {
  const [value, setValue] = useState('insanescript');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const ok = await verifyKey(value.trim());
      if (ok) {
        setStoredKey(value.trim());
        onAuth(value.trim());
      } else {
        setError('Wrong key — try again.');
      }
    } catch {
      // fetch threw → the server is unreachable, not a bad key
      setError("Can't reach the server. Is the backend running on :8000?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#EDEEF5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <form
        onSubmit={submit}
        style={{
          background: '#fff',
          border: '1px solid rgba(0,0,0,.06)',
          borderRadius: 20,
          padding: '38px 34px',
          width: '100%',
          maxWidth: 380,
          boxShadow: '0 24px 60px rgba(0,0,0,.10)',
          animation: 'cdRise .5s ease both',
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
        <p style={{ color: '#71717a', fontSize: 13.5, margin: '0 0 22px', lineHeight: 1.5 }}>
          This is a private workspace. Enter the shared access key to open the app.
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
              borderRadius: 11,
              padding: '12px 44px 12px 14px',
              fontSize: 14.5,
              color: '#18181b',
            }}
          />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            aria-label={show ? 'Hide key' : 'Show key'}
            title={show ? 'Hide key' : 'Show key'}
            style={{
              position: 'absolute',
              right: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 32,
              height: 32,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#71717a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
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
          disabled={busy || !value.trim()}
          style={{
            width: '100%',
            border: 'none',
            background: '#9fff00',
            color: '#000',
            borderRadius: 11,
            padding: '13px 0',
            fontSize: 14.5,
            fontWeight: 600,
            cursor: busy || !value.trim() ? 'default' : 'pointer',
            opacity: busy || !value.trim() ? 0.55 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
          }}
        >
          {busy && (
            <span style={{
              width: 15, height: 15, borderRadius: '50%',
              border: '2px solid rgba(0,0,0,.25)', borderTopColor: '#000',
              animation: 'cdSpin .7s linear infinite', flex: 'none',
            }} />
          )}
          {busy ? 'Checking…' : 'Unlock'}
        </button>
      </form>
    </div>
  );
}
