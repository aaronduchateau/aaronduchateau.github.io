"use client";

import { useState } from "react";
import { AuditInput } from "./components/AuditInput";
import { AuditResults } from "./components/AuditResults";
import { useAuditDemo } from "./useAuditDemo";

function AuditSplash({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-8 px-6 text-center">
      <p className="max-w-md text-lg font-semibold leading-snug tracking-tight text-surface-100 sm:text-xl">
        Turn raw npm audit JSON into an actionable security dashboard — an experiment
      </p>
      <button
        type="button"
        onClick={onContinue}
        className="rounded-full bg-accent-500/90 px-8 py-2.5 text-sm font-semibold text-surface-950 hover:bg-accent-400"
      >
        Continue
      </button>
    </div>
  );
}

export function NpmAuditDemo() {
  const demo = useAuditDemo();
  const [showSplash, setShowSplash] = useState(true);

  const returnToStart = () => {
    demo.clearResults();
    setShowSplash(true);
  };

  if (showSplash) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <AuditSplash onContinue={() => setShowSplash(false)} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {demo.parsed ? (
        <AuditResults report={demo.parsed} onClose={returnToStart} />
      ) : (
        <AuditInput
          inputMode={demo.inputMode}
          onInputModeChange={demo.setInputMode}
          pasteText={demo.pasteText}
          onPasteTextChange={demo.setPasteText}
          demoSampleId={demo.demoSampleId}
          onDemoSampleChange={demo.selectDemoSample}
          parseError={demo.parseError}
          fileName={demo.fileName}
          onFileSelect={demo.submitFile}
          onSubmitPaste={demo.submitPaste}
          onLaunchDemo={demo.launchDemo}
        />
      )}
    </div>
  );
}
