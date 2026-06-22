import { useState, useRef, useEffect } from 'react';
import type { Account, ContentItem, PlatformKey } from '@/types';
import { PLATFORMS } from '@/types';
import { PlatformIcon } from '@/components/icons/PlatformIcon';
import { Spinner, LoadingPanel, ErrorBanner } from '@/components/app/States';
import { uploadMedia, createContent, updateContent, approveContent, schedulePost, publishNowBatch } from '@/api/client';
import { fmtISO } from '@/lib/dateUtils';

interface CreateProps {
  accounts: Account[];
  content: ContentItem[];
  prefill: string;
  editDraft: ContentItem | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSaved: (msg: string) => void;
  onClearEdit: () => void;
  flash: (msg: string) => void;
  onGoAccounts: () => void;
  onGoCalendar: () => void;
  onGoAnalytics: () => void;
}

const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPT = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];

const field: React.CSSProperties = {
  border: '1px solid rgba(0,0,0,.12)', borderRadius: 10,
  padding: '11px 13px', fontSize: 14, color: '#18181b', width: '100%', background: '#fff',
};

type SaveMode = 'now' | 'schedule' | 'draft';

const fmtTags = (tags: string[]) => tags.map(t => '#' + t.replace(/^#/, '')).join(' ');

export function Create({
  accounts, content, prefill, editDraft, loading, error,
  onRetry, onSaved, onClearEdit, flash, onGoAccounts, onGoCalendar, onGoAnalytics,
}: CreateProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [link, setLink] = useState('');

  const [file, setFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [scheduleExpanded, setScheduleExpanded] = useState(false);
  const [date, setDate] = useState(fmtISO(new Date()));
  const [time, setTime] = useState('10:00');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [savingMode, setSavingMode] = useState<SaveMode | null>(null);
  const saving = savingMode !== null;

  const [previewPlatform, setPreviewPlatform] = useState<PlatformKey | null>(null);
  const [checklistDismissed, setChecklistDismissed] = useState(
    () => sessionStorage.getItem('cd_checklist_dismissed') === '1',
  );

  const connected = accounts.filter(a => a.status === 'connected');
  const hasConnected = connected.length > 0;
  const bodyLen = body.length;
  const editing = editDraft !== null;

  // Load an existing draft into the form when entering edit mode.
  useEffect(() => {
    if (editDraft) {
      setTitle(editDraft.title);
      setBody(editDraft.body);
      setTags(editDraft.hashtags ?? []);
      setLink(editDraft.link ?? '');
      setMediaUrl(editDraft.media_url ?? '');
      setFile(null);
      setScheduleExpanded(false);
      setSelectedIds([]);
    }
  }, [editDraft]);

  // Hero-search prefill (only when not editing and body is blank).
  useEffect(() => {
    if (!editing && prefill && !body) setBody(prefill);
  }, [prefill]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (connected.length > 0 && !previewPlatform) setPreviewPlatform(connected[0].platform);
  }, [accounts]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Hashtag chips ────────────────────────────────────────────────────────
  function commitTag() {
    const raw = tagInput.trim().replace(/^#/, '');
    if (raw && !tags.includes(raw)) setTags(t => [...t, raw]);
    setTagInput('');
  }
  function onTagKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') { e.preventDefault(); commitTag(); }
    else if (e.key === 'Backspace' && !tagInput && tags.length) { setTags(t => t.slice(0, -1)); }
  }

  // ── Media ────────────────────────────────────────────────────────────────
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
    setTitle(''); setBody(''); setTags([]); setTagInput(''); setLink('');
    clearMedia(); setScheduleExpanded(false); setSelectedIds([]);
    onClearEdit();
  }

  function toggleId(id: number) {
    setSelectedIds(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  // Create a new content row, or PATCH the one being edited. Returns its id.
  async function ensureContentId(): Promise<number> {
    const allTags = tagInput.trim() ? [...tags, tagInput.trim().replace(/^#/, '')] : tags;
    const payload = { title: title.trim(), body, hashtags: allTags, link: link || null, media_url: mediaUrl || null };
    if (editing && editDraft) {
      await updateContent(editDraft.id, payload);
      return editDraft.id;
    }
    const created = await createContent({ ...payload, status: 'pending_approval' });
    return created.id;
  }

  async function submit(mode: SaveMode) {
    if (!title.trim()) { flash('Add a title first.'); return; }
    if (mode !== 'draft' && selectedIds.length === 0) {
      flash(hasConnected ? 'Select at least one account.' : 'Connect an account first.'); return;
    }
    if (mode === 'schedule' && (!date || !time)) { flash('Pick a date and time.'); return; }

    setSavingMode(mode);
    try {
      const id = await ensureContentId();

      if (mode === 'draft') {
        resetForm();
        onSaved(editing ? 'Draft updated.' : 'Saved to Drafts.');
        return;
      }

      if (mode === 'now') {
        const rows = await publishNowBatch(id, selectedIds);
        const liveUrl = rows.find(r => r.platform_post_url)?.platform_post_url ?? null;
        const anyFailed = rows.some(r => r.status === 'failed');
        resetForm();
        if (liveUrl) onSaved(`Posted live! ${liveUrl}`);
        else if (anyFailed) onSaved('Some posts failed — check the Calendar for details.');
        else onSaved('Posted to all selected networks.');
        return;
      }

      // schedule
      await approveContent(id).catch(() => undefined); // ok if already approved
      const scheduledTime = new Date(`${date}T${time}:00`).toISOString();
      await schedulePost({ content_id: id, account_ids: selectedIds, scheduled_time: scheduledTime });
      resetForm();
      onSaved('Scheduled — see it on the Calendar.');
    } catch (e) {
      flash('Error: ' + (e instanceof Error ? e.message : String(e)).slice(0, 90));
    } finally {
      setSavingMode(null);
    }
  }

  function handleScheduleBtn() {
    if (scheduleExpanded) submit('schedule');
    else setScheduleExpanded(true);
  }

  function dismissChecklist() {
    sessionStorage.setItem('cd_checklist_dismissed', '1');
    setChecklistDismissed(true);
  }

  // ── Preview ────────────────────────────────────────────────────────────────
  const isImage = file ? file.type.startsWith('image/') : /\.(jpe?g|png|gif|webp)(\?.*)?$/i.test(mediaUrl);
  const isVideo = file ? file.type.startsWith('video/') : /\.(mp4|mov|webm)(\?.*)?$/i.test(mediaUrl);
  const previewSrc = file ? URL.createObjectURL(file) : mediaUrl;
  const previewTags = tagInput.trim() ? [...tags, tagInput.trim().replace(/^#/, '')] : tags;

  const hasContent = content.length > 0;

  return (
    <div style={{ animation: 'cdRise .4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 30, letterSpacing: '-.02em', margin: 0, color: '#18181b' }}>
          {editing ? 'Edit draft' : 'Create'}
        </h1>
        {editing && (
          <button onClick={resetForm} style={{ border: '1px solid rgba(0,0,0,.12)', background: '#fff', color: '#52525b', borderRadius: 9, padding: '7px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            ✕ Cancel edit
          </button>
        )}
      </div>
      <p style={{ color: '#71717a', fontSize: '14.5px', margin: '0 0 22px' }}>
        {editing ? 'Update this draft, then re-save, schedule, or post it.' : 'Write a post, pick your networks, then post now, schedule, or save as a draft.'}
      </p>

      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      {!checklistDismissed && !editing && (
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.08)', borderRadius: 14, padding: '16px 20px', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 15, color: '#18181b' }}>Getting started</span>
            <button onClick={dismissChecklist} aria-label="Dismiss" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#a1a1aa', fontSize: 16, lineHeight: 1, padding: '0 2px' }}>&#10005;</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <CheckItem done={hasConnected} label="Connect an account">
              {!hasConnected && <CheckLink onClick={onGoAccounts}>Go to Accounts →</CheckLink>}
            </CheckItem>
            <CheckItem done={hasContent} label="Create your first post">
              {!hasContent && <span style={{ fontSize: 12.5, color: '#a1a1aa' }}>Write below</span>}
            </CheckItem>
            <CheckItem done={false} label="See it on the calendar"><CheckLink onClick={onGoCalendar}>Go to Calendar →</CheckLink></CheckItem>
            <CheckItem done={false} label="Check your analytics"><CheckLink onClick={onGoAnalytics}>Go to Analytics →</CheckLink></CheckItem>
          </div>
        </div>
      )}

      {loading && accounts.length === 0 ? (
        <LoadingPanel label="Loading…" />
      ) : (
        <div className="cd-create" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: 22 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" style={field} />

                <div style={{ position: 'relative' }}>
                  <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your post…" rows={5} style={{ ...field, resize: 'vertical', lineHeight: 1.55, paddingBottom: 26 }} />
                  <span style={{ position: 'absolute', right: 10, bottom: 8, fontSize: 11.5, color: bodyLen > 280 ? '#dc2626' : '#a1a1aa' }}>{bodyLen}</span>
                </div>

                {/* Hashtag chips */}
                <div style={{ ...field, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', paddingTop: 8, paddingBottom: 8 }}>
                  {tags.map(t => (
                    <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#eef2ff', color: '#3730a3', borderRadius: 8, padding: '4px 8px', fontSize: 12.5, fontWeight: 600 }}>
                      #{t}
                      <button onClick={() => setTags(x => x.filter(y => y !== t))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6366f1', fontSize: 12, lineHeight: 1, padding: 0 }} aria-label={`Remove ${t}`}>&#10005;</button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={onTagKey}
                    onBlur={commitTag}
                    placeholder={tags.length ? 'Add another…' : '#hashtags (space or enter)'}
                    style={{ flex: 1, minWidth: 120, border: 'none', fontSize: 14, color: '#18181b', padding: '2px 0' }}
                  />
                </div>

                <input value={link} onChange={e => setLink(e.target.value)} placeholder="Link (optional)" style={field} />

                {/* Media zone with LARGE preview */}
                <div>
                  <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  {file || mediaUrl ? (
                    <div style={{ border: '1px solid rgba(0,0,0,.12)', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ position: 'relative', width: '100%', background: '#0b0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
                        {uploading ? (
                          <div style={{ padding: 40 }}><Spinner size={24} /></div>
                        ) : isVideo ? (
                          <video src={previewSrc} controls style={{ width: '100%', maxHeight: 360, display: 'block' }} />
                        ) : isImage ? (
                          <img src={previewSrc} alt="" style={{ width: '100%', maxHeight: 360, objectFit: 'contain', display: 'block' }} />
                        ) : (
                          <div style={{ color: '#a1a1aa', fontSize: 13, padding: 30 }}>Media attached</div>
                        )}
                        <button onClick={clearMedia} title="Remove" style={{ position: 'absolute', top: 8, right: 8, border: 'none', background: 'rgba(0,0,0,.6)', color: '#fff', width: 30, height: 30, borderRadius: 8, cursor: 'pointer' }}>&#10005;</button>
                      </div>
                      <div style={{ padding: '8px 12px', fontSize: 12, color: uploading ? '#a1a1aa' : '#65a30d', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{file ? file.name : mediaUrl}</span>
                        <span>{uploading ? 'Uploading…' : 'Ready'}</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                      style={{ border: `2px dashed ${dragging ? '#9fff00' : 'rgba(0,0,0,.16)'}`, background: dragging ? 'rgba(159,255,0,.06)' : '#fafafa', borderRadius: 12, padding: 26, textAlign: 'center', cursor: 'pointer', fontSize: 13, color: '#71717a', transition: 'all .15s' }}
                    >
                      Drag an image or video, or <span style={{ color: '#18181b', fontWeight: 600 }}>click to browse</span>
                      <div style={{ fontSize: 11.5, color: '#a1a1aa', marginTop: 4 }}>Max 25 MB · jpg, png, gif, webp, mp4, mov</div>
                    </div>
                  )}
                  {mediaError && <div style={{ color: '#dc2626', fontSize: 12.5, marginTop: 6 }}>{mediaError}</div>}
                  {!file && (
                    <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="…or paste a media URL" style={{ ...field, marginTop: 8 }} />
                  )}
                </div>
              </div>
            </div>

            {scheduleExpanded && (
              <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: '16px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '.04em' }}>Pick a date & time</span>
                  <button onClick={() => setScheduleExpanded(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#a1a1aa', fontSize: 13 }}>Cancel ✕</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={field} />
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} style={field} />
                </div>
              </div>
            )}

            {/* Decision bar */}
            <div data-guide="decision-bar" style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: '16px 22px' }}>
              {!hasConnected && (
                <div style={{ fontSize: 13, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 9, padding: '9px 12px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <span>Connect an account first to post or schedule.</span>
                  <button onClick={onGoAccounts} style={{ border: 'none', background: 'transparent', color: '#b45309', fontWeight: 600, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>Go to Accounts →</button>
                </div>
              )}
              <div style={{ display: 'flex', gap: 9 }}>
                <button onClick={() => submit('now')} disabled={saving || uploading || !hasConnected}
                  style={{ flex: '1 1 0', border: 'none', background: '#9fff00', color: '#000', borderRadius: 11, padding: '13px 12px', fontSize: 13.5, fontWeight: 700, cursor: saving || !hasConnected ? 'default' : 'pointer', opacity: !hasConnected ? 0.45 : saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {savingMode === 'now' && <Spinner size={13} />} Post now
                </button>
                <button onClick={handleScheduleBtn} disabled={saving || uploading || !hasConnected}
                  style={{ flex: '1 1 0', border: `1.5px solid ${scheduleExpanded ? '#1a1a1a' : 'rgba(0,0,0,.14)'}`, background: scheduleExpanded ? '#1a1a1a' : '#fff', color: scheduleExpanded ? '#fff' : '#3f3f46', borderRadius: 11, padding: '13px 12px', fontSize: 13.5, fontWeight: 600, cursor: saving || !hasConnected ? 'default' : 'pointer', opacity: !hasConnected ? 0.45 : saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {savingMode === 'schedule' && <Spinner size={13} />} {scheduleExpanded ? 'Confirm schedule' : 'Schedule'}
                </button>
                <button onClick={() => submit('draft')} disabled={saving || uploading}
                  style={{ flex: '1 1 0', border: '1px solid rgba(0,0,0,.12)', background: '#fff', color: '#52525b', borderRadius: 11, padding: '13px 12px', fontSize: 13.5, fontWeight: 600, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {savingMode === 'draft' && <Spinner size={13} />} {editing ? 'Save draft' : 'Save as draft'}
                </button>
              </div>
              <div style={{ fontSize: 11.5, color: '#a1a1aa', marginTop: 10, lineHeight: 1.5 }}>
                <strong style={{ color: '#52525b' }}>Post now</strong> publishes immediately.{' '}
                <strong style={{ color: '#52525b' }}>Schedule</strong> reveals a date & time picker — click again to confirm.{' '}
                <strong style={{ color: '#52525b' }}>Save draft</strong> keeps it in Drafts.
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: '16px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 12 }}>Post to</div>
              {!hasConnected ? (
                <div style={{ fontSize: 13, color: '#71717a', lineHeight: 1.6 }}>
                  No accounts connected yet.{' '}
                  <button onClick={onGoAccounts} style={{ border: 'none', background: 'transparent', color: '#0085FF', fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0 }}>Connect a network →</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {connected.map(a => {
                    const on = selectedIds.includes(a.id);
                    return (
                      <button key={a.id} onClick={() => { toggleId(a.id); setPreviewPlatform(a.platform); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1.5px solid ${on ? '#1a1a1a' : 'rgba(0,0,0,.1)'}`, background: on ? '#1a1a1a' : '#fff', color: on ? '#fff' : '#3f3f46', borderRadius: 10, padding: '9px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                        <PlatformIcon platform={a.platform} box={26} radius={7} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div>{PLATFORMS[a.platform].label}</div>
                          <div style={{ fontSize: 11.5, fontWeight: 400, opacity: 0.65, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.handle}</div>
                        </div>
                        {a.live
                          ? <span style={{ fontSize: 10, fontWeight: 700, color: on ? '#9fff00' : '#3f6212', background: on ? 'rgba(159,255,0,.18)' : '#ecfccb', borderRadius: 4, padding: '2px 6px', flex: 'none' }}>LIVE</span>
                          : <span style={{ fontSize: 10, fontWeight: 700, color: on ? '#93c5fd' : '#1e40af', background: on ? 'rgba(147,197,253,.18)' : '#dbeafe', borderRadius: 4, padding: '2px 6px', flex: 'none' }}>SIM</span>}
                        <span style={{ fontSize: 14, opacity: on ? 1 : 0.3, flex: 'none' }}>{on ? '✓' : '○'}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {previewPlatform && connected.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: '16px 18px', position: 'sticky', top: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: '.04em', textTransform: 'uppercase' }}>Preview</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {connected.map(a => (
                      <button key={a.id} onClick={() => setPreviewPlatform(a.platform)} title={PLATFORMS[a.platform].label}
                        style={{ width: 30, height: 30, borderRadius: 8, border: previewPlatform === a.platform ? '2px solid #1a1a1a' : '2px solid transparent', cursor: 'pointer', padding: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: '#18181b', marginBottom: 5 }}>{title || 'Your title'}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: '#3f3f46', marginBottom: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{body || 'Your post content will appear here…'}</div>
                    {mediaUrl && isVideo && <video src={mediaUrl} controls style={{ width: '100%', borderRadius: 8, marginBottom: 8, maxHeight: 220 }} />}
                    {mediaUrl && isImage && <img src={mediaUrl} alt="" style={{ width: '100%', borderRadius: 8, marginBottom: 8, maxHeight: 260, objectFit: 'cover' }} />}
                    {previewTags.length > 0 && <div style={{ fontSize: 12.5, color: '#0958d9', marginBottom: 8 }}>{fmtTags(previewTags)}</div>}
                    {link && <div style={{ fontSize: 12, color: '#0958d9', border: '1px solid rgba(0,0,0,.07)', borderRadius: 7, padding: '7px 9px', background: '#fafafa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>&#128279; {link}</div>}
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

function CheckItem({ done, label, children }: { done: boolean; label: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 18, height: 18, borderRadius: 5, flex: 'none', border: done ? 'none' : '1.5px solid rgba(0,0,0,.2)', background: done ? '#9fff00' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000' }}>
        {done ? '✓' : ''}
      </span>
      <span style={{ fontSize: 13.5, flex: 1, color: done ? '#71717a' : '#18181b', textDecoration: done ? 'line-through' : 'none' }}>{label}</span>
      {!done && children}
    </div>
  );
}

function CheckLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ border: 'none', background: 'transparent', color: '#0085FF', fontWeight: 600, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap', padding: 0 }}>
      {children}
    </button>
  );
}
