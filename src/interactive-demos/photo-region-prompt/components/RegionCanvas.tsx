"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { critiqueResultPhotoFrameClass } from "@/interactive-demos/photo-critique/components/photo-critique-layout";
import {
  clientToNormalized,
  computeContainRect,
  nearPoint,
  type ContainRect,
} from "../polygon";
import type { RegionPoint } from "../types";

type Props = {
  src: string;
  alt: string;
  points: RegionPoint[];
  complete: boolean;
  onAddPoint: (point: RegionPoint) => void;
  onComplete: () => void;
};

export function RegionCanvas({ src, alt, points, complete, onAddPoint, onComplete }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [layout, setLayout] = useState<ContainRect | null>(null);

  const updateLayout = useCallback(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img || !img.naturalWidth) {
      setLayout(null);
      return;
    }
    setLayout(
      computeContainRect(wrap.clientWidth, wrap.clientHeight, img.naturalWidth, img.naturalHeight),
    );
  }, []);

  useEffect(() => {
    updateLayout();
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => updateLayout());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [updateLayout, src]);

  const handlePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const wrap = wrapRef.current;
    if (!wrap || !layout) return;
    const next = clientToNormalized(event.clientX, event.clientY, wrap.getBoundingClientRect(), layout);
    if (!next) return;
    event.preventDefault();
    if (!complete && points.length >= 3 && nearPoint(next, points[0])) {
      onComplete();
      return;
    }
    if (complete) return;
    onAddPoint(next);
  };

  const polyline = points
    .map((p) => `${(p.x * 100).toFixed(3)},${(p.y * 100).toFixed(3)}`)
    .join(" ");

  return (
    <div
      ref={wrapRef}
      className={`${critiqueResultPhotoFrameClass} h-full min-h-0 flex-1 cursor-crosshair touch-none`}
      onPointerDown={handlePointer}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- blob/local URLs */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        onLoad={updateLayout}
        className="pointer-events-none h-full w-full object-contain select-none"
      />
      {layout ? (
        <svg
          className="pointer-events-none absolute"
          style={{
            left: layout.left,
            top: layout.top,
            width: layout.width,
            height: layout.height,
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {complete && points.length >= 3 ? (
            <polygon
              points={polyline}
              fill="rgba(34, 211, 238, 0.28)"
              stroke="rgb(125, 211, 252)"
              strokeWidth="0.6"
            />
          ) : points.length >= 2 ? (
            <polyline
              points={polyline}
              fill="none"
              stroke="rgb(125, 211, 252)"
              strokeWidth="0.6"
            />
          ) : null}
          {points.map((p, i) => (
            <circle
              key={`${p.x}-${p.y}-${i}`}
              cx={p.x * 100}
              cy={p.y * 100}
              r={i === 0 ? 1.4 : 1.1}
              fill={i === 0 ? "rgb(250, 204, 21)" : "rgb(255,255,255)"}
              stroke="rgb(8,8,12)"
              strokeWidth="0.35"
            />
          ))}
        </svg>
      ) : null}
    </div>
  );
}
