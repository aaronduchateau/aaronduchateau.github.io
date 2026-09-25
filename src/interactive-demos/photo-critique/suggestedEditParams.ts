import type { CritiquePoint, CritiqueReport } from "./types";

export type SuggestedEditParams = {
  brightness: number;
  contrast: number;
  shadowLift: number;
  highlightCompress: number;
  bgBlurPx: number;
  bgDarken: number;
  vignetteStrength: number;
  claritySeparation: boolean;
  subjectCenter: CritiquePoint;
  crop: { x: number; y: number; w: number; h: number } | null;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function computeCompositionCrop(report: CritiqueReport) {
  if (report.compositionScore >= 62) return null;

  const { x: cx, y: cy } = report.attentionCenter;
  const anchors = [1 / 3, 2 / 3];
  let bestTx = 0.5;
  let bestTy = 0.5;
  let bestDist = Infinity;

  for (const tx of anchors) {
    for (const ty of anchors) {
      const d = Math.hypot(cx - tx, cy - ty);
      if (d < bestDist) {
        bestDist = d;
        bestTx = tx;
        bestTy = ty;
      }
    }
  }

  const scale = clamp(0.92 - (62 - report.compositionScore) * 0.002, 0.84, 0.92);
  const targetX = cx + (bestTx - cx) * 0.45;
  const targetY = cy + (bestTy - cy) * 0.45;
  const w = scale;
  const h = scale;
  const x = clamp(targetX - w / 2, 0, 1 - w);
  const y = clamp(targetY - h / 2, 0, 1 - h);

  return { x, y, w, h };
}

/** Map critique scores + histogram into concrete canvas adjustment knobs. */
export function deriveSuggestedEditParams(report: CritiqueReport): SuggestedEditParams {
  const [shadow, dark, , light, highlight] = report.histogram;
  const darkShare = shadow + dark;
  const brightShare = light + highlight;

  let brightness = 0;
  let contrast = 1;
  let shadowLift = 0;
  let highlightCompress = 0;
  let bgBlurPx = 0;
  let bgDarken = 0;
  let vignetteStrength = 0;

  if (shadow > 0.35) {
    brightness += 0.12;
    shadowLift += 0.42;
  } else if (darkShare > 0.6) {
    brightness += 0.18;
    shadowLift += 0.32;
  }

  if (highlight > 0.25) {
    brightness -= 0.08;
    highlightCompress += 0.38;
  } else if (highlight > 0.12) {
    highlightCompress += 0.15;
  }

  if (report.lightingScore < 55) {
    contrast += 0.12;
  }

  if (brightShare < 0.12 && darkShare < 0.2 && report.histogram[2] > 0.55) {
    contrast += 0.14;
  }

  if (report.lightingScore > 72) {
    contrast = Math.max(contrast, 1.04);
  }

  const claritySeparation = report.clarityScore < 62;
  if (claritySeparation) {
    bgBlurPx = clamp(10 + (62 - report.clarityScore) * 0.15, 8, 18);
    bgDarken = clamp(0.22 + (62 - report.clarityScore) * 0.004, 0.18, 0.42);
  }

  if (report.eyeFlowPath.length > 5 && report.clarityScore < 70) {
    vignetteStrength = clamp(0.18 + report.eyeFlowPath.length * 0.02, 0.15, 0.38);
  }

  return {
    brightness: clamp(brightness, -0.2, 0.25),
    contrast: clamp(contrast, 0.9, 1.28),
    shadowLift: clamp(shadowLift, 0, 0.55),
    highlightCompress: clamp(highlightCompress, 0, 0.55),
    bgBlurPx,
    bgDarken,
    vignetteStrength,
    claritySeparation,
    subjectCenter: report.attentionCenter,
    crop: computeCompositionCrop(report),
  };
}

function adjustRgb(
  r: number,
  g: number,
  b: number,
  params: SuggestedEditParams,
  vignette: number,
): [number, number, number] {
  let lr = r / 255;
  let lg = g / 255;
  let lb = b / 255;

  lr += params.brightness;
  lg += params.brightness;
  lb += params.brightness;

  lr = (lr - 0.5) * params.contrast + 0.5;
  lg = (lg - 0.5) * params.contrast + 0.5;
  lb = (lb - 0.5) * params.contrast + 0.5;

  const lum = 0.299 * lr + 0.587 * lg + 0.114 * lb;

  if (params.shadowLift > 0 && lum < 0.5) {
    const lift = params.shadowLift * (0.5 - lum) * 0.85;
    lr += lift;
    lg += lift;
    lb += lift;
  }

  if (params.highlightCompress > 0 && lum > 0.72) {
    const compress = params.highlightCompress * (lum - 0.72) * 0.9;
    lr -= compress;
    lg -= compress;
    lb -= compress;
  }

  if (vignette > 0) {
    lr *= 1 - vignette;
    lg *= 1 - vignette;
    lb *= 1 - vignette;
  }

  return [
    clamp(Math.round(lr * 255), 0, 255),
    clamp(Math.round(lg * 255), 0, 255),
    clamp(Math.round(lb * 255), 0, 255),
  ];
}

function sampleHeatmap(
  heatmap: CritiqueReport["heatmap"],
  nx: number,
  ny: number,
): number {
  const { width: gw, height: gh, values } = heatmap;
  if (gw <= 0 || gh <= 0) return 0;

  const fx = clamp(nx, 0, 1) * (gw - 1);
  const fy = clamp(ny, 0, 1) * (gh - 1);
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const x1 = Math.min(gw - 1, x0 + 1);
  const y1 = Math.min(gh - 1, y0 + 1);
  const tx = fx - x0;
  const ty = fy - y0;

  const v00 = values[y0 * gw + x0];
  const v10 = values[y0 * gw + x1];
  const v01 = values[y1 * gw + x0];
  const v11 = values[y1 * gw + x1];

  return v00 * (1 - tx) * (1 - ty) + v10 * tx * (1 - ty) + v01 * (1 - tx) * ty + v11 * tx * ty;
}

function radialSubjectWeight(
  nx: number,
  ny: number,
  center: CritiquePoint,
  heat: number,
): number {
  const dist = Math.hypot(nx - center.x, ny - center.y);
  const radial = clamp(1 - dist / 0.42, 0, 1);
  return clamp(heat * 0.65 + radial * 0.35, 0, 1);
}

/**
 * Draw the source image onto `canvas` with critique-driven tone + background
 * separation adjustments. Returns false if rendering could not complete.
 */
export function renderSuggestedEdit(
  canvas: HTMLCanvasElement,
  source: CanvasImageSource,
  sw: number,
  sh: number,
  report: CritiqueReport,
): boolean {
  const params = deriveSuggestedEditParams(report);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx || sw <= 0 || sh <= 0) return false;

  const crop = params.crop;
  const srcX = crop ? crop.x * sw : 0;
  const srcY = crop ? crop.y * sh : 0;
  const srcW = crop ? crop.w * sw : sw;
  const srcH = crop ? crop.h * sh : sh;

  const maxEdge = 640;
  const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
  const dw = Math.max(1, Math.round(srcW * scale));
  const dh = Math.max(1, Math.round(srcH * scale));

  canvas.width = dw;
  canvas.height = dh;

  ctx.drawImage(source, srcX, srcY, srcW, srcH, 0, 0, dw, dh);

  const imageData = ctx.getImageData(0, 0, dw, dh);
  let blurredData: ImageData | null = null;

  if (params.claritySeparation && params.bgBlurPx > 0) {
    const blurCanvas = document.createElement("canvas");
    blurCanvas.width = dw;
    blurCanvas.height = dh;
    const blurCtx = blurCanvas.getContext("2d");
    if (blurCtx) {
      blurCtx.filter = `blur(${params.bgBlurPx}px)`;
      blurCtx.drawImage(canvas, 0, 0);
      blurCtx.filter = "none";
      blurredData = blurCtx.getImageData(0, 0, dw, dh);
    }
  }

  const out = imageData.data;
  const blurred = blurredData?.data;

  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const i = (y * dw + x) * 4;
      const nx = x / dw;
      const ny = y / dh;
      const heat = sampleHeatmap(report.heatmap, nx, ny);
      const subjectW = radialSubjectWeight(nx, ny, params.subjectCenter, heat);
      const bgW = 1 - clamp((subjectW - 0.28) / 0.55, 0, 1);

      const dist = Math.hypot(nx - 0.5, ny - 0.5);
      const vignette = params.vignetteStrength * clamp((dist - 0.35) / 0.45, 0, 1);

      let r = out[i];
      let g = out[i + 1];
      let b = out[i + 2];

      if (blurred && bgW > 0.02) {
        const mix = bgW * 0.82;
        r = r * (1 - mix) + blurred[i] * mix;
        g = g * (1 - mix) + blurred[i + 1] * mix;
        b = b * (1 - mix) + blurred[i + 2] * mix;

        if (params.bgDarken > 0) {
          const darken = 1 - params.bgDarken * bgW;
          r *= darken;
          g *= darken;
          b *= darken;
        }
      }

      [out[i], out[i + 1], out[i + 2]] = adjustRgb(r, g, b, params, vignette);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return true;
}
