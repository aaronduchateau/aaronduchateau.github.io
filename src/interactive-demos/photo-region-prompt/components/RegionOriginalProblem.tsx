"use client";

import { useState } from "react";
import {
  critiqueMutedClass,
  critiquePanelClass,
  critiqueResultPhotoFrameClass,
  critiqueResultPhotoLabelClass,
  critiqueSectionTitleClass,
} from "@/interactive-demos/photo-critique/components/photo-critique-layout";
import {
  failurePaintedBorderPhoto,
  failureResultPhoto,
  franklinCoordinateFailurePrompt,
} from "../failuresContent";

type Props = {
  onSeeSuccess: () => void;
};

export function RegionOriginalProblem({ onSeeSuccess }: Props) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(franklinCoordinateFailurePrompt);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = franklinCoordinateFailurePrompt;
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

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain pr-1">
      <div className={`${critiqueResultPhotoFrameClass} min-h-[12rem]`}>
        <span className={`${critiqueResultPhotoLabelClass} text-white`}>
          {failureResultPhoto.label}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element -- static local demo asset */}
        <img
          src={failureResultPhoto.src}
          alt={failureResultPhoto.alt}
          className="h-full w-full object-contain"
        />
      </div>

      <div className={`${critiquePanelClass} mt-4 px-4 py-3`}>
        <h3 className={critiqueSectionTitleClass}>What I wanted vs. what I got</h3>
        <p className={`mt-2 ${critiqueMutedClass}`}>
          The ask seems simple enough. I’m working on a painting. I can see what I want in my head,
          but I want AI to cement an actionable reference for the rest of the work I am going to do.
          We’ve got a <span className="text-surface-200">painted frame</span>, which is part of the
          fun, but AI doesn’t understand how to distinguish the difference between the physical and
          the implied.
        </p>
        <p className={`mt-3 ${critiqueMutedClass}`}>
          The ask was to add Benjamin Franklin smoking a cigarette, seated{" "}
          <span className="text-surface-200">outside</span> the painted frame — not inside the
          window opening. The drawn region crossed that painted border on purpose. The picture above
          is what came back: Franklin is tucked neatly inside the frame, as if the painted border
          were the real edge.
        </p>
        <p className={`mt-3 ${critiqueMutedClass}`}>
          Every attempt before the tool I built failed the same way. The model completed the caption
          (“add Franklin, facing the viewer”) and used the painted window as the place a person
          “belongs.”
        </p>
        <div className={`${critiqueResultPhotoFrameClass} mt-3 min-h-[10rem]`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static local demo asset */}
          <img
            src={failurePaintedBorderPhoto.src}
            alt={failurePaintedBorderPhoto.alt}
            className="h-full w-full object-contain"
          />
        </div>
        <p className={`mt-3 ${critiqueMutedClass}`}>
          My first attempt was to build a tool that allowed me to draw exactly where I wanted the
          edit to take place, and then build a prompt that communicated the original dimensions of
          the photo, and then the vertices encapsulating where I wanted the edit to take place.
        </p>
        <p className={`mt-3 ${critiqueMutedClass}`}>
          That is how we learned that most language models that can edit photos are{" "}
          <span className="text-surface-200">not vertices-aware</span>. A list of pixel coordinates
          in the prompt does not become a mask. The model still sees a frame and stops there.
        </p>
      </div>

      <div className={`${critiquePanelClass} mt-3 px-4 py-3`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className={critiqueSectionTitleClass}>Prompt that produced this result</h3>
          <button
            type="button"
            onClick={() => void handleCopy()}
            aria-live="polite"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent-500/40 bg-accent-500/10 px-3 py-1 text-[11px] font-semibold text-accent-100 transition-colors hover:border-accent-400/60 hover:bg-accent-500/20"
          >
            {copied ? "Copied!" : "Copy markdown"}
          </button>
        </div>
        <p className="mt-1 text-[10px] text-surface-500">
          This is a coordinates-only prompt sent with the original photo — no see-through mask.
        </p>
        <div className="relative mt-3">
          <pre
            className={`whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/50 p-3 text-[11px] leading-relaxed text-surface-300 ${
              expanded ? "" : "max-h-40 overflow-hidden"
            }`}
          >
            {franklinCoordinateFailurePrompt}
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

      <div className="mt-4">
        <button
          type="button"
          onClick={onSeeSuccess}
          className="w-full rounded-full bg-accent-500/90 px-5 py-2.5 text-sm font-semibold text-surface-950 hover:bg-accent-400 sm:w-auto"
        >
          The success
        </button>
      </div>
    </div>
  );
}
