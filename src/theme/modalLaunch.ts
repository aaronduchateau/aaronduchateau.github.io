import type { ThemeId } from "./types";

/**
 * Modal entrance motion contract — painted onto `<html>` as CSS vars.
 * Keyframes stay in globals.css; themes must not override `.modal-launch`
 * via `[data-theme]` (that restarts animations on every theme switch).
 */
export type ModalLaunchMotion = {
  /** Registered `@keyframes` name. */
  name: string;
  timing: string;
};

export const DEFAULT_MODAL_LAUNCH: ModalLaunchMotion = {
  name: "modal-launch-in",
  timing: "cubic-bezier(0.22, 1, 0.36, 1)",
};

/** Themes that keep the default soft scale-in omit an entry. */
export const THEME_MODAL_LAUNCH: Partial<Record<ThemeId, ModalLaunchMotion>> = {
  "conspiracy-theorist": {
    name: "conspiracy-modal-flicker",
    timing: "steps(5, end)",
  },
  "galaxy-guy": {
    name: "galaxy-holo-project",
    timing: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
  atlantean: {
    name: "atlantean-course-project",
    timing: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
  "captain-guy": {
    name: "captain-guy-holy-project",
    timing: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
  nerd: {
    name: "nerd-boot-sequence",
    timing: "steps(8, end)",
  },
  "pop-art-guy": {
    name: "warhol-screen-print",
    timing: "steps(5, end)",
  },
  surrealist: {
    name: "surrealist-soft-clock",
    timing: "cubic-bezier(0.37, 0, 0.63, 1)",
  },
  "dog-days-guy": {
    name: "dog-days-guy-bounce-in",
    timing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  "retro-guy": {
    name: "retro-guy-pipe-warp",
    timing: "cubic-bezier(0.34, 1.4, 0.64, 1)",
  },
  "driver-guy": {
    name: "driver-guy-night-pass",
    timing: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
};

export function modalLaunchForTheme(themeId: ThemeId): ModalLaunchMotion {
  return THEME_MODAL_LAUNCH[themeId] ?? DEFAULT_MODAL_LAUNCH;
}

/** Paint launch keyframe + easing for `.modal-launch` (ThemeProvider apply path). */
export function applyModalLaunchMotion(themeId: ThemeId): void {
  if (typeof document === "undefined") return;
  const motion = modalLaunchForTheme(themeId);
  const root = document.documentElement;
  root.style.setProperty("--modal-launch-name", motion.name);
  root.style.setProperty("--modal-launch-timing", motion.timing);
}
