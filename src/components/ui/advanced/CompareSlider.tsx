"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";

export type CompareSliderProps = {
  /** Layer revealed on the left (clipped as the handle moves right). */
  before: ReactNode;
  /** Full plate underneath (right side of the reveal). */
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatio?: number;
  /** Frame shell classes — border, radius, bg. */
  className?: string;
  initialPosition?: number;
  /** Accessible name for the range input. */
  sliderLabel?: string;
};

const DEFAULT_FRAME =
  "relative w-full overflow-hidden border border-white/10 bg-black theme-radius-media";

const LABEL_CLASS =
  "pointer-events-none absolute left-2 top-2 z-[1] rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide";

/**
 * Before/after slide-reveal with drag handle + keyboard range input.
 * Same chrome Photo Critique uses for visual-weight compare.
 */
export function CompareSlider({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  aspectRatio,
  className,
  initialPosition = 50,
  sliderLabel = "Compare before and after",
}: CompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const sliderId = useId();
  const [position, setPosition] = useState(() =>
    Math.min(100, Math.max(0, initialPosition)),
  );

  const setPositionFromClientX = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!dragging.current) return;
      setPositionFromClientX(event.clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [setPositionFromClientX]);

  const clipRight = 100 - position;

  return (
    <div
      ref={containerRef}
      className={`${className ?? DEFAULT_FRAME} w-full touch-none select-none`}
      style={aspectRatio && aspectRatio > 0 ? { aspectRatio } : { minHeight: "7rem" }}
      onPointerDown={(event) => {
        dragging.current = true;
        containerRef.current?.setPointerCapture(event.pointerId);
        setPositionFromClientX(event.clientX);
      }}
    >
      <div className="absolute inset-0">{after}</div>

      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${clipRight}% 0 0)` }}>
        {before}
      </div>

      <span className={`${LABEL_CLASS} text-surface-300`}>{beforeLabel}</span>
      <span className={`${LABEL_CLASS} left-auto right-2 text-accent-200`}>{afterLabel}</span>

      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.45)]"
        style={{ left: `${position}%` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${position}%` }}
        aria-hidden
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/90 bg-surface-950/75 shadow-lg backdrop-blur-sm sm:h-10 sm:w-10">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 text-white sm:h-5 sm:w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M8 8l-4 4 4 4M16 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <label htmlFor={sliderId} className="sr-only">
        {sliderLabel}
      </label>
      <input
        id={sliderId}
        type="range"
        min={0}
        max={100}
        value={Math.round(position)}
        onChange={(event) => setPosition(Number(event.target.value))}
        onPointerDown={(event) => event.stopPropagation()}
        className="absolute inset-x-2 bottom-2 z-30 h-6 w-[calc(100%-1rem)] cursor-ew-resize opacity-0"
      />
    </div>
  );
}
