"use client";

import { useEffect, useState } from "react";
import { EnterSplash } from "@/components/EnterSplash";
import { CritiqueResults } from "./components/CritiqueResults";
import { ImplementationThreadView } from "./components/ImplementationChat";
import { PhotoInput } from "./components/PhotoInput";
import { CritiqueContentHeader } from "./components/CritiqueContentHeader";
import { usePhotoCritique } from "./usePhotoCritique";

const TRY_YOURSELF_EVENT = "photo-critique:try-yourself";

function AnalyzingPreview({
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
      <CritiqueContentHeader label="Analyzing" emphasis={fileName} onClose={onCancel} />

      <div className="relative min-h-0 flex-1 overflow-hidden border border-white/10 bg-black [border-radius:8px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- blob/local URLs */}
        <img src={previewUrl} alt={fileName} className="absolute inset-0 h-full w-full object-contain opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent-400/30 border-t-cyan-300" />
          <span className="text-sm font-semibold text-accent-100">Analyzing pixels…</span>
          <span className="text-[11px] text-surface-400">Runs entirely in your browser</span>
        </div>
      </div>
    </div>
  );
}

export function PhotoCritiqueDemo() {
  const demo = usePhotoCritique();
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
        <EnterSplash
          message="Static analysis for photo improvement before AI consumption — an experiment"
          onContinue={() => setShowSplash(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {demo.report && demo.previewUrl && demo.fileName && demo.resultSource ? (
        <CritiqueResults
          report={demo.report}
          previewUrl={demo.previewUrl}
          fileName={demo.fileName}
          resultSource={demo.resultSource}
          onClose={demo.clearResults}
          onTryAnotherUpload={demo.returnToUpload}
          onTryADemo={demo.returnToDemo}
          onSeeV1Results={demo.returnToSelfQa}
          onTryAnotherDemo={demo.returnToDemo}
        />
      ) : demo.analyzing && demo.previewUrl && demo.fileName ? (
        <AnalyzingPreview
          previewUrl={demo.previewUrl}
          fileName={demo.fileName}
          onCancel={demo.clearResults}
        />
      ) : demo.implementationThreadId ? (
        <ImplementationThreadView
          threadId={demo.implementationThreadId}
          onClose={demo.closeImplementationThread}
        />
      ) : (
        <PhotoInput
          inputMode={demo.inputMode}
          onInputModeChange={demo.setInputMode}
          demoSampleId={demo.demoSampleId}
          onDemoSampleChange={demo.selectDemoSample}
          error={demo.error}
          analyzing={demo.analyzing}
          onFileSelect={demo.analyzeFile}
          onLaunchDemo={demo.launchDemo}
          onOpenImplementationThread={demo.openImplementationThread}
        />
      )}
    </div>
  );
}
