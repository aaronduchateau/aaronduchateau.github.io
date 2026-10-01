/**
 * Fullscreen modal content column.
 * Matches SiteNav (`max-w-6xl` / 72rem) until that column actually constrains
 * (`min-[1152px]` = 72rem at 16px root), then sits slightly narrower so header
 * chrome can use a lighter inset without looking over-indented. SiteNav / page
 * layout stay `max-w-6xl` — do not change those.
 *
 * Use `min-[1152px]` (px), not `min-[72rem]` — Tailwind drops min-/max- variants
 * when screens mix rem and px units.
 * Keep class names as complete string literals for the Tailwind content scan.
 */
export const MODAL_SITE_MAX_WIDTH =
  "max-w-6xl min-[1152px]:max-w-[69rem]";

/**
 * Top bar gutters (close left / date or actions right).
 * Same as SiteNav below the site max (`px-3 sm:px-5 md:px-10`) so the X
 * overlays the menu toggle. From `min-[1152px]`, pad drops to `px-4` to match
 * the narrower modal column: (72rem − 69rem) / 2 = 1.5rem less than `px-10`.
 * Do not put on `MODAL_VIEWPORT_INNER` or the media stage.
 */
export const MODAL_TOPBAR_PAD_X =
  "px-3 sm:px-5 md:px-10 min-[1152px]:px-4";

/**
 * Horizontal inset for other modal / demo chrome (tabs, actions, context copy).
 * Lighter than the top bar — not site-nav gutters.
 */
export const MODAL_CHROME_PAD_X = "px-3";

/**
 * Footer / CTA gutters when the left context column is stacked away (`< lg`)
 * but the viewport is still mid-width (`md+`). Matches SiteNav-scale topbar
 * gutters so Watch on YouTube lines up with close + info. Mobile (`< md`) and
 * the split layout (`lg+`) stay on `MODAL_CHROME_PAD_X`.
 */
export const MODAL_STACKED_FOOTER_PAD_X = "px-3 md:px-10 lg:px-3";

/**
 * Full-height centered column inside a viewport-bleed modal shell.
 * Max-width only — no horizontal padding. Pad header/footer with
 * `MODAL_TOPBAR_PAD_X` / `MODAL_CHROME_PAD_X`.
 * Full utility string kept literal for Tailwind JIT.
 */
export const MODAL_VIEWPORT_INNER =
  "mx-auto flex h-full min-h-0 w-full max-w-6xl min-[1152px]:max-w-[69rem] flex-col";

/**
 * Two-up modal body: context −25% / content +25% vs prior 0.95fr / 1.45fr.
 * Side-by-side from `lg` (same breakpoint as the mobile context toggle).
 * Requires `./src/lib` in `tailwind.config.ts` content so these utilities ship.
 */
export const MODAL_SPLIT_GRID_CLASS =
  "grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,0.7125fr)_minmax(0,1.8125fr)]";
