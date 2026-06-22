import { useState, useRef } from 'react';
import type { Account } from '@/types';
import { PLATFORMS } from '@/types';
import { PlatformIcon } from '@/components/icons/PlatformIcon';
import { Spinner } from '@/components/app/States';
import { uploadMedia, createContent, approveContent, schedulePost } from '@/api/client';
import { fmtISO } from '@/lib/dateUtils';

interface ComposerProps {
  accounts: Account[];
  prefill: string;
  onClose: () => void;
  onSaved: (msg: string) => void;
  flash: (msg: string) => void;
}

const MAX_BYTES = 25 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime'];

const fieldStyle: React.CSSProperties = {
  border: '1px solid rgba(0,0,0,.12)', borderRadius: 10, padding: '11px 13px', fontSize: 14, color: '#18181b',
};

export function Composer({ accounts, prefill, onClose, onSaved, flash }: ComposerProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState(prefill ?? '');
  const [hashtags, setHashtags] = useState('');
  const [link, setLink] = useState('');

  const [file, setFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'draft' | 'schedule'>('draft');
  const [date, setDate] = useState(fmtISO(new Date()));
  const [time, setTime] = useState('10:00');
  const [selected, setSelected] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const connected = accounts.filter(a => a.status === 'connected');
  const isImage = file ? file.type.startsWith('image/') : /\.(jpe?g|png|gif|webp)$/i.test(mediaUrl);
  const previewSrc = file && isImage ? URL.createObjectURL(file) : isImage ? mediaUrl : '';

  async function handleFile(f: File) {
    setMediaError('');
    if (![...IMAGE_TYPES, ...VIDEO_TYPES].includes(f.type)) {
      setMediaError('Unsupported file. Use jpg, png, gif, webp, mp4 or mov.');
      return;
    }
    if (f.size > MAX_BYTES) {
      setMediaError('File exceeds the 25 MB limit.');
      return;
    }
    setFile(f);
    setUploading(true);
    try {
      const url = await uploadMedia(f);
      setMediaUrl(url);
    } catch (e) {
      setMediaError('Upload failed: ' + (e instanceof Error ? e.message : String(e)).slice(0, 60));
      setFile(null);
    } finally {
      setUploading(false);
    }
  }

  function clearMedia() {
    setFile(null);
    setMediaUrl('');
    setMediaError('');
    if (fileInput.current) fileInput.current.value = '';
  }

  const toggleAccount = (id: number) =>
    setSelected(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));

  async function save() {
    if (!title.trim()) { flash('Add a title first.'); return; }
    if (mode === 'schedule') {
      if (!selected.length) { flash('Pick at least one account to schedule.'); return; }
      if (!date || !time) { flash('Pick a date and time.'); return; }
    }
    setSaving(true);
    try {
      const tags = hashtags.split(/\s+/).filter(Boolean).map(t => t.replace(/^#/, ''));
      const created = await createContent({
        title: title.trim(), body, hashtags: tags,
        link: link || null, media_url: mediaUrl || null,
        status: 'pending_approval',
      });

      if (mode === 'schedule') {
        // Backend requires approved content before scheduling. The workspace
        // owner is implicitly approving when they choose "Schedule now".
        await approveContent(created.id);
        const scheduled_time = new Date(`${date}T${time}:00`).toISOString();
        await schedulePost({ content_id: created.id, account_ids: selected, scheduled_time });
        onClose();
        onSaved('Scheduled — live on the calendar.');
      } else {
        onClose();
        onSaved('Draft created — pending approval.');
      }
    } catch (e) {
      flash('Error: ' + (e instanceof Error ? e.message : String(e)).slice(0, 80));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(24,24,27,.35)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 20px', overflowY: 'auto' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 520, padding: 26, boxShadow: '0 24px 60px rgba(0,0,0,.25)', animation: 'cdRise .3s ease both' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 20, margin: 0, color: '#18181b' }}>New content</h3>
          <button onClick={onClose} style={{ border: 'none', background: '#f4f4f5', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', color: '#71717a', fontSize: 14 }}>&#10005;</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" style={fieldStyle} />
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your post…" rows={4} style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.5 }} />
          <input value={hashtags} onChange={e => setHashtags(e.target.value)} placeholder="#hashtags (space separated)" style={fieldStyle} />
          <input value={link} onChange={e => setLink(e.target.value)} placeholder="Link (optional)" style={fieldStyle} />

          {/* Media upload */}
          <div>
            <input
              ref={fileInput} type="file" accept="image/*,video/*" hidden
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
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
                onClick={() => fileInput.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                style={{
                  border: `2px dashed ${dragging ? '#9fff00' : 'rgba(0,0,0,.16)'}`,
                  background: dragging ? 'rgba(159,255,0,.06)' : '#fafafa',
                  borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer',
                  fontSize: 13, color: '#71717a', transition: 'all .15s',
                }}
              >
                Drag an image or video here, or <span style={{ color: '#18181b', fontWeight: 600 }}>click to browse</span>
                <div style={{ fontSize: 11.5, color: '#a1a1aa', marginTop: 4 }}>Max 25 MB · jpg, png, gif, webp, mp4, mov</div>
              </div>
            )}
            {mediaError && <div style={{ color: '#dc2626', fontSize: 12.5, marginTop: 6 }}>{mediaError}</div>}
            <input
              value={file ? '' : mediaUrl}
              onChange={e => { setMediaUrl(e.target.value); setFile(null); }}
              placeholder="…or paste a media URL"
              disabled={!!file}
              style={{ ...fieldStyle, marginTop: 8, width: '100%', opacity: file ? 0.5 : 1 }}
            />
          </div>

          {/* Draft / schedule toggle */}
          <div style={{ display: 'flex', gap: 6, background: '#f4f4f5', borderRadius: 10, padding: 4 }}>
            {(['draft', 'schedule'] as const).map(m => (
              <button
                key={m} onClick={() => setMode(m)}
                style={{ flex: 1, border: 'none', borderRadius: 8, padding: '9px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: mode === m ? '#fff' : 'transparent', color: mode === m ? '#18181b' : '#71717a', boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,.08)' : 'none' }}
              >
                {m === 'draft' ? 'Save as draft' : 'Schedule now'}
              </button>
            ))}
          </div>

          {mode === 'schedule' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, border: '1px solid rgba(0,0,0,.08)', borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={fieldStyle} />
                <input type="time" value={time} onChange={e => setTime(e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#71717a', marginBottom: 8 }}>Post to</div>
                {connected.length === 0 ? (
                  <div style={{ fontSize: 12.5, color: '#b45309' }}>No connected accounts — connect one in the Accounts tab first.</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {connected.map(a => {
                      const on = selected.includes(a.id);
                      return (
                        <button
                          key={a.id} onClick={() => toggleAccount(a.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 7, border: `1.5px solid ${on ? '#1a1a1a' : 'rgba(0,0,0,.12)'}`, background: on ? '#1a1a1a' : '#fff', color: on ? '#fff' : '#52525b', borderRadius: 9, padding: '7px 11px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                        >
                          <PlatformIcon platform={a.platform} box={18} radius={5} />
                          {PLATFORMS[a.platform].label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ border: '1px solid rgba(0,0,0,.12)', background: '#fff', color: '#52525b', borderRadius: 10, padding: '11px 18px', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
          <button
            onClick={save}
            disabled={saving || uploading}
            style={{ border: 'none', background: '#9fff00', color: '#000', borderRadius: 10, padding: '11px 18px', fontSize: '13.5px', fontWeight: 600, cursor: saving || uploading ? 'default' : 'pointer', opacity: saving || uploading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {saving && <Spinner size={14} />}
            {mode === 'schedule' ? 'Approve & schedule' : 'Create draft'}
          </button>
        </div>
      </div>
    </div>
  );
}
