import { type Account, PLATFORMS } from '@/types';

interface AccountsProps {
  accounts: Account[];
  onToggle: (id: string) => void;
}

export function Accounts({ accounts, onToggle }: AccountsProps) {
  const statusMap: Record<string, { label: string; dot: string; fg: string }> = {
    connected: { label: 'Connected', dot: '#65a30d', fg: '#3f6212' },
    disconnected: { label: 'Disconnected', dot: '#a1a1aa', fg: '#71717a' },
    error: { label: 'Auth error', dot: '#dc2626', fg: '#b91c1c' },
    connecting: { label: 'Connecting\u2026', dot: '#9fff00', fg: '#3f6212' },
  };

  return (
    <div style={{ animation: 'cdRise .4s ease both' }}>
      <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 30, letterSpacing: '-.02em', margin: '0 0 4px', color: '#18181b' }}>
        Accounts
      </h1>
      <p style={{ color: '#71717a', fontSize: '14.5px', margin: '0 0 26px' }}>
        Connect a network in under two minutes. Bluesky posts go out live.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(258px, 1fr))', gap: 16 }}>
        {accounts.map(a => {
          const meta = PLATFORMS[a.platform];
          const sinfo = statusMap[a.status] || statusMap.disconnected;
          const connected = a.status === 'connected';
          const connecting = a.status === 'connecting';

          return (
            <div key={a.id} style={{
              background: '#fff',
              border: '1px solid rgba(0,0,0,.06)',
              borderRadius: 16,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#fff',
                  background: meta.color,
                }}>
                  {meta.short}
                </span>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  color: sinfo.fg,
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: sinfo.dot }} />
                  {sinfo.label}
                </span>
              </div>
              <div>
                <div style={{
                  fontWeight: 600,
                  fontSize: '15.5px',
                  color: '#18181b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}>
                  {meta.label}
                  {a.live && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#3f6212',
                      background: '#ecfccb',
                      borderRadius: 5,
                      padding: '2px 6px',
                      letterSpacing: '.03em',
                    }}>
                      LIVE
                    </span>
                  )}
                </div>
                <div style={{ color: '#a1a1aa', fontSize: 13, marginTop: 2 }}>{a.handle}</div>
              </div>
              <button
                onClick={() => onToggle(a.id)}
                disabled={connecting}
                style={connected
                  ? { border: '1px solid rgba(0,0,0,.1)', background: '#fff', color: '#52525b', borderRadius: 9, padding: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer' }
                  : connecting
                    ? { border: 'none', background: '#f4f4f5', color: '#a1a1aa', borderRadius: 9, padding: 9, fontSize: 13, fontWeight: 500, cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }
                    : { border: 'none', background: '#1a1a1a', color: '#fff', borderRadius: 9, padding: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }
                }
              >
                {connected ? 'Disconnect' : (connecting ? 'Connecting\u2026' : (a.status === 'error' ? 'Reconnect' : 'Connect'))}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}