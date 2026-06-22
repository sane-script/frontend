import { useState, useRef, useEffect } from 'react';
import type { Account, ContentItem, PlatformKey } from '@/types';
import { PLATFORMS } from '@/types';
import { PlatformIcon } from '@/components/icons/PlatformIcon';
import { Spinner, LoadingPanel, ErrorBanner } from '@/components/app/States';
import { uploadMedia, createContent, approveContent, schedulePost, publishNow } from '@/api/client';
import { fmtISO } from '@/lib/dateUtils';

interface CreateProps {
  accounts: Account[];
  content: ContentItem[];
  prefill: string;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSaved: (msg: string) => void;
  flash: (msg: string) => void;
  onGoAccounts: () => void;
  onGoCalendar: () => void;
  onGoAnalytics: () => void;
}

const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPT = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];

const field: React.CSSProperties = {
  border: '1px solid rgba(0,0,0,.12)', borderRadius: 10,
  padding: '11px 13px', fontSize: 14, color: '#18181b', width: '100%',
  background: '#fff',
};

type PublishMode = 'now' | 'schedule' | 'draft';

const fmtTags = (tags: string[]) => tags.map(t => '#' + t.replace(/^#/, '')).join(' ');

export function Create({ accounts, content, prefill, loading, error, onRetry, onSaved, flash, onGoAccounts, onGoCalendar, onGoAnalytics }: CreateProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [link, setLink] = useState('');

  const [file, setFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [publishMode, setPublishMode] = useState<PublishMode | null>(null);
  const [date, setDate] = useState(fmtISO(new Date()));
  const [time, setTime] = useState('10:00');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [previewPlatform, setPreviewPlatform] = useState<PlatformKey | null>(null);
  const [saving, setSaving] = useState(false);

  const [checklistDismissed, setChecklistDismissed] = useState(
    () => sessionStorage.getItem('cd_checklist_dismissed') === '1',
  );

  const connected = accounts.filter(a => a.status === 'connected');

  // Sync hero-search prefill into body (only if body is still empty)
  useEffect(() => {
    if (prefill && !body) setBody(prefill);
  }, [prefill]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-set preview to first connected account
  useEffect(() => {
    if (connected.length > 0 && !previewPlatform) {
      setPreviewPlatform(connected[0].platform);
    }
  }, [accounts]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFile(f: File) {
    setMediaError('');
    if (!ACCEPT.includes(f.type)) { setMediaError('Unsupported file — use jpg, png, gif, webp, mp4 or mov.'); return; }
    if (f.size > MAX_BYTES) { setMediaError('File exceeds the 25 MB limit.'); return; }
    setFile(f); setUploading(true);
    try { setMediaUrl(await uploadMedia(f)); }
    catch (e) { setMediaError('Upload failed: ' + (e instanceof Error ? e.message : '').slice(0, 60)); setFile(null); }
    finally { setUploading(false); }
  }

  function clearMedia() {
    setFile(null); setMediaUrl(''); setMediaError('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function resetForm() {
    setTitle(''); setBody(''); setHashtags(''); setLink('');
    clearMedia(); setPublishMode(null); setSelectedIds([]);
  }

  function toggleId(id: number) {
    setSelectedIds(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  async function submit(mode: PublishMode) {
    if (!title.trim()) { flash('Add a title first.'); return; }
    if (mode !== 'draft' && selectedIds.length === 0) {
      flash(connected.length === 0 ? 'Connect an account first.' : 'Select at least one account.'); return;
    }
    if (mode === 'schedule' && (!date || !time)) { flash('Pick a date and time.'); return; }

    setSaving(true);
    try {
      const tags = hashtags.split(/\s+/).filter(Boolean).map(t => t.replace(/^#/, ''));

      if (mode === 'draft') {
        await createContent({ title: title.trim(), body, hashtags: tags, link: link || null, media_url: mediaUrl || null, status: 'pending_approval' });
        resetForm();
        onSaved('Saved to Review queue.');
        return;
      }

      const created = await createContent({ title: title.trim(), body, hashtags: tags, link: link || null, media_url: mediaUrl || null, status: 'pending_approval' });
      await approveContent(created.id);
      const scheduledTime = mode === 'now'
        ? new Date().toISOString()
        : new Date(`${date}T${time}:00`).toISOString();
      const entries = await schedulePost({ content_id: created.id, account_ids: selectedIds, scheduled_time: scheduledTime });

      if (mode === 'now') {
        const results = await Promise.all(entries.map(e => publishNow(e.id)));
        const liveUrl = results.find(r => r.platform_post_url)?.platform_post_url ?? null;
        resetForm();
        onSaved(liveUrl ? `Posted live! Bluesky: ${liveUrl}` : 'Posted to all selected networks.');
      } else {
        resetForm();
        onSaved('Scheduled — see it on the Calendar.');
      }
    } catch (e) {
      flash('Error: ' + (e instanceof Error ? e.message : String(e)).slice(0, 80));
    } finally {
      setSaving(false);
    }
  }

  const dismissChecklist = () => {
    sessionStorage.setItem('cd_checklist_dismissed', '1');
    setChecklistDismissed(true);
  };

  const hasConnected = connected.length > 0;
  const hasContent = content.length > 0;

  const previewItem: Pick<ContentItem, 'title' | 'body' | 'hashtags' | 'link' | 'media_url'> = {
    title: title || 'Your title',
    body: body || 'Your post content will appear here…',
    hashtags: hashtags.split(/\s+/).filter(Boolean).map(t => t.replace(/^#/, '')),
    link: link,
    media_url: mediaUrl,
  };
  const bodyLen = body.length;

  const isImage = file ? file.type.startsWith('image/') : /\.(jpe?g|png|gif|webp)$/i.test(mediaUrl);
  const previewSrc = file && isImage ? URL.createObjectURL(file) : isImage ? mediaUrl : '';

  return (
    <div style={{ animation: 'cdRise .4s ease both' }}>
      <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 30, letterSpacing: '-.02em', margin: '0 0 4px', color: '#18181b' }}>
        Create
      </h1>
      <p style={{ color: '#71717a', fontSize: '14.5px', margin: '0 0 22px' }}>
        Write a post, pick platforms, then post it now, schedule it, or save as a draft.
      </p>

      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      {/* First-run checklist */}
      {!checklistDismissed && (
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.08)', borderRadius: 14, padding: '16px 20px', marginBottom: 22, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 15, color: '#18181b' }}>
              Getting started
            </span>
            <button
              onClick={dismissChecklist}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#a1a1aa', fontSize: 16, padding: '0 2px', lineHeight: 1 }}
              title="Dismiss"
            >&#10005;</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <CheckItem done={hasConnected} label="Connect an account" action={!hasConnected ? <CheckLink onClick={onGoAccounts}>Go to Accounts →</CheckLink> : null} />
            <CheckItem done={hasContent} label="Create your first post" action={null} hint="Write below" />
            <CheckItem done={false} label="See it on the calendar" action={<CheckLink onClick={onGoCalendar}>Go to Calendar →</CheckLink>} />
            <CheckItem done={false} label="Check analytics" action={<CheckLink onClick={onGoAnalytics}>Go to Analytics →</CheckLink>} />
          </div>
        </div>
      )}

      {loading && accounts.length === 0 ? (
        <LoadingPanel label="Loading…" />
      ) : (
        <div className="cd-create" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

          {/* ─── Left: compose + decision bar ──────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: 22 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Title"
                  style={field}
                />
                <div style={{ position: 'relative' }}>
                  <textarea
                    value={body} onChange={e => setBody(e.target.value)}
                    placeholder="Write your post…"
                    rows={5}
                    style={{ ...field, resize: 'vertical', lineHeight: 1.55, paddingBottom: 24 }}
                  />
                  <span style={{ position: 'absolute', right: 10, bottom: 8, fontSize: 11.5, color: bodyLen > 280 ? '#dc2626' : '#a1a1aa' }}>
                    {bodyLen}
                  </span>
                </div>
                <input value={hashtags} onChange={e => setHashtags(e.target.value)} placeholder="#hashtags (space-separated)" style={field} />
                <input value={link} onChange={e => setLink(e.target.value)} placeholder="Link (optional)" style={field} />

                {/* Media zone */}
                <div>
                  <input ref={fileRef} type="file" accept="image/*,video/*" hidden
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  {file || mediaUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(0,0,0,.12)', borderRadius: 12, padding: 12 }}>
                      {uploading ? (
                        <div style={{ width: 54, height: 54, borderRadius: 8, background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner size={18} /></div>
                      ) : previewSrc ? (
                        <img src={previewSrc} alt="" style={{ width: 54, height: 54, borderRadius: 8, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 54, height: 54, borderRadius: 8, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎬</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#18181b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file ? file.name : mediaUrl}
                        </div>
                        <div style={{ fontSize: 12, color: uploading ? '#a1a1aa' : '#65a30d' }}>{uploading ? 'Uploading…' : 'Ready'}</div>
                      </div>
                      <button onClick={clearMedia} style={{ border: 'none', background: '#f4f4f5', width: 28, height: 28, borderRadius: 7, cursor: 'pointer', color: '#71717a' }}>&#10005;</button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                      style={{ border: `2px dashed ${dragging ? '#9fff00' : 'rgba(0,0,0,.16)'}`, background: dragging ? 'rgba(159,255,0,.06)' : '#fafafa', borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer', fontSize: 13, color: '#71717a', transition: 'all .15s' }}
                    >
                      Drag an image or video, or <span style={{ color: '#18181b', fontWeight: 600 }}>click to browse</span>
                      <div style={{ fontSize: 11.5, color: '#a1a1aa', marginTop: 4 }}>Max 25 MB · jpg, png, gif, webp, mp4, mov</div>
                    </div>
                  )}
                  {mediaError && <div style={{ color: '#dc2626', fontSize: 12.5, marginTop: 6 }}>{mediaError}</div>}
                  {!file && (
                    <input
                      value={mediaUrl} onChange={e => setMediaUrl(e.target.value)}
                      placeholder="…or paste a media URL"
                      style={{ ...field, marginTop: 8, opacity: file ? 0.5 : 1 }}
                      disabled={!!file}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Schedule reveal */}
            {publishMode === 'schedule' && (
              <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: '16px 22px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#71717a', marginBottom: 10 }}>Pick a time</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={field} />
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} style={field} />
                </div>
              </div>
            )}

            {/* Decision bar */}
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: '16px 22px' }}>
              {!hasConnected && (
                <div style={{ fontSize: 13, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 9, padding: '9px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <span>Connect an account to post or schedule.</span>
                  <button onClick={onGoAccounts} style={{ border: 'none', background: 'transparent', color: '#b45309', fontWeight: 600, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>Go →</button>
                </div>
              )}
              <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
                <button
                  onClick={() => submit('now')}
                  disabled={saving || uploading || !hasConnected}
                  style={{ flex: '1 1 0', border: 'none', background: '#9fff00', color: '#000', borderRadius: 11, padding: '12px 16px', fontSize: 13.5, fontWeight: 700, cursor: saving || !hasConnected ? 'default' : 'pointer', opacity: !hasConnected ? 0.45 : saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {saving && publishMode === 'now' ? <Spinner size={13} /> : null}
                  Post now
                </button>
                <button
                  onClick={() => { setPublishMode(m => m === 'schedule' ? null : 'schedule'); }}
                  disabled={saving || uploading || !hasConnected}
                  style={{ flex: '1 1 0', border: `1.5px solid ${publishMode === 'schedule' ? '#1a1a1a' : 'rgba(0,0,0,.12)'}`, background: publishMode === 'schedule' ? '#1a1a1a' : '#fff', color: publishMode === 'schedule' ? '#fff' : '#3f3f46', borderRadius: 11, padding: '12px 16px', fontSize: 13.5, fontWeight: 600, cursor: saving || !hasConnected ? 'default' : 'pointer', opacity: !hasConnected ? 0.45 : saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {saving && publishMode === 'schedule' ? <Spinner size={13} /> : null}
                  {publishMode === 'schedule' ? 'Confirm schedule' : 'Schedule'}
                </button>
                <button
                  onClick={() => publishMode === 'schedule' ? submit('schedule') : submit('draft')}
                  disabled={saving || uploading}
                  style={{ flex: '1 1 0', border: '1px solid rgba(0,0,0,.12)', background: '#fff', color: '#52525b', borderRadius: 11, padding: '12px 16px', fontSize: 13.5, fontWeight: 600, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {saving && publishMode === 'draft' ? <Spinner size={13} /> : null}
                  Save as draft
                </button>
              </div>
              <div style={{ fontSize: 11.5, color: '#a1a1aa', marginTop: 10, lineHeight: 1.4 }}>
                <strong>Post now</strong> publishes immediately. <strong>Schedule</strong> picks a date & time. <strong>Save draft</strong> sends it to the Review queue.
              </div>
            </div>
          </div>

          {/* ─── Right: platform picker + preview ───────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Platform picker */}
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: '16px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 12 }}>Post to</div>
              {!hasConnected ? (
                <div style={{ fontSize: 13, color: '#71717a', lineHeight: 1.5 }}>
                  No accounts connected yet.{' '}
                  <button onClick={onGoAccounts} style={{ border: 'none', background: 'transparent', color: '#0085FF', fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0 }}>
                    Connect a network →
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {connected.map(a => {
                    const on = selectedIds.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        onClick={() => { toggleId(a.id); setPreviewPlatform(a.platform); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1.5px solid ${on ? '#1a1a1a' : 'rgba(0,0,0,.1)'}`, background: on ? '#1a1a1a' : '#fff', color: on ? '#fff' : '#3f3f46', borderRadius: 10, padding: '9px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', width: '100%' }}
                      >
                        <PlatformIcon platform={a.platform} box={26} radius={7} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div>{PLATFORMS[a.platform].label}</div>
                          <div style={{ fontSize: 11.5, fontWeight: 400, opacity: 0.65, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.handle}</div>
                        </div>
                        {a.live && <span style={{ fontSize: 10, fontWeight: 700, color: on ? '#9fff00' : '#3f6212', background: on ? 'rgba(159,255,0,.2)' : '#ecfccb', borderRadius: 4, padding: '2px 6px' }}>LIVE</span>}
                        <span style={{ fontSize: 14, opacity: on ? 1 : 0.3 }}>{on ? '✓' : '○'}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Live preview */}
            {previewPlatform && (
              <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: '16px 18px', position: 'sticky', top: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: '.04em', textTransform: 'uppercase' }}>Preview</span>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {connected.map(a => (
                      <button
                        key={a.id}
                        onClick={() => setPreviewPlatform(a.platform)}
                        title={PLATFORMS[a.platform].label}
                        style={{ width: 30, height: 30, borderRadius: 8, border: previewPlatform === a.platform ? '2px solid #1a1a1a' : '2px solid transparent', cursor: 'pointer', padding: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <PlatformIcon platform={a.platform} box={26} radius={7} />
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ border: '1px solid rgba(0,0,0,.07)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 12px', borderBottom: '1px solid rgba(0,0,0,.06)' }}>
                    <PlatformIcon platform={previewPlatform} box={30} radius={15} />
                    <div style={{ lineHeight: 1.2 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#18181b' }}>insane-post</div>
                      <div style={{ fontSize: 11.5, color: '#a1a1aa' }}>
                        {connected.find(a => a.platform === previewPlatform)?.handle || '@insane-post'} &middot; {PLATFORMS[previewPlatform].label}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: '#18181b', marginBottom: 5 }}>{previewItem.title}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: '#3f3f46', marginBottom: 8 }}>{previewItem.body}</div>
                    {previewItem.media_url && isImage && (
                      <img src={previewItem.media_url} alt="" style={{ width: '100%', borderRadius: 8, marginBottom: 8, maxHeight: 160, objectFit: 'cover' }} />
                    )}
                    {previewItem.hashtags.length > 0 && (
                      <div style={{ fontSize: 12.5, color: '#0958d9', marginBottom: 8 }}>{fmtTags(previewItem.hashtags)}</div>
                    )}
                    {previewItem.link && (
                      <div style={{ fontSize: 12, color: '#0958d9', border: '1px solid rgba(0,0,0,.07)', borderRadius: 7, padding: '7px 9px', background: '#fafafa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        &#128279; {previewItem.link}
                      </div>
                    )}
                    {(previewPlatform === 'x' || previewPlatform === 'bluesky') && (
                      <div style={{ marginTop: 8, fontSize: 11, color: bodyLen > (previewPlatform === 'x' ? 280 : 300) ? '#dc2626' : '#a1a1aa', textAlign: 'right' }}>
                        {bodyLen} / {previewPlatform === 'x' ? 280 : 300}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@media (max-width: 900px) { .cd-create { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function CheckItem({ done, label, action, hint }: { done: boolean; label: string; action: React.ReactNode; hint?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        width: 18, height: 18, borderRadius: 5, border: done ? 'none' : '1.5px solid rgba(0,0,0,.2)',
        background: done ? '#9fff00' : 'transparent', flex: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
      }}>
        {done ? '✓' : ''}
      </span>
      <span style={{ fontSize: 13.5, color: done ? '#52525b' : '#18181b', textDecoration: done ? 'line-through' : 'none', flex: 1 }}>
        {label}
        {hint && !done && <span style={{ color: '#a1a1aa', fontWeight: 400 }}> — {hint}</span>}
      </span>
      {action && !done && action}
    </div>
  );
}

function CheckLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{ border: 'none', background: 'transparent', color: '#0085FF', fontWeight: 600, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap', padding: 0 }}
    >
      {children}
    </button>
  );
}
