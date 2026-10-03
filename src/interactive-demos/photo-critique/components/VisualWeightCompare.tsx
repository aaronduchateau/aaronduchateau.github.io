"use client";

import { useEffect, useRef, useState } from "react";
import { CompareSlider } from "@/components/ui";
import { renderSuggestedEdit } from "../suggestedEditParams";
import type { CritiqueReport } from "../types";
import { critiqueResultPhotoFrameClass } from "./photo-critique-layout";

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  return (
    <CompareSlider
      className={critiqueResultPhotoFrameClass}
      aspectRatio={aspect}
      beforeLabel="Original"
      afterLabel="Suggested visual weight"
      sliderLabel="Compare original and suggested visual weight"
      before={
        // eslint-disable-next-line @next/next/no-img-element -- blob/local URLs
        <img
          src={src}
          alt={`Original ${alt}`}
          className="h-full w-full object-contain"
          draggable={false}
        />
      }
      after={
        <div className="flex h-full w-full items-center justify-center bg-black">
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
      }
    />
  );
}
