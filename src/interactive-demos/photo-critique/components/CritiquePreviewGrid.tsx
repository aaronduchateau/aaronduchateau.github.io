"use client";

import type { CritiqueReport } from "../types";
import { EyeFlowOverlay } from "./EyeFlowOverlay";
import { PlainPhotoPreview } from "./PlainPhotoPreview";
import { SuggestedEditPreview } from "./SuggestedEditPreview";

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
    <div className="grid min-h-0 grid-cols-1 gap-2 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
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

      <div className="flex min-w-0 flex-col gap-2">
        <PlainPhotoPreview src={src} alt={`Original ${alt}`} imageAspect={imageAspect} />
        <SuggestedEditPreview
          src={src}
          alt={`Suggested visual weight for ${alt}`}
          report={report}
          imageAspect={imageAspect}
        />
      </div>
    </div>
  );
}
