import { useState } from 'react';
import { type ContentItem, type Account, STATUS_META } from '@/types';
import { LoadingPanel, ErrorBanner, EmptyState } from '@/components/app/States';
import { fmtISO } from '@/lib/dateUtils';

interface DraftsProps {
  content: ContentItem[];
  accounts: Account[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onEdit: (item: ContentItem) => void;
  onDelete: (id: number) => void;
  onDuplicate: (item: ContentItem) => void;
  onApprove: (id: number) => void;
  onSchedule: (id: number, scheduledTime: string) => void;
  onPublishNow: (id: number) => void;
  onGoCreate: () => void;
}

const fmtTags = (tags: string[]) => tags.map(t => '#' + t.replace(/^#/, '')).join(' ');

export function Drafts({
  content, accounts, loading, error, onRetry,
  onEdit, onDelete, onDuplicate, onApprove, onSchedule, onPublishNow, onGoCreate,
}: DraftsProps) {
  const drafts = content.filter(c => c.status === 'draft' || c.status === 'pending_approval');
  const hasConnected = accounts.some(a => a.status === 'connected');
  const [scheduling, setScheduling] = useState<number | null>(null);

  return (
    <div style={{ animation: 'cdRise .4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 30, letterSpacing: '-.02em', margin: '0 0 4px', color: '#18181b' }}>Drafts</h1>
          <p style={{ color: '#71717a', fontSize: '14.5px', margin: 0 }}>Edit, duplicate, schedule, or publish any post you've saved.</p>
        </div>
        <button onClick={onGoCreate} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 16px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ New post</button>
      </div>

      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      {loading && content.length === 0 ? (
        <LoadingPanel label="Loading drafts…" />
      ) : drafts.length === 0 ? (
        <EmptyState
          title="No drafts yet"
          hint="Write a post in Create and click 'Save as draft' to keep it here."
          action={<button onClick={onGoCreate} style={{ border: 'none', background: '#9fff00', color: '#000', borderRadius: 10, padding: '11px 18px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Go to Create →</button>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {drafts.map(c => {
            const meta = STATUS_META[c.status];
            const isScheduling = scheduling === c.id;
            return (
              <div key={c.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 14, padding: 18 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {c.media_url && /\.(jpe?g|png|gif|webp)(\?.*)?$/i.test(c.media_url) && (
                    <img src={c.media_url} alt="" style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', flex: 'none' }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 15, color: '#18181b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                      <span style={{ background: meta.bg, color: meta.fg, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, whiteSpace: 'nowrap' }}>{meta.label}</span>
                    </div>
                    <div style={{ color: '#71717a', fontSize: 13, lineHeight: 1.45, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.body || '(no body)'}</div>
                    {c.hashtags.length > 0 && <div style={{ color: '#0958d9', fontSize: 12 }}>{fmtTags(c.hashtags)}</div>}
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 14 }}>
                  <ActBtn onClick={() => onEdit(c)}>Edit</ActBtn>
                  <ActBtn onClick={() => onDuplicate(c)}>Duplicate</ActBtn>
                  {c.status === 'pending_approval' && <ActBtn onClick={() => onApprove(c.id)}>Approve</ActBtn>}
                  <ActBtn onClick={() => setScheduling(isScheduling ? null : c.id)} active={isScheduling}>Schedule</ActBtn>
                  <ActBtn onClick={() => onPublishNow(c.id)} disabled={!hasConnected} primary>Post now</ActBtn>
                  <ActBtn onClick={() => onDelete(c.id)} danger>Delete</ActBtn>
                </div>

                {isScheduling && (
                  <SchedulePicker
                    disabled={!hasConnected}
                    onConfirm={(iso) => { onSchedule(c.id, iso); setScheduling(null); }}
                    onCancel={() => setScheduling(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SchedulePicker({ onConfirm, onCancel, disabled }: { onConfirm: (iso: string) => void; onCancel: () => void; disabled: boolean }) {
  const [date, setDate] = useState(fmtISO(new Date()));
  const [time, setTime] = useState('10:00');
  const inp: React.CSSProperties = { border: '1px solid rgba(0,0,0,.12)', borderRadius: 9, padding: '9px 11px', fontSize: 13.5, color: '#18181b' };
  return (
    <div style={{ marginTop: 12, padding: 12, background: '#fafafa', border: '1px solid rgba(0,0,0,.06)', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      {disabled ? (
        <span style={{ fontSize: 12.5, color: '#b45309' }}>Connect an account first to schedule.</span>
      ) : (
        <>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} />
          <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inp} />
          <button onClick={() => onConfirm(new Date(`${date}T${time}:00`).toISOString())} style={{ border: 'none', background: '#9fff00', color: '#000', borderRadius: 9, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Confirm</button>
          <button onClick={onCancel} style={{ border: 'none', background: 'transparent', color: '#71717a', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
        </>
      )}
    </div>
  );
}

function ActBtn({ children, onClick, primary, danger, active, disabled }: {
  children: React.ReactNode; onClick: () => void;
  primary?: boolean; danger?: boolean; active?: boolean; disabled?: boolean;
}) {
  const base: React.CSSProperties = {
    borderRadius: 9, padding: '8px 14px', fontSize: 12.5, fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.45 : 1,
  };
  let style: React.CSSProperties;
  if (primary) style = { ...base, border: 'none', background: '#9fff00', color: '#000' };
  else if (danger) style = { ...base, border: '1px solid rgba(0,0,0,.1)', background: '#fff', color: '#b91c1c' };
  else if (active) style = { ...base, border: '1.5px solid #1a1a1a', background: '#1a1a1a', color: '#fff' };
  else style = { ...base, border: '1px solid rgba(0,0,0,.12)', background: '#fff', color: '#52525b' };
  return <button onClick={onClick} disabled={disabled} style={style}>{children}</button>;
}
