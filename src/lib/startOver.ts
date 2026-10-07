/** Classic V1 portfolio — Start over lands here after wiping browser state. */
export const CLASSIC_SITE_URL = "https://aaronduchateau.github.io/";

/**
 * Clear local + session storage so the next visit to this origin is brand-new
 * (points, themes, sounds, intro gates, prefs). Call immediately before redirect.
 */
export function wipePortfolioBrowserState(): void {
  try {
    window.localStorage.clear();
  } catch {
    /* private mode / quota */
  }
  try {
    window.sessionStorage.clear();
  } catch {
    /* private mode / quota */
  }
}

/** Wipe storage, then navigate to the classic site. */
export function startOverAndLeave(): void {
  wipePortfolioBrowserState();
  window.location.assign(CLASSIC_SITE_URL);
}
