"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { renderSuggestedEdit } from "../suggestedEditParams";
import type { CritiqueReport } from "../types";
import {
  critiqueResultPhotoFrameClass,
  critiqueResultPhotoLabelClass,
} from "./photo-critique-layout";

type Props = {
  src: string;
  alt: string;
  report: CritiqueReport;
  imageAspect?: number;
};

/**
 * Original vs suggested visual-weight in one slide-reveal.
 * Keeps both badges; shortens the V1 results header stack vs two stacked frames.
 */
export function VisualWeightCompare({ src, alt, report, imageAspect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  const sliderId = useId();
  const [position, setPosition] = useState(50);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const aspect =
    imageAspect && imageAspect > 0
      ? imageAspect
      : report.width > 0 && report.height > 0
        ? report.width / report.height
        : undefined;

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setFailed(false);

    const img = new Image();
    img.crossOrigin = "anonymous";

    const draw = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas || !img.naturalWidth) return;
      const ok = renderSuggestedEdit(canvas, img, img.naturalWidth, img.naturalHeight, report);
      if (cancelled) return;
      setReady(ok);
      setFailed(!ok);
    };

    img.onload = draw;
    img.onerror = () => {
      if (!cancelled) setFailed(true);
    };
    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src, report]);

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
      className={`${critiqueResultPhotoFrameClass} w-full touch-none select-none`}
      style={aspect ? { aspectRatio: aspect } : { minHeight: "7rem" }}
      onPointerDown={(event) => {
        dragging.current = true;
        containerRef.current?.setPointerCapture(event.pointerId);
        setPositionFromClientX(event.clientX);
      }}
    >
      {/* Suggested (after) — full plate underneath */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Suggested visual weight for ${alt}`}
          className={`max-h-full max-w-full ${ready ? "opacity-100" : "opacity-0"}`}
        />
        {!ready && !failed ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent-400/30 border-t-cyan-300" />
          </div>
        ) : null}
        {failed ? (
          <p className="absolute inset-0 flex items-center justify-center px-3 text-center text-[11px] text-surface-500">
            Could not render suggested edit.
          </p>
        ) : null}
      </div>

      {/* Original (before) — clipped from the right as the handle moves */}
      <div className="absolute inset-0 bg-black" style={{ clipPath: `inset(0 ${clipRight}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- blob/local URLs */}
        <img
          src={src}
          alt={`Original ${alt}`}
          className="h-full w-full object-contain"
          draggable={false}
        />
      </div>

      <span className={`${critiqueResultPhotoLabelClass} text-surface-300`}>Original</span>
      <span
        className={`${critiqueResultPhotoLabelClass} left-auto right-2 text-accent-200`}
      >
        Suggested visual weight
      </span>

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
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-white sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 8l-4 4 4 4M16 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <label htmlFor={sliderId} className="sr-only">
        Compare original and suggested visual weight
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
