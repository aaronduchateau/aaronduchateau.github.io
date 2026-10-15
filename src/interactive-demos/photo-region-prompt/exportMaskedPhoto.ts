import { toPixels } from "./polygon";
import type { RegionPoint, RegionReport } from "./types";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith("blob:")) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image."));
    img.src = src;
  });
}

function pathPolygon(ctx: CanvasRenderingContext2D, pts: RegionPoint[]) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Could not encode PNG."));
      else resolve(blob);
    }, "image/png");
  });
}

/**
 * Photo 1 at full pixel size with a clear, semi-transparent overlay on the
 * polygon so the original still shows through (helps a model fill the region).
 */
export async function renderPhotoWithAlphaMask(report: RegionReport): Promise<Blob> {
  const img = await loadImage(report.originalUrl);
  const width = report.width || img.naturalWidth;
  const height = report.height || img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw the masked photo.");
  ctx.drawImage(img, 0, 0, width, height);
  const pixels = toPixels(report.points, width, height);
  const line = Math.max(2, Math.round(Math.min(width, height) / 700));
  ctx.save();
  pathPolygon(ctx, pixels);
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fill();
  ctx.strokeStyle = "rgba(34, 211, 238, 0.88)";
  ctx.lineWidth = line;
  ctx.stroke();
  ctx.restore();
  return canvasToPng(canvas);
}

/** Same-size black/white mask: white = inside the polygon (edit), black = keep. */
export async function renderBinaryMask(report: RegionReport): Promise<Blob> {
  const width = report.width;
  const height = report.height;
  if (width <= 0 || height <= 0) throw new Error("Photo size is missing.");
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw the mask.");
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  pathPolygon(ctx, toPixels(report.points, width, height));
  ctx.fill();
  return canvasToPng(canvas);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function maskDownloadStem(fileName: string): string {
  const stem = fileName.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "-") || "photo-1";
  return stem.slice(0, 80);
}

export async function copyPngToClipboard(blob: Blob): Promise<void> {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    throw new Error("This browser cannot copy images. Use download instead.");
  }
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  } catch {
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": Promise.resolve(blob) }),
    ]);
  }
}
