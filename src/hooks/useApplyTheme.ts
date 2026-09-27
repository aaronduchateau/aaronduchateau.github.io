"use client";

import { useCallback } from "react";
import { requestInteractiveDemoClose } from "@/lib/interactiveDemoClose";
import { useTheme } from "@/theme/ThemeProvider";
import type { ThemeId } from "@/theme/types";

/** Wait so modal chrome can restyle under the new theme before close. */
export const THEME_APPLY_CLOSE_DELAY_MS = 420;

export type ApplyThemeOptions = {
  /**
   * Dispatch `interactive-demo:request-close` after apply.
   * Default true (theme playground / Options-style “leave and see it”).
   */
  closeModal?: boolean;
  /**
   * Smooth-scroll the window to the top after apply (and after close, when both).
   * Default true.
   */
  scrollToTop?: boolean;
  /** Record `theme.change` for Character Ninja / Your Event Log. Default true. */
  trackActivity?: boolean;
};

/**
 * Apply a site theme through ThemeProvider.
 * Close + scroll-home are the default after-effects; pass false to stay put
 * (component catalog preview).
 */
export function useApplyTheme() {
  const { themeId, setThemeId } = useTheme();

  const applyTheme = useCallback(
    (id: ThemeId, options?: ApplyThemeOptions) => {
      const closeModal = options?.closeModal !== false;
      const scrollHome = options?.scrollToTop !== false;
      const trackActivity = options?.trackActivity !== false;

      void setThemeId(id, { trackActivity });

      if (!closeModal && !scrollHome) return;

      const afterPaint = () => {
        if (closeModal) requestInteractiveDemoClose();
        if (scrollHome) {
          window.setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }, closeModal ? 80 : 0);
        }
      };

      if (closeModal) {
        window.setTimeout(afterPaint, THEME_APPLY_CLOSE_DELAY_MS);
      } else {
        afterPaint();
      }
    },
    [setThemeId],
  );

  return { themeId, applyTheme };
}
