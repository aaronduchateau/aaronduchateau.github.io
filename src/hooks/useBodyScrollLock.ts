"use client";

import { useEffect } from "react";

const LOCK_COUNT_KEY = "__portfolioModalLockCount";

/** Fired on window when the last open modal closes (lock count returns to 0). */
export const MODAL_CLOSED_EVENT = "portfolio:modal-closed";

/**
 * Fired when the first modal layer opens (lock count 0 → 1).
 * ThemeProvider temporarily holds theme music (preference unchanged) until
 * `MODAL_CLOSED_EVENT` when `pauseThemeMusic` is true for that layer.
 */
export const MODAL_OPENED_EVENT = "portfolio:modal-opened";

declare global {
  interface Window {
    [LOCK_COUNT_KEY]?: number;
  }
}

export type BodyScrollLockOptions = {
  /**
   * When true (default), opening this lock layer fires `MODAL_OPENED_EVENT`
   * so theme music can pause (and resume on close). Intro / Theme Locked pass
   * false so music can keep playing.
   */
  pauseThemeMusic?: boolean;
};

export function getPortfolioModalLockCount(): number {
  if (typeof window === "undefined") return 0;
  return window[LOCK_COUNT_KEY] ?? 0;
}

export function isPortfolioModalOpen(): boolean {
  return getPortfolioModalLockCount() > 0;
}

export function useBodyScrollLock(locked: boolean, options?: BodyScrollLockOptions) {
  const pauseThemeMusic = options?.pauseThemeMusic !== false;

  useEffect(() => {
    if (!locked || typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    const current = window[LOCK_COUNT_KEY] ?? 0;
    window[LOCK_COUNT_KEY] = current + 1;

    if (current === 0) {
      document.body.style.overflow = "hidden";
      if (pauseThemeMusic) {
        window.dispatchEvent(new Event(MODAL_OPENED_EVENT));
      }
    }

    return () => {
      const next = Math.max((window[LOCK_COUNT_KEY] ?? 1) - 1, 0);
      window[LOCK_COUNT_KEY] = next;
      if (next === 0) {
        document.body.style.overflow = "";
        window.dispatchEvent(new Event(MODAL_CLOSED_EVENT));
      }
    };
  }, [locked, pauseThemeMusic]);
}
