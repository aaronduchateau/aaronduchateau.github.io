"use client";

import { useEffect, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useModalLaunchClass } from "@/hooks/useModalLaunchClass";
import { playBoundNavClick } from "@/theme/sounds";

export type ModalFrameChrome = "confirm" | "board" | "list" | "note";

const OVERLAY: Record<ModalFrameChrome, string> = {
  confirm:
    "theme-modal-frame theme-modal-frame--confirm fixed inset-0 z-[130] flex items-center justify-center bg-surface-950/75 p-4 backdrop-blur-sm",
  board:
    "theme-modal-frame theme-modal-frame--board fixed inset-0 z-[130] flex items-center justify-center bg-surface-950/75 p-3 backdrop-blur-sm sm:p-6",
  list:
    "theme-modal-frame theme-modal-frame--list fixed inset-0 z-[120] flex items-center justify-center bg-surface-950/80 p-3 backdrop-blur-sm sm:p-6",
  note:
    "theme-modal-frame theme-modal-frame--note fixed inset-0 z-[130] flex items-center justify-center bg-surface-950/75 p-4 backdrop-blur-sm",
};

const PANEL: Record<ModalFrameChrome, string> = {
  confirm:
    "theme-modal-panel theme-glass relative w-full max-w-md border p-5 shadow-2xl shadow-black/50 sm:p-6",
  board:
    "theme-modal-panel theme-glass relative flex h-[min(90dvh,900px)] max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden border shadow-2xl shadow-black/50",
  list:
    "theme-modal-panel theme-glass flex h-[min(88dvh,820px)] max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden border shadow-2xl shadow-black/50",
  note:
    "theme-modal-panel theme-glass relative max-h-[min(86dvh,40rem)] w-full max-w-lg overflow-y-auto overscroll-contain border p-5 shadow-2xl shadow-black/50 sm:p-6",
};

export type ModalFrameProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  chrome?: ModalFrameChrome;
  labelledBy?: string;
  describedBy?: string;
  role?: "dialog" | "alertdialog";
  dialogRef?: RefObject<HTMLDivElement | null>;
  className?: string;
};

/**
 * Shared glass overlay + panel. Parent still owns `useModalAccessibility`.
 * Does not wrap MediaModal / InteractiveModal.
 */
export function ModalFrame({
  open,
  onClose,
  children,
  chrome = "confirm",
  labelledBy,
  describedBy,
  role = "dialog",
  dialogRef,
  className,
}: ModalFrameProps) {
  const [mounted, setMounted] = useState(false);
  const { className: launchClass, onAnimationEnd } = useModalLaunchClass({
    openKey: open,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className={OVERLAY[chrome]}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          playBoundNavClick();
          onClose();
        }
      }}
    >
      <div
        ref={(node) => {
          if (!dialogRef) return;
          (dialogRef as { current: HTMLDivElement | null }).current = node;
        }}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={`${launchClass} ${PANEL[chrome]} ${className ?? ""}`.trim()}
        onAnimationEnd={onAnimationEnd}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
