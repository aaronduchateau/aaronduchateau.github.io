"use client";

import { useMemo, useState } from "react";
import {
  critiquePanelClass,
  critiqueSectionTitleClass,
} from "@/interactive-demos/photo-critique/components/photo-critique-layout";
import { buildPromptMarkdown } from "../buildPromptMarkdown";
import type { RegionPromptKind, RegionReport } from "../types";

const chipOn = "border-accent-500/50 bg-accent-950/40 text-accent-200";
const chipOff = "border-white/15 text-surface-400 hover:text-surface-200";
const chipClass =
  "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition";

export function PromptMarkdown({ report }: { report: RegionReport }) {
  const [kind, setKind] = useState<RegionPromptKind>("mask");
  const markdown = useMemo(() => buildPromptMarkdown(report, kind), [report, kind]);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(markdown);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = markdown;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const selectKind = (next: RegionPromptKind) => {
    setKind(next);
    setCopied(false);
  };

  return (
    <div className={`${critiquePanelClass} px-4 py-3`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className={critiqueSectionTitleClass}>Region prompt for AI</h3>
        <button
          type="button"
          onClick={() => void handleCopy()}
          aria-live="polite"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent-500/40 bg-accent-500/10 px-3 py-1 text-[11px] font-semibold text-accent-100 transition-colors hover:border-accent-400/60 hover:bg-accent-500/20"
        >
          {copied ? "Copied!" : "Copy markdown"}
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => selectKind("mask")}
          className={`${chipClass} ${kind === "mask" ? chipOn : chipOff}`}
        >
          Mask (default)
        </button>
        <button
          type="button"
          onClick={() => selectKind("coordinates")}
          className={`${chipClass} ${kind === "coordinates" ? chipOn : chipOff}`}
        >
          Coordinates
        </button>
      </div>
      <p className="mt-2 text-[10px] text-surface-500">
        {kind === "mask"
          ? "Default: attach the photo with the see-through mask (copy or download above). No pixel list — fill to the overlay, including across a frame line the mask clearly covers."
          : "Coordinate mode: attach the original photo. The markdown lists vertices and required pixels on photo 1’s grid."}
      </p>
      <div className="relative mt-3">
        <pre
          className={`whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/50 p-3 text-[11px] leading-relaxed text-surface-300 ${
            expanded ? "" : "max-h-40 overflow-hidden"
          }`}
        >
          {markdown}
        </pre>
        {!expanded ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-lg bg-gradient-to-t from-black/95 via-black/70 to-transparent"
            aria-hidden
          />
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 text-xs font-semibold text-accent-300 underline decoration-accent-500/50 underline-offset-2 transition hover:text-accent-200 hover:decoration-accent-300"
      >
        {expanded ? "Hide full markdown" : "Show Full Markdown"}
      </button>
    </div>
  );
}
