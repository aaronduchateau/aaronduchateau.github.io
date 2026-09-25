/** User preference: show the main-site bottom-right unlock explanation. Default on. */
export const PRIZE_ANIMATIONS_STORAGE_KEY = "portfolio-prize-animations-enabled";
export const DEFAULT_PRIZE_ANIMATIONS_ENABLED = true;
export const PRIZE_ANIMATIONS_CHANGE_EVENT = "portfolio:prize-animations-changed";

export function readPrizeAnimationsEnabled(): boolean {
  if (typeof window === "undefined") return DEFAULT_PRIZE_ANIMATIONS_ENABLED;
  try {
    const raw = window.localStorage.getItem(PRIZE_ANIMATIONS_STORAGE_KEY);
    if (raw === "false") return false;
    if (raw === "true") return true;
  } catch {
    /* private mode / blocked storage */
  }
  return DEFAULT_PRIZE_ANIMATIONS_ENABLED;
}

export function persistPrizeAnimationsEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(PRIZE_ANIMATIONS_STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<boolean>(PRIZE_ANIMATIONS_CHANGE_EVENT, { detail: enabled }),
    );
  }
}
