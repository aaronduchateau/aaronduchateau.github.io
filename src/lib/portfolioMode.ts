/**
 * Studio / tooling helpers.
 *
 * Intro vs launched portfolio is route-based (`/intro*` vs `/portfolio-launched*`),
 * not an env flag. MediaModal hamburger tools follow the host: on for local
 * preview, off on deployed hosts — no `.env` required.
 */

/** True on local static preview / `next dev` hosts only. */
export function isDevMode(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}
