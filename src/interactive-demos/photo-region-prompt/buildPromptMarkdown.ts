import {
  bboxToPixels,
  boundingBox,
  cornerHits,
  cornerProximityPx,
  edgeMidpoints,
  polygonCentroid,
  toPixels,
} from "./polygon";
import type { RegionOperation, RegionPoint, RegionPromptKind, RegionReport } from "./types";

function formatPx(p: RegionPoint): string {
  return `(${p.x}, ${p.y})`;
}

export function buildPromptMarkdown(
  report: RegionReport,
  kind: RegionPromptKind = "mask",
): string {
  return buildPromptFromParts({
    width: report.width,
    height: report.height,
    points: report.points,
    operation: report.operation,
    instruction: report.instruction,
    kind,
  });
}

export function buildPromptFromParts(input: {
  width: number;
  height: number;
  points: RegionPoint[];
  operation: RegionOperation;
  instruction: string;
  kind?: RegionPromptKind;
}): string {
  const kind = input.kind ?? "mask";
  return kind === "coordinates" ? buildCoordinatesPrompt(input) : buildMaskPrompt(input);
}

function buildMaskPrompt(input: {
  operation: RegionOperation;
  instruction: string;
}): string {
  const opLabel = input.operation === "add" ? "Add" : "Remove";
  const opNoun = input.operation === "add" ? "injection" : "removal";
  const what = input.instruction.trim();

  const body =
    input.operation === "add"
      ? `## What
${what}

The new character or object must **expand to the confines of the mask** in photo 1 — every edge and every corner of that see-through overlay. The subject is allowed to be larger than a “natural” figure if that is what it takes to meet the mask.`
      : `## What
${what}

The ${opNoun} must cover **the entire mask** in photo 1 — every edge and every corner of that see-through overlay. Reconstruct through the whole overlay, not through a smaller object inside it.`;

  return `# Region edit prompt for AI

Photo 1 is the first attached image. It already includes a **semi-transparent mask** over the region to edit. There is no coordinate list and no second file. The mask is the only legal region.

${body}

## Do not invent borders

Do **not** assume a border, edge, or corner that is not part of the mask. Painted frames, window sashes, door openings, mats, canvas edges, picture-in-picture rectangles, and the corners of the photo or the painting are **not** the region unless the mask covers them.

Pay special attention to **edges and corners of the mask**. Meet those. Do not stop at a painted line that sits under or beside the overlay. Do not grow past the overlay to a photo corner or frame corner the mask does not include.

## Frame lines

If the mask clearly crosses a “frame line” (a painted sash, a picture frame, a window pane, the edge of a canvas), that is **intentional**. The ${opNoun} must cross that line with the mask. Do not treat the frame as a wall.

**Small-margin exception:** if the mask only barely nicks a frame — a sliver, a hairline, an overlap that looks like a drawing miss — do not flood the whole frame. A clear, deliberate overlap is the instruction. A tiny miss is not.

## Reject
- Subject or fill sits only inside a painted window/frame while the mask still covers sash, wall, or frame → failed.
- Mask edges or corners left as original photo 1 while the middle changed → failed.
- Pixels clearly outside the overlay changed → failed.

## Operation
**${opLabel}**

## Ask
Edit photo 1 using the mask you can see on it. Expand the What to the confines of that overlay, including across any frame line the mask clearly covers. Return the edited image — not a plan.
`;
}

function buildCoordinatesPrompt(input: {
  width: number;
  height: number;
  points: RegionPoint[];
  operation: RegionOperation;
  instruction: string;
}): string {
  const { width, height } = input;
  const bbox = boundingBox(input.points);
  const pixelPoints = toPixels(input.points, width, height);
  const pixelBBox = bboxToPixels(bbox, width, height);
  const mids = edgeMidpoints(pixelPoints);
  const centroid = polygonCentroid(pixelPoints);
  const opLabel = input.operation === "add" ? "Add" : "Remove";
  const threshold = cornerProximityPx(width, height);
  const hits = cornerHits(input.points, width, height);
  const failed = hits.length > 0;
  const vertexLines = pixelPoints
    .map((p, i) => `${i + 1}. ${formatPx(p)}`)
    .join("\n");
  const requiredPoints = [
    ...pixelPoints.map((p, i) => `- vertex ${i + 1}: ${formatPx(p)}`),
    ...mids.map((p, i) => {
      const from = i + 1;
      const to = ((i + 1) % pixelPoints.length) + 1;
      return `- midpoint ${from}→${to}: ${formatPx(p)}`;
    }),
    ...(centroid ? [`- centroid: ${formatPx(centroid)}`] : []),
  ].join("\n");
  const hitLines = hits
    .map((h) =>
      h.kind === "inside-polygon"
        ? `- ${h.corner} corner of photo 1 lies **inside** the polygon`
        : `- ${h.corner} corner of photo 1 is **${h.distancePx} px** from a vertex (limit ${threshold} px)`,
    )
    .join("\n");

  const failureBlock = failed
    ? `## FAILURE — do not edit
A photo-corner is inside the polygon or extremely close to a vertex. Return photo 1 unchanged.

${hitLines}

`
    : `Corner check: PASS (no photo-1 corner inside the polygon or within ${threshold} px of a vertex).

`;

  const steps =
    input.operation === "add"
      ? `## Do this in order. Do not start with the person.

**Step 1 — Fill first (mandatory).**
Paint over every pixel inside the polygon with new opaque paint. Match the surrounding picture’s color and texture if you want, but the old pixels must be gone. After Step 1, every required pixel below must already differ from photo 1. The painted window, sash, frame, and wall inside the polygon must be gone. If you skip Step 1 and draw a person first, stop — that output is invalid.

**Step 2 — Only then add the subject.**
What (identity / pose only — no location): ${input.instruction.trim()}

Place that subject on top of the Step 1 fill, still inside the same polygon. An existing Franklin (or anyone) already in photo 1 is not Step 2. Do not shrink back into a window.`
      : `## Do this in order.

**Step 1 — Fill first (mandatory).**
Paint over every pixel inside the polygon with reconstructed background. After Step 1, every required pixel below must already differ from photo 1. Painted frames and windows inside the polygon must be gone.

**Step 2 — Removal target.**
What (identity only — no location): ${input.instruction.trim()}

That content must be gone from the polygon. Do not stop at a smaller object or window.`;

  const ask = failed
    ? "A failure has already been recorded. Return photo 1 unchanged."
    : "Run Step 1 until every required pixel differs from photo 1. Then run Step 2. Return the edited image — not a plan. If any required pixel still matches photo 1, you skipped Step 1; start over.";

  return `# Region edit prompt for AI

Photo 1 = first attached image. **${width} × ${height}** px. Origin \`(0, 0)\` top-left. No second image. The polygon is the only region.

${failureBlock}${steps}

## Polygon (absolute px on photo 1)

${vertexLines}

Envelope (not the shape): (${pixelBBox.x}, ${pixelBBox.y}) size ${pixelBBox.w} × ${pixelBBox.h}.

## Required pixels — must differ from photo 1 after Step 1, before you finish Step 2

${requiredPoints}

## Reject
- Any required pixel still equals photo 1 → failed (Step 1 was skipped).
- Subject sits in a painted window and frame/wall required pixels match photo 1 → failed.
- Pixels outside the polygon changed → failed.

## Operation
**${opLabel}**

## Ask
${ask}
`;
}
