"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useModalAccessibility } from "@/hooks/useModalAccessibility";
import { useTheme } from "@/theme/ThemeProvider";

/** Old portfolio era start — ~20 years before this v2 site (Aug 2026). */
export const LEGACY_PORTFOLIO_START_LABEL = "August 2006";

type Props = {
  open: boolean;
  onClose: () => void;
};

function ensureLegacyPortfolioDefined(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (customElements.get("legacy-portfolio-archive")) return Promise.resolve();

  const existing = document.querySelector(
    'script[data-legacy-portfolio="true"]',
  ) as HTMLScriptElement | null;

  if (!existing) {
    const script = document.createElement("script");
    script.src = "/archive/v1/legacy-portfolio.js";
    script.async = true;
    script.dataset.legacyPortfolio = "true";
    document.head.appendChild(script);
  }

  return customElements.whenDefined("legacy-portfolio-archive").then(() => undefined);
}

/**
 * Theme-neutral modal hosting `<legacy-portfolio-archive>`.
 * Shell styles are hard-coded so portfolio themes cannot restyle the archive.
 */
export function LegacyPortfolioModal({ open, onClose }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const { playNavClick } = useTheme();
  const [wcReady, setWcReady] = useState(false);

  useModalAccessibility(open, dialogRef, onClose);

  useEffect(() => {
    if (!open) {
      setWcReady(false);
      return;
    }
    let cancelled = false;
    void ensureLegacyPortfolioDefined().then(() => {
      if (!cancelled) setWcReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Mount WC after define — closed shadow DOM + local snapshot (no iframe / live site).
  useEffect(() => {
    const mount = mountRef.current;
    if (!open || !wcReady || !mount) return;

    mount.replaceChildren();
    const el = document.createElement("legacy-portfolio-archive");
    // Bundled under public/archive/v1 — survives after the old domain is gone.
    // Full classic document root (jQuery/Bootstrap run inside the nested page).
    el.setAttribute("src", "/archive/v1/index.html");
    el.setAttribute(
      "style",
      "display:block;width:100%;height:100%;min-height:0;",
    );
    mount.appendChild(el);

    return () => {
      mount.replaceChildren();
    };
  }, [open, wcReady]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-stretch justify-center p-0 sm:items-stretch sm:p-3 lg:p-4"
      style={{ background: "rgba(0,0,0,0.72)" }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex h-dvh w-full max-w-none flex-col overflow-hidden sm:h-[min(96dvh,100%)] sm:max-w-[min(100vw-1.5rem,1600px)] sm:rounded-lg"
        style={{
          background: "#141414",
          border: "1px solid #333",
          borderRadius: "0.5rem",
          boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
          color: "#e8e8e8",
          fontFamily: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <header
          className="flex shrink-0 items-start justify-between gap-3 px-5 py-3 sm:px-6 sm:py-4"
          style={{ borderBottom: "1px solid #333", background: "#1a1a1a" }}
        >
          <div className="min-w-0">
            <p
              className="m-0 text-[10px] uppercase tracking-[0.22em]"
              style={{ color: "#9a9a9a", fontFamily: "ui-monospace, Menlo, monospace" }}
            >
              Site archive · V1 · since {LEGACY_PORTFOLIO_START_LABEL}
            </p>
            <h2
              id={titleId}
              className="m-0 mt-1 text-lg sm:text-xl"
              style={{
                color: "#f2f2f2",
                fontWeight: 600,
                fontFamily: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              }}
            >
              aaronduchateau.com (classic)
            </h2>
            <p className="m-0 mt-1 text-xs" style={{ color: "#8a8a8a" }}>
              Nested archive root hosted by a web component — local assets + jQuery, not the live domain.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => {
              playNavClick();
              onClose();
            }}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{
              border: "1px solid #555",
              color: "#ccc",
              background: "transparent",
            }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M7 7l10 10M17 7 7 17" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <div className="min-h-0 flex-1" style={{ background: "#f4f4f4" }}>
          <div ref={mountRef} className="h-full w-full" />
        </div>
      </div>
    </div>,
    document.body,
  );
}
