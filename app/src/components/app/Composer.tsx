interface ComposerProps {
  composer: { title: string; body: string; hashtags: string; link: string; media: string };
  onClose: () => void;
  onSetField: (field: 'title' | 'body' | 'hashtags' | 'link' | 'media', value: string) => void;
  onSave: () => void;
}

export function Composer({ composer, onClose, onSetField, onSave }: ComposerProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(24,24,27,.35)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '60px 20px',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 18,
          width: '100%',
          maxWidth: 520,
          padding: 26,
          boxShadow: '0 24px 60px rgba(0,0,0,.25)',
          animation: 'cdRise .3s ease both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 20, margin: 0, color: '#18181b' }}>
            New content
          </h3>
          <button
            onClick={onClose}
            style={{ border: 'none', background: '#f4f4f5', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', color: '#71717a', fontSize: 14 }}
          >
            &#10005;
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <input
            value={composer.title}
            onChange={e => onSetField('title', e.target.value)}
            placeholder="Title"
            style={{ border: '1px solid rgba(0,0,0,.12)', borderRadius: 10, padding: '11px 13px', fontSize: 14, color: '#18181b' }}
          />
          <textarea
            value={composer.body}
            onChange={e => onSetField('body', e.target.value)}
            placeholder="Write your post\u2026"
            rows={4}
            style={{ border: '1px solid rgba(0,0,0,.12)', borderRadius: 10, padding: '11px 13px', fontSize: 14, color: '#18181b', resize: 'vertical', lineHeight: 1.5 }}
          />
          <input
            value={composer.hashtags}
            onChange={e => onSetField('hashtags', e.target.value)}
            placeholder="#hashtags (space separated)"
            style={{ border: '1px solid rgba(0,0,0,.12)', borderRadius: 10, padding: '11px 13px', fontSize: 14, color: '#18181b' }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
            <input
              value={composer.link}
              onChange={e => onSetField('link', e.target.value)}
              placeholder="Link (optional)"
              style={{ border: '1px solid rgba(0,0,0,.12)', borderRadius: 10, padding: '11px 13px', fontSize: 14, color: '#18181b' }}
            />
            <input
              value={composer.media}
              onChange={e => onSetField('media', e.target.value)}
              placeholder="Media URL (optional)"
              style={{ border: '1px solid rgba(0,0,0,.12)', borderRadius: 10, padding: '11px 13px', fontSize: 14, color: '#18181b' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button
            onClick={onClose}
            style={{ border: '1px solid rgba(0,0,0,.12)', background: '#fff', color: '#52525b', borderRadius: 10, padding: '11px 18px', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            style={{ border: 'none', background: '#9fff00', color: '#000', borderRadius: 10, padding: '11px 18px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}
          >
            Create draft
          </button>
        </div>
      </div>
    </div>
  );
}