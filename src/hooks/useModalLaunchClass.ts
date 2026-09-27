"use client";

import { useCallback, useLayoutEffect, useState, type AnimationEvent } from "react";

function readModalOpenDurationMs(): number {
  if (typeof document === "undefined") return 0;
  const root = document.documentElement;
  if (root.getAttribute("data-modal-open-instant") === "true") return 0;
  const raw = getComputedStyle(root).getPropertyValue("--modal-open-duration").trim();
  const match = /^(\d+(?:\.\d+)?)(ms|s)?$/i.exec(raw);
  if (!match) return 0;
  const n = Number(match[1]);
  if (!Number.isFinite(n)) return 0;
  return (match[2] || "ms").toLowerCase() === "s" ? n * 1000 : n;
}

type Options = {
  /**
   * Skip entrance (intro resume / instant open).
   * Same as historical `modal-launch--instant`.
   */
  instant?: boolean;
  /**
   * Identity of the **shell open session** only (e.g. `true`/`false`, or
   * `"open"` / `null`). Must NOT include in-modal content ids (letter, item,
   * demo) — next/prev inside an open modal must not re-run launch.
   */
  openKey?: string | number | boolean | null;
};

/**
 * One-shot modal entrance class.
 * Plays theme launch motion on each open; settles so later theme paints
 * (CSS var changes) cannot restart the animation.
 */
export function useModalLaunchClass(options?: Options) {
  const instant = Boolean(options?.instant);
  const openKey = options?.openKey ?? "open";
  const [settled, setSettled] = useState(instant);

  useLayoutEffect(() => {
    if (instant) {
      setSettled(true);
      return;
    }
    setSettled(false);
    const ms = readModalOpenDurationMs();
    if (ms <= 0) {
      setSettled(true);
      return;
    }
    const timer = window.setTimeout(() => setSettled(true), ms + 80);
    return () => window.clearTimeout(timer);
  }, [instant, openKey]);

  const onAnimationEnd = useCallback((event: AnimationEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    setSettled(true);
  }, []);

  const className = instant || settled ? "modal-launch modal-launch--settled" : "modal-launch";

  return { className, onAnimationEnd, settled };
}
