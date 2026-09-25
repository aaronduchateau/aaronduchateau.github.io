"use client";

import { useEffect, useRef } from "react";

type DividerWaveProps = {
  /** When true, the seam dances (analyser or a synthetic envelope). */
  active: boolean;
  className?: string;
  /**
   * Live time-domain tap. Return null to keep a flat seam (e.g. theme music
   * enabled but paused). Omit entirely for a synthetic dance (speech — the
   * Web Speech API has no AnalyserNode).
   */
  getAnalyser?: () => AnalyserNode | null;
  /** Soft theme wash under the seam (testimonial footer). */
  fillBelow?: boolean;
  /** `top` pins the seam to the start of a tall footer; default is vertically centered. */
  seam?: "middle" | "top";
};

const FILL_FADE_MS = 480;
const FILL_TOP_ALPHA = 0.16;
const FILL_BOTTOM_ALPHA = 0.05;

function themeAccentRgb(): string {
  if (typeof document === "undefined") return "34 211 238";
  const value = getComputedStyle(document.documentElement).getPropertyValue("--accent-400").trim();
  return value || "34 211 238";
}

function seamYFor(height: number, seam: "middle" | "top") {
  if (seam === "top") return Math.min(8, Math.max(4, height * 0.08));
  return height / 2;
}

function ampFor(height: number, seam: "middle" | "top") {
  if (seam === "top") return Math.min(7, Math.max(5, height * 0.08));
  return Math.max(6, height * 0.46);
}

function fillBelowSeam(
  ctx2d: CanvasRenderingContext2D,
  width: number,
  height: number,
  rgb: string,
  fillAlpha: number,
  seamY: number,
  samples: ArrayLike<number> | null,
  amp: number,
) {
  if (fillAlpha < 0.01) return;

  ctx2d.beginPath();
  if (samples && samples.length > 0) {
    const last = Math.max(1, width - 1);
    for (let x = 0; x <= last; x++) {
      const i = Math.min(samples.length - 1, Math.floor((x / last) * samples.length));
      const y = seamY - (samples[i] ?? 0) * amp;
      if (x === 0) ctx2d.moveTo(x, y);
      else ctx2d.lineTo(x, y);
    }
    ctx2d.lineTo(width, height);
    ctx2d.lineTo(0, height);
  } else {
    ctx2d.moveTo(0, seamY);
    ctx2d.lineTo(width, seamY);
    ctx2d.lineTo(width, height);
    ctx2d.lineTo(0, height);
  }
  ctx2d.closePath();
  const gradient = ctx2d.createLinearGradient(0, seamY, 0, height);
  gradient.addColorStop(0, `rgb(${rgb} / ${FILL_TOP_ALPHA * fillAlpha})`);
  gradient.addColorStop(1, `rgb(${rgb} / ${FILL_BOTTOM_ALPHA * fillAlpha})`);
  ctx2d.fillStyle = gradient;
  ctx2d.fill();
}

function paintPolyline(
  ctx2d: CanvasRenderingContext2D,
  width: number,
  height: number,
  rgb: string,
  samples: ArrayLike<number>,
  reduceMotion: boolean,
  seamY: number,
  amp: number,
  fillAlpha: number,
) {
  fillBelowSeam(ctx2d, width, height, rgb, fillAlpha, seamY, samples, amp);

  ctx2d.strokeStyle = `rgb(${rgb} / 0.14)`;
  ctx2d.lineWidth = 1;
  ctx2d.beginPath();
  ctx2d.moveTo(0, seamY);
  ctx2d.lineTo(width, seamY);
  ctx2d.stroke();

  if (reduceMotion) {
    let peak = 0;
    for (let i = 0; i < samples.length; i++) {
      const v = Math.abs(samples[i] ?? 0);
      if (v > peak) peak = v;
    }
    ctx2d.strokeStyle = `rgb(${rgb} / 0.75)`;
    ctx2d.lineWidth = 1;
    ctx2d.beginPath();
    ctx2d.moveTo(0, seamY - peak * amp);
    ctx2d.lineTo(width, seamY - peak * amp);
    ctx2d.stroke();
    return;
  }

  ctx2d.strokeStyle = `rgb(${rgb} / 0.88)`;
  ctx2d.lineWidth = 1;
  ctx2d.lineJoin = "round";
  ctx2d.lineCap = "round";
  ctx2d.beginPath();
  const last = Math.max(1, width - 1);
  for (let x = 0; x <= last; x++) {
    const i = Math.min(samples.length - 1, Math.floor((x / last) * samples.length));
    const y = seamY - (samples[i] ?? 0) * amp;
    if (x === 0) ctx2d.moveTo(x, y);
    else ctx2d.lineTo(x, y);
  }
  ctx2d.stroke();
}

function fillSynthetic(out: Float32Array, t: number) {
  for (let i = 0; i < out.length; i++) {
    const x = i / Math.max(1, out.length - 1);
    out[i] =
      Math.sin(x * 18.4 + t * 4.2) * 0.42 +
      Math.sin(x * 41.0 + t * 7.1) * 0.22 +
      Math.sin(x * 7.6 + t * 2.4) * 0.16;
  }
}

/**
 * Seam that reads as a divider at rest, then an oscilloscope while active.
 * Shared by intro theme music and testimonial speech.
 */
export function DividerWave({
  active,
  className = "",
  getAnalyser,
  fillBelow = false,
  seam = "middle",
}: DividerWaveProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotionRef = useRef(false);
  const getAnalyserRef = useRef(getAnalyser);
  getAnalyserRef.current = getAnalyser;
  const activeRef = useRef(active);
  activeRef.current = active;
  const fillBelowRef = useRef(fillBelow);
  fillBelowRef.current = fillBelow;
  const seamRef = useRef(seam);
  seamRef.current = seam;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotionRef.current = mq.matches;
    const onChange = () => {
      reduceMotionRef.current = mq.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let timeDomain: Float32Array<ArrayBuffer> | null = null;
    let synthetic: Float32Array<ArrayBuffer> | null = null;
    let fillAlpha = 0;
    let lastTs = performance.now();

    const resize = () => {
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = Math.max(1, Math.floor(wrap.clientWidth));
      const nextH = Math.max(1, Math.floor(wrap.clientHeight));
      if (nextW === width && nextH === height && nextDpr === dpr) return;
      width = nextW;
      height = nextH;
      dpr = nextDpr;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const paintFlat = (rgb: string, seamY: number, wash: number) => {
      fillBelowSeam(ctx2d, width, height, rgb, wash, seamY, null, 0);
      ctx2d.strokeStyle = `rgb(${rgb} / 0.22)`;
      ctx2d.lineWidth = 1;
      ctx2d.beginPath();
      ctx2d.moveTo(0, seamY);
      ctx2d.lineTo(width, seamY);
      ctx2d.stroke();
    };

    const paintFrame = (ts: number) => {
      resize();
      ctx2d.clearRect(0, 0, width, height);
      if (width < 8 || height < 2) return;

      const dt = Math.min(64, Math.max(0, ts - lastTs));
      lastTs = ts;
      const isActive = activeRef.current;
      const wantFill = fillBelowRef.current && isActive;
      const target = wantFill ? 1 : 0;
      const step = dt / FILL_FADE_MS;
      if (fillAlpha < target) fillAlpha = Math.min(target, fillAlpha + step);
      else if (fillAlpha > target) fillAlpha = Math.max(target, fillAlpha - step);

      const rgb = themeAccentRgb();
      const seamY = seamYFor(height, seamRef.current);
      const amp = ampFor(height, seamRef.current);

      if (!isActive) {
        paintFlat(rgb, seamY, fillBelowRef.current ? fillAlpha : 0);
        return;
      }

      const analyser = getAnalyserRef.current?.() ?? null;
      if (analyser) {
        if (!timeDomain || timeDomain.length !== analyser.fftSize) {
          timeDomain = new Float32Array(new ArrayBuffer(analyser.fftSize * 4));
        }
        analyser.getFloatTimeDomainData(timeDomain);
        paintPolyline(
          ctx2d,
          width,
          height,
          rgb,
          timeDomain,
          reduceMotionRef.current,
          seamY,
          amp,
          fillBelowRef.current ? fillAlpha : 0,
        );
        return;
      }

      if (getAnalyserRef.current) {
        paintFlat(rgb, seamY, fillBelowRef.current ? fillAlpha : 0);
        return;
      }

      const n = Math.max(64, width);
      if (!synthetic || synthetic.length !== n) {
        synthetic = new Float32Array(new ArrayBuffer(n * 4));
      }
      fillSynthetic(synthetic, performance.now() / 1000);
      paintPolyline(
        ctx2d,
        width,
        height,
        rgb,
        synthetic,
        reduceMotionRef.current,
        seamY,
        amp,
        fillBelowRef.current ? fillAlpha : 0,
      );
    };

    const tick = (ts: number) => {
      paintFrame(ts);
      raf = window.requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(() => paintFrame(performance.now()));
    ro.observe(wrap);
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`pointer-events-none overflow-hidden ${className}`.trim()}
      aria-hidden
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
