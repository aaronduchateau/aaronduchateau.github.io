export const failureResultPhoto = {
  src: "/interactive-demos/photo-region-prompt/Aaron_DuChateau_franklin-failure-result.png",
  label: "Failure result photo",
  alt: "Benjamin Franklin seated inside a painted window frame, smoking, with a dog looking into the scene",
} as const;

export const failurePaintedBorderPhoto = {
  src: "/interactive-demos/photo-region-prompt/Aaron_DuChateau_franklin-painted-border-ignore.png",
  alt: "The same failed result, with marks on the painted border showing it is not a real edge the editor should follow",
} as const;

export const franklinCoordinateFailurePrompt = `# Region edit prompt for AI

Attach the original photo (IMG_1346.jpeg, 5712×4284 px). Do **not** guess the location from the caption. Apply this edit **only** inside the coordinates below.

Language alone cannot place this change. The polygon and bounding box are the location. The instruction is the change.

## Photo constraints
- Filename: IMG_1346.jpeg
- Pixel size: 5712 × 4284
- Coordinate origin: top-left (0, 0); +x right, +y down

## Region (polygon, image pixel space)
Vertices in order, clockwise, closed:
1. (559, 2035)
2. (709, 1684)
3. (993, 1411)
4. (1355, 1294)
5. (1763, 1331)
6. (1989, 1718)
7. (2081, 2202)
8. (1947, 2486)
9. (1881, 2711)
10. (1663, 2985)
11. (1761, 3125)
12. (1723, 3610)
13. (1546, 4006)
14. (783, 4026)
15. (731, 3915)
16. (604, 3030)

Normalized (0–1 of image width / height):
1. (0.0978, 0.4751)
2. (0.1242, 0.3931)
3. (0.1738, 0.3294)
4. (0.2372, 0.3021)
5. (0.3086, 0.3106)
6. (0.3482, 0.4011)
7. (0.3642, 0.5140)
8. (0.3409, 0.5802)
9. (0.3294, 0.6329)
10. (0.2912, 0.6968)
11. (0.3083, 0.7295)
12. (0.3017, 0.8426)
13. (0.2707, 0.9350)
14. (0.1371, 0.9399)
15. (0.1279, 0.9138)
16. (0.1057, 0.7073)

## Bounding box (max extents of the polygon)
- Top-left: (559, 1294)
- Size: 1522 × 2732 px
- Normalized: x=0.0978, y=0.3021, w=0.2664, h=0.6378

Use the **full interior** of this box as the working region. Do not expand past these borders. Do not edit pixels outside the polygon even if they sit inside the box.

## Operation
**Add**

## Instruction
benjamin franklin smoking a cigarette facing towards the person viewing the painting.

## Ask
Edit the attached photo. Insert the requested subject or object only inside the polygon, filling to the bounding-box borders where coverage is needed. Match lighting, perspective, grain, and color of the original. Return the edited image — not a plan or a list of steps.
`;
