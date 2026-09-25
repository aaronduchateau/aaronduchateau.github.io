"use client";

import { howItWorksMarkdown } from "../howItWorksMarkdown";
import { critiqueMutedClass } from "./photo-critique-layout";

export function HowItWorks() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className={`shrink-0 ${critiqueMutedClass}`}>
        Everything below runs locally in your browser — no uploads, no machine learning.
      </p>
      <pre className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/50 p-4 text-[11px] leading-relaxed text-surface-300">
        {howItWorksMarkdown}
      </pre>
    </div>
  );
}
