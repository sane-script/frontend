export type PlatformKey = 'facebook' | 'instagram' | 'x' | 'tiktok' | 'bluesky';

export const PLATFORMS: Record<PlatformKey, { label: string; short: string; color: string }> = {
  facebook:  { label: 'Facebook',  short: 'f',  color: '#1877F2' },
  instagram: { label: 'Instagram', short: 'IG', color: '#E1306C' },
  x:         { label: 'X',         short: 'X',  color: '#18181b' },
  tiktok:    { label: 'TikTok',    short: 'TT', color: '#0f9bb0' },
  bluesky:   { label: 'Bluesky',   short: 'bs', color: '#0085FF' },
};

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

export interface Account {
  id: string;
  platform: PlatformKey;
  display_name: string;
  handle: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  connected_at: string | null;
  live?: boolean;
}

export interface ContentItem {
  id: string;
  title: string;
  body: string;
  hashtags: string[];
  link: string;
  media_url: string;
  status: ContentStatus;
  created_at: string;
}

export interface ScheduledPost {
  id: string;
  contentId: string;
  platform: PlatformKey;
  title: string;
  date: string;
  hour: number;
  status: 'scheduled' | 'published' | 'canceled';
}

export interface MetricRow {
  title: string;
  platform: PlatformKey;
  published: string;
  reach: number;
  engagement: number;
  clicks: number;
}

export interface AppState {
  view: 'landing' | 'app';
  tab: 'approvals' | 'calendar' | 'analytics' | 'accounts';
  heroQuery: string;
  toast: string | null;
  accounts: Account[];
  content: ContentItem[];
  scheduled: ScheduledPost[];
  composerOpen: boolean;
  composer: { title: string; body: string; hashtags: string; link: string; media: string };
  previewPlatform: PlatformKey;
  selectedContentId: string;
  metricKey: 'reach' | 'engagement' | 'followers' | 'clicks';
  weekOffset: number;
  openChip: string | null;
  metrics: {
    series: Record<string, number[]>;
    days: Date[];
    byPost: MetricRow[];
  };
}