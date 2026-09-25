"use client";

import { useEffect, useId, useRef } from "react";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import { Button, ModalFrame } from "@/components/ui";
import { useModalAccessibility } from "@/hooks/useModalAccessibility";
import { playBoundNavClick } from "@/theme/sounds";

/**
 * Confirm before sending a locked-theme click to the Aaron game.
 * Capture-phase Escape so a parent interactive modal does not close with this prompt.
 */
export function ThemeLockedModal({
  open,
  onCancel,
  onContinue,
}: {
  open: boolean;
  onCancel: () => void;
  onContinue: () => void;
}) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalAccessibility(open, dialogRef);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        playBoundNavClick();
        onCancel();
        return;
      }
      if (event.key !== "Tab") return;
      // Capture so a parent modal trap (intro / InteractiveModal) cannot steal Tab.
      event.stopImmediatePropagation();
      const root = dialogRef.current;
      if (!root) return;
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])",
        ),
      ).filter((el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true");
      if (focusable.length === 0) {
        event.preventDefault();
        root.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;
      if (event.shiftKey) {
        if (current === first || !root.contains(current)) {
          event.preventDefault();
          last.focus();
        }
      } else if (current === last || !root.contains(current)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, onCancel]);

  return (
    <ModalFrame
      open={open}
      onClose={onCancel}
      chrome="confirm"
      role="alertdialog"
      labelledBy={titleId}
      describedBy={descId}
      dialogRef={dialogRef}
    >
      <div className="absolute right-3 top-3">
        <ModalCloseButton onClick={onCancel} size="sm" />
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-300/80">Themes</p>
      <h2 id={titleId} className="modal-display-heading mt-2 pr-10 text-xl sm:text-2xl">
        <span className="modal-display-heading__text">Theme locked</span>
      </h2>
      <p id={descId} className="mt-3 text-sm leading-relaxed text-surface-300">
        Finish a quest on the Aaron game board to unlock this look.
      </p>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button
          role="ghost"
          size="sm"
          onClick={() => {
            playBoundNavClick();
            onCancel();
          }}
        >
          Cancel
        </Button>
        <Button
          role="primary"
          size="sm"
          onClick={() => {
            playBoundNavClick();
            onContinue();
          }}
        >
          Continue to the Aaron game
        </Button>
      </div>
    </ModalFrame>
  );
}
