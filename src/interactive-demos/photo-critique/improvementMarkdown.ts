import type { CritiqueReport, CritiqueTier } from "./types";

const tierWord: Record<CritiqueTier, string> = {
  strong: "Strong",
  good: "Good",
  needsWork: "Needs work",
};

const HISTOGRAM_LABELS = ["Shadow", "Dark", "Mid", "Light", "Highlight"];

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

type Dimension = "lighting" | "composition" | "clarity";

function weakestDimension(report: CritiqueReport): Dimension {
  const entries: [Dimension, number][] = [
    ["lighting", report.lightingScore],
    ["composition", report.compositionScore],
    ["clarity", report.clarityScore],
  ];
  return entries.reduce((min, cur) => (cur[1] < min[1] ? cur : min))[0];
}

function lightingSuggestions(report: CritiqueReport): string[] {
  const [shadow, dark, mid, light, highlight] = report.histogram;
  const darkShare = shadow + dark;
  const brightShare = light + highlight;
  const out: string[] = [];

  if (shadow > 0.35) {
    out.push(
      "Lift the deepest shadows and nudge exposure up — a large share of pixels are crushed to black and losing detail.",
    );
  } else if (darkShare > 0.6) {
    out.push("Brighten the frame; it skews dark. Raise exposure/shadows so the subject is clearly lit.");
  }

  if (highlight > 0.25) {
    out.push("Recover clipped highlights and pull exposure down slightly — the brightest areas are blowing out.");
  }

  if (mid > 0.6 && brightShare < 0.15 && darkShare < 0.15) {
    out.push("Add global contrast; the tones are bunched in the midtones, so the image likely looks flat.");
  }

  if (!out.length) {
    out.push("Lighting is fairly balanced — keep the tonal range and make only fine exposure/contrast tweaks.");
  }
  return out;
}

function suggestedEdits(report: CritiqueReport): string[] {
  const out: string[] = [];

  if (report.clarityScore < 62) {
    out.push(
      "Strengthen figure–ground separation: blur, darken, or simplify the background so the main subject clearly stands out, and tone down competing bright or high-detail areas outside it.",
    );
  }

  if (report.compositionScore < 62) {
    out.push(
      `Reposition or crop so the main subject sits on a rule-of-thirds line or intersection (visual weight is currently nearest the ${report.nearestThird} third), and trim empty space that weakens the focal point.`,
    );
  }

  out.push(...lightingSuggestions(report));

  if (report.eyeFlowPath.length > 5) {
    out.push(
      "Simplify the frame — attention currently bounces between many points. Reduce clutter so the eye settles on one clear subject.",
    );
  }

  out.push(`Prioritise the weakest dimension first: **${weakestDimension(report)}**.`);
  return out;
}

/**
 * Turn a pixel-only critique report into English/Markdown guidance an AI can act
 * on. Deterministic — no model calls, just a readable framing of the analysis.
 */
export function buildImprovementMarkdown(report: CritiqueReport, fileName: string): string {
  const lines: string[] = [];
  const push = (line = "") => lines.push(line);
  const weakest = weakestDimension(report);
  const flag = (d: Dimension) => (weakest === d ? "  ← weakest, start here" : "");

  push("# Improvement instructions for AI");
  push();
  push(
    `Use this automated, pixel-only critique of \`${fileName}\` to improve the photo. The analysis inspects only pixels (tone, edges, and attention) and has no idea what the subject is, so treat these as technical hints, keep the subject recognisable, and fix the lowest-scoring areas first.`,
  );
  push();

  push("## Scores (0–100)");
  push(`- **Overall:** ${report.overallScore} (${tierWord[report.tier]})`);
  push(`- **Lighting:** ${report.lightingScore}${flag("lighting")}`);
  push(`- **Composition:** ${report.compositionScore}${flag("composition")}`);
  push(`- **Visual clarity:** ${report.clarityScore}${flag("clarity")}`);
  push();

  const findingGroups = [
    { title: "Visual clarity", items: report.clarityNotes },
    { title: "Composition", items: report.compositionNotes },
    { title: "Lighting", items: report.lightingNotes },
    { title: "Eye flow", items: report.eyeFlowNotes },
    { title: "Portrait balance", items: report.balanceNotes },
  ].filter((group) => group.items.length > 0);

  if (findingGroups.length) {
    push("## Findings");
    for (const group of findingGroups) {
      push(`### ${group.title}`);
      for (const item of group.items) push(`- ${item}`);
      push();
    }
  }

  push("## Tonal distribution");
  push(report.histogram.map((bucket, i) => `${HISTOGRAM_LABELS[i]} ${pct(bucket)}`).join(" · "));
  push();
  push(`Visual weight center is nearest the **${report.nearestThird}** third.`);
  push();

  push("## Suggested edits");
  suggestedEdits(report).forEach((edit, i) => push(`${i + 1}. ${edit}`));
  push();

  push("## Ask");
  push(
    "Using this critique, edit the attached photo. Apply exposure, contrast, crop, background treatment, and dodge/burn as needed to raise the weakest scores. Return the edited image — not a plan or list of steps — and keep the result natural and recognizable.",
  );

  return lines.join("\n");
}
