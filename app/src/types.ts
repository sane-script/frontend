export type PlatformKey = 'facebook' | 'instagram' | 'x' | 'tiktok' | 'bluesky';

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
  live: boolean;
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

export interface ScheduledPost {
  id: number;
  contentId: number;
  accountId: number;
  platform: PlatformKey;
  title: string;
  date: string;
  hour: number;
  status: 'scheduled' | 'published' | 'canceled';
}

export interface MetricRow {
  platform: PlatformKey;
  handle: string;
  reach: number;
  impressions: number;
  engagement: number;
  clicks: number;
}

export type MetricKey = 'reach' | 'engagement' | 'followers' | 'clicks';

export type TabKey = 'create' | 'calendar' | 'analytics' | 'accounts' | 'drafts' | 'review';

export interface AppState {
  view: 'landing' | 'app';
  tab: TabKey;
  heroQuery: string;
  createPrefill: string;
  editDraft: ContentItem | null;
  toast: string | null;
  accounts: Account[];
  content: ContentItem[];
  scheduled: ScheduledPost[];
  previewPlatform: PlatformKey;
  selectedContentId: number | null;
  metricKey: MetricKey;
  weekOffset: number;
  openChip: number | null;
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
