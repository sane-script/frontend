export type PlatformKey = 'facebook' | 'instagram' | 'x' | 'tiktok' | 'bluesky';

// label + brand color (icon background). The actual brand glyph lives in
// components/icons/PlatformIcon.tsx — the single source of truth for logos.
export const PLATFORMS: Record<PlatformKey, { label: string; short: string; color: string }> = {
  facebook:  { label: 'Facebook',  short: 'f',  color: '#1877F2' },
  instagram: { label: 'Instagram', short: 'IG', color: '#E1306C' },
  x:         { label: 'X',         short: 'X',  color: '#18181b' },
  tiktok:    { label: 'TikTok',    short: 'TT', color: '#0f9bb0' },
  bluesky:   { label: 'Bluesky',   short: 'bs', color: '#0085FF' },
};

export const ALL_PLATFORMS: PlatformKey[] = ['facebook', 'instagram', 'x', 'tiktok', 'bluesky'];

export type ContentStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'scheduled'
  | 'published'
  | 'failed';

export const STATUS_META: Record<ContentStatus, { label: string; bg: string; fg: string }> = {
  draft:            { label: 'Draft',     bg: '#f4f4f5', fg: '#71717a' },
  pending_approval: { label: 'Pending',   bg: '#fef9c3', fg: '#854d0e' },
  approved:         { label: 'Approved',  bg: '#dcfce7', fg: '#166534' },
  rejected:         { label: 'Rejected',  bg: '#fee2e2', fg: '#991b1b' },
  scheduled:        { label: 'Scheduled', bg: '#e0e7ff', fg: '#3730a3' },
  published:        { label: 'Published', bg: '#ecfccb', fg: '#3f6212' },
  failed:           { label: 'Failed',    bg: '#fee2e2', fg: '#b91c1c' },
};

export type AccountStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface Account {
  id: number;
  platform: PlatformKey;
  display_name: string;
  handle: string;
  status: AccountStatus;
  connected_at: string | null;
  live: boolean; // bluesky is the only real (live-posting) adapter
}

export interface ContentItem {
  id: number;
  title: string;
  body: string;
  hashtags: string[];
  link: string;
  media_url: string;
  status: ContentStatus;
  created_at: string;
}

// UI-shaped scheduled post (a calendar chip). Mapped from the backend's
// ScheduledPost using the accounts + content lists.
export interface ScheduledPost {
  id: number;
  contentId: number;
  accountId: number;
  platform: PlatformKey;
  title: string;
  date: string;  // YYYY-MM-DD (local)
  hour: number;  // snapped to a band hour for the grid
  status: 'scheduled' | 'published' | 'canceled';
}

// One row of the per-post analytics table (from /api/metrics/by-post).
export interface MetricRow {
  platform: PlatformKey;
  handle: string;
  reach: number;
  impressions: number;
  engagement: number; // derived server-side from likes+comments+shares
  clicks: number;
}

export type MetricKey = 'reach' | 'engagement' | 'followers' | 'clicks';

export interface AppState {
  view: 'landing' | 'app';
  tab: 'approvals' | 'calendar' | 'analytics' | 'accounts';
  heroQuery: string;
  toast: string | null;
  accounts: Account[];
  content: ContentItem[];
  scheduled: ScheduledPost[];
  composerOpen: boolean;
  composerPrefill: string;
  previewPlatform: PlatformKey;
  selectedContentId: number | null;
  metricKey: MetricKey;
  weekOffset: number;
  openChip: number | null;
  connectingId: number | null;
  loading: boolean;
  error: string | null;
  metrics: {
    series: Record<MetricKey, number[]>;
    days: Date[];
    byPost: MetricRow[];
    overview: {
      reach: number;
      engagement: number;
      followers: number;
      clicks: number;
      impressions: number;
    };
  };
}
