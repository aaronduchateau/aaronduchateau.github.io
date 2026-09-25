/** Static markdown shown in the “How it Works” tab. */
export const howItWorksMarkdown = `# How Photo critique v1 works

This demo critiques photos using **only pixels and math** — no AI models, no face detection, no server upload. Everything runs in your browser.

---

## User flow

1. **Demo** — Pick a bundled sample (grouped into “alright” photos and known “fake good” photos), then tap **Run critique**.
2. **Upload photo** — Drop or select a JPEG, PNG, or WebP from your device. Analysis starts immediately.
3. **Results** — The photo appears with a spinner while pixels are processed (~sub-second on a downscaled image).
4. **Overlays** — Toggle the rule-of-thirds grid, eye-flow path, and attention heat map on the image.
5. **Scores & notes** — Lighting, composition, and visual clarity each get a 0–100 score plus short explanations.
6. **Improvement instructions for AI** — Copyable markdown you can paste into an image-editing AI to apply the feedback.
7. **Next steps** — From results, return to upload, demo, or Self QA v1 without closing the modal.

---

## Privacy

- Images are decoded with a canvas on your machine.
- Pixel math runs on the main thread after the preview paints.
- Nothing is uploaded or stored.

---

## Pipeline overview

\`\`\`
Image → downscale (max 512px edge)
      → grayscale luminance
      → attention field (contrast + edges + tonal deviation)
      → subject mass analysis (visual clarity)
      → lighting histogram
      → composition from visual weight
      → eye-flow scan path + heat map
      → weighted overall score + notes
\`\`\`

---

## Step 1 — Image prep

The source is drawn to an off-screen canvas and downscaled so the longest edge is **512 pixels**. This keeps analysis fast while preserving enough detail for composition cues.

Each pixel is converted to **luminance** (weighted RGB: 0.299R + 0.587G + 0.114B).

---

## Step 2 — Attention field

“Where would the eye look?” is approximated without ML:

1. **Local contrast** — absolute difference between each pixel and a 3×3 box-blurred neighbour.
2. **Sobel edge magnitude** — classic gradient operator on the grayscale image.
3. **Deviation from mean tone** — how far each pixel sits from the frame average.

These are blended (**45% contrast + 35% edges + 20% deviation**), normalized to 0–1, then smoothed with two passes of box blur and re-normalization.

The result is a **saliency map** used for eye flow, heat maps, and subject detection.

---

## Step 3 — Subject Mass Analysis (visual clarity)

Version 2 replaces “find the brightest peak” with **subject mass analysis**:

1. **Find saliency peaks** — local maxima in the attention field (up to 20, spaced apart).
2. **DBSCAN-style clustering** — merge nearby peaks into clusters; sort by total mass.
3. **Largest cluster = subject** — flood-fill from each peak in that cluster (relative saliency threshold), union the blobs, then **dilate** with a circular mask to bridge nearby parts of the same subject.
4. **Measure the background outside that mask:**
   - subject area, compactness, convexity
   - background edge density vs subject edges
   - background saliency vs subject saliency
   - silhouette complexity (perimeter vs convex hull)
   - separation between subject and background tones
   - dominance (largest cluster mass vs runner-up)

5. **Score** from those metrics with **subject confidence** gating — bonuses require either strong dominance *or* a tight, cohesive silhouette so legitimate portraits aren’t punished for textured backgrounds.

Poor clarity also adds **composition penalties** when competing masses weaken the frame.

---

## Step 4 — Lighting score

From the grayscale histogram:

- **Tonal spread** — standard deviation; very flat or extreme contrast is penalized.
- **Shadow / highlight clipping** — % of pixels crushed to near-black or blown to near-white.
- **Directional light** — compare mean brightness across the four quadrants.

Output: a 0–100 score, three notes, and the five-bucket luminance histogram (Shadow → Highlight).

---

## Step 5 — Composition score

Uses the attention field as **visual weight**:

- Left/right and top/bottom balance
- Border vs interior weight (subject hugging the edge vs sitting inside the frame)
- Distance from rule-of-thirds lines and power points
- Nearest third label for the visual-weight center

When a **cohesive subject mass** exists (dominance ≥ 0.66), some balance rules relax — a centered portrait can still score well.

Clarity penalties from competing masses are subtracted from the composition score.

---

## Step 6 — Eye flow

A **scan path** simulates how attention might move:

1. **Winner-take-all** — jump to the highest remaining saliency point.
2. **Inhibition of return** — suppress a Gaussian neighbourhood around each fixation so the path doesn’t ping-pong on the same spot.
3. Repeat up to **7 fixations**.

The path usually starts at the **subject mass centroid**, then visits other salient regions — producing zig-zags or arcs, not a single arrow.

A coarse **heatmap** downsamples the attention field to a 56×N grid for the overlay.

---

## Step 7 — Overall score

| Dimension        | Weight |
|------------------|--------|
| Visual clarity   | 50%    |
| Composition      | 30%    |
| Lighting         | 20%    |

**Weakest-link rule:** when clarity &lt; 45, the overall score is capped so strong lighting cannot rescue a cluttered or competing scene.

**Tiers:** Strong (≥75), Good (≥50), Needs work (&lt;50).

---

## What this does *not* do

- No object or face recognition — it cannot know *what* the subject is.
- No artistic judgment — scores reflect pixel structure, not story or emotion.
- No generative editing — the “Improvement instructions for AI” section is export-only; editing happens in the tool you paste into.

---

## Tips for interpreting results

- **High clarity + low composition** — clear subject, awkward placement.
- **High lighting + low clarity** — well exposed but visually busy or competing.
- **Long eye-flow path + low dominance** — many hotspots fighting for attention.
- **Short path + high dominance** — one subject owns the frame; calm flow is expected.
`;
