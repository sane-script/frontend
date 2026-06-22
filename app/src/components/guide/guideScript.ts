// Scripted onboarding beats for the "Sane" guide bot. Pure data — no AI, no
// backend. SaneGuide.tsx renders these with a typewriter effect and a spotlight
// on the element named by `target` (a [data-guide="..."] value).

export type GuideGo = 'app' | 'accounts' | 'create' | 'landing' | 'minimize';

export interface GuideStep {
  id: string;
  text: string;
  /** [data-guide] attribute value to spotlight, if any. */
  target?: string;
  /** Button label. Defaults to "Next". */
  cta?: string;
  /** Navigation/side-effect to run when the CTA is pressed. */
  go?: GuideGo;
  /** Only show this step when in this view. */
  requireView?: 'landing' | 'app';
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'intro',
    text: "First time? Follow me. Hi, I'm Sane 👋 Let's get you posting. Click below and I'll walk you through it.",
    target: 'get-started',
    cta: "Let's go →",
    go: 'app',
  },
  {
    id: 'cms',
    text: "This is the workspace you'll live in. First, let's connect an account so your posts have somewhere to go.",
    target: 'tab-accounts',
    cta: 'Open Accounts',
    go: 'accounts',
  },
  {
    id: 'connect',
    text: "Facebook, Instagram and the rest need OAuth, which we wire up in production. Don't get bogged down — use Bluesky, it's fully live. Hit Connect on the Bluesky card, then 'Use the sample demo account'.",
    target: 'tab-accounts',
    cta: 'Done — next',
  },
  {
    id: 'create',
    text: "Nice! Now let's make a post. Head to Create.",
    target: 'tab-create',
    cta: 'Open Create',
    go: 'create',
  },
  {
    id: 'decide',
    text: "Write your title, body and hashtags, pick your networks, then choose one: Post now, Schedule, or Save as draft. That's the whole flow.",
    target: 'decision-bar',
    cta: 'Got it',
  },
  {
    id: 'done',
    text: "That's it — have fun and experiment. Tweak anything you like; I'll be hanging out down here if you need me.",
    cta: 'Finish',
    go: 'minimize',
  },
];
