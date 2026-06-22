// ─────────────────────────────────────────────────────────────────────────────
// DEMO-ONLY Bluesky credentials.
//
// These are visible in the frontend bundle to anyone. That is ACCEPTABLE ONLY
// because this points at a disposable throwaway Bluesky account created purely
// for this demo. Rotate or empty these the moment they leak or the demo ends.
//
// To rotate: change the handle/app password below (generate an app password at
// https://bsky.app/settings/app-passwords). This single constant is the only
// place demo creds live.
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_BLUESKY = {
  handle: 'demoforwork.bsky.social',
  // ⚠️ Paste the throwaway account's APP PASSWORD here (xxxx-xxxx-xxxx-xxxx).
  // Left blank by default so a real secret is never committed by accident —
  // the "Use sample account" button fills the handle and focuses the password
  // field if this is empty.
  appPassword: '',
};

export const hasDemoCredentials = () => DEMO_BLUESKY.appPassword.trim().length > 0;
