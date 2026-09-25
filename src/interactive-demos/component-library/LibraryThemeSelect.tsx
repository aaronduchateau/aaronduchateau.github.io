"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useActivity } from "@/activity/ActivityProvider";
import { requestEasterEggBoard } from "@/activity/milestoneCelebration";
import { isThemeUnlocked } from "@/activity/milestonePrizes";
import { MenuLockChoiceButton } from "@/components/MenuLockChoiceButton";
import { ThemeLockedModal } from "@/components/ThemeLockedModal";
import { Button } from "@/components/ui";
import { useApplyTheme } from "@/hooks/useApplyTheme";
import { playBoundNavClick } from "@/theme/sounds";
import { THEME_IDS, THEME_LABELS, type ThemeId } from "@/theme/types";

/** Catalog theme menu — same lock rows as Options, stays in the demo when applying. */
export function LibraryThemeSelect() {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [lockedPrompt, setLockedPrompt] = useState(false);
  const { themeId, applyTheme } = useApplyTheme();
  const { unlockedMilestoneIds } = useActivity();

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open || lockedPrompt) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closeMenu();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, lockedPrompt, closeMenu]);

  const pickTheme = (id: ThemeId) => {
    playBoundNavClick();
    if (!isThemeUnlocked(id, unlockedMilestoneIds)) {
      closeMenu();
      setLockedPrompt(true);
      return;
    }
    applyTheme(id, { closeModal: false, scrollToTop: false });
    closeMenu();
  };

  return (
    <div ref={rootRef} className="relative">
      <Button
        role="nav"
        size="sm"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Theme, currently ${THEME_LABELS[themeId]}`}
        className="gap-1.5"
        onClick={() => {
          playBoundNavClick();
          setOpen((current) => !current);
        }}
      >
        Theme
        <DropdownChevron open={open} />
      </Button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Themes"
          className="options-menu-panel absolute right-0 top-[calc(100%+0.4rem)] z-[60] max-h-[min(70dvh,28rem)] min-w-[14rem] overflow-y-auto overscroll-contain border border-white/10 bg-surface-950/95 p-2 shadow-xl shadow-black/40"
        >
          {THEME_IDS.map((id) => (
            <MenuLockChoiceButton
              key={id}
              label={THEME_LABELS[id]}
              selected={themeId === id}
              locked={!isThemeUnlocked(id, unlockedMilestoneIds)}
              onClick={() => pickTheme(id)}
            />
          ))}
        </div>
      ) : null}

      <ThemeLockedModal
        open={lockedPrompt}
        onCancel={() => setLockedPrompt(false)}
        onContinue={() => {
          setLockedPrompt(false);
          requestEasterEggBoard();
        }}
      />
    </div>
  );
}

function DropdownChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className={`h-3.5 w-3.5 shrink-0 opacity-80 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}
