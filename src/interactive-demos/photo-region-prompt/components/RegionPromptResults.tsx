"use client";

import { useState } from "react";
import { CritiqueContentHeader } from "@/interactive-demos/photo-critique/components/CritiqueContentHeader";
import {
  critiqueChromePadX,
  critiqueMutedClass,
  critiquePanelClass,
  critiqueScrollPadL,
  critiqueSectionTitleClass,
} from "@/interactive-demos/photo-critique/components/photo-critique-layout";
import { bboxToPixels, cornerHits, cornerProximityPx, toPixels } from "../polygon";
import type { RegionReport } from "../types";
import { MaskDownloads } from "./MaskDownloads";
import { PromptMarkdown } from "./PromptMarkdown";
import { RegionPreviewGrid } from "./RegionPreviewGrid";

type Props = {
  report: RegionReport;
  onClose: () => void;
  onTryAnotherUpload: () => void;
  onSeeOriginalProblem: () => void;
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={`${critiquePanelClass} px-4 py-3 text-center`}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-surface-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-accent-100">{value}</p>
    </div>
  );
}

export function RegionPromptResults({
  report,
  onClose,
  onTryAnotherUpload,
  onSeeOriginalProblem,
}: Props) {
  const [showOriginal, setShowOriginal] = useState(true);
  const [showIsolated, setShowIsolated] = useState(true);
  const [showApplied, setShowApplied] = useState(true);
  const pixelBBox = bboxToPixels(report.bbox, report.width, report.height);
  const vertexCount = report.points.length;
  const first = toPixels(report.points.slice(0, 1), report.width, report.height)[0];
  const hits = cornerHits(report.points, report.width, report.height);
  const cornerLimit = cornerProximityPx(report.width, report.height);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CritiqueContentHeader label="Prompt for" emphasis={report.fileName} onClose={onClose} />

      <div className={`mb-2 flex shrink-0 flex-wrap gap-2 ${critiqueChromePadX}`}>
        <button
          type="button"
          onClick={() => setShowOriginal((v) => !v)}
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition ${
            showOriginal
              ? "border-accent-500/50 bg-accent-950/40 text-accent-200"
              : "border-white/15 text-surface-400 hover:text-surface-200"
          }`}
        >
          Original
        </button>
        <button
          type="button"
          onClick={() => setShowIsolated((v) => !v)}
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition ${
            showIsolated
              ? "border-accent-500/50 bg-accent-950/40 text-accent-200"
              : "border-white/15 text-surface-400 hover:text-surface-200"
          }`}
        >
          Isolated region
        </button>
        <button
          type="button"
          onClick={() => setShowApplied((v) => !v)}
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition ${
            showApplied
              ? "border-amber-400/50 bg-amber-950/40 text-amber-200"
              : "border-white/15 text-surface-400 hover:text-surface-200"
          }`}
        >
          Applied change
        </button>
      </div>

      <div className={`min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1 ${critiqueScrollPadL}`}>
        <RegionPreviewGrid
          report={report}
          showOriginal={showOriginal}
          showIsolated={showIsolated}
          showApplied={showApplied}
        />

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Photo size" value={`${report.width}×${report.height}`} />
          <Stat label="Vertices" value={String(vertexCount)} />
          <Stat
            label="Bounding box"
            value={`${pixelBBox.w}×${pixelBBox.h}`}
          />
          <Stat label="Operation" value={report.operation === "add" ? "Add" : "Remove"} />
        </div>

        <p className="text-[10px] text-surface-600">
          Comparison frames only — no eye flow or heat map. Isolated is the bounding box of the
          polygon (max borders). Applied is a local stub of intent, not a generated photograph.
        </p>

        {hits.length > 0 ? (
          <div className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            <p className="font-semibold">Failure — photo-corner in the drawing</p>
            <p className="mt-1 text-xs leading-relaxed text-red-200/80">
              A corner of photo 1 is inside the polygon or within {cornerLimit} px of a vertex. The
              markdown tells the model not to apply the edit.
            </p>
            <ul className="mt-2 list-inside list-disc text-xs text-red-100/90">
              {hits.map((h) => (
                <li key={`${h.corner}-${h.kind}`}>
                  {h.corner}
                  {h.kind === "inside-polygon"
                    ? " — inside the polygon"
                    : ` — ${h.distancePx} px from a vertex`}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className={`${critiquePanelClass} px-4 py-3`}>
          <h3 className={critiqueSectionTitleClass}>Instruction</h3>
          <p className={`mt-2 ${critiqueMutedClass}`}>{report.instruction}</p>
          {first ? (
            <p className="mt-2 font-mono text-[10px] text-surface-500">
              First vertex (px): ({first.x}, {first.y}) · box origin: ({pixelBBox.x}, {pixelBBox.y})
            </p>
          ) : null}
        </div>

        <MaskDownloads report={report} />

        <PromptMarkdown report={report} />
      </div>

      <div className={`mt-3 shrink-0 space-y-3 ${critiqueChromePadX}`}>
        <div className={`${critiquePanelClass} px-4 py-3`}>
          <p className={critiqueSectionTitleClass}>What to do next</p>
          <p className={`mt-1.5 ${critiqueMutedClass}`}>
            Take the mask image and the prompt, and submit both to ChatGPT or your favorite AI image
            editor.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onTryAnotherUpload}
          className="flex-1 rounded-full bg-accent-500/90 px-5 py-2.5 text-sm font-semibold text-surface-950 hover:bg-accent-400"
        >
          Try another photo
        </button>
        <button
          type="button"
          onClick={onSeeOriginalProblem}
          className="flex-1 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-surface-200 hover:border-white/35 hover:bg-white/10"
        >
          The original problem
        </button>
        </div>
      </div>
    </div>
  );
}
