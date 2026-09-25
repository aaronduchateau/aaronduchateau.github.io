"use client";

import { useRef } from "react";
import {
  auditInputTabActiveClass,
  auditInputTabClass,
  auditInputTabInactiveClass,
  auditPanelClass,
} from "./audit-layout";
import { demoSamples, type DemoSampleId } from "../demoSamples";
import type { AuditInputMode } from "../types";

type Props = {
  inputMode: AuditInputMode;
  onInputModeChange: (mode: AuditInputMode) => void;
  pasteText: string;
  onPasteTextChange: (text: string) => void;
  demoSampleId: DemoSampleId;
  onDemoSampleChange: (id: DemoSampleId) => void;
  parseError: string | null;
  fileName: string | null;
  onFileSelect: (file: File) => void;
  onSubmitPaste: () => void;
  onLaunchDemo: () => void;
};

export function AuditInput({
  inputMode,
  onInputModeChange,
  pasteText,
  onPasteTextChange,
  demoSampleId,
  onDemoSampleChange,
  parseError,
  fileName,
  onFileSelect,
  onSubmitPaste,
  onLaunchDemo,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs: { mode: AuditInputMode; label: string }[] = [
    { mode: "upload", label: "Upload file" },
    { mode: "paste", label: "Paste JSON" },
    { mode: "demo", label: "Demo" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap gap-2">
        {tabs.map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            onClick={() => onInputModeChange(mode)}
            className={`${auditInputTabClass} ${
              inputMode === mode ? auditInputTabActiveClass : auditInputTabInactiveClass
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={`mt-4 min-h-0 flex-1 ${auditPanelClass} p-5`}>
        {inputMode === "upload" ? (
          <div className="flex h-full flex-col">
            <p className="text-sm text-surface-400">
              Drop an <code className="text-accent-400">audit.json</code> file or click below to browse.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileSelect(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) onFileSelect(file);
              }}
              className="mt-4 flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-black/40 px-6 py-12 transition hover:border-accent-500/40 hover:bg-accent-950/20"
            >
              <span className="text-3xl text-accent-500/60" aria-hidden>
                ↑
              </span>
              <span className="mt-3 text-sm font-semibold text-accent-200">Drop audit.json here</span>
              <span className="mt-1 text-xs text-surface-500">or click to select a file</span>
              {fileName ? (
                <span className="mt-4 rounded bg-surface-900 px-3 py-1 font-mono text-xs text-accent-300">
                  {fileName}
                </span>
              ) : null}
            </button>
          </div>
        ) : null}

        {inputMode === "paste" ? (
          <div className="flex h-full min-h-0 flex-col">
            <p className="shrink-0 text-sm text-surface-400">
              Paste the output of <code className="text-accent-400">npm audit --json</code>.
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => onPasteTextChange(e.target.value)}
              spellCheck={false}
              className="mt-3 min-h-[280px] flex-1 resize-y rounded-lg border border-white/10 bg-black/60 px-4 py-3 font-mono text-xs leading-relaxed text-surface-200 outline-none focus:border-accent-500/40"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              {parseError ? <p className="text-xs text-red-400">{parseError}</p> : <span />}
              <button
                type="button"
                onClick={onSubmitPaste}
                className="shrink-0 rounded-full border border-accent-500/50 bg-accent-950/40 px-4 py-1.5 text-xs font-semibold text-accent-200 hover:bg-accent-900/40"
              >
                Analyze JSON
              </button>
            </div>
          </div>
        ) : null}

        {inputMode === "demo" ? (
          <div className="flex h-full min-h-0 flex-col">
            <p className="shrink-0 text-sm text-surface-400">
              Pick one of the three example audit reports below, then launch the dashboard.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {demoSamples.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => onDemoSampleChange(sample.id)}
                  className={`rounded-lg border px-4 py-3 text-left transition ${
                    demoSampleId === sample.id
                      ? "border-accent-500/50 bg-accent-950/30"
                      : "border-white/10 bg-black/30 hover:border-white/25"
                  }`}
                >
                  <div className="text-sm font-semibold text-accent-100">{sample.label}</div>
                  <div className="mt-1 text-xs text-surface-500">{sample.description}</div>
                </button>
              ))}
            </div>
            <textarea
              value={pasteText}
              onChange={(e) => onPasteTextChange(e.target.value)}
              spellCheck={false}
              className="mt-4 min-h-[200px] flex-1 resize-y rounded-lg border border-white/10 bg-black/60 px-4 py-3 font-mono text-[11px] leading-relaxed text-surface-400 outline-none focus:border-accent-500/40"
            />
            <div className="sticky bottom-0 z-10 -mx-1 mt-3 flex shrink-0 justify-end border-t border-white/10 bg-black/80 pb-1 pt-3 backdrop-blur-sm">
              <button
                type="button"
                onClick={onLaunchDemo}
                className="rounded-full border border-accent-500/50 bg-accent-950/40 px-5 py-2 text-xs font-semibold text-accent-200 hover:bg-accent-900/40"
              >
                Launch dashboard
              </button>
            </div>
            {parseError ? <p className="mt-2 text-xs text-red-400">{parseError}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
