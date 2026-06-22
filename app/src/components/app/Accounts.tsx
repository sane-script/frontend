import { useState, useEffect, useRef } from 'react';
import { type Account, PLATFORMS, ALL_PLATFORMS, type PlatformKey } from '@/types';
import { PlatformIcon } from '@/components/icons/PlatformIcon';
import { Spinner, ErrorBanner } from '@/components/app/States';
import { DEMO_BLUESKY } from '@/config/demoCredentials';

interface AccountsProps {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  onConnect: (platform: PlatformKey, creds?: { handle: string; app_password: string }) => Promise<void>;
  onDisconnect: (account: Account) => void;
  onRemove: (id: number) => void;
  onRetry: () => void;
}

export function Accounts({ accounts, loading, error, onConnect, onDisconnect, onRemove, onRetry }: AccountsProps) {
  const [modal, setModal] = useState<PlatformKey | null>(null);
  const [connecting, setConnecting] = useState<PlatformKey | null>(null);

  async function doConnect(platform: PlatformKey, creds?: { handle: string; app_password: string }) {
    setModal(null);
    setConnecting(platform);
    try { await onConnect(platform, creds); }
    catch { /* hook already flashed the error */ }
    finally { setConnecting(null); }
  }

  function startConnect(platform: PlatformKey) {
    setModal(platform); // both bluesky + simulated open a modal explaining what happens
  }

  return (
    <div style={{ animation: 'cdRise .4s ease both' }}>
      <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 30, letterSpacing: '-.02em', margin: '0 0 4px', color: '#18181b' }}>
        Accounts
      </h1>
      <p style={{ color: '#71717a', fontSize: '14.5px', margin: '0 0 26px' }}>
        Connect your networks here. <strong style={{ color: '#3f6212' }}>Bluesky posts go out live</strong>; Facebook, Instagram, X and TikTok run as honest simulations. You can connect more than one account per network.
      </p>

      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      {loading && accounts.length === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
          {[0, 1, 2].map(i => <div key={i} className="cd-skeleton" style={{ height: 150, borderRadius: 16 }} />)}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {ALL_PLATFORMS.map(platform => {
          const meta = PLATFORMS[platform];
          const rows = accounts.filter(a => a.platform === platform && a.status === 'connected');
          const isConnecting = connecting === platform;
          const live = platform === 'bluesky';

          return (
            <div key={platform} style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: rows.length || isConnecting ? 14 : 0 }}>
                <PlatformIcon platform={platform} box={40} radius={11} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15.5, color: '#18181b', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {meta.label}
                    <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 5, padding: '2px 6px', letterSpacing: '.03em', ...(live ? { color: '#3f6212', background: '#ecfccb' } : { color: '#1e40af', background: '#dbeafe' }) }}>
                      {live ? 'LIVE' : 'SIMULATED'}
                    </span>
                  </div>
                  <div style={{ color: '#a1a1aa', fontSize: 13, marginTop: 2 }}>
                    {rows.length ? `${rows.length} connected` : 'Not connected'}
                  </div>
                </div>
                <button
                  onClick={() => startConnect(platform)}
                  disabled={isConnecting}
                  style={{ border: 'none', background: isConnecting ? '#f4f4f5' : '#1a1a1a', color: isConnecting ? '#a1a1aa' : '#fff', borderRadius: 9, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: isConnecting ? 'default' : 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {isConnecting ? <ConnectingLabel /> : rows.length ? '+ Add another' : 'Connect'}
                </button>
              </div>

              {rows.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {rows.map(a => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fafafa', border: '1px solid rgba(0,0,0,.05)', borderRadius: 10, padding: '9px 12px' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#65a30d', flex: 'none' }} />
                      <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 500, color: '#18181b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.handle}</span>
                      <button onClick={() => onDisconnect(a)} style={{ border: '1px solid rgba(0,0,0,.1)', background: '#fff', color: '#52525b', borderRadius: 8, padding: '6px 12px', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>Disconnect</button>
                      <button onClick={() => onRemove(a.id)} title="Remove permanently" style={{ border: '1px solid rgba(0,0,0,.1)', background: '#fff', color: '#b91c1c', borderRadius: 8, padding: '6px 10px', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modal === 'bluesky' && (
        <BlueskyModal onClose={() => setModal(null)} onConnect={creds => doConnect('bluesky', creds)} />
      )}
      {modal && modal !== 'bluesky' && (
        <SimulateModal platform={modal} onClose={() => setModal(null)} onConnect={() => doConnect(modal)} />
      )}
    </div>
  );
}

// Live elapsed-seconds counter while a connection is in progress.
function ConnectingLabel() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return <><Spinner size={13} /> Connecting… {secs}s</>;
}

// ── Bluesky modal: step-by-step + auto-suffix + demo autofill ────────────────

function BlueskyModal({ onClose, onConnect }: {
  onClose: () => void;
  onConnect: (creds: { handle: string; app_password: string }) => void;
}) {
  const [handle, setHandle] = useState('');
  const [pw, setPw] = useState('');
  const pwRef = useRef<HTMLInputElement>(null);

  // Auto-suffix: show the full handle the user is actually connecting as.
  const fullHandle = handle.trim() && !handle.includes('.')
    ? `${handle.trim().replace(/^@/, '')}.bsky.social`
    : handle.trim().replace(/^@/, '');
  const ok = fullHandle.length > 0 && pw.trim().length > 0;

  function useSample() {
    setHandle(DEMO_BLUESKY.handle);
    if (DEMO_BLUESKY.appPassword) setPw(DEMO_BLUESKY.appPassword);
    else setTimeout(() => pwRef.current?.focus(), 0);
  }

  return (
    <Modal onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <PlatformIcon platform="bluesky" box={40} radius={10} />
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 19, margin: 0, color: '#18181b' }}>Connect Bluesky (live)</h3>
      </div>

      <ol style={{ margin: '0 0 16px', paddingLeft: 18, fontSize: 12.5, color: '#52525b', lineHeight: 1.7 }}>
        <li>No account? <a href="https://bsky.app" target="_blank" rel="noreferrer" style={{ color: '#0085FF' }}>Create a free one at bsky.app</a>.</li>
        <li>You need an <strong>App Password</strong> — not your login password.</li>
        <li>Generate one at <a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noreferrer" style={{ color: '#0085FF' }}>Settings → App Passwords</a>.</li>
      </ol>

      <button onClick={useSample} style={{ width: '100%', border: '1px dashed rgba(0,0,0,.2)', background: '#fafafa', color: '#3f3f46', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 14 }}>
        ✨ Use the sample demo account
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <input value={handle} onChange={e => setHandle(e.target.value)} placeholder="yourname" autoFocus
            style={{ width: '100%', border: '1px solid rgba(0,0,0,.12)', borderRadius: 10, padding: '11px 13px', fontSize: 14, color: '#18181b' }} />
          {handle.trim() && (
            <div style={{ fontSize: 11.5, color: '#71717a', marginTop: 4 }}>
              Connecting as <strong style={{ color: '#0085FF' }}>@{fullHandle}</strong>
            </div>
          )}
        </div>
        <input ref={pwRef} type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="App password (xxxx-xxxx-xxxx-xxxx)"
          style={{ border: '1px solid rgba(0,0,0,.12)', borderRadius: 10, padding: '11px 13px', fontSize: 14, color: '#18181b' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <ModalCancelBtn onClick={onClose} />
        <button onClick={() => onConnect({ handle: fullHandle, app_password: pw.trim() })} disabled={!ok}
          style={{ border: 'none', background: '#9fff00', color: '#000', borderRadius: 10, padding: '11px 20px', fontSize: 13.5, fontWeight: 600, cursor: ok ? 'pointer' : 'default', opacity: ok ? 1 : 0.5 }}>
          Connect live
        </button>
      </div>
    </Modal>
  );
}

function SimulateModal({ platform, onClose, onConnect }: {
  platform: PlatformKey;
  onClose: () => void;
  onConnect: () => void;
}) {
  const meta = PLATFORMS[platform];
  return (
    <Modal onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <PlatformIcon platform={platform} box={40} radius={10} />
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 19, margin: 0, color: '#18181b' }}>Connect {meta.label}</h3>
      </div>
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 14px', marginBottom: 18 }}>
        <p style={{ fontSize: 13, color: '#78350f', margin: 0, lineHeight: 1.6 }}>
          {meta.label} requires <strong>OAuth</strong>, which is set up in production. For this demo, click Enable to use a <strong>simulated connection</strong> — scheduling and the calendar work, but posts don't go out to the real network. Use Bluesky for a real live test.
        </p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <ModalCancelBtn onClick={onClose} />
        <button onClick={onConnect} style={{ border: 'none', background: '#1a1a1a', color: '#fff', borderRadius: 10, padding: '11px 20px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
          Enable simulated connection
        </button>
      </div>
    </Modal>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(24,24,27,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 430, padding: 26, boxShadow: '0 24px 60px rgba(0,0,0,.25)', animation: 'cdRise .3s ease both', maxHeight: '90vh', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

function ModalCancelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ border: '1px solid rgba(0,0,0,.12)', background: '#fff', color: '#52525b', borderRadius: 10, padding: '11px 18px', fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}>
      Cancel
    </button>
  );
}
