"use client";

import { useRef } from "react";
import {
  critiqueChromePadX,
  critiqueInputTabActiveClass,
  critiqueInputTabClass,
  critiqueInputTabInactiveClass,
  critiquePanelClass,
  critiqueUploadTabActiveClass,
  critiqueUploadTabInactiveClass,
} from "@/interactive-demos/photo-critique/components/photo-critique-layout";
import type { RegionInputMode } from "../types";
import { RegionHowItWorks } from "./RegionHowItWorks";
import { RegionOriginalProblem } from "./RegionOriginalProblem";
import { RegionSuccesses } from "./RegionSuccesses";

type Props = {
  inputMode: RegionInputMode;
  onInputModeChange: (mode: RegionInputMode) => void;
  error: string | null;
  building: boolean;
  loadingSample: boolean;
  onFileSelect: (file: File) => void;
  onTryThisImage: () => void;
  onTryYourOwnImage: () => void;
};

const tabs: { mode: RegionInputMode; label: string }[] = [
  { mode: "originalProblem", label: "The original problem" },
  { mode: "successes", label: "The success" },
  { mode: "howItWorks", label: "How it Works" },
  { mode: "upload", label: "Try it" },
];

export function RegionPromptInput({
  inputMode,
  onInputModeChange,
  error,
  building,
  loadingSample,
  onFileSelect,
  onTryThisImage,
  onTryYourOwnImage,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={`flex flex-wrap items-center gap-2 ${critiqueChromePadX}`}>
        <div className="flex flex-wrap gap-2">
          {tabs.map(({ mode, label }) => {
            const isTry = mode === "upload";
            const active = inputMode === mode;
            const activeClass = isTry ? critiqueUploadTabActiveClass : critiqueInputTabActiveClass;
            const inactiveClass = isTry
              ? critiqueUploadTabInactiveClass
              : critiqueInputTabInactiveClass;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onInputModeChange(mode)}
                className={`${critiqueInputTabClass} ${active ? activeClass : inactiveClass}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`mt-4 min-h-0 flex-1 ${critiquePanelClass} p-5`}>
        {inputMode === "originalProblem" ? (
          <RegionOriginalProblem onSeeSuccess={() => onInputModeChange("successes")} />
        ) : inputMode === "successes" ? (
          <RegionSuccesses
            loadingSample={loadingSample}
            onTryThisImage={onTryThisImage}
            onTryYourOwnImage={onTryYourOwnImage}
          />
        ) : inputMode === "howItWorks" ? (
          <RegionHowItWorks />
        ) : (
          <div className="flex h-full flex-col">
            <p className="text-sm text-surface-400">
              Drop a JPEG, PNG, or WebP, then draw the region. The image never leaves your device —
              this step only builds a prompt and a see-through mask.
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
              disabled={building}
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
                {building ? "Building…" : "Click or drop a photo"}
              </p>
              <p className="mt-2 text-xs text-surface-500">Max practical size ~20 MB</p>
            </button>
          </div>
        )}

        {error ? (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
