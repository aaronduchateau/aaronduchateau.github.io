"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  useBodyScrollLock,
  type BodyScrollLockOptions,
} from "@/hooks/useBodyScrollLock";
import { playBoundModalOpen, playBoundNavClick } from "@/theme/sounds";
import { useTheme } from "@/theme/ThemeProvider";

/** Main document landmark — set inert while a modal layer is open. */
export const APP_CONTENT_ID = "app-content";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true",
  );
}

export type ModalAccessibilityOptions = BodyScrollLockOptions & {
  /**
   * When omitted, ADA Guy (`ada-first`) auto-focuses the first control on open.
   * Other themes skip that so programmatic focus does not paint a focus ring.
   * Pass true/false to override (intro splash always false).
   */
  autoFocus?: boolean;
};

/**
 * Site-wide modal a11y:
 * - body scroll lock
 * - inert + aria-hidden on #app-content so background is not tabbable
 * - focus trap inside the dialog
 * - Escape calls onClose
 * - restores focus to the previously focused element
 * - initial autofocus only for ADA Guy unless overridden
 */
export function useModalAccessibility(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onClose?: () => void,
  options?: ModalAccessibilityOptions,
) {
  const { themeId } = useTheme();
  const autoFocus = options?.autoFocus ?? themeId === "ada-first";
  useBodyScrollLock(active, options);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Content-window open SFX whenever a modal layer becomes active.
  useEffect(() => {
    if (!active) return;
    playBoundModalOpen();
  }, [active]);

  useEffect(() => {
    if (!active || typeof document === "undefined") return;

    const content = document.getElementById(APP_CONTENT_ID);
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    content?.setAttribute("inert", "");
    content?.setAttribute("aria-hidden", "true");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        playBoundNavClick();
        onCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab") return;

      const root = containerRef.current;
      if (!root) return;

      const focusable = getFocusable(root);
      if (focusable.length === 0) {
        event.preventDefault();
        root.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;
      const outside = !(current instanceof Node) || !root.contains(current);

      // Pull focus back if it escaped (e.g. aria-hidden backdrop still in tab order).
      if (outside) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey) {
        if (current === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      content?.removeAttribute("inert");
      content?.removeAttribute("aria-hidden");
      previouslyFocused?.focus?.();
    };
  }, [active, containerRef]);

  // Separate from trap setup so toggling autoFocus (e.g. cycling into ADA on /intro)
  // does not tear down inert / restore focus early.
  useEffect(() => {
    if (!active || !autoFocus || typeof document === "undefined") return;

    const focusDialog = () => {
      const root = containerRef.current;
      if (!root) return;
      const focusable = getFocusable(root);
      (focusable[0] ?? root).focus();
    };

    const frame = window.requestAnimationFrame(focusDialog);
    return () => window.cancelAnimationFrame(frame);
  }, [active, autoFocus, containerRef]);
}
