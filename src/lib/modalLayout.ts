/** Matches SiteNav / site footer max width — modal chrome centers to the same column. */
export const MODAL_SITE_MAX_WIDTH = "max-w-6xl";

/**
 * Horizontal inset for modal / demo **chrome rows** (close, tabs, actions, context copy).
 * Same on all breakpoints — enough to keep controls off the edge; not site-nav gutters.
 * Do **not** put this on `MODAL_VIEWPORT_INNER` — that would pad the middle media stage.
 */
export const MODAL_CHROME_PAD_X = "px-3";

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
