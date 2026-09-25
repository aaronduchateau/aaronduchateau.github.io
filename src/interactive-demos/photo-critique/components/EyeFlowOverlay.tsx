"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CritiqueHeatmap, CritiquePoint } from "../types";
import { critiqueResultPhotoFrameClass } from "./photo-critique-layout";

type ImageRect = { left: number; top: number; width: number; height: number };

type Props = {
  src: string;
  alt: string;
  eyeFlowPath: CritiquePoint[];
  heatmap?: CritiqueHeatmap;
  imageAspect?: number;
  showEyeFlow: boolean;
  showThirds: boolean;
  showHeatmap: boolean;
  onToggleEyeFlow: () => void;
  onToggleThirds: () => void;
  onToggleHeatmap: () => void;
};

const FLOW_MARKER_ID = "photo-critique-flow-arrow";

/** Map a normalized attention value (0–1) to an RGBA heat colour. */
function heatColor(v: number): [number, number, number, number] {
  const stops: Array<[number, [number, number, number, number]]> = [
    [0.0, [12, 24, 120, 0]],
    [0.25, [20, 110, 220, 90]],
    [0.5, [30, 200, 160, 140]],
    [0.72, [240, 220, 60, 185]],
    [1.0, [240, 50, 30, 225]],
  ];
  const t = Math.min(1, Math.max(0, v));
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, c0] = stops[i - 1];
      const [t1, c1] = stops[i];
      const f = (t - t0) / (t1 - t0 || 1);
      return [
        Math.round(c0[0] + (c1[0] - c0[0]) * f),
        Math.round(c0[1] + (c1[1] - c0[1]) * f),
        Math.round(c0[2] + (c1[2] - c0[2]) * f),
        Math.round(c0[3] + (c1[3] - c0[3]) * f),
      ];
    }
  }
  return stops[stops.length - 1][1];
}

function computeContainRect(
  containerW: number,
  containerH: number,
  imageW: number,
  imageH: number,
): ImageRect | null {
  if (containerW <= 0 || containerH <= 0 || imageW <= 0 || imageH <= 0) return null;
  const scale = Math.min(containerW / imageW, containerH / imageH);
  const width = imageW * scale;
  const height = imageH * scale;
  return {
    left: (containerW - width) / 2,
    top: (containerH - height) / 2,
    width,
    height,
  };
}

/** Smooth the fixation sequence into a flowing Catmull-Rom spline (can swirl/zig-zag). */
function pathToSvgD(points: CritiquePoint[]) {
  if (points.length < 2) return "";
  const p = points.map((pt) => ({ x: pt.x * 100, y: pt.y * 100 }));
  if (p.length === 2) {
    return `M ${p[0].x.toFixed(2)} ${p[0].y.toFixed(2)} L ${p[1].x.toFixed(2)} ${p[1].y.toFixed(2)}`;
  }
  let d = `M ${p[0].x.toFixed(2)} ${p[0].y.toFixed(2)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(
      2,
    )} ${p2.y.toFixed(2)}`;
  }
  return d;
}

export function EyeFlowOverlay({
  src,
  alt,
  eyeFlowPath,
  heatmap,
  imageAspect,
  showEyeFlow,
  showThirds,
  showHeatmap,
  onToggleEyeFlow,
  onToggleThirds,
  onToggleHeatmap,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heatCanvasRef = useRef<HTMLCanvasElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [imageRect, setImageRect] = useState<ImageRect | null>(null);

  const updateImageRect = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    let iw = naturalSize?.w ?? 0;
    let ih = naturalSize?.h ?? 0;
    if (!iw && imageAspect) {
      iw = imageAspect;
      ih = 1;
    }
    if (!iw) return;

    const next = computeContainRect(container.clientWidth, container.clientHeight, iw, ih);
    setImageRect(next);
  }, [naturalSize, imageAspect]);

  useLayoutEffect(() => {
    updateImageRect();
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(updateImageRect);
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateImageRect]);

  useEffect(() => {
    const canvas = heatCanvasRef.current;
    if (!canvas || !heatmap || !imageRect) return;

    const { width: gw, height: gh, values } = heatmap;
    if (gw <= 0 || gh <= 0) return;

    // Paint the coarse grid into an offscreen buffer, then let the browser
    // bilinearly upscale it onto the on-screen canvas for a smooth heat field.
    const off = document.createElement("canvas");
    off.width = gw;
    off.height = gh;
    const offCtx = off.getContext("2d");
    if (!offCtx) return;
    const img = offCtx.createImageData(gw, gh);
    for (let i = 0; i < values.length; i++) {
      const [r, g, b, a] = heatColor(values[i]);
      const o = i * 4;
      img.data[o] = r;
      img.data[o + 1] = g;
      img.data[o + 2] = b;
      img.data[o + 3] = a;
    }
    offCtx.putImageData(img, 0, 0);

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = Math.max(1, Math.round(imageRect.width * dpr));
    canvas.height = Math.max(1, Math.round(imageRect.height * dpr));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
  }, [heatmap, imageRect, showHeatmap]);

  const flowD = pathToSvgD(eyeFlowPath);
  const showFlow = showEyeFlow && flowD.length > 0;

  return (
    <div className="flex min-h-0 flex-col">
      <div className="mb-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onToggleEyeFlow}
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition ${
            showEyeFlow
              ? "border-accent-500/50 bg-accent-950/40 text-accent-200"
              : "border-white/15 text-surface-400 hover:text-surface-200"
          }`}
        >
          Eye flow
        </button>
        <button
          type="button"
          onClick={onToggleThirds}
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition ${
            showThirds
              ? "border-accent-500/50 bg-accent-950/40 text-accent-200"
              : "border-white/15 text-surface-400 hover:text-surface-200"
          }`}
        >
          Thirds grid
        </button>
        <button
          type="button"
          onClick={onToggleHeatmap}
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition ${
            showHeatmap
              ? "border-amber-400/50 bg-amber-950/40 text-amber-200"
              : "border-white/15 text-surface-400 hover:text-surface-200"
          }`}
        >
          Heat map
        </button>
      </div>

      <div
        ref={containerRef}
        className={`${critiqueResultPhotoFrameClass} mx-auto w-full max-h-[min(42dvh,360px)]`}
        style={{
          // Match the photo — avoids theme-agnostic 4:3 letterboxing that reads as a thick crop.
          aspectRatio:
            imageAspect && imageAspect > 0
              ? imageAspect
              : naturalSize
                ? naturalSize.w / naturalSize.h
                : 4 / 3,
        }}
      >
          {/* eslint-disable-next-line @next/next/no-img-element -- blob URLs from user uploads */}
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 h-full w-full object-contain"
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
              }
            }}
          />

          {imageRect && showHeatmap ? (
            <canvas
              ref={heatCanvasRef}
              className="pointer-events-none absolute"
              style={{
                left: imageRect.left,
                top: imageRect.top,
                width: imageRect.width,
                height: imageRect.height,
                mixBlendMode: "screen",
              }}
              aria-hidden
            />
          ) : null}

          {imageRect ? (
            <svg
              className="pointer-events-none absolute overflow-visible"
              style={{
                left: imageRect.left,
                top: imageRect.top,
                width: imageRect.width,
                height: imageRect.height,
              }}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              {showThirds ? (
                <g stroke="rgba(255,255,255,0.45)" strokeWidth="0.35" vectorEffect="non-scaling-stroke">
                  <line x1="33.333" y1="0" x2="33.333" y2="100" />
                  <line x1="66.666" y1="0" x2="66.666" y2="100" />
                  <line x1="0" y1="33.333" x2="100" y2="33.333" />
                  <line x1="0" y1="66.666" x2="100" y2="66.666" />
                </g>
              ) : null}

              {showFlow ? (
                <>
                  <defs>
                    <marker
                      id={FLOW_MARKER_ID}
                      markerWidth="6"
                      markerHeight="6"
                      refX="5"
                      refY="3"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path d="M0,0 L6,3 L0,6 Z" fill="#22d3ee" />
                    </marker>
                  </defs>
                  <path
                    d={flowD}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    markerEnd={`url(#${FLOW_MARKER_ID})`}
                  />
                  {eyeFlowPath.map((p, i) => {
                    const isFirst = i === 0;
                    return (
                      <g key={`${p.x.toFixed(3)}-${p.y.toFixed(3)}-${i}`}>
                        <circle
                          cx={p.x * 100}
                          cy={p.y * 100}
                          r={isFirst ? 3 : 2.3}
                          fill={isFirst ? "#22d3ee" : "#0e7490"}
                          stroke="#a5f3fc"
                          strokeWidth="0.4"
                          vectorEffect="non-scaling-stroke"
                          opacity="0.95"
                        />
                        <text
                          x={p.x * 100}
                          y={p.y * 100 + 0.9}
                          textAnchor="middle"
                          fontSize="2.6"
                          fontWeight="700"
                          fill="#ecfeff"
                        >
                          {i + 1}
                        </text>
                      </g>
                    );
                  })}
                </>
              ) : null}
            </svg>
          ) : null}
      </div>
    </div>
  );
}
