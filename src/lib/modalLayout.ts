/** Matches SiteNav / site footer max width — modal chrome centers to the same column. */
export const MODAL_SITE_MAX_WIDTH = "max-w-6xl";

/**
 * Same horizontal gutters as SiteNav (`px-3 sm:px-5 md:px-10`).
 * Use on the **top bar only** so the close control lines up with the menu toggle
 * when the modal closes. Do not put on `MODAL_VIEWPORT_INNER` or the media stage.
 */
export const MODAL_TOPBAR_PAD_X = "px-3 sm:px-5 md:px-10";

/**
 * Horizontal inset for other modal / demo chrome (tabs, actions, context copy).
 * Lighter than the top bar — not site-nav gutters.
 */
export const MODAL_CHROME_PAD_X = "px-3";

/**
 * Footer / CTA gutters when the left context column is stacked away (`< lg`)
 * but the viewport is still mid-width (`md+`). Matches `MODAL_TOPBAR_PAD_X`
 * so Watch on YouTube lines up with close + info. Mobile (`< md`) and the
 * split layout (`lg+`) stay on `MODAL_CHROME_PAD_X`.
 */
export const MODAL_STACKED_FOOTER_PAD_X = "px-3 md:px-10 lg:px-3";

/**
 * Full-height centered column inside a viewport-bleed modal shell.
 * Max-width only — no horizontal padding. Pad header/footer with `MODAL_CHROME_PAD_X`.
 */
export const MODAL_VIEWPORT_INNER =
  `mx-auto flex h-full min-h-0 w-full ${MODAL_SITE_MAX_WIDTH} flex-col`;

/**
 * Two-up modal body: context −25% / content +25% vs prior 0.95fr / 1.45fr.
 * Side-by-side from `lg` (same breakpoint as the mobile context toggle).
 * Requires `./src/lib` in `tailwind.config.ts` content so these utilities ship.
 */
export const MODAL_SPLIT_GRID_CLASS =
  "grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,0.7125fr)_minmax(0,1.8125fr)]";
