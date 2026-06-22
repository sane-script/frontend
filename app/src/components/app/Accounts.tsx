import { useState } from 'react';
import { type Account, PLATFORMS } from '@/types';
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

const statusMeta: Record<string, { label: string; dot: string; fg: string }> = {
  connected:    { label: 'Connected',    dot: '#65a30d', fg: '#3f6212' },
  disconnected: { label: 'Disconnected', dot: '#a1a1aa', fg: '#71717a' },
  error:        { label: 'Auth error',   dot: '#dc2626', fg: '#b91c1c' },
  connecting:   { label: 'Connecting…', dot: '#9fff00', fg: '#3f6212' },
};

type ModalState =
  | { kind: 'bluesky'; account: Account }
  | { kind: 'simulate'; account: Account }
  | null;

export function Accounts({ accounts, connectingId, loading, error, onConnect, onDisconnect, onRetry }: AccountsProps) {
  const [modal, setModal] = useState<ModalState>(null);

  function startConnect(a: Account) {
    if (a.platform === 'bluesky') setModal({ kind: 'bluesky', account: a });
    else setModal({ kind: 'simulate', account: a });
  }

  return (
    <div style={{ animation: 'cdRise .4s ease both' }}>
      <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 30, letterSpacing: '-.02em', margin: '0 0 4px', color: '#18181b' }}>
        Accounts
      </h1>
      <p style={{ color: '#71717a', fontSize: '14.5px', margin: '0 0 26px' }}>
        Connect your networks here — takes under two minutes. Bluesky posts go out live; the others run on simulated adapters.
      </p>

      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(256px, 1fr))', gap: 16 }}>
        {loading && accounts.length === 0
          ? [0, 1, 2, 3, 4].map(i => <div key={i} className="cd-skeleton" style={{ height: 172, borderRadius: 16 }} />)
          : accounts.map(a => {
              const meta = PLATFORMS[a.platform];
              const isConnecting = connectingId === a.id;
              const effStatus = isConnecting ? 'connecting' : a.status;
              const sinfo = statusMeta[effStatus] ?? statusMeta.disconnected;
              const connected = a.status === 'connected' && !isConnecting;
              const isError = a.status === 'error' && !isConnecting;

              return (
                <div key={a.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <PlatformIcon platform={a.platform} box={42} radius={11} />
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: sinfo.fg }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: sinfo.dot, flex: 'none' }} />
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
                      {!a.live && connected && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#1e40af', background: '#dbeafe', borderRadius: 5, padding: '2px 6px', letterSpacing: '.03em' }}>
                          SIMULATED
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

      {/* Bluesky: real credentials modal */}
      {modal?.kind === 'bluesky' && (
        <BlueskyModal
          account={modal.account}
          onClose={() => setModal(null)}
          onConnect={creds => { onConnect(modal.account, creds); setModal(null); }}
        />
      )}

      {/* Others: honest "simulated connection" modal */}
      {modal?.kind === 'simulate' && (
        <SimulateModal
          account={modal.account}
          onClose={() => setModal(null)}
          onConnect={() => { onConnect(modal.account); setModal(null); }}
        />
      )}
    </div>
  );
}

// ── Bluesky live-credentials modal ──────────────────────────────────────────

function BlueskyModal({ account, onClose, onConnect }: {
  account: Account;
  onClose: () => void;
  onConnect: (creds: { handle: string; app_password: string }) => void;
}) {
  const [handle, setHandle] = useState('');
  const [pw, setPw] = useState('');
  const ok = handle.trim().length > 0 && pw.trim().length > 0;

  return (
    <Modal onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <PlatformIcon platform={account.platform} box={40} radius={10} />
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 19, margin: 0, color: '#18181b' }}>
          Connect Bluesky
        </h3>
      </div>
      <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.55, margin: '0 0 18px' }}>
        Posts go out <strong>live</strong> to your real Bluesky account. Enter your handle and an{' '}
        <a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noreferrer" style={{ color: '#0085FF' }}>
          app password
        </a>{' '}
        (not your main password — create one in Bluesky settings).
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          value={handle} onChange={e => setHandle(e.target.value)}
          placeholder="you.bsky.social"
          style={{ border: '1px solid rgba(0,0,0,.12)', borderRadius: 10, padding: '11px 13px', fontSize: 14, color: '#18181b' }}
          autoFocus
        />
        <input
          type="password" value={pw} onChange={e => setPw(e.target.value)}
          placeholder="App password (xxxx-xxxx-xxxx-xxxx)"
          style={{ border: '1px solid rgba(0,0,0,.12)', borderRadius: 10, padding: '11px 13px', fontSize: 14, color: '#18181b' }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
        <ModalCancelBtn onClick={onClose} />
        <button
          onClick={() => onConnect({ handle: handle.trim(), app_password: pw.trim() })}
          disabled={!ok}
          style={{ border: 'none', background: '#9fff00', color: '#000', borderRadius: 10, padding: '11px 20px', fontSize: 13.5, fontWeight: 600, cursor: ok ? 'pointer' : 'default', opacity: ok ? 1 : 0.5 }}
        >
          Connect live
        </button>
      </div>
    </Modal>
  );
}

// ── Simulated-connection modal for all other platforms ───────────────────────

function SimulateModal({ account, onClose, onConnect }: {
  account: Account;
  onClose: () => void;
  onConnect: () => void;
}) {
  const meta = PLATFORMS[account.platform];
  return (
    <Modal onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <PlatformIcon platform={account.platform} box={40} radius={10} />
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 19, margin: 0, color: '#18181b' }}>
          Connect {meta.label}
        </h3>
      </div>
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: '#78350f', margin: 0, lineHeight: 1.6 }}>
          <strong>Demo mode:</strong> In production this would use {meta.label}'s OAuth flow. For this workspace, clicking "Enable" creates a <em>simulated</em> connection — scheduling and the calendar will work, but posts do not go out to the real network.
        </p>
      </div>
      <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 18px', lineHeight: 1.55 }}>
        You can connect Bluesky for a <em>real live</em> publishing test. {meta.label} is honest demo mode only.
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <ModalCancelBtn onClick={onClose} />
        <button
          onClick={onConnect}
          style={{ border: 'none', background: '#1a1a1a', color: '#fff', borderRadius: 10, padding: '11px 20px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
        >
          Enable simulated connection
        </button>
      </div>
    </Modal>
  );
}

// ── Shared modal shell ───────────────────────────────────────────────────────

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(24,24,27,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 430, padding: 26, boxShadow: '0 24px 60px rgba(0,0,0,.25)', animation: 'cdRise .3s ease both' }}
      >
        {children}
      </div>
    </div>
  );
}

function ModalCancelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ border: '1px solid rgba(0,0,0,.12)', background: '#fff', color: '#52525b', borderRadius: 10, padding: '11px 18px', fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}
    >
      Cancel
    </button>
  );
}

