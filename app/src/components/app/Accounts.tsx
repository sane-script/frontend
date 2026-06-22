import { useState } from 'react';
import { type Account, PLATFORMS, type PlatformKey } from '@/types';
import { PlatformIcon } from '@/components/icons/PlatformIcon';
import { Spinner, ErrorBanner } from '@/components/app/States';

interface AccountsProps {
  accounts: Account[];
  connectingId: number | null;
  loading: boolean;
  error: string | null;
  onConnect: (account: Account, creds?: { handle: string; app_password: string }) => void;
  onDisconnect: (account: Account) => void;
  onRetry: () => void;
}

const statusMap: Record<string, { label: string; dot: string; fg: string }> = {
  connected: { label: 'Connected', dot: '#65a30d', fg: '#3f6212' },
  disconnected: { label: 'Disconnected', dot: '#a1a1aa', fg: '#71717a' },
  error: { label: 'Auth error', dot: '#dc2626', fg: '#b91c1c' },
  connecting: { label: 'Connecting…', dot: '#9fff00', fg: '#3f6212' },
};

export function Accounts({ accounts, connectingId, loading, error, onConnect, onDisconnect, onRetry }: AccountsProps) {
  const [modal, setModal] = useState<Account | null>(null);

  const startConnect = (a: Account) => {
    if (a.platform === 'bluesky') setModal(a); // real login → needs credentials
    else onConnect(a); // mock adapters → simulate immediately
  };

  return (
    <div style={{ animation: 'cdRise .4s ease both' }}>
      <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 30, letterSpacing: '-.02em', margin: '0 0 4px', color: '#18181b' }}>
        Accounts
      </h1>
      <p style={{ color: '#71717a', fontSize: '14.5px', margin: '0 0 26px' }}>
        Connect a network in under two minutes. Bluesky posts go out live; the others run on simulated adapters.
      </p>

      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(258px, 1fr))', gap: 16 }}>
        {loading && accounts.length === 0
          ? [0, 1, 2, 3, 4].map(i => (
              <div key={i} className="cd-skeleton" style={{ height: 168, borderRadius: 16 }} />
            ))
          : accounts.map(a => {
              const meta = PLATFORMS[a.platform];
              const isConnecting = connectingId === a.id;
              const effStatus = isConnecting ? 'connecting' : a.status;
              const sinfo = statusMap[effStatus] || statusMap.disconnected;
              const connected = a.status === 'connected' && !isConnecting;
              const isError = a.status === 'error' && !isConnecting;

              return (
                <div key={a.id} style={{
                  background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16,
                  padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <PlatformIcon platform={a.platform} box={42} radius={11} />
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: sinfo.fg }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: sinfo.dot }} />
                      {sinfo.label}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15.5px', color: '#18181b', display: 'flex', alignItems: 'center', gap: 7 }}>
                      {meta.label}
                      {a.live && connected && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#3f6212', background: '#ecfccb', borderRadius: 5, padding: '2px 6px', letterSpacing: '.03em' }}>
                          LIVE
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#a1a1aa', fontSize: 13, marginTop: 2 }}>
                      {connected ? a.handle : 'Not connected'}
                    </div>
                  </div>

                  {connected ? (
                    <button
                      onClick={() => onDisconnect(a)}
                      disabled={isConnecting}
                      style={{ border: '1px solid rgba(0,0,0,.1)', background: '#fff', color: '#52525b', borderRadius: 9, padding: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                    >
                      Disconnect
                    </button>
                  ) : isConnecting ? (
                    <button disabled style={{ border: 'none', background: '#f4f4f5', color: '#a1a1aa', borderRadius: 9, padding: 9, fontSize: 13, fontWeight: 500, cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <Spinner size={14} /> Connecting…
                    </button>
                  ) : (
                    <button
                      onClick={() => startConnect(a)}
                      style={{ border: 'none', background: isError ? '#fee2e2' : '#1a1a1a', color: isError ? '#b91c1c' : '#fff', borderRadius: 9, padding: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                    >
                      {isError ? 'Reconnect' : 'Connect'}
                    </button>
                  )}
                </div>
              );
            })}
      </div>

      {modal && (
        <ConnectModal
          platform={modal.platform}
          onClose={() => setModal(null)}
          onConnect={(creds) => { onConnect(modal, creds); setModal(null); }}
        />
      )}
    </div>
  );
}

function ConnectModal({ platform, onClose, onConnect }: {
  platform: PlatformKey;
  onClose: () => void;
  onConnect: (creds: { handle: string; app_password: string }) => void;
}) {
  const [handle, setHandle] = useState('');
  const [pw, setPw] = useState('');
  const meta = PLATFORMS[platform];

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(24,24,27,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 420, padding: 26, boxShadow: '0 24px 60px rgba(0,0,0,.25)', animation: 'cdRise .3s ease both' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <PlatformIcon platform={platform} box={40} radius={10} />
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 19, margin: 0, color: '#18181b' }}>
            Connect {meta.label}
          </h3>
        </div>
        <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.5, margin: '0 0 18px' }}>
          Bluesky posts go out <strong>live</strong>. Enter your handle and an{' '}
          <a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noreferrer" style={{ color: '#0085FF' }}>app password</a>{' '}
          (not your main password).
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            value={handle} onChange={e => setHandle(e.target.value)}
            placeholder="you.bsky.social"
            style={{ border: '1px solid rgba(0,0,0,.12)', borderRadius: 10, padding: '11px 13px', fontSize: 14, color: '#18181b' }}
          />
          <input
            type="password" value={pw} onChange={e => setPw(e.target.value)}
            placeholder="App password (xxxx-xxxx-xxxx-xxxx)"
            style={{ border: '1px solid rgba(0,0,0,.12)', borderRadius: 10, padding: '11px 13px', fontSize: 14, color: '#18181b' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ border: '1px solid rgba(0,0,0,.12)', background: '#fff', color: '#52525b', borderRadius: 10, padding: '11px 18px', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={() => onConnect({ handle: handle.trim(), app_password: pw.trim() })}
            disabled={!handle.trim() || !pw.trim()}
            style={{ border: 'none', background: '#9fff00', color: '#000', borderRadius: 10, padding: '11px 18px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', opacity: !handle.trim() || !pw.trim() ? 0.5 : 1 }}
          >
            Connect live
          </button>
        </div>
      </div>
    </div>
  );
}
