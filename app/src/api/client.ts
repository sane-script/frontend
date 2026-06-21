import type { ContentItem, Account } from '@/types';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export const getContent = (status?: string) =>
  request<ContentItem[]>('GET', `/content${status ? `?status=${status}` : ''}`);
export const createContent = (data: Partial<ContentItem>) =>
  request<ContentItem>('POST', '/content', data);
export const approveContent = (id: string) =>
  request<ContentItem>('POST', `/content/${id}/approve`);
export const rejectContent = (id: string) =>
  request<ContentItem>('POST', `/content/${id}/reject`);

export const getAccounts = () => request<Account[]>('GET', '/accounts');
export const connectAccount = (platform: string) =>
  request<Account>('POST', `/accounts/${platform}/connect`);
export const disconnectAccount = (id: string) =>
  request<Account>('POST', `/accounts/${id}/disconnect`);

export const schedulePost = (data: { content_id: string; account_ids: string[]; scheduled_time: string }) =>
  request('POST', '/schedule', data);
export const reschedulePost = (id: string, scheduled_time: string) =>
  request('PATCH', `/schedule/${id}/reschedule`, { scheduled_time });
export const cancelSchedule = (id: string) =>
  request('POST', `/schedule/${id}/cancel`);
export const publishNow = (id: string) =>
  request('POST', `/schedule/${id}/publish-now`);

export const getCalendar = (from?: string, to?: string) =>
  request('GET', `/calendar${from ? `?from=${from}&to=${to}` : ''}`);

export const getMetricsOverview = (from?: string, to?: string) =>
  request('GET', `/metrics/overview${from ? `?from=${from}&to=${to}` : ''}`);
export const getMetricsTimeseries = (metric: string, from?: string, to?: string) =>
  request('GET', `/metrics/timeseries?metric=${metric}${from ? `&from=${from}&to=${to}` : ''}`);
export const getMetricsByPost = () => request('GET', '/metrics/by-post');

export const exportCsv = () => window.open(`${BASE}/export/csv`, '_blank');
export const exportPdf = () => window.open(`${BASE}/export/pdf`, '_blank');