"use client";

import { playBoundNavClick } from "@/theme/sounds";

export type ModalChromeIcon = "info" | "back" | "menu";

type Props = {
  icon: ModalChromeIcon;
  ariaLabel: string;
  onClick: () => void;
  className?: string;
};

function ChromeIcon({ icon }: { icon: ModalChromeIcon }) {
  if (icon === "menu") {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
      </svg>
    );
  }
  if (icon === "back") {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 11v6M12 8h.01" />
    </svg>
  );
}

/** Same chrome as the modal hamburger — swap the glyph for info / back. */
export function ModalChromeIconButton({ icon, ariaLabel, onClick, className }: Props) {
  return (
    <button
      type="button"
      className={`theme-modal-chrome-btn ${className ?? ""}`.trim()}
      aria-label={ariaLabel}
      onClick={() => {
        playBoundNavClick();
        onClick();
      }}
    >
      <ChromeIcon icon={icon} />
    </button>
  );
}
