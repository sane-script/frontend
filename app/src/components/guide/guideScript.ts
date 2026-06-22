// Scripted onboarding beats for the "Sane" guide bot. Pure data — no AI, no
// backend. SaneGuide.tsx renders these with a typewriter effect, auto-navigates
// to each step's `location`, and spotlights the element named by `target`.

export type GuideLocation = 'landing' | 'accounts' | 'create';

export interface GuideStep {
  id: string;
  text: string;
  /** Where the user should be for this step — the guide navigates here. */
  location: GuideLocation;
  /** [data-guide] attribute value to spotlight, if any. */
  target?: string;
  /** Forward-button label. Defaults to "Next". */
  cta?: string;
}

// A single coherent narrative: open the app → connect → create → choose → done.
// Each beat moves the story forward; none repeat the previous one.
export const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'open',
    location: 'landing',
    target: 'get-started',
    text: "Hey — I'm Sane 👋 I'll take you from zero to your first live post in about a minute. First, let's step inside the workspace.",
    cta: 'Open the app →',
  },
  {
    id: 'accounts',
    location: 'accounts',
    target: 'tab-accounts',
    text: "This is your workspace. Nothing can go out until a network is connected, so we start here — I've opened the Accounts tab for you.",
    cta: 'Makes sense →',
  },
  {
    id: 'bluesky',
    location: 'accounts',
    target: 'tab-accounts',
    text: "Facebook, Instagram, X and TikTok need each platform's OAuth review — a production step. For a real LIVE test right now, use Bluesky: hit Connect on its card, then “Use the sample demo account.”",
    cta: "Connected — next →",
  },
  {
    id: 'create',
    location: 'create',
    target: 'tab-create',
    text: "Now the fun part: making a post. This is the Create tab — where writing and publishing happen in one place.",
    cta: 'Show me how →',
  },
  {
    id: 'decide',
    location: 'create',
    target: 'decision-bar',
    text: "Write a title and body, add hashtags, then pick your networks on the right. When you're ready, choose one: Post now, Schedule, or Save as draft.",
    cta: 'Got it →',
  },
  {
    id: 'done',
    location: 'create',
    text: "That's the whole loop — Connect, Create, Choose, then watch it perform in Analytics. Have a play; I'll be down in the corner whenever you need me.",
    cta: 'Finish',
  },
];
