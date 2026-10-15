"use client";

import { critiqueMutedClass } from "@/interactive-demos/photo-critique/components/photo-critique-layout";
import { howItWorksMarkdown } from "../howItWorksMarkdown";

export function RegionHowItWorks() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className={`shrink-0 ${critiqueMutedClass}`}>
        Add a photo, draw the boundary, copy the masked picture and the Mask markdown, then paste
        both into an editor such as ChatGPT.
      </p>
      <pre className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/50 p-4 text-[11px] leading-relaxed text-surface-300">
        {howItWorksMarkdown}
      </pre>
    </div>
  );
}
