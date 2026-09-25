import type { CritiqueHeatmap, CritiquePoint, CritiqueReport, CritiqueTier } from "./types";
import { scoreVisualClarity } from "./visualClarity";

const MAX_ANALYSIS_EDGE = 512;
const ATTENTION_BLUR_PASSES = 2;

function luminance(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function tierFromScore(score: number): CritiqueTier {
  if (score >= 75) return "strong";
  if (score >= 50) return "good";
  return "needsWork";
}

function thirdLabel(x: number, y: number): string {
  const col = x < 1 / 3 ? "left" : x < 2 / 3 ? "center" : "right";
  const row = y < 1 / 3 ? "upper" : y < 2 / 3 ? "middle" : "lower";
  return `${row} ${col}`;
}

function boxBlur(src: Float32Array, w: number, h: number): Float32Array {
  const out = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let count = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;

          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            sum += src[ny * w + nx];
            count++;
          }
        }
      }

      out[y * w + x] = sum / count;
    }
  }

  return out;
}

function sobelMagnitude(gray: Float32Array, w: number, h: number): Float32Array {
  const out = new Float32Array(w * h);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;

      const gx =
        -gray[idx - w - 1] +
        gray[idx - w + 1] +
        -2 * gray[idx - 1] +
        2 * gray[idx + 1] +
        -gray[idx + w - 1] +
        gray[idx + w + 1];

      const gy =
        -gray[idx - w - 1] -
        2 * gray[idx - w] -
        gray[idx - w + 1] +
        gray[idx + w - 1] +
        2 * gray[idx + w] +
        gray[idx + w + 1];

      out[idx] = Math.hypot(gx, gy);
    }
  }

  return out;
}

function normalizeField(field: Float32Array): Float32Array {
  let max = 0;

  for (let i = 0; i < field.length; i++) {
    max = Math.max(max, field[i]);
  }

  const out = new Float32Array(field.length);

  if (max <= 0) return out;

  for (let i = 0; i < field.length; i++) {
    out[i] = field[i] / max;
  }

  return out;
}

/**
 * Simulate a visual scan path with winner-take-all + inhibition of return:
 * jump to the most salient point, suppress a Gaussian neighbourhood around it,
 * then repeat. The ordered fixations form a comprehensive flow (zig-zags and
 * swirls across the frame), not a single linear direction.
 */
function buildScanpath(
  attention: Float32Array,
  w: number,
  h: number,
  maxFixations = 7,
): CritiquePoint[] {
  const field = Float32Array.from(attention);
  const fixations: CritiquePoint[] = [];

  const sigma = Math.max(6, Math.min(w, h) * 0.13);
  const radius = Math.ceil(sigma * 2.4);
  const minSalience = 0.16;

  for (let k = 0; k < maxFixations; k++) {
    let best = -Infinity;
    let bx = 0;
    let by = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const v = field[y * w + x];
        if (v > best) {
          best = v;
          bx = x;
          by = y;
        }
      }
    }

    if (best < minSalience) break;

    fixations.push({ x: bx / w, y: by / h });

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = bx + dx;
        const ny = by + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const g = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
        field[ny * w + nx] -= best * g;
      }
    }
  }

  return fixations;
}

/** Coarse, normalized attention grid for the heat-map overlay. */
function buildHeatmap(attention: Float32Array, w: number, h: number, gridW = 56): CritiqueHeatmap {
  const scale = gridW / w;
  const gridH = Math.max(1, Math.round(h * scale));
  const values = new Array<number>(gridW * gridH).fill(0);
  let max = 0;

  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const sx0 = Math.floor((gx / gridW) * w);
      const sx1 = Math.max(sx0 + 1, Math.floor(((gx + 1) / gridW) * w));
      const sy0 = Math.floor((gy / gridH) * h);
      const sy1 = Math.max(sy0 + 1, Math.floor(((gy + 1) / gridH) * h));

      let sum = 0;
      let n = 0;
      for (let sy = sy0; sy < sy1; sy++) {
        for (let sx = sx0; sx < sx1; sx++) {
          sum += attention[sy * w + sx];
          n++;
        }
      }
      const v = n ? sum / n : 0;
      values[gy * gridW + gx] = v;
      if (v > max) max = v;
    }
  }

  if (max > 0) {
    for (let i = 0; i < values.length; i++) values[i] /= max;
  }

  return { width: gridW, height: gridH, values };
}

function flowDirectionNotes(
  path: CritiquePoint[],
  shortFlow: boolean,
  backgroundBusyness: number,
  figureGroundSeparation: number,
  cohesiveSubjectMass: boolean,
): string[] {
  if (path.length < 2) {
    return ["Eye flow is concentrated in a single hotspot with little movement across the frame."];
  }

  const start = path[0];
  const entry = thirdLabel(start.x, start.y);
  const stops = path.length;

  // Describe the actual route as a sequence of thirds the eye visits.
  const route = path.map((p) => thirdLabel(p.x, p.y));
  const distinctRoute = route.filter((label, i) => i === 0 || label !== route[i - 1]);

  const notes = [
    `Likely entry point sits in the ${entry} third—where contrast and brightness pull attention first.`,
  ];

  if (distinctRoute.length >= 2) {
    notes.push(
      `The simulated scan path visits ${stops} salient stops, traveling ${distinctRoute
        .slice(0, 4)
        .join(" → ")}${distinctRoute.length > 4 ? " …" : ""}.`,
    );
  }

  if (shortFlow) {
    if (cohesiveSubjectMass) {
      notes.push("The eye settles quickly—one merged subject mass controls the frame, so flow stays calm and contained.");
    } else if (backgroundBusyness > 0.35 || figureGroundSeparation < 0.42) {
      notes.push(
        "Flow is short but the background is busy or weakly separated—attention stalls amid competing edges rather than resting cleanly.",
      );
    } else {
      notes.push("Flow is short with a clean focal region—the eye can settle on one dominant area.");
    }
  } else if (stops >= 5 && !cohesiveSubjectMass) {
    notes.push(
      "The eye is pulled across many competing hotspots—a long, scattered path that weakens the sense of a single subject.",
    );
  } else if (cohesiveSubjectMass) {
    notes.push("The path ranges across the frame but keeps returning to the dominant subject mass, so it still reads as organized.");
  } else {
    notes.push("A moderate flow path gives the eye room to travel across distinct tonal regions.");
  }

  return notes;
}

function scoreLighting(
  gray: Float32Array,
  w: number,
  h: number,
): { score: number; notes: string[]; histogram: number[] } {
  const n = w * h;

  let sum = 0;
  let sumSq = 0;
  let clipLow = 0;
  let clipHigh = 0;

  const buckets = [0, 0, 0, 0, 0];

  for (let i = 0; i < n; i++) {
    const v = gray[i];

    sum += v;
    sumSq += v * v;

    if (v < 12) clipLow++;
    if (v > 243) clipHigh++;

    const b = clamp(Math.floor(v / 51), 0, 4);
    buckets[b]++;
  }

  const mean = sum / n;
  const variance = sumSq / n - mean * mean;
  const std = Math.sqrt(Math.max(0, variance));

  const clipLowPct = (clipLow / n) * 100;
  const clipHighPct = (clipHigh / n) * 100;
  const histogram = buckets.map((b) => b / n);

  const quadrants = [0, 0, 0, 0];
  const quadrantCounts = [0, 0, 0, 0];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const q = (y < h / 2 ? 0 : 2) + (x < w / 2 ? 0 : 1);
      quadrants[q] += gray[y * w + x];
      quadrantCounts[q]++;
    }
  }

  const qMeans = quadrants.map((v, i) => v / quadrantCounts[i]);
  const maxQ = Math.max(...qMeans);
  const minQ = Math.min(...qMeans);
  const directionalSpread = maxQ - minQ;

  let score = 50;
  const notes: string[] = [];

  if (std >= 28 && std <= 65) {
    score += 22;
    notes.push("Contrast has healthy separation between lights and darks without looking completely flat.");
  } else if (std < 18) {
    score -= 18;
    notes.push("Tonal range is narrow—midtones dominate and lights/darks do not separate much.");
  } else if (std > 75) {
    score -= 8;
    notes.push("Very high contrast—dramatic, but easy to lose detail in shadows or highlights.");
  } else {
    score += 10;
    notes.push("Moderate contrast gives the frame some depth between bright and dark areas.");
  }

  if (clipLowPct > 8) {
    score -= 12;
    notes.push(`Shadows are heavily crushed (${clipLowPct.toFixed(0)}% near-black pixels).`);
  } else if (clipLowPct > 3) {
    score -= 4;
    notes.push("Some deep shadow clipping—adds mood but can swallow fine detail.");
  }

  if (clipHighPct > 8) {
    score -= 12;
    notes.push(`Highlights are blown (${clipHighPct.toFixed(0)}% near-white pixels).`);
  } else if (clipHighPct > 3) {
    score -= 4;
    notes.push("A few specular highlights clip to white—watch skin or sky edges.");
  }

  if (directionalSpread > 25) {
    score += 12;
    const brightest = qMeans.indexOf(maxQ);
    const dirs = ["top-left", "top-right", "bottom-left", "bottom-right"];

    notes.push(
      `Light reads directional—brightest quadrant is ${dirs[brightest]} (${directionalSpread.toFixed(0)} levels spread).`,
    );
  } else {
    score -= 6;
    notes.push("Lighting is fairly even across quadrants—soft and flat rather than directional.");
  }

  return {
    score: clamp(Math.round(score), 0, 100),
    notes: notes.slice(0, 3),
    histogram,
  };
}

function scoreComposition(
  weight: Float32Array,
  w: number,
  h: number,
  subjectCenter: CritiquePoint,
  cohesiveSubjectMass: boolean,
): { score: number; notes: string[]; balanceNotes: string[]; nearestThird: string } {
  let left = 0;
  let right = 0;
  let top = 0;
  let bottom = 0;

  let borderSum = 0;
  let interiorSum = 0;
  let borderCount = 0;
  let interiorCount = 0;

  const border = Math.max(2, Math.floor(Math.min(w, h) * 0.06));

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = weight[y * w + x];

      if (x < w / 2) left += v;
      else right += v;

      if (y < h / 2) top += v;
      else bottom += v;

      const onBorder = x < border || x >= w - border || y < border || y >= h - border;

      if (onBorder) {
        borderSum += v;
        borderCount++;
      } else {
        interiorSum += v;
        interiorCount++;
      }
    }
  }

  const lrTotal = left + right || 1;
  const tbTotal = top + bottom || 1;

  const leftPct = (left / lrTotal) * 100;
  const topPct = (top / tbTotal) * 100;

  const thirds = [
    { x: 1 / 3, y: 1 / 3 },
    { x: 2 / 3, y: 1 / 3 },
    { x: 1 / 3, y: 2 / 3 },
    { x: 2 / 3, y: 2 / 3 },
    { x: 1 / 3, y: 0.5 },
    { x: 2 / 3, y: 0.5 },
    { x: 0.5, y: 1 / 3 },
    { x: 0.5, y: 2 / 3 },
    { x: 0.5, y: 0.5 },
  ];

  let minDist = Infinity;
  let nearest = thirds[0];

  for (const t of thirds) {
    const d = Math.hypot(subjectCenter.x - t.x, subjectCenter.y - t.y);

    if (d < minDist) {
      minDist = d;
      nearest = t;
    }
  }

  const nearestThird = thirdLabel(nearest.x, nearest.y);

  let score = 50;
  const notes: string[] = [];
  const balanceNotes: string[] = [];

  const lrImbalance = Math.abs(leftPct - 50);
  const tbImbalance = Math.abs(topPct - 50);

  if (lrImbalance < 8) {
    score += 6;
    balanceNotes.push(`Left/right weight is balanced (${leftPct.toFixed(0)}% / ${(100 - leftPct).toFixed(0)}%).`);
  } else if (lrImbalance < 18) {
    score += 3;
    balanceNotes.push(
      `Slight ${leftPct > 50 ? "left" : "right"} weighting (${leftPct.toFixed(0)}% / ${(100 - leftPct).toFixed(0)}%).`,
    );
  } else {
    score -= 10;
    balanceNotes.push(
      `Strong ${leftPct > 50 ? "left" : "right"} lean (${leftPct.toFixed(0)}% / ${(100 - leftPct).toFixed(
        0,
      )}%)—portrait may feel off-balance.`,
    );
  }

  if (tbImbalance < 10) {
    score += 5;
    balanceNotes.push(`Top/bottom weight is fairly even (${topPct.toFixed(0)}% / ${(100 - topPct).toFixed(0)}%).`);
  } else {
    score += tbImbalance < 22 ? 2 : -8;
    balanceNotes.push(
      `Vertical weight favors the ${topPct > 50 ? "top" : "bottom"} (${topPct.toFixed(0)}% / ${(100 - topPct).toFixed(
        0,
      )}%).`,
    );
  }

  const cx = subjectCenter.x;
  const cy = subjectCenter.y;
  const deadCenter = Math.hypot(cx - 0.5, cy - 0.5);

  if (minDist < 0.12) {
    if (deadCenter < 0.1 && cohesiveSubjectMass) {
      score += 14;
      notes.push("Subject mass is centered, but the merged focal blob makes the portrait feel intentional and direct.");
    } else {
      score += 12;
      notes.push(`Visual weight sits near a rule-of-thirds anchor (${nearestThird})—classic compositional placement.`);
    }
  } else if (minDist < 0.2) {
    if (deadCenter < 0.12 && cohesiveSubjectMass) {
      score += 10;
      notes.push("Subject mass sits near the middle, but one cohesive focal region gives the frame clear intent.");
    } else {
      score += 6;
      notes.push(`Weight center is close to the ${nearestThird} third—reasonable compositional placement.`);
    }
  } else {
    if (deadCenter < 0.08) {
      if (cohesiveSubjectMass) {
        score += 8;
        notes.push("Subject mass clusters near center, but one cohesive blob makes the centered framing feel intentional.");
      } else {
        score -= 6;
        notes.push("Weight clusters near dead center—stable but less dynamic than a thirds placement.");
      }
    } else {
      notes.push(`Weight center falls in the ${thirdLabel(cx, cy)} region—away from center but not on a third.`);
    }
  }

  const borderAvg = borderCount ? borderSum / borderCount : 0;
  const interiorAvg = interiorCount ? interiorSum / interiorCount : 0;

  if (borderAvg > interiorAvg * 1.15) {
    score += 6;
    notes.push("Darker border strips suggest vignette or framing elements that contain the eye.");
  }

  return {
    score: clamp(Math.round(score), 0, 100),
    notes: notes.slice(0, 2),
    balanceNotes,
    nearestThird,
  };
}

export function analyzeImageData(data: ImageData): CritiqueReport {
  const w = data.width;
  const h = data.height;
  const n = w * h;

  const gray = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    const o = i * 4;
    gray[i] = luminance(data.data[o], data.data[o + 1], data.data[o + 2]);
  }

  const blurred = boxBlur(gray, w, h);

  const localContrast = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    localContrast[i] = Math.abs(gray[i] - blurred[i]);
  }

  const edges = sobelMagnitude(gray, w, h);

  let mean = 0;

  for (let i = 0; i < n; i++) {
    mean += gray[i];
  }

  mean /= n;

  const deviation = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    deviation[i] = Math.abs(gray[i] - mean);
  }

  let attentionField = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    attentionField[i] = 0.45 * localContrast[i] + 0.35 * edges[i] + 0.2 * deviation[i];
  }

  attentionField = Float32Array.from(normalizeField(attentionField));

  for (let p = 0; p < ATTENTION_BLUR_PASSES; p++) {
    attentionField = Float32Array.from(normalizeField(boxBlur(attentionField, w, h)));
  }

  const weight = attentionField;

  const lighting = scoreLighting(gray, w, h);

  const clarity = scoreVisualClarity(gray, attentionField, edges, w, h);
  const subjectCenter = clarity.subjectCenter;
  const cohesiveSubjectMass = clarity.metrics.subjectMassDominance >= 0.66;

  const heatmap = buildHeatmap(attentionField, w, h);

  // The scan path starts at the subject mass (where the eye lands first), then
  // follows the remaining salient regions via inhibition of return.
  const fixations = buildScanpath(attentionField, w, h, 7);
  let eyeFlowPath: CritiquePoint[] =
    fixations.length && Math.hypot(fixations[0].x - subjectCenter.x, fixations[0].y - subjectCenter.y) > 0.18
      ? [subjectCenter, ...fixations]
      : fixations;

  if (eyeFlowPath.length < 2) {
    eyeFlowPath = [
      subjectCenter,
      {
        x: clamp(subjectCenter.x, 0.05, 0.95),
        y: clamp(subjectCenter.y + 0.08, 0.05, 0.95),
      },
    ];
  }

  // Total traversal length across all fixations (how far the eye must travel).
  let flowSpan = 0;
  for (let i = 1; i < eyeFlowPath.length; i++) {
    flowSpan += Math.hypot(
      eyeFlowPath[i].x - eyeFlowPath[i - 1].x,
      eyeFlowPath[i].y - eyeFlowPath[i - 1].y,
    );
  }
  const shortFlow = flowSpan < 0.22 && eyeFlowPath.length <= 3;

  const compositionBase = scoreComposition(weight, w, h, subjectCenter, cohesiveSubjectMass);

  const compositionScore = clamp(
    Math.round(compositionBase.score - clarity.compositionPenalties),
    0,
    100,
  );

  const compositionNotes = [...compositionBase.notes];

  if (clarity.compositionPenalties > 12) {
    compositionNotes.push(
      "Balance and thirds placement look acceptable, but competing masses or shape collisions weaken the composition.",
    );
  }

  // Clarity (is there a clear, separated subject?) carries the most weight: a
  // technically well-lit photo of a cluttered, competing scene is still a weak
  // photo. When clarity is poor, cap how far strong lighting can lift the total
  // so a bad subject can't be rescued by exposure alone.
  const blended =
    lighting.score * 0.2 + compositionScore * 0.3 + clarity.score * 0.5;
  const clarityCeiling = clarity.score < 45 ? clarity.score + 18 : 100;
  const overallScore = clamp(Math.round(Math.min(blended, clarityCeiling)), 0, 100);

  return {
    width: w,
    height: h,
    lightingScore: lighting.score,
    compositionScore,
    clarityScore: clarity.score,
    overallScore,
    tier: tierFromScore(overallScore),
    lightingNotes: lighting.notes,
    compositionNotes: compositionNotes.slice(0, 3),
    clarityNotes: clarity.notes.slice(0, 4),
    eyeFlowNotes: flowDirectionNotes(
      eyeFlowPath,
      shortFlow,
      clarity.metrics.backgroundBusyness,
      clarity.metrics.figureGroundSeparation,
      cohesiveSubjectMass,
    ),
    balanceNotes: compositionBase.balanceNotes,
    eyeFlowPath,
    attentionCenter: subjectCenter,
    heatmap,
    histogram: lighting.histogram,
    nearestThird: compositionBase.nearestThird,
  };
}

/**
 * Decode + downscale a source into ImageData (the only step that needs the DOM /
 * canvas). Kept separate from the heavy pixel analysis (`analyzeImageData`, pure
 * compute) so the two concerns stay independent and easy to reason about.
 */
export function imageDataFromSource(source: CanvasImageSource): ImageData {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) throw new Error("Canvas is not available in this browser.");

  let sw = "width" in source && typeof source.width === "number" ? source.width : 0;
  let sh = "height" in source && typeof source.height === "number" ? source.height : 0;

  if (source instanceof HTMLImageElement) {
    sw = source.naturalWidth || source.width;
    sh = source.naturalHeight || source.height;
  }

  if (!sw || !sh) {
    throw new Error("Could not read image dimensions.");
  }

  const scale = Math.min(1, MAX_ANALYSIS_EDGE / Math.max(sw, sh));

  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));

  canvas.width = w;
  canvas.height = h;

  ctx.drawImage(source, 0, 0, w, h);

  return ctx.getImageData(0, 0, w, h);
}

export async function analyzeImageSource(source: CanvasImageSource): Promise<CritiqueReport> {
  return analyzeImageData(imageDataFromSource(source));
}

export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image."));

    img.src = url;
  });
}