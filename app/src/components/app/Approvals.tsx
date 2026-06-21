import { type AppState, type ContentItem, PLATFORMS, STATUS_META, type PlatformKey } from '@/types';

interface ApprovalsProps {
  content: ContentItem[];
  selectedContentId: string;
  previewPlatform: PlatformKey;
  accounts: AppState['accounts'];
  onSelect: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSetPreviewPlatform: (p: PlatformKey) => void;
  onOpenComposer: () => void;
}

export function Approvals({
  content,
  selectedContentId,
  previewPlatform,
  accounts,
  onSelect,
  onApprove,
  onReject,
  onSetPreviewPlatform,
  onOpenComposer,
}: ApprovalsProps) {
  const sel = content.find(c => c.id === selectedContentId) || content[0];
  const connectedPlatforms = accounts.filter(a => a.status === 'connected').map(a => a.platform);
  const ppMeta = PLATFORMS[previewPlatform];
  const bodyLen = sel ? sel.body.length : 0;

  return (
    <div style={{ animation: 'cdRise .4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 30, letterSpacing: '-.02em', margin: '0 0 4px', color: '#18181b' }}>
            Approvals
          </h1>
          <p style={{ color: '#71717a', fontSize: '14.5px', margin: 0 }}>
            Review the queue, approve in one click, and preview exactly how it posts.
          </p>
        </div>
        <button
          onClick={onOpenComposer}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: '#1a1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '11px 16px',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          &#65291; New content
        </button>
      </div>

      <div className="cd-appr" style={{ display: 'grid', gridTemplateColumns: '1fr 372px', gap: 20, alignItems: 'start' }}>
        {/* Content list */}
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: 8 }}>
          {content.map(c => {
            const meta = STATUS_META[c.status] || STATUS_META.draft;
            const prev = c.body.length > 96 ? c.body.slice(0, 96) + '\u2026' : c.body;
            const isSelected = selectedContentId === c.id;
            const isPending = c.status === 'pending_approval';

            return (
              <div
                key={c.id}
                onClick={() => onSelect(c.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 110px',
                  gap: 12,
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  border: `1px solid ${isSelected ? 'rgba(0,0,0,.14)' : 'transparent'}`,
                  background: isSelected ? '#fff' : 'transparent',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '14.5px', color: '#18181b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.title}
                    </span>
                    <span style={{
                      background: meta.bg,
                      color: meta.fg,
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 9px',
                      borderRadius: 6,
                      whiteSpace: 'nowrap',
                    }}>
                      {meta.label}
                    </span>
                  </div>
                  <div style={{ color: '#71717a', fontSize: 13, lineHeight: 1.4, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {prev}
                  </div>
                  <div style={{ color: '#a1a1aa', fontSize: 12 }}>
                    {c.hashtags.join(' ')}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                  {isPending && (
                    <>
                      <button
                        onClick={e => { e.stopPropagation(); onApprove(c.id); }}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: 'none',
                          background: '#9fff00',
                          color: '#000',
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                        title="Approve"
                      >
                        &#10003;
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); onReject(c.id); }}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: '1px solid rgba(0,0,0,.12)',
                          background: '#fff',
                          color: '#71717a',
                          cursor: 'pointer',
                          fontSize: 13,
                        }}
                        title="Reject"
                      >
                        &#10005;
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview panel */}
        <div style={{ position: 'sticky', top: 6, background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: '.04em', textTransform: 'uppercase' }}>
              Preview
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {connectedPlatforms.map(pk => {
                const p = PLATFORMS[pk];
                const active = previewPlatform === pk;
                return (
                  <button
                    key={pk}
                    onClick={() => onSetPreviewPlatform(pk)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 700,
                      color: active ? '#fff' : '#71717a',
                      background: active ? p.color : '#f4f4f5',
                    }}
                  >
                    {p.short}
                  </button>
                );
              })}
            </div>
          </div>

          {sel && (
            <div style={{ border: '1px solid rgba(0,0,0,.07)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', borderBottom: '1px solid rgba(0,0,0,.06)' }}>
                <span style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#fff',
                  background: ppMeta.color,
                }}>
                  {ppMeta.short}
                </span>
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#18181b' }}>insane-post</div>
                  <div style={{ fontSize: 12, color: '#a1a1aa' }}>
                    {accounts.find(a => a.platform === previewPlatform)?.handle || '@insane-post'} &middot; {ppMeta.label}
                  </div>
                </div>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontWeight: 600, fontSize: '14.5px', color: '#18181b', marginBottom: 6 }}>{sel.title}</div>
                <div style={{ fontSize: '13.5px', lineHeight: 1.55, color: '#3f3f46', marginBottom: 10 }}>{sel.body}</div>
                <div style={{ fontSize: 13, color: '#0958d9', fontWeight: 500, marginBottom: 10 }}>
                  {sel.hashtags.join(' ')}
                </div>
                {sel.link && (
                  <div style={{
                    fontSize: '12.5px',
                    color: '#0958d9',
                    border: '1px solid rgba(0,0,0,.08)',
                    borderRadius: 9,
                    padding: '9px 11px',
                    background: '#fafafa',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    &#128279; {sel.link}
                  </div>
                )}
                {(previewPlatform === 'x' || previewPlatform === 'bluesky') && (
                  <div style={{
                    marginTop: 12,
                    fontSize: '11.5px',
                    color: bodyLen > (previewPlatform === 'x' ? 280 : 300) ? '#dc2626' : '#a1a1aa',
                    textAlign: 'right',
                  }}>
                    {bodyLen} / {previewPlatform === 'x' ? 280 : 300}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cd-appr { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}