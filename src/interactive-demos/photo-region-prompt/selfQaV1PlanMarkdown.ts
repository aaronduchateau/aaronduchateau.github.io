/** Static V1 QA notes shown under the stub thread grid. */
export const selfQaV1PlanMarkdown = `# Self QA v1 — coordinate prompt stubs

## What this tab is

**“V1 QA”** is a stub space, parallel to Photo critique v1’s thread grid. Each card is a canned walkthrough of the same idea: attach a photo, include a drawn region, and show the markdown that would be sent to an image-editing model.

AI image outputs are **placeholders**. This version’s success criterion is the prompt, not a live edit.

---

## What we are checking

| Check | Intent |
|---|---|
| Language is not enough | The instruction names the change; the polygon names the place |
| Photo 1, not a filename | Absolute width × height and origin travel with the prompt |
| Fill to polygon edges | Injection/removal must reach every segment — no inset, no “detected object” shrink |
| Painted borders are not the mask | Frames, window sashes, and picture-in-picture edges inside the polygon must be overwritten |
| What vs Where | The instruction names the subject; it has no authority over location |
| Fill first | Step 1 overwrites the polygon before the subject is drawn |
| Required pixels | Vertices, edge midpoints, and centroid must differ from photo 1 after Step 1 |
| Image-corner failure | A corner of photo 1 inside the polygon, or a vertex extremely close to a corner, is a failed drawing |
| Bounding box is envelope only | Min/max of the vertices — not the edit shape |
| Add vs remove is explicit | The operation is a first-class field, not buried in prose |
| Outside pixels stay off-limits | The ask forbids edits outside the polygon |

---

## What V1 does not do yet

- It does not call an image model.
- It does not drag existing vertices (add / delete last / complete only).
- Demo polygons are stubbed on the Photo critique sample photos, not hand-traced production masks.
- The **Applied change** frame is a local overlay (tint or hatch), not a generated photograph.

---

## Proposed V2

| Flag | Intent |
|---|---|
| \`liveApply\` | Send the markdown + photo to an image model and show the real edit beside Isolated region |
| \`dragVertices\` | Move existing points after they are placed |
| \`multiRegion\` | More than one polygon, each with its own instruction |
| \`lockOutside\` | Hard-mask the source so the model never sees pixels outside the box |
`;
