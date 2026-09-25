"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { isComponentPreviewPath } from "@/lib/routes";

const SIGNATURE = "Aaron DuChateau";
/** Floor for how long the boot plate stays up (ms). */
export const SIGNATURE_BOOT_MIN_MS = 1500;
/** Target duration of the cursive draw (ms). */
const SIGNATURE_DRAW_MS = 1600;
const BOOT_BG = "#0c0c0c";
const INK = "#e8e4dc";

/** Matches sync boot script + CSS veil in `layout.tsx` / `globals.css`. */
export const SIGNATURE_BOOTING_CLASS = "signature-booting";
/**
 * Set when theme tokens are applied and the plate may lift — reveals
 * `.theme-boot-shell` under the still-opaque splash so the fade shows the
 * correct theme (not a cyberpunk flash).
 */
export const THEME_BOOT_READY_CLASS = "theme-boot-ready";

type Props = {
  /** Theme tokens applied and engine hydrate finished. */
  themeReady: boolean;
  onDismissed?: () => void;
};

/**
 * Full-viewport boot plate: muted black + canvas cursive signature.
 * Stays until the theme underneath is ready and the signature has finished
 * (at least {@link SIGNATURE_BOOT_MIN_MS}).
 *
 * Full reload: `html.signature-booting` (sync script) hides `.theme-boot-shell`
 * until {@link THEME_BOOT_READY_CLASS}, so SSR default theme never paints.
 * SPA theme switches never set those classes — transitions stay instant.
 *
 * Never mounts on `/component-preview/` (catalog iframes).
 */
export function SignatureBootSplash({ themeReady, onDismissed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** pending → decide client-side; skip for iframes; boot for real pages. */
  const [mode, setMode] = useState<"pending" | "boot" | "skip">("pending");
  const [signatureDone, setSignatureDone] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);
  const dismissedRef = useRef(false);

  useLayoutEffect(() => {
    const preview =
      isComponentPreviewPath() ||
      document.documentElement.dataset.componentPreview === "1";
    if (preview) {
      document.documentElement.classList.remove(
        SIGNATURE_BOOTING_CLASS,
        THEME_BOOT_READY_CLASS,
      );
      setMode("skip");
      return;
    }
    document.documentElement.classList.add(SIGNATURE_BOOTING_CLASS);
    setMode("boot");
  }, []);

  useEffect(() => {
    if (mode !== "boot") return;
    const minTimer = window.setTimeout(() => setMinElapsed(true), SIGNATURE_BOOT_MIN_MS);
    return () => {
      window.clearTimeout(minTimer);
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== "boot" || gone) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let cancelled = false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let finished = false;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w, h };
    };

    const fontFamily =
      getComputedStyle(document.documentElement).getPropertyValue("--font-cursive").trim() ||
      "cursive";

    const paint = (progress: number, w: number, h: number) => {
      ctx.fillStyle = BOOT_BG;
      ctx.fillRect(0, 0, w, h);

      const size = Math.max(28, Math.min(72, w * 0.07));
      ctx.font = `400 ${size}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = INK;

      const textW = ctx.measureText(SIGNATURE).width;
      const x = w / 2;
      const y = h / 2;

      if (progress >= 1) {
        ctx.globalAlpha = 1;
        ctx.fillText(SIGNATURE, x, y);
        return;
      }

      ctx.save();
      const reveal = textW * progress;
      const left = x - textW / 2;
      ctx.beginPath();
      ctx.rect(left - 4, y - size, reveal + 8, size * 2.2);
      ctx.clip();
      ctx.globalAlpha = 0.92;
      ctx.fillText(SIGNATURE, x, y);
      ctx.restore();

      if (progress > 0.02 && progress < 0.98) {
        const tipX = left + reveal;
        const tip = ctx.createRadialGradient(tipX, y, 0, tipX, y, size * 0.45);
        tip.addColorStop(0, "rgb(232 228 220 / 0.35)");
        tip.addColorStop(1, "rgb(232 228 220 / 0)");
        ctx.fillStyle = tip;
        ctx.beginPath();
        ctx.arc(tipX, y - size * 0.08, size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const run = async () => {
      try {
        await document.fonts.load(`400 72px ${fontFamily}`);
        await document.fonts.ready;
      } catch {
        /* system fallback */
      }
      if (cancelled) return;

      const { w, h } = fit();

      if (reduceMotion) {
        paint(1, w, h);
        finished = true;
        setSignatureDone(true);
        return;
      }

      const t0 = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const { w: cw, h: ch } = fit();
        const t = Math.min(1, (now - t0) / SIGNATURE_DRAW_MS);
        const eased = 1 - (1 - t) ** 3;
        paint(eased, cw, ch);
        if (t < 1) {
          raf = window.requestAnimationFrame(tick);
        } else {
          finished = true;
          setSignatureDone(true);
        }
      };
      raf = window.requestAnimationFrame(tick);
    };

    void run();

    const onResize = () => {
      if (cancelled) return;
      const { w, h } = fit();
      if (finished) paint(1, w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      // Do not strip signature-booting here — that class also veils .theme-boot-shell
      // until THEME_BOOT_READY_CLASS. Clearing it mid-draw would flash the shell.
    };
  }, [mode, gone]);

  useEffect(() => {
    if (mode !== "boot" || gone || dismissedRef.current) return;
    if (!(themeReady && signatureDone && minElapsed)) return;
    dismissedRef.current = true;
    // Reveal hydrated theme under the plate, then fade the plate away.
    document.documentElement.classList.add(THEME_BOOT_READY_CLASS);
    setFading(true);
    const t = window.setTimeout(() => {
      document.documentElement.classList.remove(
        SIGNATURE_BOOTING_CLASS,
        THEME_BOOT_READY_CLASS,
      );
      setGone(true);
      onDismissed?.();
    }, 420);
    return () => window.clearTimeout(t);
  }, [mode, themeReady, signatureDone, minElapsed, gone, onDismissed]);

  if (mode !== "boot" || gone) return null;

  return (
    <div
      className={`signature-boot-splash${fading ? " signature-boot-splash--out" : ""}`}
      role="presentation"
      aria-hidden
    >
      <canvas ref={canvasRef} className="signature-boot-splash__canvas" />
    </div>
  );
}
