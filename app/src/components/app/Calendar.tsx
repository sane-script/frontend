import type { MutableRefObject } from 'react';
import { type AppState, PLATFORMS } from '@/types';
import { addDays, mondayOf, fmtISO, sameDay, md, hourLabel } from '@/lib/dateUtils';
import { bandHours } from '@/lib/seedData';

interface CalendarProps {
  weekOffset: number;
  scheduled: AppState['scheduled'];
  content: AppState['content'];
  openChip: string | null;
  dragRef: MutableRefObject<{ type: 'chip' | 'rail'; id: string } | null>;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onDropOnCell: (date: string, hour: number) => void;
  onPublishNow: (sid: string) => void;
  onCancelSched: (sid: string) => void;
  onSetOpenChip: (id: string | null) => void;
  onCloseChip: () => void;
}

export function Calendar({
  weekOffset,
  scheduled,
  content,
  openChip,
  dragRef,
  onPrevWeek,
  onNextWeek,
  onDropOnCell,
  onPublishNow,
  onCancelSched,
  onSetOpenChip,
  onCloseChip,
}: CalendarProps) {
  const mon = mondayOf(addDays(new Date(), weekOffset * 7));
  const today = new Date();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const weekHeader: { label: string; dateNum: number; iso: string; isToday: boolean; todayBg: string; todayFg: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const dt = addDays(mon, i);
    const isT = sameDay(dt, today);
    weekHeader.push({
      label: dayNames[i],
      dateNum: dt.getDate(),
      iso: fmtISO(dt),
      isToday: isT,
      todayBg: isT ? '#9fff00' : 'transparent',
      todayFg: isT ? '#1a1a1a' : '#18181b',
    });
  }

  const weekLabel = `${md(mon)} \u2013 ${md(addDays(mon, 6))}, ${addDays(mon, 6).getFullYear()}`;

  const weekRows = bandHours.map(hour => {
    const cells = weekHeader.map(h => {
      const chips = scheduled.filter(p => p.date === h.iso && p.hour === hour).map(p => {
        const meta = PLATFORMS[p.platform];
        return {
          id: p.id,
          title: p.title,
          short: meta.short,
          color: meta.color,
          bg: p.status === 'published' ? '#ecfccb' : '#f4f5fb',
          time: hourLabel(p.hour),
          published: p.status === 'published',
        };
      });
      return {
        key: `${h.iso}-${hour}`,
        chips,
      };
    });
    return { hour, label: hourLabel(hour), cells };
  });

  const railItems = content.filter(c => c.status === 'approved').map(c => ({
    id: c.id,
    title: c.title,
    tags: c.hashtags.slice(0, 2).join(' '),
  }));

  return (
    <div style={{ animation: 'cdRise .4s ease both' }} onClick={onCloseChip}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 30, letterSpacing: '-.02em', margin: '0 0 4px', color: '#18181b' }}>
            Calendar
          </h1>
          <p style={{ color: '#71717a', fontSize: '14.5px', margin: 0 }}>
            Drag a chip to reschedule. Drag from "Ready to schedule" onto the grid to queue it.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onPrevWeek}
            style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid rgba(0,0,0,.1)', background: '#fff', cursor: 'pointer', color: '#3f3f46', fontSize: 15 }}
          >
            &#8249;
          </button>
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#18181b', minWidth: 170, textAlign: 'center' }}>
            {weekLabel}
          </span>
          <button
            onClick={onNextWeek}
            style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid rgba(0,0,0,.1)', background: '#fff', cursor: 'pointer', color: '#3f3f46', fontSize: 15 }}
          >
            &#8250;
          </button>
        </div>
      </div>

      <div className="cd-cal" style={{ display: 'grid', gridTemplateColumns: '212px 1fr', gap: 18, alignItems: 'start' }}>
        {/* Ready rail */}
        <div style={{
          background: '#fff',
          border: '1px solid rgba(0,0,0,.06)',
          borderRadius: 16,
          padding: 16,
          position: 'sticky',
          top: 6,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 12 }}>
            Ready to schedule
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {railItems.map(r => (
              <div
                key={r.id}
                draggable
                onDragStart={e => {
                  dragRef.current = { type: 'rail', id: r.id };
                  if (e.dataTransfer) e.dataTransfer.setData('text/plain', r.id);
                }}
                style={{
                  border: '1px dashed rgba(0,0,0,.16)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  cursor: 'grab',
                  background: '#fafafa',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: '#18181b', marginBottom: 2, lineHeight: 1.25 }}>
                  {r.title}
                </div>
                <div style={{ fontSize: '11.5px', color: '#a1a1aa' }}>{r.tags}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="cd-scroll" style={{
          background: '#fff',
          border: '1px solid rgba(0,0,0,.06)',
          borderRadius: 16,
          padding: 12,
          overflowX: 'auto',
        }}>
          <div style={{ minWidth: 720 }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '54px repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
              <div />
              {weekHeader.map((h, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '6px 0' }}>
                  <div style={{ fontSize: '11.5px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                    {h.label}
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    marginTop: 3,
                    fontSize: 13,
                    fontWeight: 600,
                    color: h.todayFg,
                    background: h.todayBg,
                  }}>
                    {h.dateNum}
                  </div>
                </div>
              ))}
            </div>

            {/* Rows */}
            {weekRows.map((row, ri) => (
              <div key={ri} style={{ display: 'grid', gridTemplateColumns: '54px repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: '#a1a1aa', textAlign: 'right', paddingTop: 8, paddingRight: 4 }}>
                  {row.label}
                </div>
                {row.cells.map((cell, ci) => (
                  <div
                    key={cell.key}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      onDropOnCell(weekHeader[ci].iso, row.hour);
                    }}
                    style={{
                      minHeight: 54,
                      border: '1px solid rgba(0,0,0,.05)',
                      borderRadius: 9,
                      padding: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      background: '#fcfcfd',
                    }}
                  >
                    {cell.chips.map(chip => (
                      <div
                        key={chip.id}
                        draggable
                        onDragStart={e => {
                          dragRef.current = { type: 'chip', id: chip.id };
                          if (e.dataTransfer) e.dataTransfer.setData('text/plain', chip.id);
                        }}
                        style={{
                          position: 'relative',
                          borderRadius: 7,
                          padding: '5px 6px',
                          cursor: 'grab',
                          background: chip.bg,
                          borderLeft: `3px solid ${chip.color}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{
                            width: 15,
                            height: 15,
                            borderRadius: 4,
                            flex: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 8,
                            fontWeight: 700,
                            color: '#fff',
                            background: chip.color,
                          }}>
                            {chip.short}
                          </span>
                          <span style={{ fontSize: '10.5px', color: '#52525b', fontWeight: 500 }}>{chip.time}</span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onSetOpenChip(openChip === chip.id ? null : chip.id);
                            }}
                            style={{ marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', color: '#a1a1aa', fontSize: 12, lineHeight: 1, padding: '0 2px' }}
                          >
                            &#8943;
                          </button>
                        </div>
                        <div style={{ fontSize: 11, color: '#18181b', lineHeight: 1.2, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {chip.title}
                        </div>
                        {openChip === chip.id && (
                          <div
                            onClick={e => e.stopPropagation()}
                            style={{
                              position: 'absolute',
                              top: '100%',
                              right: 0,
                              zIndex: 20,
                              background: '#fff',
                              border: '1px solid rgba(0,0,0,.1)',
                              borderRadius: 9,
                              boxShadow: '0 8px 24px rgba(0,0,0,.14)',
                              padding: 4,
                              width: 124,
                              marginTop: 3,
                            }}
                          >
                            <button
                              onClick={e => { e.stopPropagation(); onPublishNow(chip.id); onSetOpenChip(null); }}
                              style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#18181b', padding: '7px 9px', borderRadius: 6 }}
                              onMouseEnter={e => { (e.target as HTMLElement).style.background = '#f4f4f5'; }}
                              onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; }}
                            >
                              Publish now
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); onCancelSched(chip.id); onSetOpenChip(null); }}
                              style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#b91c1c', padding: '7px 9px', borderRadius: 6 }}
                              onMouseEnter={e => { (e.target as HTMLElement).style.background = '#fee2e2'; }}
                              onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cd-cal { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}