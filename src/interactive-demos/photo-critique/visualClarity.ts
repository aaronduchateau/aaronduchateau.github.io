import type { CritiquePoint } from "./types";

/** Normalized 0–1 metrics from subject-mass analysis (v2). */
export type VisualClarityMetrics = {
  subjectArea: number;
  compactness: number;
  convexity: number;
  separation: number;
  backgroundEdgeDensity: number;
  backgroundSaliency: number;
  silhouetteComplexity: number;
  subjectMassDominance: number;
  peakClusterCount: number;
  mergedPeakCount: number;
  /** Legacy aliases used by eye-flow copy */
  backgroundBusyness: number;
  figureGroundSeparation: number;
  shortFlow: boolean;
  flowSpan: number;
};

export type VisualClarityResult = {
  score: number;
  notes: string[];
  compositionPenalties: number;
  metrics: VisualClarityMetrics;
  subjectCenter: CritiquePoint;
};

type Peak = { x: number; y: number; value: number };

type PeakCluster = {
  peaks: Peak[];
  totalMass: number;
  cx: number;
  cy: number;
};

const DEBUG = false;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function findSaliencyPeaks(
  attention: Float32Array,
  w: number,
  h: number,
  maxPeaks = 20,
): Peak[] {
  const candidates: Peak[] = [];
  const floor = 0.12;

  for (let y = 2; y < h - 2; y++) {
    for (let x = 2; x < w - 2; x++) {
      const idx = y * w + x;
      const v = attention[idx];
      if (v < floor) continue;

      let isMax = true;
      for (let dy = -2; dy <= 2 && isMax; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx === 0 && dy === 0) continue;
          if (attention[(y + dy) * w + (x + dx)] > v) {
            isMax = false;
            break;
          }
        }
      }
      if (isMax) candidates.push({ x, y, value: v });
    }
  }

  candidates.sort((a, b) => b.value - a.value);

  const minDist = Math.max(4, Math.min(w, h) * 0.035);
  const selected: Peak[] = [];

  for (const p of candidates) {
    if (selected.length >= maxPeaks) break;
    if (selected.every((s) => Math.hypot(s.x - p.x, s.y - p.y) >= minDist)) {
      selected.push(p);
    }
  }

  return selected;
}

function dbscanPeaks(peaks: Peak[], w: number, h: number): PeakCluster[] {
  if (!peaks.length) return [];

  const eps = Math.min(w, h) * 0.11;
  const visited = new Set<number>();
  const clusters: PeakCluster[] = [];

  const neighborsOf = (i: number) => {
    const out: number[] = [];
    for (let j = 0; j < peaks.length; j++) {
      if (Math.hypot(peaks[i].x - peaks[j].x, peaks[i].y - peaks[j].y) <= eps) {
        out.push(j);
      }
    }
    return out;
  };

  for (let i = 0; i < peaks.length; i++) {
    if (visited.has(i)) continue;
    visited.add(i);

    const memberIndices = new Set<number>([i]);
    const queue = neighborsOf(i).filter((j) => j !== i);

    while (queue.length) {
      const j = queue.pop()!;
      if (!visited.has(j)) {
        visited.add(j);
        queue.push(...neighborsOf(j).filter((k) => !visited.has(k)));
      }
      memberIndices.add(j);
    }

    const clusterPeaks = Array.from(memberIndices).map((idx) => peaks[idx]);
    const totalMass = clusterPeaks.reduce((s, p) => s + p.value, 0);
    const cx = clusterPeaks.reduce((s, p) => s + p.x * p.value, 0) / totalMass;
    const cy = clusterPeaks.reduce((s, p) => s + p.y * p.value, 0) / totalMass;

    clusters.push({ peaks: clusterPeaks, totalMass, cx, cy });
  }

  return clusters.sort((a, b) => b.totalMass - a.totalMass);
}

function floodFromPeak(
  attention: Float32Array,
  w: number,
  h: number,
  seedX: number,
  seedY: number,
  relativeThreshold: number,
): boolean[] {
  const mask = new Array<boolean>(w * h).fill(false);
  const seedIdx = seedY * w + seedX;
  const limit = attention[seedIdx] * relativeThreshold;
  const stack: [number, number][] = [[seedX, seedY]];

  while (stack.length) {
    const [x, y] = stack.pop()!;
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const idx = y * w + x;
    if (mask[idx] || attention[idx] < limit) continue;
    mask[idx] = true;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return mask;
}

function dilateMask(mask: boolean[], w: number, h: number, radius: number): boolean[] {
  const out = mask.slice();

  // Precompute the circular structuring-element offsets once so the hot loop
  // avoids a per-neighbour distance test. Output is identical to testing
  // dx*dx + dy*dy <= radius*radius inline.
  const offX: number[] = [];
  const offY: number[] = [];
  const r2 = radius * radius;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= r2) {
        offX.push(dx);
        offY.push(dy);
      }
    }
  }
  const offCount = offX.length;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) continue;
      for (let k = 0; k < offCount; k++) {
        const nx = x + offX[k];
        const ny = y + offY[k];
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) out[ny * w + nx] = true;
      }
    }
  }
  return out;
}

function buildSubjectMask(
  attention: Float32Array,
  w: number,
  h: number,
  cluster: PeakCluster,
): boolean[] {
  const mask = new Array<boolean>(w * h).fill(false);

  for (const peak of cluster.peaks) {
    const blob = floodFromPeak(attention, w, h, peak.x, peak.y, 0.32);
    for (let i = 0; i < mask.length; i++) {
      if (blob[i]) mask[i] = true;
    }
  }

  const bridge = Math.max(2, Math.round(Math.min(w, h) * 0.03));
  return dilateMask(mask, w, h, bridge);
}

function maskArea(mask: boolean[]) {
  let n = 0;
  for (let i = 0; i < mask.length; i++) if (mask[i]) n++;
  return n;
}

function maskCentroid(mask: boolean[], w: number, h: number): CritiquePoint {
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) continue;
      sx += x;
      sy += y;
      n++;
    }
  }
  return n ? { x: sx / n / w, y: sy / n / h } : { x: 0.5, y: 0.5 };
}

function boundaryPixels(mask: boolean[], w: number, h: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (!mask[idx]) continue;
      const edge =
        !mask[idx - 1] || !mask[idx + 1] || !mask[idx - w] || !mask[idx + w];
      if (edge) pts.push({ x, y });
    }
  }
  return pts;
}

/**
 * Discrete perimeter: for every mask pixel, count the 4-neighbours that fall
 * outside the mask (or out of bounds). This is order-independent, unlike summing
 * distances between raster-ordered boundary pixels.
 */
function discretePerimeter(mask: boolean[], w: number, h: number): number {
  let perim = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) continue;
      if (x === 0 || !mask[y * w + x - 1]) perim++;
      if (x === w - 1 || !mask[y * w + x + 1]) perim++;
      if (y === 0 || !mask[(y - 1) * w + x]) perim++;
      if (y === h - 1 || !mask[(y + 1) * w + x]) perim++;
    }
  }
  return perim;
}

function convexHull(points: { x: number; y: number }[]): { x: number; y: number }[] {
  if (points.length < 3) return points.slice();
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);

  const cross = (o: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: { x: number; y: number }[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: { x: number; y: number }[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

function polygonArea(pts: { x: number; y: number }[]): number {
  if (pts.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2;
}

function measureSeparation(
  gray: Float32Array,
  edges: Float32Array,
  mask: boolean[],
  w: number,
  h: number,
): number {
  let boundaryContrast = 0;
  let boundaryEdges = 0;
  let count = 0;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (!mask[idx]) continue;

      const isBoundary =
        !mask[idx - 1] || !mask[idx + 1] || !mask[idx - w] || !mask[idx + w];
      if (!isBoundary) continue;

      count++;
      boundaryEdges += edges[idx];

      let outSum = 0;
      let outN = 0;
      const inside = gray[idx];
      for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        const nidx = (y + dy) * w + (x + dx);
        if (!mask[nidx]) {
          outSum += gray[nidx];
          outN++;
        }
      }
      if (outN) boundaryContrast += Math.abs(inside - outSum / outN);
    }
  }

  if (!count) return 0.4;
  const contrastNorm = boundaryContrast / count / 70;
  const edgeNorm = boundaryEdges / count / 35;
  return clamp01(contrastNorm * 0.7 + edgeNorm * 0.3);
}

function regionMeans(field: Float32Array, mask: boolean[], inside: boolean): number {
  let sum = 0;
  let n = 0;
  for (let i = 0; i < field.length; i++) {
    if (mask[i] === inside) {
      sum += field[i];
      n++;
    }
  }
  return n ? sum / n : 0;
}

function scoreFromSubjectMass(params: {
  subjectArea: number;
  compactness: number;
  convexity: number;
  separation: number;
  bgEdgeRatio: number;
  bgSalRatio: number;
  silhouetteComplexity: number;
  dominance: number;
  clusterCount: number;
  secondClusterShare: number;
}): { score: number; notes: string[]; compositionPenalties: number } {
  let score = 50;
  const notes: string[] = [];
  let compositionPenalties = 0;

  const {
    subjectArea,
    compactness,
    convexity,
    separation,
    bgEdgeRatio,
    bgSalRatio,
    silhouetteComplexity,
    dominance,
    clusterCount,
    secondClusterShare,
  } = params;

  // How confident are we that a single subject actually exists? Figure-ground
  // "quality" bonuses (clean boundary, calm background) only mean something when
  // there IS a real figure — otherwise a blob that swallowed the whole busy
  // center of the frame would be rewarded for having a tidy leftover background.
  //
  // Confidence comes from EITHER a dominant saliency cluster OR a tight, cohesive,
  // moderately-sized silhouette. A clean portrait whose busy background spawns
  // texture clusters still reads as a real subject via its shape, even when raw
  // dominance is low. A sprawling fragmented blob (a fountain swallowing the
  // frame) scores low on both.
  const dominanceConf = clamp((dominance - 0.38) / 0.25, 0, 1);
  const areaGood = subjectArea >= 0.05 && subjectArea <= 0.35 ? 1 : 0.3;
  const shapeConf = clamp01(compactness / 0.15) * clamp01(convexity) * areaGood;
  const subjectConfidence = Math.max(dominanceConf, shapeConf);

  // 1. Subject dominance — the single most important "is there one clear subject?"
  //    signal. Maps roughly 0.30 -> -16, 0.50 -> 0, 0.70 -> +16.
  score += clamp((dominance - 0.5) * 80, -28, 28);
  if (dominance >= 0.62) {
    notes.push("One merged subject mass dominates saliency—nearby peaks read as a single focal unit.");
  } else if (dominance < 0.45) {
    compositionPenalties += 12;
    notes.push(
      `Several masses compete for attention (the runner-up holds ${(secondClusterShare * 100).toFixed(
        0,
      )}%)—no clear focal hierarchy.`,
    );
  }

  // 2. Scatter — many surviving clusters with weak dominance AND a fragmented
  //    mass reads as chaos (a cohesive subject with a textured background is fine).
  if (clusterCount >= 6 && dominance < 0.5 && compactness < 0.18) {
    score -= 12;
    compositionPenalties += 6;
    notes.push(`${clusterCount} separate peak clusters remain after merging—scattered focal interest.`);
  } else if (clusterCount <= 3 && dominance >= 0.6) {
    score += 6;
  }

  // 3. Background edge calmness relative to the subject (bonus gated by confidence).
  if (bgEdgeRatio <= 0.7) {
    const b = 12 * subjectConfidence;
    score += b;
    if (b >= 6) notes.push("Background outside the subject is noticeably calmer than the subject mass.");
  } else if (bgEdgeRatio >= 1.05) {
    const p = Math.min(22, (bgEdgeRatio - 1) * 30);
    score -= p;
    notes.push(
      `Background edge density rivals or exceeds the subject (${bgEdgeRatio.toFixed(
        2,
      )}×)—texture behind the mass competes for attention.`,
    );
  }

  // 4. Background saliency relative to subject (reward gated; penalty ungated).
  if (bgSalRatio <= 0.5) {
    score += 8 * subjectConfidence;
  } else if (bgSalRatio >= 0.58) {
    const p = Math.min(16, (bgSalRatio - 0.58) * 38);
    score -= p;
    if (bgSalRatio >= 0.7) {
      notes.push("Background saliency rivals the subject—competing shapes pull the eye outward.");
    }
  }

  // 5. Subject size — too tiny reads as no subject, too large leaves no frame.
  if (subjectArea >= 0.06 && subjectArea <= 0.4) {
    score += 8;
  } else if (subjectArea < 0.035) {
    score -= 12;
    notes.push("Subject mass is tiny relative to the frame—nothing reads as a clear primary subject.");
  } else if (subjectArea > 0.5) {
    score -= 8;
    notes.push("Subject mass fills most of the frame—little background separation to measure.");
  }

  // 5b. Bloated low-confidence blob — the classic "no real subject, the detector
  //     just grabbed the whole cluttered middle" signature (e.g. a busy fountain):
  //     large, fragmented, and not dominant.
  if (subjectArea > 0.38 && dominance < 0.5 && compactness < 0.12) {
    score -= 12;
    compositionPenalties += 6;
    notes.push(
      "The strongest region is a large, diffuse blob rather than a distinct subject—no single thing clearly owns the frame.",
    );
  }

  // 6. Figure–ground separation — bonus only counts when a real subject exists;
  //    soft boundaries get a gentle penalty (low-contrast subjects are readable).
  if (separation >= 0.45) {
    const b = 12 * subjectConfidence;
    score += b;
    if (b >= 6) notes.push("Subject mass separates cleanly from the background at its boundary.");
  } else if (separation < 0.22) {
    score -= 6;
    notes.push("Subject and background blend at the edges—soft figure-ground separation.");
  }

  // 7. Cohesive shape.
  if (compactness >= 0.32) {
    score += 5;
  } else if (compactness < 0.14) {
    score -= 6;
    compositionPenalties += 3;
    notes.push("Subject mass is sprawling rather than a tight visual unit.");
  }

  if (convexity >= 0.6) {
    score += 4;
  } else if (convexity < 0.4) {
    const p = Math.min(12, (0.4 - convexity) * 35);
    score -= p;
    compositionPenalties += Math.round(p * 0.5);
    notes.push("Subject silhouette is fractured or concave—merged peaks did not form one cohesive blob.");
  }

  // 8. Silhouette tangle — colliding / interlocking forms at the boundary.
  if (silhouetteComplexity > 0.72) {
    const p = (silhouetteComplexity - 0.72) * 28;
    score -= p;
    compositionPenalties += Math.round(p * 0.5);
    notes.push("Subject outline is highly irregular—forms appear to collide or tangle at the boundary.");
  }

  score = clamp(Math.round(score), 0, 100);

  if (!notes.length) {
    notes.push("Subject mass reads as a single, separated focal region from pixel structure alone.");
  }

  return { score, notes: notes.slice(0, 5), compositionPenalties };
}

function debugLog(label: string, data: Record<string, string | number>) {
  if (!DEBUG) return;
  console.log(`[${label}] ${JSON.stringify(data)}`);
}

export function scoreVisualClarity(
  gray: Float32Array,
  attention: Float32Array,
  edges: Float32Array,
  w: number,
  h: number,
): VisualClarityResult {
  const peaks = findSaliencyPeaks(attention, w, h, 20);
  const clusters = dbscanPeaks(peaks, w, h);

  const emptyMetrics: VisualClarityMetrics = {
    subjectArea: 0,
    compactness: 0,
    convexity: 0,
    separation: 0,
    backgroundEdgeDensity: 0,
    backgroundSaliency: 0,
    silhouetteComplexity: 0,
    subjectMassDominance: 0,
    peakClusterCount: 0,
    mergedPeakCount: 0,
    backgroundBusyness: 1,
    figureGroundSeparation: 0,
    shortFlow: true,
    flowSpan: 0,
  };

  if (!clusters.length || !peaks.length) {
    return {
      score: 35,
      notes: ["No salient regions detected—image reads flat or uniformly textured."],
      compositionPenalties: 15,
      metrics: emptyMetrics,
      subjectCenter: { x: 0.5, y: 0.5 },
    };
  }

  const subjectCluster = clusters[0];
  const subjectMask = buildSubjectMask(attention, w, h, subjectCluster);
  const areaPx = maskArea(subjectMask);
  const subjectArea = areaPx / (w * h);
  const subjectCenter = maskCentroid(subjectMask, w, h);

  const boundary = boundaryPixels(subjectMask, w, h);
  const perim = discretePerimeter(subjectMask, w, h);
  const compactness = areaPx > 0 && perim > 0 ? clamp01((4 * Math.PI * areaPx) / (perim * perim)) : 0;

  const hull = convexHull(boundary);
  const hullArea = polygonArea(hull);
  const convexity = hullArea > 0 ? clamp01(areaPx / hullArea) : 0;

  const separation = measureSeparation(gray, edges, subjectMask, w, h);

  const subjectEdge = regionMeans(edges, subjectMask, true);
  const bgEdge = regionMeans(edges, subjectMask, false);
  const subjectSal = regionMeans(attention, subjectMask, true);
  const bgSal = regionMeans(attention, subjectMask, false);

  const bgEdgeRatio = bgEdge / (subjectEdge + 0.001);
  const bgSalRatio = bgSal / (subjectSal + 0.001);

  const silhouetteComplexity = areaPx > 0 ? clamp01((perim / Math.sqrt(areaPx) - 3) / 8) : 0;

  const totalClusterMass = clusters.reduce((s, c) => s + c.totalMass, 0);
  const dominance = subjectCluster.totalMass / Math.max(0.001, totalClusterMass);
  const secondClusterShare =
    clusters.length > 1 ? clusters[1].totalMass / Math.max(0.001, totalClusterMass) : 0;

  const backgroundBusyness = clamp01((bgEdgeRatio - 0.85) / 0.7);

  const { score, notes, compositionPenalties } = scoreFromSubjectMass({
    subjectArea,
    compactness,
    convexity,
    separation,
    bgEdgeRatio,
    bgSalRatio,
    silhouetteComplexity,
    dominance,
    clusterCount: clusters.length,
    secondClusterShare,
  });

  debugLog("Subject Mass v2", {
    peaks: peaks.length,
    clusters: clusters.length,
    mergedPeaks: subjectCluster.peaks.length,
    subjectArea: subjectArea.toFixed(3),
    compactness: compactness.toFixed(3),
    convexity: convexity.toFixed(3),
    separation: separation.toFixed(3),
    bgEdgeRatio: bgEdgeRatio.toFixed(3),
    bgSalRatio: bgSalRatio.toFixed(3),
    silhouetteComplexity: silhouetteComplexity.toFixed(3),
    dominance: dominance.toFixed(3),
    score,
  });

  return {
    score,
    notes,
    compositionPenalties,
    subjectCenter,
    metrics: {
      subjectArea,
      compactness,
      convexity,
      separation,
      backgroundEdgeDensity: bgEdge,
      backgroundSaliency: bgSal,
      silhouetteComplexity,
      subjectMassDominance: dominance,
      peakClusterCount: clusters.length,
      mergedPeakCount: subjectCluster.peaks.length,
      backgroundBusyness,
      figureGroundSeparation: separation,
      shortFlow: false,
      flowSpan: 0,
    },
  };
}
