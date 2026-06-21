import { useState, useCallback, useRef } from 'react';
import type { AppState, PlatformKey, ContentItem } from '@/types';
import { seedAccounts, seedContent, genScheduled, genMetrics } from '@/lib/seedData';
import { fmtISO, hourLabel } from '@/lib/dateUtils';

const initialState: AppState = {
  view: 'landing',
  tab: 'approvals',
  heroQuery: '',
  toast: null,
  accounts: seedAccounts,
  content: seedContent,
  scheduled: genScheduled(),
  composerOpen: false,
  composer: { title: '', body: '', hashtags: '', link: '', media: '' },
  previewPlatform: 'instagram',
  selectedContentId: 'c1',
  metricKey: 'reach',
  weekOffset: 0,
  openChip: null,
  metrics: genMetrics(),
};

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);
  const dragRef = useRef<{ type: 'chip' | 'rail'; id: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((msg: string) => {
    setState(s => ({ ...s, toast: msg }));
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setState(s => ({ ...s, toast: null })), 2600);
  }, []);

  const setView = useCallback((view: 'landing' | 'app') => {
    setState(s => ({ ...s, view }));
  }, []);

  const setTab = useCallback((tab: AppState['tab']) => {
    setState(s => ({ ...s, tab }));
  }, []);

  const setHeroQuery = useCallback((heroQuery: string) => {
    setState(s => ({ ...s, heroQuery }));
  }, []);

  const setPreviewPlatform = useCallback((previewPlatform: PlatformKey) => {
    setState(s => ({ ...s, previewPlatform }));
  }, []);

  const setSelectedContentId = useCallback((selectedContentId: string) => {
    setState(s => ({ ...s, selectedContentId }));
  }, []);

  const setMetricKey = useCallback((metricKey: AppState['metricKey']) => {
    setState(s => ({ ...s, metricKey }));
  }, []);

  const setWeekOffset = useCallback((weekOffset: number) => {
    setState(s => ({ ...s, weekOffset, openChip: null }));
  }, []);

  const setOpenChip = useCallback((openChip: string | null) => {
    setState(s => ({ ...s, openChip }));
  }, []);

  const openComposer = useCallback(() => {
    setState(s => ({ ...s, composerOpen: true }));
  }, []);

  const closeComposer = useCallback(() => {
    setState(s => ({ ...s, composerOpen: false }));
  }, []);

  const setComposerField = useCallback((field: keyof AppState['composer'], value: string) => {
    setState(s => ({ ...s, composer: { ...s.composer, [field]: value } }));
  }, []);

  const approve = useCallback((id: string) => {
    setState(s => ({
      ...s,
      content: s.content.map(c => c.id === id ? { ...c, status: 'approved' as const } : c),
    }));
    flash('Approved \u2014 ready to schedule.');
  }, [flash]);

  const reject = useCallback((id: string) => {
    setState(s => ({
      ...s,
      content: s.content.map(c => c.id === id ? { ...c, status: 'rejected' as const } : c),
    }));
    flash('Rejected.');
  }, [flash]);

  const toggleAccount = useCallback((id: string) => {
    setState(s => {
      const acc = s.accounts.find(a => a.id === id);
      if (!acc) return s;
      if (acc.status === 'connected') {
        return {
          ...s,
          accounts: s.accounts.map(a => a.id === id ? { ...a, status: 'disconnected' as const, connected_at: null } : a),
        };
      } else {
        return {
          ...s,
          accounts: s.accounts.map(a => a.id === id ? { ...a, status: 'connecting' as const } : a),
        };
      }
    });

    setState(s => {
      const acc = s.accounts.find(a => a.id === id);
      if (!acc || acc.status !== 'connecting') return s;
      setTimeout(() => {
        setState(s2 => ({
          ...s2,
          accounts: s2.accounts.map(a => a.id === id ? { ...a, status: 'connected' as const, connected_at: fmtISO(new Date()) } : a),
        }));
        flash('Connected in under a minute.');
      }, 1000);
      return s;
    });
  }, [flash]);

  const publishNow = useCallback((sid: string) => {
    setState(s => ({
      ...s,
      scheduled: s.scheduled.map(p => p.id === sid ? { ...p, status: 'published' as const } : p),
    }));
    flash('Published now.');
  }, [flash]);

  const cancelSched = useCallback((sid: string) => {
    setState(s => ({
      ...s,
      scheduled: s.scheduled.filter(p => p.id !== sid),
    }));
    flash('Schedule cancelled.');
  }, [flash]);

  const dropOnCell = useCallback((date: string, hour: number) => {
    const item = dragRef.current;
    if (!item) return;
    if (item.type === 'chip') {
      setState(s => ({
        ...s,
        scheduled: s.scheduled.map(p => p.id === item.id ? { ...p, date, hour } : p),
      }));
      flash('Rescheduled to ' + hourLabel(hour) + '.');
    } else if (item.type === 'rail') {
      setState(s => {
        const c = s.content.find(x => x.id === item.id);
        const nid = 's' + Date.now();
        return {
          ...s,
          scheduled: [...s.scheduled, { id: nid, contentId: item.id, platform: 'instagram' as PlatformKey, title: c ? c.title : 'New post', date, hour, status: 'scheduled' as const }],
          content: s.content.map(x => x.id === item.id ? { ...x, status: 'scheduled' as const } : x),
        };
      });
      flash('Scheduled \u2014 appears on the calendar instantly.');
    }
    dragRef.current = null;
  }, [flash]);

  const saveComposer = useCallback(() => {
    setState(s => {
      const c = s.composer;
      if (!c.title.trim()) return s;
      const nid = 'c' + Date.now();
      const item: ContentItem = {
        id: nid,
        title: c.title,
        body: c.body,
        hashtags: c.hashtags.split(/\s+/).filter(Boolean),
        link: c.link,
        media_url: c.media,
        status: 'pending_approval',
        created_at: fmtISO(new Date()),
      };
      return {
        ...s,
        content: [item, ...s.content],
        composerOpen: false,
        composer: { title: '', body: '', hashtags: '', link: '', media: '' },
        selectedContentId: nid,
      };
    });
    flash('Draft created \u2014 pending approval.');
  }, [flash]);

  const closeChip = useCallback(() => {
    setState(s => s.openChip ? { ...s, openChip: null } : s);
  }, []);

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
    openComposer,
    closeComposer,
    setComposerField,
    flash,
    approve,
    reject,
    toggleAccount,
    publishNow,
    cancelSched,
    dropOnCell,
    saveComposer,
    closeChip,
  };
}