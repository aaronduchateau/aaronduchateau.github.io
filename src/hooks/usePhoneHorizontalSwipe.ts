"use client";

import { useEffect, useRef, type TouchEvent as ReactTouchEvent } from "react";

/** Match Tailwind `sm` — side paddles are often `hidden sm:flex`. */
export const PHONE_SWIPE_MAX_WIDTH_QUERY = "(max-width: 639px)";

const SWIPE_MIN_DX = 56;
const SWIPE_MAX_DY_RATIO = 0.75;

/** Default: ignore before/after sliders and custom seek chrome. */
export const PHONE_SWIPE_IGNORE_SELECTOR =
  "[data-compare-slider], [data-no-swipe-nav]";

type Options = {
  /** When false, handlers are no-ops (still safe to attach). */
  enabled?: boolean;
  /** CSS selector — touches starting inside a match are ignored. */
  ignoreSelector?: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

/**
 * Phone-only horizontal swipe → prev/next. Desktop/tablet unchanged.
 * Uses a matchMedia ref so handlers stay stable without re-binding each render.
 */
export function usePhoneHorizontalSwipe({
  enabled = true,
  ignoreSelector = PHONE_SWIPE_IGNORE_SELECTOR,
  onSwipeLeft,
  onSwipeRight,
}: Options) {
  const phoneSwipeRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const enabledRef = useRef(enabled);
  const ignoreRef = useRef(ignoreSelector);
  const leftRef = useRef(onSwipeLeft);
  const rightRef = useRef(onSwipeRight);

  enabledRef.current = enabled;
  ignoreRef.current = ignoreSelector;
  leftRef.current = onSwipeLeft;
  rightRef.current = onSwipeRight;

  useEffect(() => {
    const mq = window.matchMedia(PHONE_SWIPE_MAX_WIDTH_QUERY);
    const sync = () => {
      phoneSwipeRef.current = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const onTouchStart = (event: ReactTouchEvent) => {
    if (!enabledRef.current || !phoneSwipeRef.current) return;
    const target = event.target;
    if (target instanceof Element && target.closest(ignoreRef.current)) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: ReactTouchEvent) => {
    if (!enabledRef.current || !phoneSwipeRef.current) return;
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_DX) return;
    if (Math.abs(dy) > Math.abs(dx) * SWIPE_MAX_DY_RATIO) return;

    if (dx < 0) leftRef.current();
    else rightRef.current();
  };

  return { onTouchStart, onTouchEnd };
}
