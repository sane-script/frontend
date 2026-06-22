import type {
  Account, ContentItem, MetricRow, MetricKey, PlatformKey, ContentStatus,
} from '@/types';
import { PLATFORMS } from '@/types';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

const KEY_STORAGE = 'insane_post_key';
export const getKey = () => sessionStorage.getItem(KEY_STORAGE) ?? '';
export const setStoredKey = (k: string) => sessionStorage.setItem(KEY_STORAGE, k);
export const clearKey = () => sessionStorage.removeItem(KEY_STORAGE);

class Unauthorized extends Error {}

function handle401(res: Response) {
  if (res.status === 401) {
    clearKey();
    window.location.reload();
    throw new Unauthorized('Unauthorized');
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-App-Key': getKey() },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  handle401(res);
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function verifyKey(key: string): Promise<boolean> {
  const res = await fetch(`${BASE}/auth/verify`, { headers: { 'X-App-Key': key } });
  return res.ok;
}

// Fire-and-forget wake-up ping. The backend sleeps when idle on free hosting;
// hitting /health (public, no key) on first load warms it while the user reads
// the guide intro, so the first real API call isn't stuck on a cold start.
// /health lives at the server root, so strip the trailing /api from BASE.
export function wakeBackend(): void {
  const root = BASE.replace(/\/api\/?$/, '');
  const url = `${root}/health`;
  try {
    fetch(url, { method: 'GET' }).catch(() => {});
  } catch {
    /* ignore — purely opportunistic */
  }
}

// ─── Raw backend shapes ─────────────────────────────────────────────────────────

interface ApiContent {
  id: number; title: string; body: string; hashtags: string[];
  link: string | null; media_url: string | null; status: ContentStatus;
  created_by: string; created_at: string; updated_at: string;
}
interface ApiAccount {
  id: number; platform: PlatformKey; display_name: string; handle: string;
  status: 'connected' | 'disconnected' | 'error'; connected_at: string | null;
  credentials_ref: string | null;
}
export interface ApiScheduledPost {
  id: number; content_id: number; account_id: number; scheduled_time: string;
  status: 'queued' | 'publishing' | 'published' | 'failed' | 'canceled';
  platform_post_id: string | null; platform_post_url: string | null;
  error_message: string | null; attempts: number; published_at: string | null;
  created_at: string; updated_at: string;
}
interface ApiMetricsOverview {
  total_reach: number; total_impressions: number; total_engagement: number;
  total_likes: number; total_comments: number; total_shares: number;
  total_clicks: number; followers: number;
  per_platform: Record<string, Record<string, number>>;
}
interface ApiTimeseriesPoint { date: string; value: number }
interface ApiPostMetric {
  scheduled_post_id: number; platform: PlatformKey; handle: string;
  reach: number; impressions: number; likes: number; comments: number;
  shares: number; clicks: number; followers: number; engagement: number;
}

// ─── Mappers ────────────────────────────────────────────────────────────────────

export const mapContent = (c: ApiContent): ContentItem => ({
  id: c.id, title: c.title, body: c.body, hashtags: c.hashtags ?? [],
  link: c.link ?? '', media_url: c.media_url ?? '', status: c.status,
  created_at: c.created_at,
});

export const mapAccount = (a: ApiAccount): Account => ({
  id: a.id, platform: a.platform, display_name: a.display_name, handle: a.handle,
  status: a.status, connected_at: a.connected_at, live: a.platform === 'bluesky',
});

// ─── Content ─────────────────────────────────────────────────────────────────────

export async function getContent(status?: ContentStatus): Promise<ContentItem[]> {
  const data = await request<ApiContent[]>('GET', `/content${status ? `?status=${status}` : ''}`);
  return data.map(mapContent);
}

export async function createContent(data: {
  title: string; body: string; hashtags: string[];
  link?: string | null; media_url?: string | null; status: ContentStatus;
}): Promise<ContentItem> {
  return mapContent(await request<ApiContent>('POST', '/content', data));
}

export async function updateContent(id: number, data: {
  title?: string; body?: string; hashtags?: string[];
  link?: string | null; media_url?: string | null;
}): Promise<ContentItem> {
  return mapContent(await request<ApiContent>('PATCH', `/content/${id}`, data));
}

export async function deleteContent(id: number): Promise<void> {
  await request('DELETE', `/content/${id}`);
}

export async function approveContent(id: number): Promise<ContentItem> {
  return mapContent(await request<ApiContent>('POST', `/content/${id}/approve`));
}

export async function rejectContent(id: number): Promise<ContentItem> {
  return mapContent(await request<ApiContent>('POST', `/content/${id}/reject`));
}

// ─── Accounts ──────────────────────────────────────────────────────────────────

export async function getAccounts(): Promise<Account[]> {
  const data = await request<ApiAccount[]>('GET', '/accounts');
  return data.map(mapAccount);
}

export async function connectAccount(
  platform: PlatformKey,
  credentials?: { handle: string; app_password: string },
): Promise<Account> {
  return mapAccount(await request<ApiAccount>('POST', `/accounts/${platform}/connect`, credentials ?? {}));
}

export async function disconnectAccount(id: number): Promise<Account> {
  return mapAccount(await request<ApiAccount>('POST', `/accounts/${id}/disconnect`));
}

export async function deleteAccount(id: number): Promise<void> {
  await request('DELETE', `/accounts/${id}`);
}

// ─── Scheduling ─────────────────────────────────────────────────────────────────

export async function schedulePost(data: {
  content_id: number; account_ids: number[]; scheduled_time: string;
}): Promise<ApiScheduledPost[]> {
  return request<ApiScheduledPost[]>('POST', '/schedule', data);
}

export async function getCalendar(from: string, to: string): Promise<ApiScheduledPost[]> {
  return request<ApiScheduledPost[]>('GET', `/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
}

export async function reschedulePost(id: number, scheduled_time: string): Promise<void> {
  await request('PATCH', `/schedule/${id}/reschedule`, { scheduled_time });
}

export async function cancelSchedule(id: number): Promise<void> {
  await request('POST', `/schedule/${id}/cancel`);
}

export async function publishNow(id: number): Promise<ApiScheduledPost> {
  return request<ApiScheduledPost>('POST', `/schedule/${id}/publish-now`);
}

// Combined create-and-publish-now for N accounts in one synchronous backend call.
// Avoids the APScheduler race that produced spurious "internal server error"
// toasts. Each returned row carries its own final status + platform_post_url.
export async function publishNowBatch(content_id: number, account_ids: number[]): Promise<ApiScheduledPost[]> {
  return request<ApiScheduledPost[]>('POST', '/schedule/publish-now', { content_id, account_ids });
}

// ─── Metrics ────────────────────────────────────────────────────────────────────

export async function getMetricsOverview(from?: string, to?: string) {
  const q = from && to ? `?from=${from}&to=${to}` : '';
  const o = await request<ApiMetricsOverview>('GET', `/metrics/overview${q}`);
  return {
    reach: o.total_reach,
    engagement: o.total_engagement,
    followers: o.followers,
    clicks: o.total_clicks,
    impressions: o.total_impressions,
  };
}

export async function getMetricsTimeseries(metric: MetricKey, from?: string, to?: string): Promise<number[]> {
  const q = from && to ? `&from=${from}&to=${to}` : '';
  const points = await request<ApiTimeseriesPoint[]>('GET', `/metrics/timeseries?metric=${metric}${q}`);
  return points.map(p => p.value);
}

export async function getMetricsTimeseriesDates(metric: MetricKey, from?: string, to?: string): Promise<string[]> {
  const q = from && to ? `&from=${from}&to=${to}` : '';
  const points = await request<ApiTimeseriesPoint[]>('GET', `/metrics/timeseries?metric=${metric}${q}`);
  return points.map(p => p.date);
}

export async function getMetricsByPost(): Promise<MetricRow[]> {
  const data = await request<ApiPostMetric[]>('GET', '/metrics/by-post');
  return data.map(p => ({
    platform: (PLATFORMS[p.platform] ? p.platform : 'x') as PlatformKey,
    handle: p.handle,
    reach: p.reach,
    impressions: p.impressions,
    engagement: p.engagement,
    clicks: p.clicks,
  }));
}

// ─── Media upload ─────────────────────────────────────────────────────────────────

export async function uploadMedia(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${BASE}/media/upload`, {
    method: 'POST',
    headers: { 'X-App-Key': getKey() },
    body: fd,
  });
  handle401(res);
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { media_url: string };
  return data.media_url;
}

// ─── Export ───────────────────────────────────────────────────────────────────────

async function downloadBlob(path: string, filename: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, { headers: { 'X-App-Key': getKey() } });
  handle401(res);
  if (!res.ok) throw new Error(await res.text());
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const exportCsv = () => downloadBlob('/export/csv', 'insane-post-metrics.csv');
export const exportPdf = () => downloadBlob('/export/pdf', 'insane-post-metrics.pdf');
