"use client";

import { useEffect, useRef, useState } from "react";
import {
  critiqueResultPhotoFrameClass,
  critiqueResultPhotoLabelClass,
} from "@/interactive-demos/photo-critique/components/photo-critique-layout";
import { drawRegionPreview, type PreviewKind } from "../regionPreview";
import type { RegionReport } from "../types";

type Props = {
  report: RegionReport;
  kind: "original" | PreviewKind;
  label: string;
};

export function RegionPreviewFrame({ report, kind, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(kind === "original");
  const [failed, setFailed] = useState(false);
  const aspect = report.width > 0 && report.height > 0 ? report.width / report.height : undefined;
  const cropAspect =
    report.bbox.w > 0 && report.bbox.h > 0 ? report.bbox.w / report.bbox.h : aspect;

  useEffect(() => {
    if (kind === "original") return;
    let cancelled = false;
    setReady(false);
    setFailed(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    void drawRegionPreview(
      canvas,
      report.originalUrl,
      report.points,
      report.bbox,
      kind,
      report.operation,
      report.instruction,
    )
      .then((ok) => {
        if (cancelled) return;
        setReady(ok);
        setFailed(!ok);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [kind, report]);

  return (
    <div
      className={`${critiqueResultPhotoFrameClass} min-h-[10rem]`}
      style={
        kind === "original"
          ? aspect
            ? { aspectRatio: String(aspect) }
            : undefined
          : cropAspect
            ? { aspectRatio: String(cropAspect) }
            : undefined
      }
    >
      <span className={`${critiqueResultPhotoLabelClass} text-white`}>{label}</span>
      {kind === "original" ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob/local URLs
        <img
          src={report.originalUrl}
          alt={report.fileName}
          className="h-full w-full object-contain"
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-black">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={label}
            className={`max-h-full max-w-full ${ready ? "opacity-100" : "opacity-0"}`}
          />
          {!ready && !failed ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent-400/30 border-t-cyan-300" />
            </div>
          ) : null}
          {failed ? (
            <p className="absolute inset-0 flex items-center justify-center px-3 text-center text-[11px] text-surface-500">
              Could not render this region.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
