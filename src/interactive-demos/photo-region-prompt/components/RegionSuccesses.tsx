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
  franklinMaskSuccessPrompt,
  successMaskPhoto,
  successResultPhotos,
} from "../successesContent";

type Props = {
  loadingSample: boolean;
  onTryThisImage: () => void;
  onTryYourOwnImage: () => void;
};

export function RegionSuccesses({
  loadingSample,
  onTryThisImage,
  onTryYourOwnImage,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(franklinMaskSuccessPrompt);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = franklinMaskSuccessPrompt;
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
      <div className="grid gap-3 sm:grid-cols-2">
        {successResultPhotos.map((photo) => (
          <div key={photo.src} className={`${critiqueResultPhotoFrameClass} min-h-[10rem]`}>
            <span className={`${critiqueResultPhotoLabelClass} text-white`}>{photo.label}</span>
            {/* eslint-disable-next-line @next/next/no-img-element -- static local demo asset */}
            <img src={photo.src} alt={photo.alt} className="h-full w-full object-contain" />
          </div>
        ))}
      </div>

      <div className={`${critiquePanelClass} mt-4 px-4 py-3`}>
        <h3 className={critiqueSectionTitleClass}>What worked</h3>
        <p className={`mt-2 ${critiqueMutedClass}`}>
          The same painting kept failing while we only sent words and a list of coordinates. Franklin
          still landed inside the painted window.
        </p>
        <p className={`mt-3 ${critiqueMutedClass}`}>
          It succeeded after this tool could build a{" "}
          <span className="text-surface-200">downloadable mask</span> — a see-through overlay drawn
          on the photo itself — and the prompt was rewritten to talk about{" "}
          <span className="text-surface-200">that mask on a single photo</span>. There is no vertex
          list in this version. The overlay is the region.
        </p>
        <p className={`mt-3 ${critiqueMutedClass}`}>
          The pictures above are what came back. Franklin’s coat and figure cross the painted border
          instead of stopping at it.
        </p>
      </div>

      <div className={`${critiqueResultPhotoFrameClass} mt-3 min-h-[10rem]`}>
        <span className={`${critiqueResultPhotoLabelClass} text-white`}>{successMaskPhoto.label}</span>
        {/* eslint-disable-next-line @next/next/no-img-element -- static local demo asset */}
        <img
          src={successMaskPhoto.src}
          alt={successMaskPhoto.alt}
          className="h-full w-full object-contain"
        />
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
          Mask prompt sent with one photo — the overlay is the only legal region.
        </p>
        <div className="relative mt-3">
          <pre
            className={`whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/50 p-3 text-[11px] leading-relaxed text-surface-300 ${
              expanded ? "" : "max-h-40 overflow-hidden"
            }`}
          >
            {franklinMaskSuccessPrompt}
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

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={loadingSample}
          onClick={onTryThisImage}
          className="flex-1 rounded-full bg-accent-500/90 px-5 py-2.5 text-sm font-semibold text-surface-950 hover:bg-accent-400 disabled:opacity-60"
        >
          {loadingSample ? "Loading photo…" : "Try this image"}
        </button>
        <button
          type="button"
          disabled={loadingSample}
          onClick={onTryYourOwnImage}
          className="flex-1 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-surface-200 hover:border-white/35 hover:bg-white/10 disabled:opacity-60"
        >
          Try your own image
        </button>
      </div>
    </div>
  );
}
