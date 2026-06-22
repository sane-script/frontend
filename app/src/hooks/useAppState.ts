import { useState, useCallback, useRef, useEffect } from 'react';
import type { AppState, TabKey, PlatformKey, ScheduledPost, Account, MetricKey } from '@/types';
import * as api from '@/api/client';
import { addDays, mondayOf, fmtISO, hourLabel } from '@/lib/dateUtils';
import { bandHours } from '@/lib/seedData';

const initialState: AppState = {
  view: 'landing',
  tab: 'create',
  heroQuery: '',
  createPrefill: '',
  toast: null,
  accounts: [],
  content: [],
  scheduled: [],
  previewPlatform: 'instagram',
  selectedContentId: null,
  metricKey: 'reach',
  weekOffset: 0,
  openChip: null,
  connectingId: null,
  loading: false,
  error: null,
  metrics: {
    series: { reach: [], engagement: [], followers: [], clicks: [] },
    days: [],
    byPost: [],
    overview: { reach: 0, engagement: 0, followers: 0, clicks: 0, impressions: 0 },
  },
};

function snapToBand(hour: number): number {
  return bandHours.reduce((best, h) => (Math.abs(h - hour) < Math.abs(best - hour) ? h : best), bandHours[0]);
}

function cellToISO(date: string, hour: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function mapScheduled(
  raw: api.ApiScheduledPost,
  accounts: Account[],
  content: { id: number; title: string }[],
): ScheduledPost {
  const acc = accounts.find(a => a.id === raw.account_id);
  const c = content.find(x => x.id === raw.content_id);
  const dt = new Date(raw.scheduled_time);
  const status: ScheduledPost['status'] =
    raw.status === 'published' ? 'published' : raw.status === 'canceled' ? 'canceled' : 'scheduled';
  return {
    id: raw.id,
    contentId: raw.content_id,
    accountId: raw.account_id,
    platform: acc?.platform ?? 'x',
    title: c?.title ?? 'Scheduled post',
    date: fmtISO(dt),
    hour: snapToBand(dt.getHours()),
    status,
  };
}

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);
  const dragRef = useRef<{ type: 'chip' | 'rail'; id: number } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((msg: string) => {
    setState(s => ({ ...s, toast: msg }));
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setState(s => ({ ...s, toast: null })), 3200);
  }, []);

  const fail = useCallback((err: unknown, fallback: string) => {
    const msg = err instanceof Error ? err.message : String(err);
    flash('Error: ' + msg.slice(0, 80));
    setState(s => ({ ...s, error: fallback, loading: false }));
  }, [flash]);

  // ─── Loaders ────────────────────────────────────────────────────────────────

  const loadCreate = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const [content, accounts] = await Promise.all([api.getContent(), api.getAccounts()]);
      setState(s => {
        const firstConnected = accounts.find(a => a.status === 'connected');
        return {
          ...s, content, accounts, loading: false,
          previewPlatform: firstConnected?.platform ?? s.previewPlatform,
        };
      });
    } catch (e) { fail(e, 'Could not load.'); }
  }, [fail]);

  const loadAccounts = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const accounts = await api.getAccounts();
      setState(s => ({ ...s, accounts, loading: false }));
    } catch (e) { fail(e, 'Could not load accounts.'); }
  }, [fail]);

  const loadReview = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const [content, accounts] = await Promise.all([api.getContent(), api.getAccounts()]);
      setState(s => {
        const firstConnected = accounts.find(a => a.status === 'connected');
        const pending = content.find(c => c.status === 'pending_approval');
        return {
          ...s, content, accounts, loading: false,
          selectedContentId: s.selectedContentId ?? pending?.id ?? content[0]?.id ?? null,
          previewPlatform: firstConnected?.platform ?? s.previewPlatform,
        };
      });
    } catch (e) { fail(e, 'Could not load content.'); }
  }, [fail]);

  const loadCalendar = useCallback(async (weekOffset: number) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const mon = mondayOf(addDays(new Date(), weekOffset * 7));
      const from = new Date(mon); from.setHours(0, 0, 0, 0);
      const to = addDays(mon, 7); to.setHours(0, 0, 0, 0);
      const [raw, content, accounts] = await Promise.all([
        api.getCalendar(from.toISOString(), to.toISOString()),
        api.getContent(),
        api.getAccounts(),
      ]);
      const scheduled = raw.map(r => mapScheduled(r, accounts, content));
      setState(s => ({ ...s, scheduled, content, accounts, loading: false }));
    } catch (e) { fail(e, 'Could not load the calendar.'); }
  }, [fail]);

  const loadAnalytics = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const today = new Date();
      const from = fmtISO(addDays(today, -29));
      const to = fmtISO(today);
      const [overview, reach, engagement, followers, clicks, dates, byPost] = await Promise.all([
        api.getMetricsOverview(from, to),
        api.getMetricsTimeseries('reach', from, to),
        api.getMetricsTimeseries('engagement', from, to),
        api.getMetricsTimeseries('followers', from, to),
        api.getMetricsTimeseries('clicks', from, to),
        api.getMetricsTimeseriesDates('reach', from, to),
        api.getMetricsByPost(),
      ]);
      const days = dates.map(d => new Date(d + 'T00:00:00'));
      setState(s => ({
        ...s, loading: false,
        metrics: {
          series: { reach, engagement, followers, clicks },
          days: days.length ? days : s.metrics.days,
          byPost,
          overview,
        },
      }));
    } catch (e) { fail(e, 'Could not load analytics.'); }
  }, [fail]);

  useEffect(() => {
    if (state.view !== 'app') return;
    if (state.tab === 'create')    loadCreate();
    else if (state.tab === 'accounts') loadAccounts();
    else if (state.tab === 'review')   loadReview();
    else if (state.tab === 'calendar') loadCalendar(state.weekOffset);
    else if (state.tab === 'analytics') loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.view, state.tab, state.weekOffset]);

  const retry = useCallback(() => {
    if (state.tab === 'create')    loadCreate();
    else if (state.tab === 'accounts') loadAccounts();
    else if (state.tab === 'review')   loadReview();
    else if (state.tab === 'calendar') loadCalendar(state.weekOffset);
    else if (state.tab === 'analytics') loadAnalytics();
  }, [state.tab, state.weekOffset, loadCreate, loadAccounts, loadReview, loadCalendar, loadAnalytics]);

  // ─── View / UI setters ─────────────────────────────────────────────────────

  const setView = useCallback((view: 'landing' | 'app') => setState(s => ({ ...s, view })), []);
  const setTab = useCallback((tab: TabKey) => setState(s => ({ ...s, tab, error: null })), []);
  const setHeroQuery = useCallback((heroQuery: string) => setState(s => ({ ...s, heroQuery })), []);
  const setPreviewPlatform = useCallback((previewPlatform: PlatformKey) => setState(s => ({ ...s, previewPlatform })), []);
  const setSelectedContentId = useCallback((selectedContentId: number) => setState(s => ({ ...s, selectedContentId })), []);
  const setMetricKey = useCallback((metricKey: MetricKey) => setState(s => ({ ...s, metricKey })), []);
  const setWeekOffset = useCallback((weekOffset: number) => setState(s => ({ ...s, weekOffset, openChip: null })), []);
  const setOpenChip = useCallback((openChip: number | null) => setState(s => ({ ...s, openChip })), []);
  const closeChip = useCallback(() => setState(s => (s.openChip !== null ? { ...s, openChip: null } : s)), []);

  const goAppFromHero = useCallback(() => {
    setState(s => ({
      ...s,
      view: 'app',
      tab: 'create',
      createPrefill: s.heroQuery.trim(),
    }));
  }, []);

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const approve = useCallback(async (id: number) => {
    try { await api.approveContent(id); await loadReview(); flash('Approved — ready to schedule.'); }
    catch (e) { fail(e, ''); }
  }, [loadReview, flash, fail]);

  const reject = useCallback(async (id: number) => {
    try { await api.rejectContent(id); await loadReview(); flash('Rejected.'); }
    catch (e) { fail(e, ''); }
  }, [loadReview, flash, fail]);

  const connectAccount = useCallback(async (account: Account, creds?: { handle: string; app_password: string }) => {
    setState(s => ({ ...s, connectingId: account.id }));
    try {
      await api.connectAccount(account.platform, creds);
      await loadAccounts();
      flash(account.platform === 'bluesky' ? 'Bluesky connected — posts go out live.' : 'Connected (simulated).');
    } catch (e) { fail(e, ''); }
    finally { setState(s => ({ ...s, connectingId: null })); }
  }, [loadAccounts, flash, fail]);

  const disconnectAccount = useCallback(async (account: Account) => {
    setState(s => ({ ...s, connectingId: account.id }));
    try { await api.disconnectAccount(account.id); await loadAccounts(); flash('Disconnected.'); }
    catch (e) { fail(e, ''); }
    finally { setState(s => ({ ...s, connectingId: null })); }
  }, [loadAccounts, flash, fail]);

  const publishNow = useCallback(async (sid: number) => {
    try { await api.publishNow(sid); await loadCalendar(state.weekOffset); flash('Published now.'); }
    catch (e) { fail(e, ''); }
  }, [loadCalendar, state.weekOffset, flash, fail]);

  const cancelSched = useCallback(async (sid: number) => {
    try { await api.cancelSchedule(sid); await loadCalendar(state.weekOffset); flash('Schedule cancelled.'); }
    catch (e) { fail(e, ''); }
  }, [loadCalendar, state.weekOffset, flash, fail]);

  const dropOnCell = useCallback(async (date: string, hour: number) => {
    const item = dragRef.current;
    dragRef.current = null;
    if (!item) return;
    const scheduled_time = cellToISO(date, hour);
    try {
      if (item.type === 'chip') {
        await api.reschedulePost(item.id, scheduled_time);
        await loadCalendar(state.weekOffset);
        flash('Rescheduled to ' + hourLabel(hour) + '.');
      } else {
        const connected = state.accounts.filter(a => a.status === 'connected').map(a => a.id);
        if (!connected.length) { flash('Connect an account first to schedule.'); return; }
        await api.schedulePost({ content_id: item.id, account_ids: connected, scheduled_time });
        await loadCalendar(state.weekOffset);
        flash('Scheduled — appears on the calendar instantly.');
      }
    } catch (e) { fail(e, ''); }
  }, [state.weekOffset, state.accounts, loadCalendar, flash, fail]);

  const onContentSaved = useCallback(async (msg: string) => {
    await loadCreate();
    flash(msg);
  }, [loadCreate, flash]);

  return {
    state,
    dragRef,
    setView,
    setTab,
    setHeroQuery,
    setPreviewPlatform,
    setSelectedContentId,
    setMetricKey,
    setWeekOffset,
    setOpenChip,
    goAppFromHero,
    flash,
    retry,
    approve,
    reject,
    connectAccount,
    disconnectAccount,
    publishNow,
    cancelSched,
    dropOnCell,
    onContentSaved,
    closeChip,
  };
}
