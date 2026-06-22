import { type AppState, type MetricKey, PLATFORMS } from '@/types';
import { PlatformIcon } from '@/components/icons/PlatformIcon';
import { LoadingPanel, ErrorBanner, EmptyState, CountUp } from '@/components/app/States';
import { sparkPath, chartLinePath, chartAreaPath, fmtNum } from '@/lib/chartUtils';
import { md } from '@/lib/dateUtils';

interface AnalyticsProps {
  metrics: AppState['metrics'];
  metricKey: MetricKey;
  loading: boolean;
  error: string | null;
  onSetMetricKey: (k: MetricKey) => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
  onRetry: () => void;
}

const METRIC_LABELS: [MetricKey, string][] = [
  ['reach', 'Reach'],
  ['engagement', 'Engagement'],
  ['followers', 'Follower growth'],
  ['clicks', 'Click-throughs'],
];

export function Analytics({ metrics, metricKey, loading, error, onSetMetricKey, onExportCsv, onExportPdf, onRetry }: AnalyticsProps) {
  const carr = metrics.series[metricKey] ?? [];
  const W = 900, H = 240;
  const hasChart = carr.length >= 2;

  const chartLine = hasChart ? chartLinePath(carr, W, H) : '';
  const chartArea = hasChart ? chartAreaPath(carr, W, H) : '';

  const chartLabels: string[] = [];
  if (metrics.days.length) {
    for (let i = 0; i < 6; i++) {
      const idx = Math.round(i * ((metrics.days.length - 1) / 5));
      if (metrics.days[idx]) chartLabels.push(md(metrics.days[idx]));
    }
  }

  const metricLabel = (METRIC_LABELS.find(x => x[0] === metricKey) || ['', 'Reach'])[1];

  const kpis = METRIC_LABELS.map(([k, label]) => {
    const a = metrics.series[k] ?? [];
    const half = Math.floor(a.length / 2);
    const recent = a.slice(half).reduce((x, y) => x + y, 0);
    const prev = a.slice(0, half).reduce((x, y) => x + y, 0);
    const pct = prev ? ((recent - prev) / prev) * 100 : 0;
    const up = pct >= 0;
    const total = metrics.overview[k];
    return {
      key: k, label, total,
      value: k === 'followers' ? '+' + fmtNum(total) : fmtNum(total),
      delta: (up ? '▲ ' : '▼ ') + Math.abs(pct).toFixed(1) + '%',
      deltaColor: up ? '#65a30d' : '#a1a1aa',
      spark: a.length >= 2 ? sparkPath(a, 116, 34) : '',
      active: metricKey === k,
    };
  });

  const legend = (['instagram', 'x', 'facebook', 'tiktok', 'bluesky'] as const).map(k => ({ key: k, ...PLATFORMS[k] }));

  const isEmpty = !loading && metrics.byPost.length === 0 &&
    metrics.overview.reach === 0 && metrics.overview.engagement === 0 &&
    metrics.overview.followers === 0 && metrics.overview.clicks === 0;

  return (
    <div style={{ animation: 'cdRise .4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 30, letterSpacing: '-.02em', margin: '0 0 4px', color: '#18181b' }}>Analytics</h1>
          <p style={{ color: '#71717a', fontSize: '14.5px', margin: 0 }}>Last 30 days &middot; updates within minutes of a post going live.</p>
        </div>
        <div style={{ display: 'flex', gap: 9 }}>
          <button onClick={onExportCsv} style={{ border: '1px solid rgba(0,0,0,.1)', background: '#fff', color: '#3f3f46', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Export CSV</button>
          <button onClick={onExportPdf} style={{ border: '1px solid rgba(0,0,0,.1)', background: '#fff', color: '#3f3f46', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Export PDF</button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      {loading && carr.length === 0 ? (
        <LoadingPanel label="Loading analytics…" />
      ) : isEmpty ? (
        <EmptyState title="No analytics yet" hint="Publish a post to start seeing reach, engagement, growth and clicks here." />
      ) : (
        <>
          {/* KPI cards */}
          <div className="cd-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 18 }}>
            {kpis.map(k => (
              <div key={k.key} onClick={() => onSetMetricKey(k.key)} style={{ background: '#fff', border: `1px solid ${k.active ? 'rgba(0,0,0,.16)' : 'rgba(0,0,0,.06)'}`, borderRadius: 16, padding: 18, cursor: 'pointer' }}>
                <div style={{ fontSize: 13, color: '#71717a', marginBottom: 8 }}>{k.label}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 28, letterSpacing: '-.02em', color: '#18181b' }}>
                    <CountUp value={k.total} format={(n) => (k.key === 'followers' ? '+' + fmtNum(n) : fmtNum(n))} />
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
                  <span key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#71717a' }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: l.color }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
            {hasChart ? (
              <>
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
                  {chartLabels.map((lbl, i) => (<span key={i} style={{ fontSize: '11.5px', color: '#a1a1aa' }}>{lbl}</span>))}
                </div>
              </>
            ) : (
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa', fontSize: 14 }}>
                Not enough data for this period.
              </div>
            )}
          </div>

          {/* Per-post table */}
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.06)', borderRadius: 16, padding: '8px 8px 4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 100px 120px 130px 90px', gap: 12, padding: '12px 16px', fontSize: '11.5px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 600, borderBottom: '1px solid rgba(0,0,0,.05)' }}>
              <span>Account</span>
              <span>Platform</span>
              <span style={{ textAlign: 'right' }}>Reach</span>
              <span style={{ textAlign: 'right' }}>Impressions</span>
              <span style={{ textAlign: 'right' }}>Engagement</span>
              <span style={{ textAlign: 'right' }}>Clicks</span>
            </div>
            {metrics.byPost.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center', color: '#a1a1aa', fontSize: 13.5 }}>No published posts yet.</div>
            ) : metrics.byPost.map((p, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 150px 100px 120px 130px 90px', gap: 12, padding: '13px 16px', fontSize: '13.5px', color: '#18181b', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,.04)' }}>
                <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.handle}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#52525b', fontSize: 13 }}>
                  <PlatformIcon platform={p.platform} box={20} radius={6} />
                  {PLATFORMS[p.platform].label}
                </span>
                <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(p.reach)}</span>
                <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(p.impressions)}</span>
                <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(p.engagement)}</span>
                <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(p.clicks)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`@media (max-width: 768px) { .cd-kpi { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  );
}
