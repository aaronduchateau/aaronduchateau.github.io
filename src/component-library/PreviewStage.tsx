"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { PreviewSize } from "@/components/ui";

type DeviceSpec = {
  width: number;
  height: number;
  bezelX: number;
  bezelY: number;
};

const FULLSCREEN_WIDTH = 1152;
const FULLSCREEN_BEZEL = 0;

const DEVICES: Record<Exclude<PreviewSize, "fullscreen" | "natural">, DeviceSpec> = {
  tablet: { width: 768, height: 1024, bezelX: 18, bezelY: 22 },
  phone: { width: 390, height: 844, bezelX: 12, bezelY: 18 },
};

const NATURAL_MAX_WIDTH = 400;
const NATURAL_MIN_HEIGHT = 400;
const NATURAL_MAX_HEIGHT = 800;

const MIN_SCALED_WIDTH = 120;
const MIN_SCALED_HEIGHT = 160;

function fullscreenSpec(stage: { width: number; height: number }): DeviceSpec {
  const stageAspect =
    stage.width > 0 && stage.height > 0 ? stage.height / stage.width : 9 / 16;
  return {
    width: FULLSCREEN_WIDTH,
    height: Math.max(1, Math.round(FULLSCREEN_WIDTH * stageAspect)),
    bezelX: FULLSCREEN_BEZEL,
    bezelY: FULLSCREEN_BEZEL,
  };
}

function specFor(size: PreviewSize, stage: { width: number; height: number }): DeviceSpec | null {
  if (size === "natural") return null;
  return size === "fullscreen" ? fullscreenSpec(stage) : DEVICES[size];
}

function outerSize(spec: DeviceSpec) {
  return {
    width: spec.width + spec.bezelX * 2,
    height: spec.height + spec.bezelY * 2,
  };
}

function scaleToFit(spec: DeviceSpec, stage: { width: number; height: number }) {
  if (stage.width <= 0 || stage.height <= 0) return 0;
  const outer = outerSize(spec);
  return Math.min(stage.width / outer.width, stage.height / outer.height);
}

function deviceFits(spec: DeviceSpec, stage: { width: number; height: number }) {
  const scale = scaleToFit(spec, stage);
  return scale * spec.width >= MIN_SCALED_WIDTH && scale * spec.height >= MIN_SCALED_HEIGHT;
}

function DeviceFrame({
  kind,
  spec,
  scale,
  children,
}: {
  kind: PreviewSize;
  spec: DeviceSpec;
  scale: number;
  children: ReactNode;
}) {
  const outer = outerSize(spec);
  const phone = kind === "phone";
  const tablet = kind === "tablet";

  return (
    <div className="shrink-0" style={{ width: outer.width * scale, height: outer.height * scale }}>
      <div
        className={`relative bg-surface-900/90 shadow-[0_0_0_1px_rgb(255_255_255/0.08)] ${
          phone ? "rounded-[1.65rem]" : tablet ? "rounded-[1.15rem]" : "rounded-xl"
        }`}
        style={{
          width: outer.width,
          height: outer.height,
          padding: `${spec.bezelY}px ${spec.bezelX}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {phone || tablet ? (
          <span
            className={`absolute left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/80 ${
              phone ? "top-2.5 h-1.5 w-12" : "top-2 h-1.5 w-1.5"
            }`}
            aria-hidden
          />
        ) : null}
        <div
          className={`relative overflow-hidden bg-surface-950 ${
            phone ? "rounded-[1.05rem]" : tablet ? "rounded-[0.55rem]" : "rounded-lg"
          }`}
          style={{ width: spec.width, height: spec.height }}
        >
          {children}
        </div>
        {phone ? (
          <span
            className="absolute bottom-2 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-white/20"
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
}

type Props = {
  size: PreviewSize;
  onFullscreen: () => void;
  children: ReactNode;
  className?: string;
  onAvailabilityChange?: (available: Record<PreviewSize, boolean>) => void;
};

/** Workbench device chrome around the catalog iframe — not a catalog story. */
export function PreviewStage({
  size,
  onFullscreen,
  children,
  className,
  onAvailabilityChange,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sync = () => {
      setStage({ width: canvas.clientWidth, height: canvas.clientHeight });
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const spec = specFor(size, stage);
  const canFullscreen = deviceFits(fullscreenSpec(stage), stage);
  const canTablet = deviceFits(DEVICES.tablet, stage);
  const canPhone = deviceFits(DEVICES.phone, stage);

  useEffect(() => {
    onAvailabilityChange?.({
      natural: true,
      fullscreen: canFullscreen,
      tablet: canTablet,
      phone: canPhone,
    });
  }, [canFullscreen, canPhone, canTablet, onAvailabilityChange]);

  useEffect(() => {
    if (stage.width <= 0) return;
    if (size === "tablet" && !canTablet && canFullscreen) onFullscreen();
    if (size === "phone" && !canPhone && canFullscreen) onFullscreen();
  }, [canFullscreen, canPhone, canTablet, onFullscreen, size, stage.width]);

  const scale = spec ? scaleToFit(spec, stage) : 0;

  return (
    <div className={`flex min-h-0 min-w-0 flex-col ${className ?? ""}`.trim()}>
      <div ref={canvasRef} className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden">
        {size === "natural" ? (
          <div
            className="h-full w-full overflow-hidden rounded-lg border border-white/10 bg-surface-950 [&>*]:h-full [&>*]:w-full max-md:!min-h-0 max-md:!max-h-full"
            style={{
              maxWidth: NATURAL_MAX_WIDTH,
              minHeight: NATURAL_MIN_HEIGHT,
              maxHeight: NATURAL_MAX_HEIGHT,
            }}
          >
            {children}
          </div>
        ) : !spec || scale <= 0 ? (
          <div className="h-full w-full overflow-hidden rounded-xl border border-white/10 bg-surface-950 [&>*]:h-full [&>*]:w-full">
            {children}
          </div>
        ) : (
          <DeviceFrame kind={size} spec={spec} scale={scale}>
            <div className="h-full w-full [&>*]:h-full [&>*]:w-full">{children}</div>
          </DeviceFrame>
        )}
      </div>
    </div>
  );
}
