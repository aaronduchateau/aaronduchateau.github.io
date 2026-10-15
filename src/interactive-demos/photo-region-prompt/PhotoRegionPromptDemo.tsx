"use client";

import { useEffect, useState } from "react";
import { EnterSplash } from "@/components/EnterSplash";
import { CritiqueContentHeader } from "@/interactive-demos/photo-critique/components/CritiqueContentHeader";
import { RegionDrawView } from "./components/RegionDrawView";
import { RegionPromptInput } from "./components/RegionPromptInput";
import { RegionPromptResults } from "./components/RegionPromptResults";
import type { EnterSplashConfig } from "@/components/EnterSplash";
import enterSplash from "./enterSplash.json";
import { successTryThisPhoto } from "./successesContent";
import { usePhotoRegionPrompt } from "./usePhotoRegionPrompt";

const splash = enterSplash as EnterSplashConfig;

const TRY_YOURSELF_EVENT = "photo-region-prompt:try-yourself";

function BuildingPreview({
  previewUrl,
  fileName,
  onCancel,
}: {
  previewUrl: string;
  fileName: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <CritiqueContentHeader label="Building prompt for" emphasis={fileName} onClose={onCancel} />

      <div className="relative min-h-0 flex-1 overflow-hidden border border-white/10 bg-black [border-radius:8px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- blob/local URLs */}
        <img src={previewUrl} alt={fileName} className="absolute inset-0 h-full w-full object-contain opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent-400/30 border-t-cyan-300" />
          <span className="text-sm font-semibold text-accent-100">Building prompt…</span>
          <span className="text-[11px] text-surface-400">Runs entirely in your browser</span>
        </div>
      </div>
    </div>
  );
}

export function PhotoRegionPromptDemo() {
  const demo = usePhotoRegionPrompt();
  const { returnToUpload } = demo;
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const onTryYourself = () => {
      returnToUpload();
    };
    window.addEventListener(TRY_YOURSELF_EVENT, onTryYourself);
    return () => window.removeEventListener(TRY_YOURSELF_EVENT, onTryYourself);
  }, [returnToUpload]);

  if (showSplash) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <EnterSplash {...splash} onContinue={() => setShowSplash(false)} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {demo.report ? (
        <RegionPromptResults
          report={demo.report}
          onClose={demo.clearResults}
          onTryAnotherUpload={demo.returnToUpload}
          onSeeOriginalProblem={demo.returnToOriginalProblem}
        />
      ) : demo.building && demo.previewUrl && demo.fileName ? (
        <BuildingPreview
          previewUrl={demo.previewUrl}
          fileName={demo.fileName}
          onCancel={demo.clearResults}
        />
      ) : demo.drawing && demo.previewUrl && demo.fileName ? (
        <RegionDrawView
          previewUrl={demo.previewUrl}
          fileName={demo.fileName}
          points={demo.points}
          complete={demo.polygonComplete}
          operation={demo.operation}
          instruction={demo.instruction}
          error={demo.error}
          building={demo.building}
          onAddPoint={demo.addPoint}
          onDeleteLast={demo.deleteLastPoint}
          onComplete={demo.completePolygon}
          onClear={demo.clearPolygon}
          onOperationChange={demo.setOperation}
          onInstructionChange={demo.setInstruction}
          onBuild={demo.buildFromDrawing}
          onCancel={demo.returnToUpload}
        />
      ) : (
        <RegionPromptInput
          inputMode={demo.inputMode}
          onInputModeChange={demo.setInputMode}
          error={demo.error}
          building={demo.building}
          loadingSample={demo.loadingSample}
          onFileSelect={demo.beginUpload}
          onTryThisImage={() => {
            void demo.beginPublicPhoto(successTryThisPhoto.src, successTryThisPhoto.fileName);
          }}
          onTryYourOwnImage={demo.returnToUpload}
        />
      )}
    </div>
  );
}
