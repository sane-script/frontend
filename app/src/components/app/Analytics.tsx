import { type AppState, PLATFORMS } from '@/types';
import { sparkPath, chartLinePath, chartAreaPath, fmtNum } from '@/lib/chartUtils';
import { md } from '@/lib/dateUtils';

interface AnalyticsProps {
  metrics: AppState['metrics'];
  metricKey: AppState['metricKey'];
  onSetMetricKey: (k: AppState['metricKey']) => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
}

const METRIC_LABELS: [AppState['metricKey'], string][] = [
  ['reach', 'Reach'],
  ['engagement', 'Engagement'],
  ['followers', 'Follower growth'],
  ['clicks', 'Click-throughs'],
];

export function Analytics({
  metrics,
  metricKey,
  onSetMetricKey,
  onExportCsv,
  onExportPdf,
}: AnalyticsProps) {
  const carr = metrics.series[metricKey];
  const W = 900, H = 240;

  const chartLine = chartLinePath(carr, W, H);
  const chartArea = chartAreaPath(carr, W, H);

  const chartLabels: string[] = [];
  for (let i = 0; i < 6; i++) {
    const idx = Math.round(i * (29 / 5));
    chartLabels.push(md(metrics.days[idx]));
  }

  const metricLabel = (METRIC_LABELS.find(x => x[0] === metricKey) || ['', 'Reach'])[1];

  const kpis = METRIC_LABELS.map(([k, label]) => {
    const a = metrics.series[k];
    const total = a.reduce((x, y) => x + y, 0);
    const recent = a.slice(15).reduce((x, y) => x + y, 0);
    const prev = a.slice(0, 15).reduce((x, y) => x + y, 0);
    const pct = prev ? ((recent - prev) / prev * 100) : 0;
    const up = pct >= 0;
    const val = k === 'followers' ? '+' + fmtNum(total) : fmtNum(total);
    return {
      key: k,
      label,
      value: val,
      delta: (up ? '\u25b2 ' : '\u25bc ') + Math.abs(pct).toFixed(1) + '%',
      deltaColor: up ? '#65a30d' : '#a1a1aa',
      spark: sparkPath(a, 116, 34),
      active: metricKey === k,
    };
  });

  const legend = (['instagram', 'x', 'facebook', 'tiktok', 'bluesky'] as const).map(k => ({
    ...PLATFORMS[k],
    label: PLATFORMS[k].label,
  }));

  return (
    <div style={{ animation: 'cdRise .4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 30, letterSpacing: '-.02em', margin: '0 0 4px', color: '#18181b' }}>
            Analytics
          </h1>
          <p style={{ color: '#71717a', fontSize: '14.5px', margin: 0 }}>
            Last 30 days &middot; updates within minutes of a post going live.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 9 }}>
          <button
            onClick={onExportCsv}
            style={{ border: '1px solid rgba(0,0,0,.1)', background: '#fff', color: '#3f3f46', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            Export CSV
          </button>
          <button
            onClick={onExportPdf}
            style={{ border: '1px solid rgba(0,0,0,.1)', background: '#fff', color: '#3f3f46', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="cd-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 18 }}>
        {kpis.map(k => (
          <div
            key={k.key}
            onClick={() => onSetMetricKey(k.key as AppState['metricKey'])}
            style={{
              background: '#fff',
              border: `1px solid ${k.active ? 'rgba(0,0,0,.16)' : 'rgba(0,0,0,.06)'}`,
              borderRadius: 16,
              padding: 18,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 13, color: '#71717a', marginBottom: 8 }}>{k.label}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 28, letterSpacing: '-.02em', color: '#18181b' }}>
                {k.value}
              </div>
              <svg width="116" height="34" viewBox="0 0 116 34" preserveAspectRatio="none" style={{ flex: 'none' }}>
                <path d={k.spark} fill="none" stroke="#9fff00" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 600, marginTop: 6, color: k.deltaColor }}>
              {k.delta} <span style={{ color: '#a1a1aa', fontWeight: 400 }}>vs prev</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main chart */}
      <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: 22, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 18, color: '#18181b' }}>
            {metricLabel} <span style={{ fontSize: 13, color: '#a1a1aa', fontWeight: 400 }}>&middot; 30 days</span>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {legend.map(l => (
              <span key={l.short} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#71717a' }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
        <svg width="100%" height="240" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="cdGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9fff00" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#9fff00" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={chartArea} fill="url(#cdGrad)" />
          <path d={chartLine} fill="none" stroke="#5fae00" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {chartLabels.map((lbl, i) => (
            <span key={i} style={{ fontSize: '11.5px', color: '#a1a1aa' }}>{lbl}</span>
          ))}
        </div>
      </div>

      {/* Per-post table */}
      <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: '8px 8px 4px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 120px 130px 90px 110px 80px',
          gap: 12,
          padding: '12px 16px',
          fontSize: '11.5px',
          color: '#a1a1aa',
          textTransform: 'uppercase',
          letterSpacing: '.03em',
          fontWeight: 600,
          borderBottom: '1px solid rgba(0,0,0,.05)',
        }}>
          <span>Post</span>
          <span>Platform</span>
          <span>Published</span>
          <span style={{ textAlign: 'right' }}>Reach</span>
          <span style={{ textAlign: 'right' }}>Engagement</span>
          <span style={{ textAlign: 'right' }}>Clicks</span>
        </div>
        {metrics.byPost.map((p, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 120px 130px 90px 110px 80px',
              gap: 12,
              padding: '13px 16px',
              fontSize: '13.5px',
              color: '#18181b',
              alignItems: 'center',
              borderBottom: '1px solid rgba(0,0,0,.04)',
            }}
          >
            <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#52525b', fontSize: 13 }}>
              <span style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                flex: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 700,
                color: '#fff',
                background: PLATFORMS[p.platform].color,
              }}>
                {PLATFORMS[p.platform].short}
              </span>
              {PLATFORMS[p.platform].label}
            </span>
            <span style={{ color: '#71717a', fontSize: 13 }}>{p.published}</span>
            <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(p.reach)}</span>
            <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(p.engagement)}</span>
            <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(p.clicks)}</span>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cd-kpi { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}