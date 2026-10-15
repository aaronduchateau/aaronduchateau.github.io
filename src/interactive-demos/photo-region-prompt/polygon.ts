import type { RegionBBox, RegionPoint } from "./types";

export function boundingBox(points: RegionPoint[]): RegionBBox {
  if (points.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
  let minX = 1;
  let minY = 1;
  let maxX = 0;
  let maxY = 0;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  minX = clamp01(minX);
  minY = clamp01(minY);
  maxX = clamp01(maxX);
  maxY = clamp01(maxY);
  return { x: minX, y: minY, w: Math.max(0, maxX - minX), h: Math.max(0, maxY - minY) };
}

export function toPixels(points: RegionPoint[], width: number, height: number): RegionPoint[] {
  return points.map((p) => ({
    x: Math.round(p.x * width),
    y: Math.round(p.y * height),
  }));
}

export function edgeMidpoints(pixelPoints: RegionPoint[]): RegionPoint[] {
  if (pixelPoints.length < 2) return [];
  return pixelPoints.map((p, i) => {
    const n = pixelPoints[(i + 1) % pixelPoints.length];
    return {
      x: Math.round((p.x + n.x) / 2),
      y: Math.round((p.y + n.y) / 2),
    };
  });
}

export function polygonCentroid(pixelPoints: RegionPoint[]): RegionPoint | null {
  if (pixelPoints.length === 0) return null;
  const sum = pixelPoints.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 },
  );
  return {
    x: Math.round(sum.x / pixelPoints.length),
    y: Math.round(sum.y / pixelPoints.length),
  };
}

export function bboxToPixels(bbox: RegionBBox, width: number, height: number) {
  return {
    x: Math.round(bbox.x * width),
    y: Math.round(bbox.y * height),
    w: Math.max(1, Math.round(bbox.w * width)),
    h: Math.max(1, Math.round(bbox.h * height)),
  };
}

export function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function nearPoint(a: RegionPoint, b: RegionPoint, threshold = 0.02): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy <= threshold * threshold;
}

export const IMAGE_CORNERS: { name: string; point: RegionPoint }[] = [
  { name: "top-left", point: { x: 0, y: 0 } },
  { name: "top-right", point: { x: 1, y: 0 } },
  { name: "bottom-right", point: { x: 1, y: 1 } },
  { name: "bottom-left", point: { x: 0, y: 1 } },
];

/** Pixels: max(8, 1.5% of the shorter photo edge). */
export function cornerProximityPx(width: number, height: number): number {
  return Math.max(8, Math.round(0.015 * Math.min(width, height)));
}

export function pointInPolygon(point: RegionPoint, polygon: RegionPoint[]): boolean {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi || Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export type CornerHit = {
  corner: string;
  kind: "inside-polygon" | "near-vertex";
  distancePx: number;
};

export function cornerHits(
  points: RegionPoint[],
  width: number,
  height: number,
): CornerHit[] {
  if (points.length < 3 || width <= 0 || height <= 0) return [];
  const threshold = cornerProximityPx(width, height);
  const hits: CornerHit[] = [];

  for (const { name, point } of IMAGE_CORNERS) {
    const cornerPx = { x: point.x * width, y: point.y * height };
    if (pointInPolygon(point, points)) {
      hits.push({ corner: name, kind: "inside-polygon", distancePx: 0 });
      continue;
    }
    let nearest = Number.POSITIVE_INFINITY;
    for (const vertex of points) {
      const dx = vertex.x * width - cornerPx.x;
      const dy = vertex.y * height - cornerPx.y;
      nearest = Math.min(nearest, Math.hypot(dx, dy));
    }
    if (nearest <= threshold) {
      hits.push({
        corner: name,
        kind: "near-vertex",
        distancePx: Math.round(nearest),
      });
    }
  }

  return hits;
}

export type ContainRect = { left: number; top: number; width: number; height: number };

export function computeContainRect(
  containerW: number,
  containerH: number,
  imageW: number,
  imageH: number,
): ContainRect | null {
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

export function clientToNormalized(
  clientX: number,
  clientY: number,
  container: DOMRect,
  layout: ContainRect,
): RegionPoint | null {
  const px = clientX - container.left - layout.left;
  const py = clientY - container.top - layout.top;
  if (px < 0 || py < 0 || px > layout.width || py > layout.height) return null;
  return {
    x: clamp01(px / layout.width),
    y: clamp01(py / layout.height),
  };
}
