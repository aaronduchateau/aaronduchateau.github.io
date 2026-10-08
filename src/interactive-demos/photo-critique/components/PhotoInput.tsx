"use client";

import { useRef } from "react";
import { demoSampleGroups, type DemoSample, type DemoSampleId } from "../demoSamples";
import type { ImplementationThreadId } from "../implementationScenario";
import type { PhotoInputMode } from "../types";
import { HowItWorks } from "./HowItWorks";
import { ImplementationThreadList } from "./ImplementationChat";
import { V2Psd } from "./V2Psd";
import {
  critiqueChromePadX,
  critiqueInputTabActiveClass,
  critiqueInputTabClass,
  critiqueInputTabInactiveClass,
  critiquePanelClass,
  critiqueUploadTabActiveClass,
  critiqueUploadTabInactiveClass,
} from "./photo-critique-layout";

type Props = {
  inputMode: PhotoInputMode;
  onInputModeChange: (mode: PhotoInputMode) => void;
  demoSampleId: DemoSampleId;
  onDemoSampleChange: (id: DemoSampleId) => void;
  error: string | null;
  analyzing: boolean;
  onFileSelect: (file: File) => void;
  onLaunchDemo: () => void;
  onOpenImplementationThread: (id: ImplementationThreadId) => void;
};

function SampleCard({
  sample,
  selected,
  onSelect,
}: {
  sample: DemoSample;
  selected: boolean;
  onSelect: (id: DemoSampleId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(sample.id)}
      aria-pressed={selected}
      className={`group flex flex-col overflow-hidden rounded-lg border text-left transition ${
        selected ? "border-accent-400/70 ring-1 ring-accent-400/40" : "border-white/10 hover:border-white/30"
      }`}
    >
      <span className="relative block aspect-[4/3] w-full overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element -- static local demo asset */}
        <img
          src={sample.src}
          alt={sample.label}
          loading="lazy"
          className={`h-full w-full object-cover transition duration-300 ${
            selected ? "opacity-100" : "opacity-80 group-hover:opacity-100"
          }`}
        />
        {selected ? (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-accent-400 px-1.5 py-0.5 text-[9px] font-bold text-surface-950">
            ✓
          </span>
        ) : null}
      </span>
      <span className="flex flex-col gap-0.5 px-2.5 py-2">
        <span className="text-xs font-semibold text-surface-200">{sample.label}</span>
        <span className="text-[10px] leading-snug text-surface-500">{sample.description}</span>
      </span>
    </button>
  );
}

export function PhotoInput({
  inputMode,
  onInputModeChange,
  demoSampleId,
  onDemoSampleChange,
  error,
  analyzing,
  onFileSelect,
  onLaunchDemo,
  onOpenImplementationThread,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mainTabs: { mode: Exclude<PhotoInputMode, "upload">; label: string }[] = [
    { mode: "demo", label: "Demo" },
    { mode: "implementation", label: "V1 QA" },
    { mode: "v2Psd", label: "V2 PSD" },
    { mode: "howItWorks", label: "How it Works" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={`flex flex-wrap items-center gap-2 ${critiqueChromePadX}`}>
        <div className="flex flex-wrap gap-2">
          {mainTabs.map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => onInputModeChange(mode)}
              className={`${critiqueInputTabClass} ${
                inputMode === mode ? critiqueInputTabActiveClass : critiqueInputTabInactiveClass
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onInputModeChange("upload")}
          className={`ml-auto max-md:hidden ${critiqueInputTabClass} ${
            inputMode === "upload" ? critiqueUploadTabActiveClass : critiqueUploadTabInactiveClass
          }`}
        >
          Try it
        </button>
      </div>

      <div className={`mt-4 min-h-0 flex-1 ${critiquePanelClass} p-5`}>
        {inputMode === "upload" ? (
          <div className="flex h-full flex-col">
            <p className="text-sm text-surface-400">
              Try it for yourself — drop a JPEG, PNG, or WebP. Analysis runs entirely in your browser;
              the image never leaves your device.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileSelect(file);
              }}
            />
            <button
              type="button"
              disabled={analyzing}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) onFileSelect(file);
              }}
              className="mt-4 flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-violet-500/25 bg-violet-950/15 px-6 py-12 transition hover:border-violet-500/40 hover:bg-violet-950/25 disabled:opacity-60"
            >
              <p className="text-sm font-semibold text-violet-200">
                {analyzing ? "Analyzing…" : "Click or drop a photo"}
              </p>
              <p className="mt-2 text-xs text-surface-500">Max practical size ~20 MB</p>
            </button>
          </div>
        ) : inputMode === "implementation" ? (
          <ImplementationThreadList onOpenThread={onOpenImplementationThread} />
        ) : inputMode === "v2Psd" ? (
          <V2Psd />
        ) : inputMode === "demo" ? (
          <div className="flex h-full min-h-0 flex-col">
            <p className="shrink-0 text-sm text-surface-400">
              Pick a bundled sample, then run the critique. Every photo uses the same pixel-only rules.
            </p>
            <div className="mt-4 min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain pr-1">
              {demoSampleGroups.map((group) => (
                <div key={group.id}>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-surface-400">
                      {group.label}
                    </span>
                    <span className="h-px flex-1 bg-white/10" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {group.samples.map((sample) => (
                      <SampleCard
                        key={sample.id}
                        sample={sample}
                        selected={demoSampleId === sample.id}
                        onSelect={onDemoSampleChange}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <HowItWorks />
        )}

        {error ? (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}
      </div>

      {inputMode === "demo" ? (
        <div
          className={`mt-3 flex shrink-0 flex-col-reverse gap-2 sm:flex-row ${critiqueChromePadX}`}
        >
          <button
            type="button"
            disabled={analyzing}
            onClick={() => onInputModeChange("upload")}
            className="flex-1 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-surface-200 hover:border-white/35 hover:bg-white/10 disabled:opacity-60"
          >
            Upload your own photo for analysis
          </button>
          <button
            type="button"
            disabled={analyzing}
            onClick={onLaunchDemo}
            className="flex-1 rounded-full bg-accent-500/90 px-5 py-2.5 text-sm font-semibold text-surface-950 hover:bg-accent-400 disabled:opacity-60"
          >
            {analyzing ? "Analyzing…" : "Run critique"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
