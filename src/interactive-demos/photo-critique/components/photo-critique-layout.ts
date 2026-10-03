export const critiquePanelClass = "rounded-xl border border-white/10 bg-black/60";

/**
 * Horizontal inset for top tab/close chrome, overlay toggles, and bottom action rows.
 * Re-exports `MODAL_CHROME_PAD_X` so Photo Critique stays on the shared chrome contract.
 */
export { MODAL_CHROME_PAD_X as critiqueChromePadX } from "@/lib/modalLayout";

/** Left inset for the critique results scroll body (photos + notes). */
export const critiqueScrollPadL = "pl-[6px]";

/**
 * Result photo frames (eye-flow / visual-weight compare).
 * Caps chrome at 8px so theme `--radius-media` never clips these previews.
 * Do not use `var(--radius-media)` here — theme radii stay untouched elsewhere.
 */
export const CRITIQUE_RESULT_PHOTO_RADIUS_PX = 8;

export const critiqueResultPhotoFrameClass =
  "relative overflow-hidden border border-white/10 bg-black [border-radius:8px]";

export const critiqueResultPhotoLabelClass =
  "pointer-events-none absolute left-2 top-2 z-[1] rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide";

export const critiqueInputTabClass =
  "rounded-full border px-3 py-1.5 text-xs font-semibold transition";

export const critiqueInputTabActiveClass =
  "border-accent-500/50 bg-accent-950/40 text-accent-200";

export const critiqueInputTabInactiveClass =
  "border-white/15 text-surface-400 hover:border-white/30 hover:text-surface-200";

export const critiqueUploadTabActiveClass =
  "border-violet-500/50 bg-violet-950/40 text-violet-200";

export const critiqueUploadTabInactiveClass =
  "border-violet-500/30 text-violet-300/80 hover:border-violet-500/45 hover:text-violet-200";

export const critiqueSectionTitleClass = "text-sm font-semibold text-accent-100";

export const critiqueMutedClass = "text-xs leading-relaxed text-surface-400";

export const tierBadgeClass: Record<string, string> = {
  strong: "border-emerald-500/40 bg-emerald-950/40 text-emerald-200",
  good: "border-accent-500/40 bg-accent-950/40 text-accent-200",
  needsWork: "border-amber-500/40 bg-amber-950/40 text-amber-200",
};

export const tierLabel: Record<string, string> = {
  strong: "Strong",
  good: "Good",
  needsWork: "Needs work",
};
