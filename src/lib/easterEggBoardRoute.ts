/** URL-driven easter-egg / portfolio-game board (`?modal=easter-eggs:board`). */
export const EASTER_EGG_BOARD_NAMESPACE = "easter-eggs";
export const EASTER_EGG_BOARD_KEY = "board";

export const THEME_PLAYGROUND_NAMESPACE = "demos";
export const THEME_PLAYGROUND_KEY = "theme-playground";

const RETURN_TO_BOARD_KEY = "portfolio-theme-picker-return-board";
const THEME_OPTIN_DONE_KEY = "portfolio-easter-theme-optin-done";

export function markThemePickerReturnToBoard(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(RETURN_TO_BOARD_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function isThemePickerReturningToBoard(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(RETURN_TO_BOARD_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearThemePickerReturnToBoard(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(RETURN_TO_BOARD_KEY);
  } catch {
    /* ignore */
  }
}

export function markEasterThemeOptinDone(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(THEME_OPTIN_DONE_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function readEasterThemeOptinDone(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(THEME_OPTIN_DONE_KEY) === "1";
  } catch {
    return false;
  }
}
