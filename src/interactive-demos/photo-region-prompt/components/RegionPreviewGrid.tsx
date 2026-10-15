"use client";

import type { RegionReport } from "../types";
import { RegionPreviewFrame } from "./RegionPreviewFrame";

type Props = {
  report: RegionReport;
  showOriginal: boolean;
  showIsolated: boolean;
  showApplied: boolean;
};

export function RegionPreviewGrid({ report, showOriginal, showIsolated, showApplied }: Props) {
  const count = Number(showOriginal) + Number(showIsolated) + Number(showApplied);
  const cols =
    count <= 1 ? "grid-cols-1" : count === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  if (count === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-black/60 px-4 py-6 text-center text-xs text-surface-500">
        Turn on Original, Isolated region, or Applied change to compare frames.
      </p>
    );
  }

  return (
    <div className={`grid min-h-0 gap-2 ${cols}`}>
      {showOriginal ? (
        <RegionPreviewFrame report={report} kind="original" label="Original" />
      ) : null}
      {showIsolated ? (
        <RegionPreviewFrame report={report} kind="isolated" label="Isolated region" />
      ) : null}
      {showApplied ? (
        <RegionPreviewFrame
          report={report}
          kind="applied"
          label={report.operation === "add" ? "Applied (add)" : "Applied (remove)"}
        />
      ) : null}
    </div>
  );
}
