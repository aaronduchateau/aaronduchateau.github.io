/** Software-portfolio-only layout: hide playful sections on any theme. */
export const SOFTWARE_PORTFOLIO_ONLY_STORAGE_KEY = "portfolio-software-only";
export const SOFTWARE_PORTFOLIO_ONLY_CHANGE_EVENT = "portfolio:software-only-changed";

export function readSoftwarePortfolioOnly(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SOFTWARE_PORTFOLIO_ONLY_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function persistSoftwarePortfolioOnly(enabled: boolean): void {
  try {
    window.localStorage.setItem(
      SOFTWARE_PORTFOLIO_ONLY_STORAGE_KEY,
      enabled ? "true" : "false",
    );
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<boolean>(SOFTWARE_PORTFOLIO_ONLY_CHANGE_EVENT, {
        detail: enabled,
      }),
    );
  }
}
