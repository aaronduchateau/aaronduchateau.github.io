"use client";

import type { CritiqueReport } from "../types";
import { EyeFlowOverlay } from "./EyeFlowOverlay";
import { VisualWeightCompare } from "./VisualWeightCompare";

type Props = {
  src: string;
  alt: string;
  report: CritiqueReport;
  showEyeFlow: boolean;
  showThirds: boolean;
  showHeatmap: boolean;
};

export function CritiquePreviewGrid({
  src,
  alt,
  report,
  showEyeFlow,
  showThirds,
  showHeatmap,
}: Props) {
  const imageAspect =
    report.width > 0 && report.height > 0 ? report.width / report.height : undefined;

  return (
    <div className="grid min-h-0 grid-cols-1 gap-2 sm:grid-cols-2">
      <div className="min-h-0 min-w-0">
        <EyeFlowOverlay
          src={src}
          alt={alt}
          eyeFlowPath={report.eyeFlowPath}
          heatmap={report.heatmap}
          imageAspect={imageAspect}
          showEyeFlow={showEyeFlow}
          showThirds={showThirds}
          showHeatmap={showHeatmap}
        />
      </div>

      <div className="min-h-0 min-w-0">
        <VisualWeightCompare
          src={src}
          alt={alt}
          report={report}
          imageAspect={imageAspect}
        />
      </div>
    </div>
  );
}
