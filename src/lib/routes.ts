/**
 * App route tree (static export, trailing slashes).
 *
 * - `/` → reconciles to splash
 * - `/intro/`, `/intro/splash/` — entry / loadout (outside the launched site)
 * - `/portfolio-launched/` — main portfolio
 * - `/component-preview/` — isolated Storybook iframe (no signature boot plate)
 */

export const INTRO_PATH = "/intro/";
export const INTRO_SPLASH_PATH = "/intro/splash/";
export const PORTFOLIO_PATH = "/portfolio-launched/";
/** Isolated catalog iframe — must never run the signature boot splash. */
export const COMPONENT_PREVIEW_PATH = "/component-preview/";

/** Normalize for comparisons (trailing slash optional). */
export function normalizePathname(pathname: string): string {
  if (!pathname) return "/";
  const withSlash = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return withSlash === "//" ? "/" : withSlash;
}

export function isIntroPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return path === INTRO_PATH || path.startsWith("/intro/");
}

export function isPortfolioPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return path === PORTFOLIO_PATH || path.startsWith("/portfolio-launched/");
}

export function isComponentPreviewPath(pathname?: string): boolean {
  const path = normalizePathname(
    pathname ?? (typeof window !== "undefined" ? window.location.pathname : ""),
  );
  return path === COMPONENT_PREVIEW_PATH || path.startsWith("/component-preview/");
}
