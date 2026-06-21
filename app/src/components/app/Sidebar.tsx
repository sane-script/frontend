import type { AppState } from '@/types';

interface SidebarProps {
  tab: AppState['tab'];
  onSetTab: (tab: AppState['tab']) => void;
  onGoSite: () => void;
}

const NAV_TABS: [AppState['tab'], string][] = [
  ['approvals', 'Approvals'],
  ['calendar', 'Calendar'],
  ['analytics', 'Analytics'],
  ['accounts', 'Accounts'],
];

export function Sidebar({ tab, onSetTab, onGoSite }: SidebarProps) {
  return (
    <aside style={{
      width: 248,
      flex: 'none',
      background: '#fff',
      borderRight: '1px solid rgba(0,0,0,.06)',
      display: 'flex',
      flexDirection: 'column',
      padding: '22px 16px',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 22px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#1a1a1a" d="M12 2c1.6 2.2 3.4 3.2 6 3 -.2 2.6 .8 4.4 3 6 -2.2 1.6-3.2 3.4-3 6 -2.6-.2-4.4 .8-6 3 -1.6-2.2-3.4-3.2-6-3 .2-2.6-.8-4.4-3-6 2.2-1.6 3.2-3.4 3-6 2.6 .2 4.4-.8 6-3Z" />
        </svg>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 19, color: '#1a1a1a' }}>
          insane-post
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {NAV_TABS.map(([key, label]) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => onSetTab(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                textAlign: 'left',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 10,
                padding: '10px 12px',
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                color: active ? '#18181b' : '#71717a',
                background: active ? '#f4f4f5' : 'transparent',
              }}
            >
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: active ? '#9fff00' : 'transparent',
                flex: 'none',
              }} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f4f4f5',
          borderRadius: 10,
          padding: '9px 12px',
          fontSize: 13,
          color: '#3f3f46',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
            }}>c</span>
            @insane-post
          </span>
          <span style={{ opacity: 0.5 }}>&#8997;</span>
        </div>
        <button
          onClick={onGoSite}
          style={{ fontSize: '12.5px', color: '#71717a', textDecoration: 'none', cursor: 'pointer', padding: '0 4px', background: 'none', border: 'none', textAlign: 'left' }}
        >
          &larr; back to site
        </button>
      </div>
    </aside>
  );
}