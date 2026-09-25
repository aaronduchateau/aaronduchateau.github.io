"use client";

import { useEffect, useId, useRef, useState } from "react";

type Props = {
  /** When false, Sort is omitted (e.g. current path has fewer than 2 items). */
  canSort: boolean;
  sorting: boolean;
  forceBw: boolean;
  onToggleSort: () => void;
  onToggleForceBw: () => void;
};

/** Dev-only hamburger: Sort (when reorderable) + Force black & white. */
export function DevModalToolsMenu({
  canSort,
  sorting,
  forceBw,
  onToggleSort,
  onToggleForceBw,
}: Props) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className="theme-modal-chrome-btn"
        aria-label="Dev modal tools"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
        </svg>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-[calc(100%+0.35rem)] z-[80] w-max min-w-[14rem] max-w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-white/15 bg-surface-950/95 py-1 shadow-xl shadow-black/50"
        >
          {canSort ? (
            <button
              type="button"
              role="menuitemcheckbox"
              aria-checked={sorting}
              className="flex w-full items-center justify-between gap-4 whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-surface-200 hover:bg-white/5"
              onClick={() => {
                onToggleSort();
                setOpen(false);
              }}
            >
              Sort
              {sorting ? <span className="shrink-0 text-accent-400">On</span> : null}
            </button>
          ) : null}
          <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={forceBw}
            className="flex w-full items-center justify-between gap-4 whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-surface-200 hover:bg-white/5"
            onClick={() => {
              onToggleForceBw();
              setOpen(false);
            }}
          >
            Force black &amp; white
            {forceBw ? <span className="shrink-0 text-accent-400">On</span> : null}
          </button>
        </div>
      ) : null}
    </div>
  );
}
