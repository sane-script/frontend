import type { Account, ContentItem, ScheduledPost, PlatformKey } from '@/types';
import { addDays, mondayOf, fmtISO } from './dateUtils';

export const bandHours = [8, 10, 12, 14, 16, 18, 20];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function genScheduled(): ScheduledPost[] {
  const mon = mondayOf(new Date());
  const d = (i: number) => fmtISO(addDays(mon, i));
  return [
    { id: 's1', contentId: 'c4', platform: 'instagram', title: 'Spring drop teaser', date: d(0), hour: 10, status: 'scheduled' },
    { id: 's2', contentId: 'c4', platform: 'x', title: 'Tip: batch your week', date: d(0), hour: 16, status: 'scheduled' },
    { id: 's3', contentId: 'c3', platform: 'facebook', title: 'Customer story: Loom', date: d(1), hour: 12, status: 'scheduled' },
    { id: 's4', contentId: 'c5', platform: 'bluesky', title: 'We post to Bluesky live', date: d(1), hour: 18, status: 'scheduled' },
    { id: 's5', contentId: 'c2', platform: 'instagram', title: 'Behind the build', date: d(2), hour: 8, status: 'scheduled' },
    { id: 's6', contentId: 'c8', platform: 'tiktok', title: '15s product teaser', date: d(2), hour: 14, status: 'scheduled' },
    { id: 's7', contentId: 'c2', platform: 'x', title: 'Thread: scheduling 101', date: d(2), hour: 20, status: 'scheduled' },
    { id: 's8', contentId: 'c5', platform: 'bluesky', title: 'Changelog 2.4', date: d(3), hour: 10, status: 'scheduled' },
    { id: 's9', contentId: 'c1', platform: 'facebook', title: 'Webinar signup', date: d(3), hour: 16, status: 'scheduled' },
    { id: 's10', contentId: 'c5', platform: 'instagram', title: 'Feature Friday', date: d(4), hour: 12, status: 'scheduled' },
    { id: 's11', contentId: 'c6', platform: 'x', title: 'Weekend reading', date: d(4), hour: 18, status: 'scheduled' },
    { id: 's12', contentId: 'c8', platform: 'tiktok', title: 'Trend remix', date: d(5), hour: 14, status: 'scheduled' },
    { id: 's13', contentId: 'c6', platform: 'instagram', title: 'Sunday recap', date: d(6), hour: 16, status: 'scheduled' },
  ];
}

export function genMetrics() {
  const rnd = seeded(73);
  const defs: Record<string, [number, number, number]> = {
    reach: [4200, 1.014, 0.14],
    engagement: [760, 1.016, 0.2],
    followers: [120, 1.0, 0.5],
    clicks: [280, 1.012, 0.16],
  };
  const series: Record<string, number[]> = {};
  Object.keys(defs).forEach(k => {
    const a = defs[k];
    let val = a[0];
    const arr: number[] = [];
    for (let i = 0; i < 30; i++) {
      val = val * a[1] * (1 + (rnd() - 0.5) * a[2]);
      arr.push(Math.max(1, Math.round(val)));
    }
    series[k] = arr;
  });
  const days: Date[] = [];
  for (let i = 0; i < 30; i++) {
    days.push(addDays(new Date(), -29 + i));
  }
  const byPost = [
    { title: 'Spring product drop', platform: 'instagram' as PlatformKey, published: 'Jun 18, 10:00', reach: 18420, engagement: 2140, clicks: 612 },
    { title: 'Behind the build', platform: 'x' as PlatformKey, published: 'Jun 17, 09:00', reach: 9240, engagement: 880, clicks: 301 },
    { title: 'Customer story: Loom', platform: 'facebook' as PlatformKey, published: 'Jun 16, 12:00', reach: 12880, engagement: 1320, clicks: 455 },
    { title: 'Changelog 2.4', platform: 'bluesky' as PlatformKey, published: 'Jun 15, 11:00', reach: 5210, engagement: 640, clicks: 188 },
    { title: '15s product teaser', platform: 'tiktok' as PlatformKey, published: 'Jun 14, 14:00', reach: 31200, engagement: 4820, clicks: 740 },
    { title: 'Feature Friday', platform: 'instagram' as PlatformKey, published: 'Jun 12, 12:00', reach: 14110, engagement: 1660, clicks: 520 },
    { title: 'Weekend reading', platform: 'x' as PlatformKey, published: 'Jun 11, 18:00', reach: 7430, engagement: 710, clicks: 240 },
    { title: 'Meet the team', platform: 'facebook' as PlatformKey, published: 'Jun 09, 16:00', reach: 8990, engagement: 980, clicks: 276 },
  ];
  return { series, days, byPost };
}

export const seedAccounts: Account[] = [
  { id: 'a1', platform: 'facebook', display_name: 'insane-post', handle: '@insane-post', status: 'connected', connected_at: '2026-04-02' },
  { id: 'a2', platform: 'instagram', display_name: 'insane-post', handle: '@insane-post.app', status: 'connected', connected_at: '2026-04-02' },
  { id: 'a3', platform: 'x', display_name: 'insane-post', handle: '@insane-postHQ', status: 'connected', connected_at: '2026-05-11' },
  { id: 'a4', platform: 'tiktok', display_name: 'insane-post', handle: '@insane-post', status: 'error', connected_at: null },
  { id: 'a5', platform: 'bluesky', display_name: 'insane-post', handle: '@insane-post.bsky.social', status: 'connected', connected_at: '2026-06-01', live: true },
];

export const seedContent: ContentItem[] = [
  { id: 'c1', title: 'Spring product drop', body: 'Five networks, one calendar. insane-post is the cleanest way to run social for a small team \u2014 draft, approve, schedule, measure.', hashtags: ['#socialmedia', '#scheduling', '#smm'], link: 'insane-post.app/spring', media_url: '', status: 'pending_approval', created_at: '2026-06-18' },
  { id: 'c2', title: 'Behind the build', body: 'We rebuilt our scheduler around a single adapter layer. Here is what changed and why your queue is now twice as fast.', hashtags: ['#buildinpublic', '#devlog'], link: 'insane-post.app/blog/adapter', media_url: '', status: 'pending_approval', created_at: '2026-06-17' },
  { id: 'c3', title: 'Customer story: Loom', body: 'How a 4-person team ships 30 posts a week across five networks with one person and zero spreadsheets.', hashtags: ['#casestudy', '#growth'], link: 'insane-post.app/loom', media_url: '', status: 'approved', created_at: '2026-06-15' },
  { id: 'c4', title: 'Weekly tips thread', body: 'Batch your week on Sunday. Approve once. Let it publish. Five quick rules for a calmer social calendar.', hashtags: ['#tips', '#productivity'], link: '', media_url: '', status: 'scheduled', created_at: '2026-06-14' },
  { id: 'c5', title: 'Feature: drag to reschedule', body: 'Moved a post? Just drag the chip. It republishes on the new slot automatically \u2014 no re-approval needed.', hashtags: ['#product'], link: 'insane-post.app/changelog', media_url: '', status: 'published', created_at: '2026-06-10' },
  { id: 'c6', title: 'Q2 metrics recap', body: 'Reach up 38%, engagement up 22%. The numbers in this post match the CSV we exported \u2014 to the digit.', hashtags: ['#analytics', '#recap'], link: '', media_url: '', status: 'draft', created_at: '2026-06-19' },
  { id: 'c7', title: 'Hiring: design engineer', body: 'We are looking for a design engineer who cares about motion and type. Remote, async, lime-green optional.', hashtags: ['#hiring', '#designengineer'], link: 'insane-post.app/jobs', media_url: '', status: 'rejected', created_at: '2026-06-12' },
  { id: 'c8', title: 'TikTok teaser', body: '15 seconds of our calendar in motion. Sound on.', hashtags: ['#tiktok', '#teaser'], link: '', media_url: '', status: 'failed', created_at: '2026-06-11' },
  { id: 'c20', title: 'Q3 roadmap preview', body: 'Threads support, bulk import, and a sharper analytics export are next. Here is the shape of Q3.', hashtags: ['#roadmap'], link: 'insane-post.app/roadmap', media_url: '', status: 'approved', created_at: '2026-06-16' },
  { id: 'c21', title: 'Meet the team', body: 'Six people, five time zones, one calendar. Say hi to the team behind insane-post.', hashtags: ['#team', '#culture'], link: '', media_url: '', status: 'approved', created_at: '2026-06-13' },
  { id: 'c22', title: 'Integration: Notion', body: 'Draft in Notion, push to insane-post. The two-way sync is now in beta for everyone on Pro.', hashtags: ['#integration', '#notion'], link: 'insane-post.app/notion', media_url: '', status: 'approved', created_at: '2026-06-09' },
];