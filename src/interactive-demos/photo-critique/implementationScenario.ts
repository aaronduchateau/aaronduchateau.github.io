import type { DemoSampleId } from "./demoSamples";
import { getDemoSample } from "./demoSamples";

export type ImplementationMessage =
  | {
      role: "user";
      kind: "critique";
      /** Full improvement markdown pasted into ChatGPT. */
      markdown: string;
      /** Shown on the attached original; omitted when re-pasting critique only. */
      showOriginal?: boolean;
      /** Small “replying to previous edit” chip (disjointed thread order in the real chat). */
      replyToLabel?: string;
    }
  | {
      role: "user";
      kind: "refinement";
      text: string;
      replyToLabel?: string;
    }
  | {
      role: "assistant";
      kind: "image";
      /** Placeholder caption — real ChatGPT image gen output. */
      alt: string;
      /** Local path to the real ChatGPT edit; falls back to placeholder when absent. */
      src?: string;
    };

/** Thread id — every thread maps to a demo sample (originals live in the Demo tab). */
export type ImplementationThreadId = DemoSampleId;

/** Closing recap for a thread — before/after critique scores plus a write-up. */
export type ImplementationThreadSummary = {
  beforeScore: number;
  afterScore: number;
  description: string;
};

export type ImplementationPhotoThread = {
  sampleId: ImplementationThreadId;
  label: string;
  description: string;
  originalSrc: string;
  messages: ImplementationMessage[];
  summary?: ImplementationThreadSummary;
};

const gardenStillLifeMarkdown = `# Improvement instructions for AI

Use this automated, pixel-only critique of \`Garden still-life\` to improve the photo. The analysis inspects only pixels (tone, edges, and attention) and has no idea what the subject is, so treat these as technical hints, keep the subject recognisable, and fix the lowest-scoring areas first.

## Scores (0–100)
- **Overall:** 59 (Good)
- **Lighting:** 80
- **Composition:** 52  ← weakest, start here
- **Visual clarity:** 55

## Findings
### Visual clarity
- Several masses compete for attention (the runner-up holds 15%)—no clear focal hierarchy.
- Background outside the subject is noticeably calmer than the subject mass.
- Subject mass separates cleanly from the background at its boundary.

### Composition
- Weight center is close to the middle right third—reasonable compositional placement.

### Lighting
- Contrast has healthy separation between lights and darks without looking completely flat.
- Some deep shadow clipping—adds mood but can swallow fine detail.
- Light reads directional—brightest quadrant is top-left (41 levels spread).

### Eye flow
- Likely entry point sits in the upper right third—where contrast and brightness pull attention first.
- The simulated scan path visits 8 salient stops, traveling upper right → upper left → upper right → upper center ….
- The eye is pulled across many competing hotspots—a long, scattered path that weakens the sense of a single subject.

### Portrait balance
- Left/right weight is balanced (44% / 56%).
- Vertical weight favors the top (64% / 36%).

## Tonal distribution
Shadow 55% · Dark 25% · Mid 12% · Light 6% · Highlight 2%

Visual weight center is nearest the **middle right** third.

## Suggested edits
1. Strengthen figure–ground separation: blur, darken, or simplify the background so the main subject clearly stands out, and tone down competing bright or high-detail areas outside it.
2. Reposition or crop so the main subject sits on a rule-of-thirds line or intersection (visual weight is currently nearest the middle right third), and trim empty space that weakens the focal point.
3. Lift the deepest shadows and nudge exposure up — a large share of pixels are crushed to black and losing detail.
4. Simplify the frame — attention currently bounces between many points. Reduce clutter so the eye settles on one clear subject.
5. Prioritise the weakest dimension first: **composition**.

## Ask
Using this critique, edit the attached photo. Apply exposure, contrast, crop, background treatment, and dodge/burn as needed to raise the weakest scores. Return the edited image — not a plan or list of steps — and keep the result natural and recognizable.`;

const streetArtMuralMarkdown = `# Improvement instructions for AI

Use this automated, pixel-only critique of \`Street-art mural\` to improve the photo. The analysis inspects only pixels (tone, edges, and attention) and has no idea what the subject is, so treat these as technical hints, keep the subject recognisable, and fix the lowest-scoring areas first.

## Scores (0–100)
- **Overall:** 77 (Strong)
- **Lighting:** 84
- **Composition:** 70  ← weakest, start here
- **Visual clarity:** 78

## Findings
### Visual clarity
- Background outside the subject is noticeably calmer than the subject mass.

### Composition
- Visual weight sits near a rule-of-thirds anchor (middle center)—classic compositional placement.

### Lighting
- Contrast has healthy separation between lights and darks without looking completely flat.
- Light reads directional—brightest quadrant is top-right (26 levels spread).

### Eye flow
- Likely entry point sits in the upper center third—where contrast and brightness pull attention first.
- The simulated scan path visits 8 salient stops, traveling upper center → middle left → upper left → middle right ….
- The eye is pulled across many competing hotspots—a long, scattered path that weakens the sense of a single subject.

### Portrait balance
- Left/right weight is balanced (55% / 45%).
- Vertical weight favors the top (65% / 35%).

## Tonal distribution
Shadow 7% · Dark 20% · Mid 16% · Light 54% · Highlight 2%

Visual weight center is nearest the **middle center** third.

## Suggested edits
1. Lighting is fairly balanced — keep the tonal range and make only fine exposure/contrast tweaks.
2. Simplify the frame — attention currently bounces between many points. Reduce clutter so the eye settles on one clear subject.
3. Prioritise the weakest dimension first: **composition**.

## Ask
Using this critique, edit the attached photo. Apply exposure, contrast, crop, background treatment, and dodge/burn as needed to raise the weakest scores. Return the edited image — not a plan or list of steps — and keep the result natural and recognizable.`;

const couplePortraitMarkdown = `# Improvement instructions for AI

Use this automated, pixel-only critique of \`Couple portrait\` to improve the photo. The analysis inspects only pixels (tone, edges, and attention) and has no idea what the subject is, so treat these as technical hints, keep the subject recognisable, and fix the lowest-scoring areas first.

## Scores (0–100)
- **Overall:** 73 (Good)
- **Lighting:** 84
- **Composition:** 67  ← weakest, start here
- **Visual clarity:** 73

## Findings
### Visual clarity
- Background outside the subject is noticeably calmer than the subject mass.

### Composition
- Weight center is close to the lower right third—reasonable compositional placement.

### Lighting
- Contrast has healthy separation between lights and darks without looking completely flat.
- Light reads directional—brightest quadrant is bottom-left (47 levels spread).

### Eye flow
- Likely entry point sits in the lower right third—where contrast and brightness pull attention first.
- The simulated scan path visits 8 salient stops, traveling lower right → middle right → lower center → lower right ….
- The eye is pulled across many competing hotspots—a long, scattered path that weakens the sense of a single subject.

### Portrait balance
- Left/right weight is balanced (44% / 56%).
- Top/bottom weight is fairly even (46% / 54%).

## Tonal distribution
Shadow 9% · Dark 35% · Mid 33% · Light 23% · Highlight 0%

Visual weight center is nearest the **lower right** third.

## Suggested edits
1. Lighting is fairly balanced — keep the tonal range and make only fine exposure/contrast tweaks.
2. Simplify the frame — attention currently bounces between many points. Reduce clutter so the eye settles on one clear subject.
3. Prioritise the weakest dimension first: **composition**.

## Ask
Using this critique, edit the attached photo. Apply exposure, contrast, crop, background treatment, and dodge/burn as needed to raise the weakest scores. Return the edited image — not a plan or list of steps — and keep the result natural and recognizable.`;

const closeUpPortraitMarkdown = `# Improvement instructions for AI

Use this automated, pixel-only critique of \`Close-up portrait\` to improve the photo. The analysis inspects only pixels (tone, edges, and attention) and has no idea what the subject is, so treat these as technical hints, keep the subject recognisable, and fix the lowest-scoring areas first.

## Scores (0–100)
- **Overall:** 78 (Strong)
- **Lighting:** 42  ← weakest, start here
- **Composition:** 64
- **Visual clarity:** 100

## Findings
### Visual clarity
- One merged subject mass dominates saliency—nearby peaks read as a single focal unit.
- Background outside the subject is noticeably calmer than the subject mass.
- Subject mass separates cleanly from the background at its boundary.

### Composition
- Weight center is close to the lower right third—reasonable compositional placement.

### Lighting
- Very high contrast—dramatic, but easy to lose detail in shadows or highlights.
- Shadows are heavily crushed (16% near-black pixels).
- Light reads directional—brightest quadrant is top-right (68 levels spread).

### Eye flow
- Likely entry point sits in the lower right third—where contrast and brightness pull attention first.
- The simulated scan path visits 7 salient stops, traveling lower right → lower center → upper center → upper right ….
- The path ranges across the frame but keeps returning to the dominant subject mass, so it still reads as organized.

### Portrait balance
- Slight right weighting (41% / 59%).
- Top/bottom weight is fairly even (45% / 55%).

## Tonal distribution
Shadow 49% · Dark 16% · Mid 10% · Light 12% · Highlight 13%

Visual weight center is nearest the **lower right** third.

## Suggested edits
1. Lift the deepest shadows and nudge exposure up — a large share of pixels are crushed to black and losing detail.
2. Simplify the frame — attention currently bounces between many points. Reduce clutter so the eye settles on one clear subject.
3. Prioritise the weakest dimension first: **lighting**.

## Ask
Using this critique, edit the attached photo. Apply exposure, contrast, crop, background treatment, and dodge/burn as needed to raise the weakest scores. Return the edited image — not a plan or list of steps — and keep the result natural and recognizable.`;

const mistyLandscapeMarkdown = `# Improvement instructions for AI

Use this automated, pixel-only critique of \`Misty landscape\` to improve the photo. The analysis inspects only pixels (tone, edges, and attention) and has no idea what the subject is, so treat these as technical hints, keep the subject recognisable, and fix the lowest-scoring areas first.

## Scores (0–100)
- **Overall:** 60 (Good)
- **Lighting:** 54  ← weakest, start here
- **Composition:** 61
- **Visual clarity:** 62

## Findings
### Visual clarity
- Background outside the subject is noticeably calmer than the subject mass.
- Subject and background blend at the edges—soft figure-ground separation.

### Composition
- Weight center falls in the upper left region—away from center but not on a third.

### Lighting
- Very high contrast—dramatic, but easy to lose detail in shadows or highlights.
- Light reads directional—brightest quadrant is top-right (183 levels spread).

### Eye flow
- Likely entry point sits in the upper left third—where contrast and brightness pull attention first.
- The simulated scan path visits 8 salient stops, traveling upper left → middle right → upper left → upper center ….
- The eye is pulled across many competing hotspots—a long, scattered path that weakens the sense of a single subject.

### Portrait balance
- Left/right weight is balanced (49% / 51%).
- Top/bottom weight is fairly even (45% / 55%).

## Tonal distribution
Shadow 37% · Dark 22% · Mid 3% · Light 3% · Highlight 35%

Visual weight center is nearest the **middle center** third.

## Suggested edits
1. Reposition or crop so the main subject sits on a rule-of-thirds line or intersection (visual weight is currently nearest the middle center third), and trim empty space that weakens the focal point.
2. Lift the deepest shadows and nudge exposure up — a large share of pixels are crushed to black and losing detail.
3. Recover clipped highlights and pull exposure down slightly — the brightest areas are blowing out.
4. Simplify the frame — attention currently bounces between many points. Reduce clutter so the eye settles on one clear subject.
5. Prioritise the weakest dimension first: **lighting**.

## Ask
Using this critique, edit the attached photo. Apply exposure, contrast, crop, background treatment, and dodge/burn as needed to raise the weakest scores. Return the edited image — not a plan or list of steps — and keep the result natural and recognizable.`;

const farmAnimalsMarkdown = `# Improvement instructions for AI

Use this automated, pixel-only critique of \`Farm animals\` to improve the photo. The analysis inspects only pixels (tone, edges, and attention) and has no idea what the subject is, so treat these as technical hints, keep the subject recognisable, and fix the lowest-scoring areas first.

## Scores (0–100)
- **Overall:** 70 (Good)
- **Lighting:** 84
- **Composition:** 46  ← weakest, start here
- **Visual clarity:** 79

## Findings
### Visual clarity
- Several masses compete for attention (the runner-up holds 35%)—no clear focal hierarchy.
- Background outside the subject is noticeably calmer than the subject mass.
- Subject mass separates cleanly from the background at its boundary.

### Composition
- Weight center falls in the upper right region—away from center but not on a third.

### Lighting
- Contrast has healthy separation between lights and darks without looking completely flat.
- Light reads directional—brightest quadrant is top-right (37 levels spread).

### Eye flow
- Likely entry point sits in the upper right third—where contrast and brightness pull attention first.
- The simulated scan path visits 7 salient stops, traveling upper right → upper left → upper center → upper left ….
- The eye is pulled across many competing hotspots—a long, scattered path that weakens the sense of a single subject.

### Portrait balance
- Left/right weight is balanced (48% / 52%).
- Vertical weight favors the top (62% / 38%).

## Tonal distribution
Shadow 21% · Dark 56% · Mid 15% · Light 4% · Highlight 5%

Visual weight center is nearest the **middle right** third.

## Suggested edits
1. Reposition or crop so the main subject sits on a rule-of-thirds line or intersection (visual weight is currently nearest the middle right third), and trim empty space that weakens the focal point.
2. Brighten the frame; it skews dark. Raise exposure/shadows so the subject is clearly lit.
3. Simplify the frame — attention currently bounces between many points. Reduce clutter so the eye settles on one clear subject.
4. Prioritise the weakest dimension first: **composition**.

## Ask
Using this critique, edit the attached photo. Apply exposure, contrast, crop, background treatment, and dodge/burn as needed to raise the weakest scores. Return the edited image — not a plan or list of steps — and keep the result natural and recognizable.`;

const charlieMarkdown = `# Improvement instructions for AI

Use this automated, pixel-only critique of \`Charlie\` to improve the photo. The analysis inspects only pixels (tone, edges, and attention) and has no idea what the subject is, so treat these as technical hints, keep the subject recognisable, and fix the lowest-scoring areas first.

## Scores (0–100)
- **Overall:** 38 (Needs work)
- **Lighting:** 60
- **Composition:** 49
- **Visual clarity:** 23  ← weakest, start here

## Findings
### Visual clarity
- Several masses compete for attention (the runner-up holds 15%)—no clear focal hierarchy.
- Background saliency rivals the subject—competing shapes pull the eye outward.
- Subject mass is tiny relative to the frame—nothing reads as a clear primary subject.

### Composition
- Weight center falls in the upper left region—away from center but not on a third.

### Lighting
- Moderate contrast gives the frame some depth between bright and dark areas.
- Shadows are heavily crushed (29% near-black pixels).
- Light reads directional—brightest quadrant is top-left (29 levels spread).

### Eye flow
- Likely entry point sits in the upper left third—where contrast and brightness pull attention first.
- The simulated scan path visits 8 salient stops, traveling upper left → upper center → lower left → upper left ….
- The eye is pulled across many competing hotspots—a long, scattered path that weakens the sense of a single subject.

### Portrait balance
- Left/right weight is balanced (51% / 49%).
- Top/bottom weight is fairly even (51% / 49%).

## Tonal distribution
Shadow 55% · Dark 18% · Mid 10% · Light 10% · Highlight 7%

Visual weight center is nearest the **middle center** third.

## Suggested edits
1. Strengthen figure–ground separation: blur, darken, or simplify the background so the main subject clearly stands out, and tone down competing bright or high-detail areas outside it.
2. Reposition or crop so the main subject sits on a rule-of-thirds line or intersection (visual weight is currently nearest the middle center third), and trim empty space that weakens the focal point.
3. Lift the deepest shadows and nudge exposure up — a large share of pixels are crushed to black and losing detail.
4. Simplify the frame — attention currently bounces between many points. Reduce clutter so the eye settles on one clear subject.
5. Prioritise the weakest dimension first: **clarity**.

## Ask
Using this critique, edit the attached photo. Apply exposure, contrast, crop, background treatment, and dodge/burn as needed to raise the weakest scores. Return the edited image — not a plan or list of steps — and keep the result natural and recognizable.`;

const patrickOnCarpetMarkdown = `# Improvement instructions for AI

Use this automated, pixel-only critique of \`Patrick on carpet\` to improve the photo. The analysis inspects only pixels (tone, edges, and attention) and has no idea what the subject is, so treat these as technical hints, keep the subject recognisable, and fix the lowest-scoring areas first.

## Scores (0–100)
- **Overall:** 84 (Strong)
- **Lighting:** 66  ← weakest, start here
- **Composition:** 75
- **Visual clarity:** 96

## Findings
### Visual clarity
- One merged subject mass dominates saliency—nearby peaks read as a single focal unit.
- Background outside the subject is noticeably calmer than the subject mass.
- Subject mass fills most of the frame—little background separation to measure.
- Subject mass separates cleanly from the background at its boundary.

### Composition
- Subject mass is centered, but the merged focal blob makes the portrait feel intentional and direct.

### Lighting
- Contrast has healthy separation between lights and darks without looking completely flat.
- Lighting is fairly even across quadrants—soft and flat rather than directional.

### Eye flow
- Likely entry point sits in the middle center third—where contrast and brightness pull attention first.
- The simulated scan path visits 8 salient stops, traveling middle center → lower center → upper center → middle center ….
- The path ranges across the frame but keeps returning to the dominant subject mass, so it still reads as organized.

### Portrait balance
- Left/right weight is balanced (51% / 49%).
- Top/bottom weight is fairly even (49% / 51%).

## Tonal distribution
Shadow 33% · Dark 45% · Mid 18% · Light 3% · Highlight 2%

Visual weight center is nearest the **middle center** third.

## Suggested edits
1. Brighten the frame; it skews dark. Raise exposure/shadows so the subject is clearly lit.
2. Simplify the frame — attention currently bounces between many points. Reduce clutter so the eye settles on one clear subject.
3. Prioritise the weakest dimension first: **lighting**.

## Ask
Using this critique, edit the attached photo. Apply exposure, contrast, crop, background treatment, and dodge/burn as needed to raise the weakest scores. Return the edited image — not a plan or list of steps — and keep the result natural and recognizable.`;

const patrickPlayfulMarkdown = `# Improvement instructions for AI

Use this automated, pixel-only critique of \`Patrick playful\` to improve the photo. The analysis inspects only pixels (tone, edges, and attention) and has no idea what the subject is, so treat these as technical hints, keep the subject recognisable, and fix the lowest-scoring areas first.

## Scores (0–100)
- **Overall:** 22 (Needs work)
- **Lighting:** 68
- **Composition:** 42
- **Visual clarity:** 4  ← weakest, start here

## Findings
### Visual clarity
- Several masses compete for attention (the runner-up holds 18%)—no clear focal hierarchy.
- 8 separate peak clusters remain after merging—scattered focal interest.
- The strongest region is a large, diffuse blob rather than a distinct subject—no single thing clearly owns the frame.
- Subject mass is sprawling rather than a tight visual unit.

### Composition
- Visual weight sits near a rule-of-thirds anchor (middle center)—classic compositional placement.
- Balance and thirds placement look acceptable, but competing masses or shape collisions weaken the composition.

### Lighting
- Moderate contrast gives the frame some depth between bright and dark areas.
- Some deep shadow clipping—adds mood but can swallow fine detail.
- Light reads directional—brightest quadrant is top-left (38 levels spread).

### Eye flow
- Likely entry point sits in the middle center third—where contrast and brightness pull attention first.
- The simulated scan path visits 8 salient stops, traveling middle center → upper right → middle center → lower right ….
- The eye is pulled across many competing hotspots—a long, scattered path that weakens the sense of a single subject.

### Portrait balance
- Left/right weight is balanced (46% / 54%).
- Top/bottom weight is fairly even (52% / 48%).

## Tonal distribution
Shadow 26% · Dark 25% · Mid 18% · Light 16% · Highlight 15%

Visual weight center is nearest the **middle center** third.

## Suggested edits
1. Strengthen figure–ground separation: blur, darken, or simplify the background so the main subject clearly stands out, and tone down competing bright or high-detail areas outside it.
2. Reposition or crop so the main subject sits on a rule-of-thirds line or intersection (visual weight is currently nearest the middle center third), and trim empty space that weakens the focal point.
3. Lighting is fairly balanced — keep the tonal range and make only fine exposure/contrast tweaks.
4. Simplify the frame — attention currently bounces between many points. Reduce clutter so the eye settles on one clear subject.
5. Prioritise the weakest dimension first: **clarity**.

## Ask
Using this critique, edit the attached photo. Apply exposure, contrast, crop, background treatment, and dodge/burn as needed to raise the weakest scores. Return the edited image — not a plan or list of steps — and keep the result natural and recognizable.`;

const competingSubjectsMarkdown = `# Improvement instructions for AI

Use this automated, pixel-only critique of \`Competing subjects\` to improve the photo. The analysis inspects only pixels (tone, edges, and attention) and has no idea what the subject is, so treat these as technical hints, keep the subject recognisable, and fix the lowest-scoring areas first.

## Scores (0–100)
- **Overall:** 25 (Needs work)
- **Lighting:** 84
- **Composition:** 42
- **Visual clarity:** 7  ← weakest, start here

## Findings
### Visual clarity
- Several masses compete for attention (the runner-up holds 10%)—no clear focal hierarchy.
- 9 separate peak clusters remain after merging—scattered focal interest.
- The strongest region is a large, diffuse blob rather than a distinct subject—no single thing clearly owns the frame.
- Subject mass is sprawling rather than a tight visual unit.

### Composition
- Visual weight sits near a rule-of-thirds anchor (middle center)—classic compositional placement.
- Balance and thirds placement look acceptable, but competing masses or shape collisions weaken the composition.

### Lighting
- Contrast has healthy separation between lights and darks without looking completely flat.
- Light reads directional—brightest quadrant is top-right (50 levels spread).

### Eye flow
- Likely entry point sits in the middle center third—where contrast and brightness pull attention first.
- The simulated scan path visits 8 salient stops, traveling middle center → middle left → middle center → lower center ….
- The eye is pulled across many competing hotspots—a long, scattered path that weakens the sense of a single subject.

### Portrait balance
- Left/right weight is balanced (48% / 52%).
- Top/bottom weight is fairly even (52% / 48%).

## Tonal distribution
Shadow 9% · Dark 18% · Mid 43% · Light 25% · Highlight 6%

Visual weight center is nearest the **middle center** third.

## Suggested edits
1. Strengthen figure–ground separation: blur, darken, or simplify the background so the main subject clearly stands out, and tone down competing bright or high-detail areas outside it.
2. Reposition or crop so the main subject sits on a rule-of-thirds line or intersection (visual weight is currently nearest the middle center third), and trim empty space that weakens the focal point.
3. Lighting is fairly balanced — keep the tonal range and make only fine exposure/contrast tweaks.
4. Simplify the frame — attention currently bounces between many points. Reduce clutter so the eye settles on one clear subject.
5. Prioritise the weakest dimension first: **clarity**.

## Ask
Using this critique, edit the attached photo. Apply exposure, contrast, crop, background treatment, and dodge/burn as needed to raise the weakest scores. Return the edited image — not a plan or list of steps — and keep the result natural and recognizable.`;

const chaoticFrameMarkdown = `# Improvement instructions for AI

Use this automated, pixel-only critique of \`Chaotic frame\` to improve the photo. The analysis inspects only pixels (tone, edges, and attention) and has no idea what the subject is, so treat these as technical hints, keep the subject recognisable, and fix the lowest-scoring areas first.

## Scores (0–100)
- **Overall:** 47 (Needs work)
- **Lighting:** 72
- **Composition:** 49
- **Visual clarity:** 36  ← weakest, start here

## Findings
### Visual clarity
- Several masses compete for attention (the runner-up holds 15%)—no clear focal hierarchy.
- Background outside the subject is noticeably calmer than the subject mass.
- Subject and background blend at the edges—soft figure-ground separation.

### Composition
- Weight center falls in the upper left region—away from center but not on a third.

### Lighting
- Moderate contrast gives the frame some depth between bright and dark areas.
- Light reads directional—brightest quadrant is top-right (45 levels spread).

### Eye flow
- Likely entry point sits in the upper left third—where contrast and brightness pull attention first.
- The simulated scan path visits 8 salient stops, traveling upper left → middle center → lower left → lower right ….
- The eye is pulled across many competing hotspots—a long, scattered path that weakens the sense of a single subject.

### Portrait balance
- Left/right weight is balanced (48% / 52%).
- Top/bottom weight is fairly even (45% / 55%).

## Tonal distribution
Shadow 27% · Dark 20% · Mid 20% · Light 18% · Highlight 16%

Visual weight center is nearest the **middle center** third.

## Suggested edits
1. Strengthen figure–ground separation: blur, darken, or simplify the background so the main subject clearly stands out, and tone down competing bright or high-detail areas outside it.
2. Reposition or crop so the main subject sits on a rule-of-thirds line or intersection (visual weight is currently nearest the middle center third), and trim empty space that weakens the focal point.
3. Lighting is fairly balanced — keep the tonal range and make only fine exposure/contrast tweaks.
4. Simplify the frame — attention currently bounces between many points. Reduce clutter so the eye settles on one clear subject.
5. Prioritise the weakest dimension first: **clarity**.

## Ask
Using this critique, edit the attached photo. Apply exposure, contrast, crop, background treatment, and dodge/burn as needed to raise the weakest scores. Return the edited image — not a plan or list of steps — and keep the result natural and recognizable.`;

const busyActionShotMarkdown = `# Improvement instructions for AI

Use this automated, pixel-only critique of \`Busy action shot\` to improve the photo. The analysis inspects only pixels (tone, edges, and attention) and has no idea what the subject is, so treat these as technical hints, keep the subject recognisable, and fix the lowest-scoring areas first.

## Scores (0–100)
- **Overall:** 47 (Needs work)
- **Lighting:** 84
- **Composition:** 46
- **Visual clarity:** 32  ← weakest, start here

## Findings
### Visual clarity
- Several masses compete for attention (the runner-up holds 26%)—no clear focal hierarchy.
- 9 separate peak clusters remain after merging—scattered focal interest.
- Subject mass is sprawling rather than a tight visual unit.
- Subject outline is highly irregular—forms appear to collide or tangle at the boundary.

### Composition
- Visual weight sits near a rule-of-thirds anchor (middle center)—classic compositional placement.
- Balance and thirds placement look acceptable, but competing masses or shape collisions weaken the composition.

### Lighting
- Contrast has healthy separation between lights and darks without looking completely flat.
- Light reads directional—brightest quadrant is bottom-right (39 levels spread).

### Eye flow
- Likely entry point sits in the middle center third—where contrast and brightness pull attention first.
- The simulated scan path visits 8 salient stops, traveling middle center → middle right → upper left → lower center ….
- The eye is pulled across many competing hotspots—a long, scattered path that weakens the sense of a single subject.

### Portrait balance
- Left/right weight is balanced (50% / 50%).
- Vertical weight favors the bottom (30% / 70%).

## Tonal distribution
Shadow 3% · Dark 17% · Mid 61% · Light 18% · Highlight 2%

Visual weight center is nearest the **middle center** third.

## Suggested edits
1. Strengthen figure–ground separation: blur, darken, or simplify the background so the main subject clearly stands out, and tone down competing bright or high-detail areas outside it.
2. Reposition or crop so the main subject sits on a rule-of-thirds line or intersection (visual weight is currently nearest the middle center third), and trim empty space that weakens the focal point.
3. Lighting is fairly balanced — keep the tonal range and make only fine exposure/contrast tweaks.
4. Simplify the frame — attention currently bounces between many points. Reduce clutter so the eye settles on one clear subject.
5. Prioritise the weakest dimension first: **clarity**.

## Ask
Using this critique, edit the attached photo. Apply exposure, contrast, crop, background treatment, and dodge/burn as needed to raise the weakest scores. Return the edited image — not a plan or list of steps — and keep the result natural and recognizable.`;

function thread(
  sampleId: DemoSampleId,
  messages: ImplementationMessage[],
  summary?: ImplementationThreadSummary,
): ImplementationPhotoThread {
  const sample = getDemoSample(sampleId);
  return {
    sampleId,
    label: sample.label,
    description: sample.description,
    originalSrc: sample.src,
    messages,
    summary,
  };
}

/** Scripted ChatGPT workflow grouped by source photo (from a real share link). */
export const implementationPhotoThreads: ImplementationPhotoThread[] = [
  thread(
    "gardenTomatoes",
    [
      { role: "user", kind: "critique", markdown: gardenStillLifeMarkdown, showOriginal: true },
      {
        role: "assistant",
        kind: "image",
        alt: "Ripe tomatoes basking in golden sunlight",
        src: "/photo-chat-improvments/Aaron_DuChateau_garden-tomatoes-edit.png",
      },
    ],
    {
      beforeScore: 58,
      afterScore: 52,
      description:
        "For the picture of the tomato, the original score was 58. After performing revisions in ChatGPT, we can see that while the photo visually appears to be more cohesive and more impressive, it appears, though, the score went down to 52. This means we lost six points of an overall rating score, when we would expect the score to go up. There is clearly still a divergence in V1 between what is being suggested and the interpretation of the AI to make the image better and processing it a second time. It should also be noted that in the revised photograph, substantial modifications were made to the original subject matter in both framing and content. We should consider having a boolean that represents whether or not we are okay with this level of modification, such as subject reframing or subject redistribution.",
    },
  ),
  thread(
    "astronautMural",
    [
      { role: "user", kind: "critique", markdown: streetArtMuralMarkdown, showOriginal: true },
      {
        role: "assistant",
        kind: "image",
        alt: "Astronaut mural with child and ball",
        src: "/photo-chat-improvments/Aaron_DuChateau_astronaut-mural-edit.png",
      },
    ],
    {
      beforeScore: 77,
      afterScore: 76,
      description:
        "In this example we took the original photo, which was run through analysis the first time and received a score of 77 and an overall standing of good. After taking the recommendations and running them through our AI interpreter (GPT), the score remains strong but actually reduced by a point. This clearly means we need to modify some aspects of the algorithm, since the suggestion in this case is creating a score that is lower than what would be anticipated after using the feedback from the algorithm itself. You can also note the subject matter in the original photo was swapped out or modified, which could mean that in version 2 you might want to consider creating a boolean that indicates to what extent subjects can be modified or manipulated. Again, from the naked eye the photo appears to be more consistent and more visually appealing, yet our V1 expression of markdown generation — as consumed by ChatGPT and then reanalyzed — did not create an outcome that appeared to produce an increase in overall scoring.",
    },
  ),
  thread(
    "coupleThrones",
    [
      {
        role: "user",
        kind: "critique",
        markdown: couplePortraitMarkdown,
        showOriginal: true,
        replyToLabel: "Previous edit (street-art mural)",
      },
      {
        role: "assistant",
        kind: "image",
        alt: "A cozy moment in warm lighting",
        src: "/photo-chat-improvments/Aaron_DuChateau_couple-thrones-edit-1.png",
      },
      {
        role: "user",
        kind: "refinement",
        text: "the topical lighting on the womans face is too sharp on her forhead and on her cheak",
        replyToLabel: "Edited image",
      },
      {
        role: "assistant",
        kind: "image",
        alt: "Intimate moment with ornate backdrop",
        src: "/photo-chat-improvments/Aaron_DuChateau_couple-thrones-edit-2.png",
      },
      {
        role: "user",
        kind: "critique",
        markdown: couplePortraitMarkdown,
        showOriginal: false,
        replyToLabel: "Edited image",
      },
      {
        role: "assistant",
        kind: "image",
        alt: "Intimate moment in ornate space",
        src: "/photo-chat-improvments/Aaron_DuChateau_couple-thrones-edit-3.png",
      },
    ],
    {
      beforeScore: 73,
      afterScore: 49,
      description:
        "For the couple portrait, the original analysis returned a solid 73 with a good standing. After the markdown was consumed by GPT Image 2 across several revisions, the final image dropped sharply to 49 and fell into the needs-work tier. The largest losses came from lighting (84 to 60) and clarity (73 to 42): the regenerated frame relit both faces and softened the figure-ground separation the original relied on. This is a clear V1 divergence — the model made the image more attractive to the naked eye while erasing the exact qualities the critique was trying to protect. We should consider a configuration boolean that locks exposure and lighting whenever the original already scores well on that axis, instructing GPT Image 2 to preserve tone rather than re-render it, so that acting on the feedback pushes the score up instead of down.",
    },
  ),
  thread(
    "closeUpSmile",
    [
      { role: "user", kind: "critique", markdown: closeUpPortraitMarkdown, showOriginal: true },
      {
        role: "assistant",
        kind: "image",
        alt: "Close-up portrait with lifted shadows and calmer backdrop",
        src: "/photo-chat-improvments/Aaron_DuChateau_close-up-smile-edit.png",
      },
    ],
    {
      beforeScore: 78,
      afterScore: 83,
      description:
        "The close-up portrait started at 78 with a strong standing: visual clarity was already perfect at 100, while lighting dragged at 42 from crushed shadows (nearly half the pixels in the shadow bin). GPT Image 2 followed the markdown—lifted the deepest blacks, nudged exposure, and simplified the backdrop—without breaking the single subject mass. The rescored frame landed at Strong · 83, with clarity still at 100 and composition easing only slightly (64 to 61). This is a V1 success pattern: act on the weakest lighting axis while protecting the silhouette the analyzer already rewarded.",
    },
  ),
  thread(
    "mistyHillside",
    [
      { role: "user", kind: "critique", markdown: mistyLandscapeMarkdown, showOriginal: true },
      {
        role: "assistant",
        kind: "image",
        alt: "Misty morning in conifer forest",
        src: "/photo-chat-improvments/Aaron_DuChateau_misty-hillside-edit.png",
      },
    ],
    {
      beforeScore: 60,
      afterScore: 59,
      description:
        "For the misty landscape, the original scored 60 and the regenerated frame came back at 59 — effectively unchanged. Composition improved (61 to 70) but clarity slipped (62 to 51), netting a single-point loss. On a low-contrast fog scene the algorithm has little signal to grade, so the markdown produced a visually cleaner image without moving the number. This suggests our clarity metric is under-sensitive on soft, atmospheric subjects. A useful V2 tweak would be a scene-type hint — a boolean or enum for 'low-contrast / atmospheric' — that rebalances how heavily clarity is weighted, so genuine compositional gains are allowed to lift the overall score instead of being cancelled out.",
    },
  ),
  thread(
    "farmPigs",
    [
      { role: "user", kind: "critique", markdown: farmAnimalsMarkdown, showOriginal: true },
      {
        role: "assistant",
        kind: "image",
        alt: "Pigs in the golden hour light",
        src: "/photo-chat-improvments/Aaron_DuChateau_farm-pigs-edit.png",
      },
    ],
    {
      beforeScore: 70,
      afterScore: 23,
      description:
        "The farm-animals photo began at a healthy 70 with strong clarity (79). After GPT Image 2 processed the markdown, the overall cratered to 23 and clarity fell to 5 — one of the worst regressions in the set. Visually the frame is still appealing, but the model reworked the subjects and background enough that our figure-ground analysis can no longer find a dominant mass. This is the strongest argument yet for a subject-preservation boolean: a flag that constrains subject count and forbids adding, duplicating, or dispersing subjects during a regeneration. Paired with an algorithm guard that rejects any edit whose clarity drops below the original, we could stop V1 from 'improving' a photo straight into a lower score.",
    },
  ),
  thread(
    "charlieDog",
    [
      { role: "user", kind: "critique", markdown: charlieMarkdown, showOriginal: true },
      {
        role: "assistant",
        kind: "image",
        alt: "Golden lab in serene focus",
        src: "/photo-chat-improvments/Aaron_DuChateau_charlie-dog-edit.png",
      },
    ],
    {
      beforeScore: 38,
      afterScore: 60,
      description:
        "Charlie is our clearest success. The original scored just 38 (needs work) with a weak clarity of 23, and after the markdown was applied the overall climbed to 60 (good), with lighting jumping 60 to 84 and clarity more than doubling to 50. Here the V1 pipeline behaved exactly as intended: the critique identified the weak dimensions, GPT Image 2 acted on them, and the re-analysis confirmed the gain. The lesson for V2 is to detect what made this case work — a single, centered subject with clear room to improve — and to bias the markdown generator toward these high-confidence edits, while gating the riskier multi-subject scenes behind the subject-preservation boolean described elsewhere.",
    },
  ),
  thread(
    "patrickOnCarpet",
    [
      { role: "user", kind: "critique", markdown: patrickOnCarpetMarkdown, showOriginal: true },
      {
        role: "assistant",
        kind: "image",
        alt: "Relaxed dog on cozy carpet",
        src: "/photo-chat-improvments/Aaron_DuChateau_patrick-on-carpet-edit.png",
      },
    ],
    {
      beforeScore: 84,
      afterScore: 47,
      description:
        "Patrick on the carpet had the highest starting score in the group at 84 (strong), with near-perfect clarity of 96. The regenerated image fell all the way to 47, with clarity dropping to 29. This is the danger case of editing a photo that was already good: there was little to gain and a great deal to lose. We should add an algorithm guard — effectively a boolean threshold — that suppresses or heavily constrains edits when the original already scores above roughly 75, and instead returns a 'no meaningful improvement available' result. Re-rendering a strong image with a generative model almost always trades away the exact clarity that earned the high score.",
    },
  ),
  thread(
    "patrickPlayful",
    [
      { role: "user", kind: "critique", markdown: patrickPlayfulMarkdown, showOriginal: true },
      {
        role: "assistant",
        kind: "image",
        alt: "Cozy pup relaxes on cushion",
        src: "/photo-chat-improvments/Aaron_DuChateau_patrick-playful-edit.png",
      },
    ],
    {
      beforeScore: 22,
      afterScore: 57,
      description:
        "The playful pet pose is our second success story: it opened at a very low 22 (needs work) with clarity of just 4, and the regenerated frame rose to 57 (good) with clarity recovering to 49. As with Charlie, a low-scoring original built around a single expressive subject gave the markdown plenty of room to help, and the numbers moved the right direction. This reinforces a V2 heuristic: the lower and simpler the starting frame, the more reliably V1 improves it. We could expose a confidence estimate — derived from starting score and subject count — and only auto-apply edits above a confidence boolean, routing uncertain cases to manual review.",
    },
  ),
  thread(
    "busyFountain",
    [
      { role: "user", kind: "critique", markdown: competingSubjectsMarkdown, showOriginal: true },
      {
        role: "assistant",
        kind: "image",
        alt: "Sunny portrait with fountain backdrop",
        src: "/photo-chat-improvments/Aaron_DuChateau_competing-subjects-edit.png",
      },
    ],
    {
      beforeScore: 25,
      afterScore: 42,
      description:
        "The competing-subjects frame started at 25 (needs work), our lowest original clarity at 7. After the markdown pass the overall rose to 42 — a real improvement, though still short of the good tier. GPT Image 2 simplified the scene enough to lift clarity to 32, but multiple masses still fight for attention. This is partial success: the direction is right but V1 does not push far enough in a single pass. A helpful tweak would be an iteration boolean that re-feeds the still-low result back through analysis and markdown until the score crosses a target threshold or a max-iterations cap is hit, letting the pipeline converge rather than stopping after one round.",
    },
  ),
  thread(
    "chaoticFisheye",
    [
      { role: "user", kind: "critique", markdown: chaoticFrameMarkdown, showOriginal: true },
      {
        role: "assistant",
        kind: "image",
        alt: "Sporty street style with bold sunglasses",
        src: "/photo-chat-improvments/Aaron_DuChateau_chaotic-frame-edit.png",
      },
    ],
    {
      beforeScore: 47,
      afterScore: 53,
      description:
        "The chaotic fisheye frame moved from 47 (needs work) to 53 (good) after processing — a modest but genuine gain that crossed the tier boundary. Lighting improved (72 to 80) and clarity ticked up (36 to 45), so the markdown nudged the frame toward a clearer focal mass without fully resolving the clutter. This is roughly the outcome we want from V1, just smaller than ideal. As with the fountain, an iterative re-analysis loop — gated by a boolean and a target score — would let us keep applying the critique until the improvement plateaus, capturing more of the available headroom in a single workflow.",
    },
  ),
  thread(
    "beachJump",
    [
      { role: "user", kind: "critique", markdown: busyActionShotMarkdown, showOriginal: true },
      {
        role: "assistant",
        kind: "image",
        alt: "Beach stunt on a sunny day",
        src: "/photo-chat-improvments/Aaron_DuChateau_busy-action-shot-edit.png",
      },
    ],
    {
      beforeScore: 47,
      afterScore: 33,
      description:
        "The busy action shot regressed from 47 to 33, with clarity falling from 32 to 15. The scattered subjects across a wide beach gave the model too much freedom, and the regeneration spread attention even further rather than consolidating it. This mirrors the farm-animals failure: multi-subject, wide-frame scenes are where V1 is most likely to make things worse. The fix is the same subject-preservation and clarity-guard booleans — refuse any edit that lowers clarity, and constrain the model from redistributing or multiplying subjects — so an action frame is tightened around one clear focal point instead of being re-scattered.",
    },
  ),
];
