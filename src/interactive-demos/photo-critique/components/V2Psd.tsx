"use client";

import { v2PsdMarkdown } from "../v2PsdMarkdown";
import { critiqueMutedClass } from "./photo-critique-layout";

export function V2Psd() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className={`shrink-0 ${critiqueMutedClass}`}>
        Product Spec Document (PSD) for Photo critique v2 — the how-to-build complement to a PRD,
        drafted from Self QA v1 findings.
      </p>
      <pre className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/50 p-4 text-[11px] leading-relaxed text-surface-300">
        {v2PsdMarkdown}
      </pre>
    </div>
  );
}
