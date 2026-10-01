"use client";

import { playBoundNavClick } from "@/theme/sounds";

type Props = {
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  /** Accessible name — defaults to “Close”. */
  ariaLabel?: string;
  className?: string;
};

/** Icon-only modal close — SVG cross stays centered in the circular border. */
export function ModalCloseButton({
  onClick,
  size = "md",
  ariaLabel = "Close",
  className,
}: Props) {
  const isSm = size === "sm";
  const isLg = size === "lg";
  const shell = isLg
    ? "relative inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 p-0 leading-none text-surface-300 hover:border-accent-500/40 hover:text-white"
    : isSm
      ? "relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 p-0 leading-none text-surface-400 hover:border-accent-500/40 hover:text-accent-200"
      : "relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 p-0 leading-none text-surface-300 hover:border-accent-500/40 hover:text-white";

  return (
    <button
      type="button"
      onClick={() => {
        playBoundNavClick();
        onClick();
      }}
      aria-label={ariaLabel}
      className={`${shell}${className ? ` ${className}` : ""}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
          isLg ? "h-7 w-7" : isSm ? "h-3.5 w-3.5" : "h-4 w-4"
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M7 7l10 10M17 7 7 17" />
      </svg>
    </button>
  );
}
