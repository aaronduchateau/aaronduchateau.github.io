"use client";

import { useState } from "react";
import { EnterSplash } from "@/components/EnterSplash";
import { AuditInput } from "./components/AuditInput";
import { AuditResults } from "./components/AuditResults";
import { useAuditDemo } from "./useAuditDemo";

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
        <EnterSplash
          message="Turn raw npm audit JSON into an actionable security dashboard — an experiment"
          onContinue={() => setShowSplash(false)}
        />
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
