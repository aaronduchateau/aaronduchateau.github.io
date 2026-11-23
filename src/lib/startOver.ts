import { INTRO_SPLASH_PATH } from "@/lib/routes";

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

/** Wipe storage, then open Your Experience. A full load so wiped prefs cannot linger. */
export function startOverAndLeave(): void {
  wipePortfolioBrowserState();
  window.location.assign(INTRO_SPLASH_PATH);
}
