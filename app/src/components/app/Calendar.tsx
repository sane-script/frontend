import type { MutableRefObject } from 'react';
import { type Account, type ContentItem, type ScheduledPost } from '@/types';
import { PlatformIcon } from '@/components/icons/PlatformIcon';
import { ErrorBanner, Spinner } from '@/components/app/States';
import { addDays, mondayOf, fmtISO, sameDay, md, hourLabel } from '@/lib/dateUtils';
import { bandHours } from '@/lib/seedData';

interface CalendarProps {
  weekOffset: number;
  scheduled: ScheduledPost[];
  content: ContentItem[];
  accounts: Account[];
  openChip: number | null;
  dragRef: MutableRefObject<{ type: 'chip' | 'rail'; id: number } | null>;
  loading: boolean;
  error: string | null;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onDropOnCell: (date: string, hour: number) => void;
  onPublishNow: (sid: number) => void;
  onCancelSched: (sid: number) => void;
  onSetOpenChip: (id: number | null) => void;
  onCloseChip: () => void;
  onRetry: () => void;
}

export function Calendar({
  weekOffset, scheduled, content, accounts, openChip, dragRef, loading, error,
  onPrevWeek, onNextWeek, onDropOnCell, onPublishNow, onCancelSched, onSetOpenChip, onCloseChip, onRetry,
}: CalendarProps) {
  const mon = mondayOf(addDays(new Date(), weekOffset * 7));
  const today = new Date();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const weekHeader = Array.from({ length: 7 }, (_, i) => {
    const dt = addDays(mon, i);
    const isT = sameDay(dt, today);
    return { label: dayNames[i], dateNum: dt.getDate(), iso: fmtISO(dt), isToday: isT };
  });

  const weekLabel = `${md(mon)} – ${md(addDays(mon, 6))}, ${addDays(mon, 6).getFullYear()}`;

  const scheduledContentIds = new Set(scheduled.map(p => p.contentId));
  const railItems = content
    .filter(c => c.status === 'approved' && !scheduledContentIds.has(c.id))
    .map(c => ({ id: c.id, title: c.title, tags: c.hashtags.slice(0, 2).map(t => '#' + t.replace(/^#/, '')).join(' ') }));

  const connectedCount = accounts.filter(a => a.status === 'connected').length;
  const hasChips = scheduled.length > 0;

  return (
    <div style={{ animation: 'cdRise .4s ease both' }} onClick={onCloseChip}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 30, letterSpacing: '-.02em', margin: '0 0 4px', color: '#18181b' }}>Calendar</h1>
          <p style={{ color: '#71717a', fontSize: '14.5px', margin: 0 }}>
            Drag a chip to reschedule. Drag from "Ready to schedule" onto the grid to queue it.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onPrevWeek} style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid rgba(0,0,0,.1)', background: '#fff', cursor: 'pointer', color: '#3f3f46', fontSize: 15 }}>&#8249;</button>
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#18181b', minWidth: 170, textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {weekLabel}{loading && <Spinner size={13} />}
          </span>
          <button onClick={onNextWeek} style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid rgba(0,0,0,.1)', background: '#fff', cursor: 'pointer', color: '#3f3f46', fontSize: 15 }}>&#8250;</button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      <div className="cd-cal" style={{ display: 'grid', gridTemplateColumns: '212px 1fr', gap: 18, alignItems: 'start' }}>
        {/* Ready rail */}
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: 16, position: 'sticky', top: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 12 }}>Ready to schedule</div>
          {connectedCount === 0 && (
            <div style={{ fontSize: 12, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 10px', marginBottom: 10, lineHeight: 1.4 }}>
              Connect an account to schedule posts.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {railItems.length === 0 ? (
              <div style={{ fontSize: 12.5, color: '#a1a1aa', padding: '6px 2px' }}>No approved posts waiting.</div>
            ) : railItems.map(r => (
              <div
                key={r.id}
                draggable
                onDragStart={e => { dragRef.current = { type: 'rail', id: r.id }; if (e.dataTransfer) e.dataTransfer.setData('text/plain', String(r.id)); }}
                style={{ border: '1px dashed rgba(0,0,0,.16)', borderRadius: 10, padding: '10px 12px', cursor: 'grab', background: '#fafafa' }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: '#18181b', marginBottom: 2, lineHeight: 1.25 }}>{r.title}</div>
                <div style={{ fontSize: '11.5px', color: '#a1a1aa' }}>{r.tags}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="cd-scroll" style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: 12, overflowX: 'auto', position: 'relative' }}>
          <div style={{ minWidth: 720 }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '54px repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
              <div />
              {weekHeader.map((h, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '6px 0' }}>
                  <div style={{ fontSize: '11.5px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '.03em' }}>{h.label}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', marginTop: 3, fontSize: 13, fontWeight: 600, color: h.isToday ? '#1a1a1a' : '#18181b', background: h.isToday ? '#9fff00' : 'transparent' }}>{h.dateNum}</div>
                </div>
              ))}
            </div>

            {/* Rows */}
            {bandHours.map((hour, ri) => (
              <div key={ri} style={{ display: 'grid', gridTemplateColumns: '54px repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: '#a1a1aa', textAlign: 'right', paddingTop: 8, paddingRight: 4 }}>{hourLabel(hour)}</div>
                {weekHeader.map((h, ci) => {
                  const chips = scheduled.filter(p => p.date === h.iso && p.hour === hour);
                  return (
                    <div
                      key={`${h.iso}-${hour}`}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); onDropOnCell(weekHeader[ci].iso, hour); }}
                      style={{ minHeight: 54, border: '1px solid rgba(0,0,0,.05)', borderRadius: 9, padding: 4, display: 'flex', flexDirection: 'column', gap: 4, background: '#fcfcfd' }}
                    >
                      {chips.map(chip => (
                        <div
                          key={chip.id}
                          draggable
                          onDragStart={e => { dragRef.current = { type: 'chip', id: chip.id }; if (e.dataTransfer) e.dataTransfer.setData('text/plain', String(chip.id)); }}
                          style={{ position: 'relative', borderRadius: 7, padding: '5px 6px', cursor: 'grab', background: chip.status === 'published' ? '#ecfccb' : '#f4f5fb', borderLeft: `3px solid ${chip.status === 'published' ? '#65a30d' : '#9aa3c7'}` }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <PlatformIcon platform={chip.platform} box={15} radius={4} />
                            <span style={{ fontSize: '10.5px', color: '#52525b', fontWeight: 500 }}>{hourLabel(chip.hour)}</span>
                            {chip.status !== 'published' && (
                              <button onClick={e => { e.stopPropagation(); onSetOpenChip(openChip === chip.id ? null : chip.id); }} style={{ marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', color: '#a1a1aa', fontSize: 12, lineHeight: 1, padding: '0 2px' }}>&#8943;</button>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: '#18181b', lineHeight: 1.2, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chip.title}</div>
                          {openChip === chip.id && (
                            <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: '100%', right: 0, zIndex: 20, background: '#fff', border: '1px solid rgba(0,0,0,.1)', borderRadius: 9, boxShadow: '0 8px 24px rgba(0,0,0,.14)', padding: 4, width: 124, marginTop: 3 }}>
                              <button onClick={e => { e.stopPropagation(); onPublishNow(chip.id); onSetOpenChip(null); }} style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#18181b', padding: '7px 9px', borderRadius: 6 }} onMouseEnter={e => { (e.target as HTMLElement).style.background = '#f4f4f5'; }} onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; }}>Publish now</button>
                              <button onClick={e => { e.stopPropagation(); onCancelSched(chip.id); onSetOpenChip(null); }} style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#b91c1c', padding: '7px 9px', borderRadius: 6 }} onMouseEnter={e => { (e.target as HTMLElement).style.background = '#fee2e2'; }} onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; }}>Cancel</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {!loading && !hasChips && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', color: '#c4c4cc', fontSize: 14, fontWeight: 500 }}>
              Nothing scheduled this week
            </div>
          )}
        </div>
      </div>

      <style>{`@media (max-width: 768px) { .cd-cal { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
