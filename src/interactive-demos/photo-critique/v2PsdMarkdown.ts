/** Product Spec Document (PSD) for Photo critique v2 — complement to a PRD. */
export const v2PsdMarkdown = `# Product Spec Document (PSD)
## Photo critique v2

| Field | Value |
|---|---|
| **Document type** | Product Spec (PSD) — *how* to build; complements a PRD (*what* / *why*) |
| **Status** | Draft from Self QA v1 findings |
| **Product** | Photo critique |
| **Version** | v2 |
| **Inputs** | Self QA v1 threads + live pixel rescans of GPT Image 2 outputs |
| **Audience** | Engineering / design implementing the next markdown + constraint layer |

---

## 1. Overview

Photo critique v1 proved that a **client-side, pixel-only** pass can produce improvement markdown without a frontier model. Self QA v1 showed that when that markdown is consumed by GPT Image 2 and the result is rescanned, scores often **fall** even when the image looks better to a human.

This PSD specifies **how** v2 should constrain the AI edit path and the markdown generator so a post-edit rescan is more likely to improve (or at least not collapse) the same metrics.

---

## 2. Problem statement

1. Overall score is dominated by **visual clarity / subject mass** (\`~0.5\` weight) plus a clarity ceiling. Edits that redistribute subjects, soft-blur figure–ground, or invent new masses get punished hard.
2. The markdown tells the model *what to improve* but does not adequately tell it *what not to destroy*.
3. **Critical oversight (v1):** We never explicitly instructed the AI — in the improvement markdown — to **skip its own form of pixel / low-level image analysis** and to treat the attached client-generated critique as the authoritative technical pass.

That omission is a large failure relative to the experiment’s thesis. The whole point of offsetting static analysis to the browser is to **avoid burning tokens on redundant thought cycles** over luminance, edges, saliency, thirds, and figure–ground. If the model silently re-runs (or re-reasons) that stack anyway, we pay twice and still get unconstrained “creative” edits that fight our scorer.

**v2 requirement:** The markdown must state, in plain language the model cannot ignore, that low-level pixel analysis has **already been completed on-device**, that those scores and findings are source of truth for technical edits, and that the model should **not** spend tokens re-deriving equivalent measurements.

---

## 3. Goals

- Raise the odds that markdown → AI edit → client rescan yields a **higher or stable** overall score.
- Keep the client analyzer as the single technical authority for lighting / composition / clarity.
- Encode **explicit policy flags** (booleans) into the markdown so edit scope is constrained.
- Preserve intentional user style shifts (e.g. B&W) without treating them as clarity defects.

## 4. Non-goals

- Replacing GPT Image 2 with a custom generative model.
- Teaching the pixel scorer to detect faces, objects, or scene semantics.
- Hand-tuning per-image demo score overrides (audit confirmed none exist today).

---

## 5. Solution overview

\`\`\`
Client pixel pass (v1)
  → Improvement markdown
       + HARD: skip redundant AI pixel analysis
       + Policy booleans (orientation, subject, lighting, style, skip-if-strong, clarity floor)
  → GPT Image 2 edit
  → Client rescan
  → Optional iterate until target / max rounds
\`\`\`

---

## 6. Functional requirements

### 6.1 Markdown contract (must emit)

1. **Skip-AI-pixel-analysis directive (P0)**  
   Explicit block near the top of every improvement markdown, e.g.:

   > Low-level pixel analysis (luminance, contrast, edges, saliency, thirds, figure–ground, etc.) has already been performed in the user’s browser. Do **not** re-run or re-reason that analysis. Use the scores, findings, and suggested edits below as the technical source of truth. Spend capacity on applying those edits while preserving the subject.

2. **Policy booleans** written into the prompt (and optionally enforced in pipeline):

   | Flag | Spec |
   |---|---|
   | \`orientationLock\` | Preserve taller-vs-wider frame; no aspect flip |
   | \`allowSubjectReframe\` | Crop / reposition subject mass |
   | \`allowSubjectRedistribution\` | Change subject count, identity, or layout |
   | \`allowStyleShift\` | Intentional style (e.g. color → B&W) |
   | \`skipEditIfStrong\` | No regen when overall ≥ ~75 |
   | \`preserveLighting\` | When lighting already strong, no full re-light |
   | \`maxClarityDrop\` | Reject / warn if rescan clarity < original |

3. **Geometry from pixels alone** may set \`orientationLock\` from \`width\` vs \`height\`. Semantic portrait-vs-landscape *policy* and “OK to redistribute subjects?” remain **user/pipeline config**, not invented by the scorer.

### 6.2 Pipeline guards

- If \`skipEditIfStrong\` and overall ≥ threshold → return “no meaningful edit” instead of regenerating.
- If \`maxClarityDrop\` breached on rescan → discard edit or re-prompt with stricter subject-preservation language.
- Optional **iteration loop**: markdown → edit → rescan until target score or max rounds (needed for competing-subjects / chaotic-frame cases).

### 6.3 Scorer adjustments (paired with markdown)

- When \`allowStyleShift\` / monochrome detected: score figure–ground on **luminance**, do not punish loss of color contrast as clarity failure.
- Optional atmospheric / low-contrast scene hint to rebalance clarity weight (misty landscapes).

---

## 7. Evidence from Self QA v1 (acceptance guidance)

| Thread | Before → After | Spec implication |
|---|---|---|
| Garden still-life | 58 → 52 | \`allowSubjectRedistribution: false\`; keep crop + subject |
| Street-art mural | 77 → 76 | \`skipEditIfStrong\` / micro-edits only |
| Couple portrait | 73 → 49 | \`preserveLighting: true\` when lighting ≥ ~80 |
| Close-up portrait | 78 → 83 | Lift crushed shadows only; protect clarity silhouette |
| Misty landscape | 60 → 59 | Atmospheric scene hint |
| Farm animals | 70 → 23 | Subject preservation + clarity floor (worst case) |
| Charlie | 38 → 60 | Success pattern — keep |
| Patrick on carpet | 84 → 47 | Hard skip-if-strong |
| Patrick playful | 22 → 57 | Success — confidence gate |
| Competing subjects | 25 → 42 | Iteration loop |
| Chaotic frame | 47 → 53 | Iteration loop |
| Busy action shot | 47 → 33 | Subject preservation + clarity floor |

---

## 8. Success metrics

- Majority of Self QA threads show **non-negative** overall delta after v2 markdown + same model.
- Farm-animals / busy-action / carpet-style regressions reduced (clarity drop bounded by \`maxClarityDrop\`).
- Token / latency proxy: model responses show less re-derivation of pixel metrics (qualitative prompt audit + optional length/cost comparison).

---

## 9. Risks & open questions

- Models may ignore the skip-pixel-analysis directive unless it is repeated and placed first.
- Over-constraining edits may produce boring but high-scoring images — product choice.
- Should \`maxClarityDrop\` hard-fail the edit in UI, or only annotate Self QA?

---

## 10. Out of scope for this PSD

- Full PRD (business case, personas, roadmap sequencing) — maintain separately.
- Rewriting the core attention / clarity math beyond the style and atmosphere adjustments above.
`;
