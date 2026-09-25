import { readSoftwarePortfolioOnly } from "@/lib/softwarePortfolioPref";
import { CONTENT_WINDOW_STORAGE_KEY } from "@/theme/sounds";

/** localStorage flag: visitor has entered the launched portfolio at least once. */
export const INTRO_COMPLETED_KEY = "portfolio.introCompleted";

const SPLASH_CHOICES_SESSION_KEY = "portfolio.introSplashChoices";

/**
 * Splash + `/intro` use `modal-launch`, which follows content-window SFX length.
 * After the visitor has picked a path (software-only) or a content-window sound,
 * skip that fade so those screens appear instantly.
 */
export function shouldSkipIntroShellLaunch(): boolean {
  if (typeof window === "undefined") return false;
  if (readSoftwarePortfolioOnly()) return true;
  try {
    if (window.localStorage.getItem(CONTENT_WINDOW_STORAGE_KEY)) return true;
    if (window.sessionStorage.getItem(SPLASH_CHOICES_SESSION_KEY)) return true;
  } catch {
    /* private mode / quota */
  }
  return false;
}

export function hasCompletedIntro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(INTRO_COMPLETED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Call when the visitor enters/skips/closes the intro into `/portfolio-launched/`. */
export function markIntroCompleted(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INTRO_COMPLETED_KEY, "1");
  } catch {
    /* private mode / quota */
  }
}
