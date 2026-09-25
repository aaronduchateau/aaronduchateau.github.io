"use client";

import { useState } from "react";
import type { CritiqueReport } from "../types";
import { CritiquePreviewGrid } from "./CritiquePreviewGrid";
import { CritiqueContentHeader } from "./CritiqueContentHeader";
import { ImprovementInstructions } from "./ImprovementInstructions";
import {
  critiqueMutedClass,
  critiquePanelClass,
  critiqueSectionTitleClass,
  tierBadgeClass,
  tierLabel,
} from "./photo-critique-layout";

type Props = {
  report: CritiqueReport;
  previewUrl: string;
  fileName: string;
  resultSource: "demo" | "upload";
  onClose: () => void;
  onTryAnotherUpload: () => void;
  onTryADemo: () => void;
  onSeeV1Results: () => void;
  onTryAnotherDemo: () => void;
};

function ScoreCard({ label, score }: { label: string; score: number }) {
  return (
    <div className={`${critiquePanelClass} px-4 py-3 text-center`}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-surface-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-accent-100">{score}</p>
    </div>
  );
}

function NoteList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className={`${critiquePanelClass} px-4 py-3`}>
      <h3 className={critiqueSectionTitleClass}>{title}</h3>
      <ul className={`mt-2 space-y-2 ${critiqueMutedClass}`}>
        {items.map((note) => (
          <li key={note} className="list-inside list-disc">
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HistogramBar({ buckets }: { buckets: number[] }) {
  const labels = ["Shadow", "Dark", "Mid", "Light", "Highlight"];
  const max = Math.max(...buckets, 0.001);
  const chartHeight = 56;

  return (
    <div className={`${critiquePanelClass} px-4 py-3`}>
      <h3 className={critiqueSectionTitleClass}>Luminance spread</h3>
      <div className="mt-6 flex h-[4.5rem] items-end gap-2">
        {buckets.map((b, i) => {
          const pct = b * 100;
          const barPx = Math.max(3, Math.round((b / max) * chartHeight));
          return (
            <div key={labels[i]} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <span className="font-mono text-[10px] tabular-nums text-accent-300/90">{pct.toFixed(0)}%</span>
              <div
                className="w-full max-w-[3rem] rounded-t bg-accent-500/70"
                style={{ height: barPx }}
                title={`${labels[i]}: ${pct.toFixed(1)}% of pixels`}
              />
              <span className="text-[9px] text-surface-500">{labels[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CritiqueResults({
  report,
  previewUrl,
  fileName,
  resultSource,
  onClose,
  onTryAnotherUpload,
  onTryADemo,
  onSeeV1Results,
  onTryAnotherDemo,
}: Props) {
  const [showEyeFlow, setShowEyeFlow] = useState(true);
  const [showThirds, setShowThirds] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CritiqueContentHeader label="Critique for" emphasis={fileName} onClose={onClose} />

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1">
        <CritiquePreviewGrid
          src={previewUrl}
          alt={`Critique of ${fileName}`}
          report={report}
          showEyeFlow={showEyeFlow}
          showThirds={showThirds}
          showHeatmap={showHeatmap}
          onToggleEyeFlow={() => setShowEyeFlow((v) => !v)}
          onToggleThirds={() => setShowThirds((v) => !v)}
          onToggleHeatmap={() => setShowHeatmap((v) => !v)}
        />

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <ScoreCard label="Lighting" score={report.lightingScore} />
          <ScoreCard label="Composition" score={report.compositionScore} />
          <ScoreCard label="Visual clarity" score={report.clarityScore} />
          <div className={`${critiquePanelClass} flex flex-col items-center justify-center px-4 py-3`}>
            <p className="font-mono text-[10px] uppercase tracking-widest text-surface-500">Overall</p>
            <span
              className={`mt-1 rounded-full border px-3 py-1 text-xs font-semibold ${tierBadgeClass[report.tier]}`}
            >
              {tierLabel[report.tier]} · {report.overallScore}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-surface-600">
          Pixel-only guidance—no subject or emotion detection. Automated hints, not artistic judgment.
        </p>

        <NoteList title="Eye flow" items={report.eyeFlowNotes} />
        <NoteList title="Portrait balance" items={report.balanceNotes} />
        <NoteList title="Visual clarity" items={report.clarityNotes} />
        <NoteList title="Lighting" items={report.lightingNotes} />
        <NoteList title="Composition" items={report.compositionNotes} />
        <HistogramBar buckets={report.histogram} />

        <ImprovementInstructions report={report} fileName={fileName} />

        <p className={`${critiqueMutedClass} px-1`}>
          Visual weight center is nearest the <span className="text-accent-300/90">{report.nearestThird}</span> third.
        </p>

        {resultSource === "upload" ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onTryAnotherUpload}
              className="flex-1 rounded-full bg-accent-500/90 px-5 py-2.5 text-sm font-semibold text-surface-950 hover:bg-accent-400"
            >
              Try Another upload
            </button>
            <button
              type="button"
              onClick={onTryADemo}
              className="flex-1 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-surface-200 hover:border-white/35 hover:bg-white/10"
            >
              Try a demo
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onSeeV1Results}
              className="flex-1 rounded-full bg-accent-500/90 px-5 py-2.5 text-sm font-semibold text-surface-950 hover:bg-accent-400"
            >
              See V1 results
            </button>
            <button
              type="button"
              onClick={onTryAnotherDemo}
              className="flex-1 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-surface-200 hover:border-white/35 hover:bg-white/10"
            >
              Try another demo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
