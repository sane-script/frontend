import { type Account, type ContentItem, PLATFORMS, STATUS_META, type PlatformKey } from '@/types';
import { PlatformIcon } from '@/components/icons/PlatformIcon';
import { LoadingPanel, ErrorBanner, EmptyState } from '@/components/app/States';

interface ApprovalsProps {
  content: ContentItem[];
  selectedContentId: number | null;
  previewPlatform: PlatformKey;
  accounts: Account[];
  loading: boolean;
  error: string | null;
  onSelect: (id: number) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onSetPreviewPlatform: (p: PlatformKey) => void;
  onOpenComposer: () => void;
  onRetry: () => void;
}

const fmtTags = (tags: string[]) => tags.map(t => '#' + t.replace(/^#/, '')).join(' ');

export function Approvals({
  content, selectedContentId, previewPlatform, accounts,
  loading, error, onSelect, onApprove, onReject, onSetPreviewPlatform, onOpenComposer, onRetry,
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
            Review queue
          </h1>
          <p style={{ color: '#71717a', fontSize: '14.5px', margin: 0 }}>
            Team drafts land here. Approve in one click to unlock scheduling, or reject to send back.
          </p>
        </div>
        <button
          onClick={onOpenComposer}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 16px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          &#65291; New content
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      {loading && content.length === 0 ? (
        <LoadingPanel label="Loading content…" />
      ) : content.length === 0 ? (
        <EmptyState
          title="No drafts yet"
          hint="Use 'Save as draft' in Create to send a post here for team review."
          action={
            <button onClick={onOpenComposer} style={{ border: 'none', background: '#9fff00', color: '#000', borderRadius: 10, padding: '11px 18px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
              Go to Create →
            </button>
          }
        />
      ) : (
        <div className="cd-appr" style={{ display: 'grid', gridTemplateColumns: '1fr 372px', gap: 20, alignItems: 'start' }}>
          {/* Content list */}
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: 8 }}>
            {content.map(c => {
              const meta = STATUS_META[c.status] || STATUS_META.draft;
              const prev = c.body.length > 96 ? c.body.slice(0, 96) + '…' : c.body;
              const isSelected = (selectedContentId ?? content[0]?.id) === c.id;
              const isPending = c.status === 'pending_approval';

              return (
                <div
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 12, alignItems: 'center', padding: '14px 16px', borderRadius: 12, cursor: 'pointer', border: `1px solid ${isSelected ? 'rgba(0,0,0,.14)' : 'transparent'}`, background: isSelected ? '#fff' : 'transparent' }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: '14.5px', color: '#18181b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</span>
                      <span style={{ background: meta.bg, color: meta.fg, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, whiteSpace: 'nowrap' }}>{meta.label}</span>
                    </div>
                    <div style={{ color: '#71717a', fontSize: 13, lineHeight: 1.4, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prev || '(no body)'}</div>
                    <div style={{ color: '#a1a1aa', fontSize: 12 }}>{fmtTags(c.hashtags)}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                    {isPending && (
                      <>
                        <button onClick={e => { e.stopPropagation(); onApprove(c.id); }} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#9fff00', color: '#000', cursor: 'pointer', fontSize: 14, fontWeight: 700 }} title="Approve">&#10003;</button>
                        <button onClick={e => { e.stopPropagation(); onReject(c.id); }} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(0,0,0,.12)', background: '#fff', color: '#71717a', cursor: 'pointer', fontSize: 13 }} title="Reject">&#10005;</button>
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
              <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: '.04em', textTransform: 'uppercase' }}>Preview</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {connectedPlatforms.length === 0 && (
                  <span style={{ fontSize: 11.5, color: '#a1a1aa' }}>No accounts connected</span>
                )}
                {connectedPlatforms.map(pk => {
                  const active = previewPlatform === pk;
                  return (
                    <button
                      key={pk}
                      onClick={() => onSetPreviewPlatform(pk)}
                      title={PLATFORMS[pk].label}
                      style={{ width: 34, height: 34, borderRadius: 9, border: active ? '2px solid #1a1a1a' : '2px solid transparent', cursor: 'pointer', padding: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <PlatformIcon platform={pk} box={30} radius={8} />
                    </button>
                  );
                })}
              </div>
            </div>

            {sel && (
              <div style={{ border: '1px solid rgba(0,0,0,.07)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', borderBottom: '1px solid rgba(0,0,0,.06)' }}>
                  <PlatformIcon platform={previewPlatform} box={34} radius={17} />
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
                  {sel.media_url && (
                    <img src={sel.media_url} alt="" style={{ width: '100%', borderRadius: 10, marginBottom: 10, maxHeight: 220, objectFit: 'cover' }} />
                  )}
                  <div style={{ fontSize: 13, color: '#0958d9', fontWeight: 500, marginBottom: 10 }}>{fmtTags(sel.hashtags)}</div>
                  {sel.link && (
                    <div style={{ fontSize: '12.5px', color: '#0958d9', border: '1px solid rgba(0,0,0,.08)', borderRadius: 9, padding: '9px 11px', background: '#fafafa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      &#128279; {sel.link}
                    </div>
                  )}
                  {(previewPlatform === 'x' || previewPlatform === 'bluesky') && (
                    <div style={{ marginTop: 12, fontSize: '11.5px', color: bodyLen > (previewPlatform === 'x' ? 280 : 300) ? '#dc2626' : '#a1a1aa', textAlign: 'right' }}>
                      {bodyLen} / {previewPlatform === 'x' ? 280 : 300}
                    </div>
                  )}
                  {sel.status === 'pending_approval' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      <button onClick={() => onApprove(sel.id)} style={{ flex: 1, border: 'none', background: '#9fff00', color: '#000', borderRadius: 10, padding: '11px 0', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>&#10003; Approve</button>
                      <button onClick={() => onReject(sel.id)} style={{ flex: 1, border: '1px solid rgba(0,0,0,.12)', background: '#fff', color: '#52525b', borderRadius: 10, padding: '11px 0', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>&#10005; Reject</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@media (max-width: 768px) { .cd-appr { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
