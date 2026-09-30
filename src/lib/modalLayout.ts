/** Matches SiteNav / site footer — modal chrome aligns with header on wide viewports. */
export const MODAL_SITE_MAX_WIDTH = "max-w-6xl";

/** Horizontal padding aligned with `SiteNav` (`px-3 sm:px-5 md:px-10`). */
export const MODAL_SITE_GUTTER_X = "px-3 sm:px-5 md:px-10";

/** Full-height inner column inside a viewport-bleed modal shell. */
export const MODAL_VIEWPORT_INNER =
  `mx-auto flex h-full min-h-0 w-full ${MODAL_SITE_MAX_WIDTH} flex-col ${MODAL_SITE_GUTTER_X}`;

/**
 * Two-up modal body: context −25% / content +25% vs prior 0.95fr / 1.45fr.
 * Side-by-side from `lg` (same breakpoint as the mobile context toggle).
 * Requires `./src/lib` in `tailwind.config.ts` content so these utilities ship.
 */
export const MODAL_SPLIT_GRID_CLASS =
  "grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,0.7125fr)_minmax(0,1.8125fr)]";
