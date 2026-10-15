import { bboxToPixels, toPixels } from "./polygon";
import type { RegionBBox, RegionOperation, RegionPoint } from "./types";

function addPolygon(ctx: CanvasRenderingContext2D, pts: RegionPoint[]) {
  if (pts.length < 2) return;
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
}

function pathPolygon(ctx: CanvasRenderingContext2D, pts: RegionPoint[]) {
  ctx.beginPath();
  addPolygon(ctx, pts);
}

function wrapLabel(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 6);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith("blob:")) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image."));
    img.src = src;
  });
}

export type PreviewKind = "isolated" | "applied";

export async function drawRegionPreview(
  canvas: HTMLCanvasElement,
  src: string,
  points: RegionPoint[],
  bbox: RegionBBox,
  kind: PreviewKind,
  operation: RegionOperation,
  instruction: string,
): Promise<boolean> {
  if (points.length < 3 || bbox.w <= 0 || bbox.h <= 0) return false;
  const img = await loadImage(src);
  const width = img.naturalWidth;
  const height = img.naturalHeight;
  if (width <= 0 || height <= 0) return false;

  const pixelBBox = bboxToPixels(bbox, width, height);
  const pixelPoints = toPixels(points, width, height);

  if (kind === "isolated") {
    const maxEdge = 720;
    const scale = Math.min(1, maxEdge / Math.max(pixelBBox.w, pixelBBox.h));
    canvas.width = Math.max(1, Math.round(pixelBBox.w * scale));
    canvas.height = Math.max(1, Math.round(pixelBBox.h * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(
      img,
      pixelBBox.x,
      pixelBBox.y,
      pixelBBox.w,
      pixelBBox.h,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const local = pixelPoints.map((p) => ({
      x: (p.x - pixelBBox.x) * scale,
      y: (p.y - pixelBBox.y) * scale,
    }));
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.62)";
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    addPolygon(ctx, local);
    ctx.fill("evenodd");
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(125, 211, 252, 0.95)";
    ctx.lineWidth = Math.max(2, canvas.width / 180);
    pathPolygon(ctx, local);
    ctx.stroke();
    ctx.strokeStyle = "rgba(250, 204, 21, 0.85)";
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    ctx.restore();
    return true;
  }

  const maxEdge = 720;
  const scale = Math.min(1, maxEdge / Math.max(pixelBBox.w, pixelBBox.h));
  canvas.width = Math.max(1, Math.round(pixelBBox.w * scale));
  canvas.height = Math.max(1, Math.round(pixelBBox.h * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(
    img,
    pixelBBox.x,
    pixelBBox.y,
    pixelBBox.w,
    pixelBBox.h,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const local = pixelPoints.map((p) => ({
    x: (p.x - pixelBBox.x) * scale,
    y: (p.y - pixelBBox.y) * scale,
  }));

  ctx.save();
  pathPolygon(ctx, local);
  ctx.clip();
  if (operation === "remove") {
    ctx.fillStyle = "rgba(8, 8, 12, 0.62)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(248, 113, 113, 0.7)";
    ctx.lineWidth = 1;
    const step = Math.max(8, canvas.width / 18);
    for (let x = -canvas.height; x < canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + canvas.height, canvas.height);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = "rgba(34, 211, 238, 0.38)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.restore();

  ctx.save();
  ctx.strokeStyle =
    operation === "remove" ? "rgba(248, 113, 113, 0.95)" : "rgba(125, 211, 252, 0.95)";
  ctx.lineWidth = Math.max(2, canvas.width / 180);
  pathPolygon(ctx, local);
  ctx.stroke();
  ctx.restore();

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.62)";
  const label = operation === "add" ? "ADD" : "REMOVE";
  ctx.font = `bold ${Math.max(12, Math.round(canvas.width / 16))}px ui-sans-serif, system-ui`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fillText(label, cx, cy - Math.max(10, canvas.height / 14));
  ctx.font = `${Math.max(10, Math.round(canvas.width / 22))}px ui-sans-serif, system-ui`;
  ctx.fillStyle = "rgba(226,232,240,0.95)";
  const lines = wrapLabel(ctx, instruction, canvas.width * 0.86);
  lines.forEach((line, i) => {
    ctx.fillText(line, cx, cy + 8 + i * Math.max(14, canvas.height / 16));
  });
  ctx.restore();
  return true;
}
