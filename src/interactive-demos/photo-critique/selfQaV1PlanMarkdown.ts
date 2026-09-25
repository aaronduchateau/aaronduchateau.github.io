/** Static V2 roadmap shown under the Self QA v1 thread grid. */
export const selfQaV1PlanMarkdown = `# Self QA v1 → V2 plan

## Audit recap

Demo and Self QA “before” scores come from the **same pixel-only algorithm**. There is no per-image score table and no conditional inflation for demo photos. Self QA “after” scores are live re-analyses of the GPT Image 2 outputs from each thread.

When a visually nicer edit scores lower, that is **metric divergence** — usually a clarity / subject-mass collapse — not fake boosting of the original.

Overall blends roughly \`0.2×lighting + 0.3×composition + 0.5×clarity\`, then caps the total when clarity is poor. Edits that redistribute subjects or weaken figure–ground separation get punished hard even if they look better to a human.

---

## Boolean overrides (proposed)

These flags would be written into the improvement markdown the AI consumes (and optionally enforced by the pipeline later):

| Flag | Intent |
|---|---|
| \`orientationLock\` | Keep portrait vs landscape **frame** (taller vs wider); forbid crop/reframe that flips aspect |
| \`allowSubjectReframe\` | Allow / forbid repositioning or cropping the subject mass |
| \`allowSubjectRedistribution\` | Allow / forbid changing subject count, identity, or layout |
| \`allowStyleShift\` | Allow intentional style changes (e.g. color → black and white) |
| \`skipEditIfStrong\` | Do not regenerate when overall is already ≥ ~75 |
| \`preserveLighting\` | When lighting is already strong, instruct the AI not to re-light |
| \`maxClarityDrop\` | Reject or warn if rescan clarity falls below the original |

---

## Can this be done with pixel analysis alone (no AI)?

**Partial yes for geometry; no for semantic policy.**

| Signal | Pixel-only? | Why |
|---|---|---|
| Frame orientation (taller vs wider) | **Yes** | Compare decoded \`width\` vs \`height\` — already available on the report |
| “Portrait” as a *person photo* vs “landscape” as *scenery* | **No (reliably)** | The algo has no subject class; saliency peaks cannot tell a face from a mural from a pig |
| Single vs multi-subject mass | **Partially** | Clarity metrics already expose competing peaks and dominance — usable as a soft \`multiSubject\` hint |
| Intentional B&W / style | **Partially** | Low chroma can hint monochrome; it cannot know the user *wanted* a style shift |
| “OK to reframe / redistribute subjects?” | **No from pixels alone** | That is a product/policy boolean — must be user- or pipeline-supplied |

**Conclusion:** Boolean overrides should be **explicit pipeline/user config** (plus cheap aspect-ratio lock). Do not pretend a pixel-only classifier can choose portrait-vs-landscape *policy* for GPT Image 2. Aspect-ratio lock is the only honest free lunch from pixels alone.

---

## Per-thread recommendations (raise rescan score odds)

What to change in the markdown / booleans so an AI following V1 instructions is more likely to produce a higher score after re-analysis:

### Garden still-life — 58 → 52 (−6)
Set \`allowSubjectRedistribution: false\`. Instruct: keep the same tomato cluster and framing; only exposure, contrast, and background simplify. Forbid inventing new fruit or changing crop.

### Street-art mural — 77 → 76 (−1)
Enable \`skipEditIfStrong\` or allow micro-edits only. Explicitly forbid swapping / adding foreground subjects (child, ball). High starters have little upside and lots of downside.

### Couple portrait — 73 → 49 (−24)
Set \`preserveLighting: true\` when lighting ≥ ~80. Markdown should allow soft dodge/burn only — no full re-light of both faces. The drop was driven by lighting (84→60) and clarity (73→42).

### Close-up portrait — 78 → 83 (+5)
**Success pattern.** Lighting was the only weak axis (42) under an already-perfect clarity score (100). Instruct GPT Image 2 to lift crushed shadows and calm the backdrop only — do not re-sculpt the subject mass. Clarity held at 100; composition stayed near the original (64→61).

### Misty landscape — 60 → 59 (−1)
Add an atmospheric / low-contrast scene hint. Down-weight clarity so composition gains (61→70) can lift overall instead of being cancelled by a soft fog scene.

### Farm animals — 70 → 23 (−47)
Strongest case for subject preservation + clarity guard. Forbid adding, duplicating, or dispersing animals. Reject the edit if clarity drops below the original. Clarity 79→5 is a redistribution failure, not “demo inflation.”

### Charlie — 38 → 60 (+22)
**Success pattern.** Keep biasing the markdown generator toward single, centered subjects with low starting scores — room to improve without inventing new masses.

### Patrick on carpet — 84 → 47 (−37)
Hard \`skipEditIfStrong\` threshold. Do not regenerate frames that already score strong (~75+). Re-rendering a clear subject almost always trades away the clarity that earned the high score.

### Patrick playful — 22 → 57 (+35)
**Success pattern.** Confidence gate: low start score + single expressive subject → auto-apply. Route uncertain multi-subject cases behind the redistribution boolean instead.

### Competing subjects — 25 → 42 (+17)
Direction is right but one pass is not enough. Add an iteration loop: markdown → edit → rescan until a target score or max rounds.

### Chaotic frame — 47 → 53 (+6)
Same iterative loop to capture remaining headroom after a modest first gain.

### Busy action shot — 47 → 33 (−14)
Same guards as farm animals: subject preservation + clarity floor. Instruct the AI to tighten around one focal mass — do not re-scatter subjects across a wide beach.

---

## Closing thesis

Either the markdown generator **constrains the AI** to operate inside the metric’s blind spots (clarity / subject mass), or the scorer **stops punishing allowed edits** (B&W, soft atmospheres). Boolean overrides are the bridge. Most of them cannot be invented from pixels alone — they must be stated up front in the instructions GPT Image 2 consumes.
`;
