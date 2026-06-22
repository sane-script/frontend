import type { TabKey } from '@/types';

interface SidebarProps {
  tab: TabKey;
  onSetTab: (tab: TabKey) => void;
  onGoSite: () => void;
}

const NAV: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: 'create',
    label: 'Create',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    key: 'calendar',
    label: 'Calendar',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="3" y1="20" x2="21" y2="20" />
      </svg>
    ),
  },
  {
    key: 'accounts',
    label: 'Accounts',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: 'review',
    label: 'Review queue',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

export function Sidebar({ tab, onSetTab, onGoSite }: SidebarProps) {
  return (
    <aside style={{
      width: 220,
      flex: 'none',
      background: '#fff',
      borderRight: '1px solid rgba(0,0,0,.06)',
      display: 'flex',
      flexDirection: 'column',
      padding: '22px 14px',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 8px 22px' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#1a1a1a" d="M12 2c1.6 2.2 3.4 3.2 6 3 -.2 2.6 .8 4.4 3 6 -2.2 1.6-3.2 3.4-3 6 -2.6-.2-4.4 .8-6 3 -1.6-2.2-3.4-3.2-6-3 .2-2.6-.8-4.4-3-6 2.2-1.6 3.2-3.4 3-6 2.6 .2 4.4-.8 6-3Z" />
        </svg>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 17, color: '#1a1a1a' }}>
          insane-post
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ key, label, icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => onSetTab(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                width: '100%',
                textAlign: 'left',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 10,
                padding: '10px 12px',
                fontSize: 13.5,
                fontWeight: active ? 600 : 500,
                color: active ? '#18181b' : '#71717a',
                background: active ? '#f4f4f5' : 'transparent',
                transition: 'background .12s, color .12s',
              }}
            >
              <span style={{ color: active ? '#18181b' : '#a1a1aa', flex: 'none', display: 'flex' }}>{icon}</span>
              <span>{label}</span>
              {active && (
                <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#9fff00', flex: 'none' }} />
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#f4f4f5',
          borderRadius: 10,
          padding: '9px 12px',
          fontSize: 13,
          color: '#3f3f46',
        }}>
          <span style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: '#9fff00',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            flex: 'none',
          }}>c</span>
          @insane-post
        </div>
        <button
          onClick={onGoSite}
          style={{ fontSize: '12.5px', color: '#71717a', cursor: 'pointer', padding: '0 4px', background: 'none', border: 'none', textAlign: 'left' }}
        >
          &larr; back to site
        </button>
      </div>
    </aside>
  );
}
