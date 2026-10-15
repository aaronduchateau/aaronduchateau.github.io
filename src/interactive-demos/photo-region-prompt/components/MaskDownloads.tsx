"use client";

import { useState } from "react";
import {
  critiquePanelClass,
  critiqueSectionTitleClass,
} from "@/interactive-demos/photo-critique/components/photo-critique-layout";
import {
  copyPngToClipboard,
  downloadBlob,
  maskDownloadStem,
  renderBinaryMask,
  renderPhotoWithAlphaMask,
} from "../exportMaskedPhoto";
import type { RegionReport } from "../types";

type Busy = "photo" | "mask" | "copy" | null;

export function MaskDownloads({ report }: { report: RegionReport }) {
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const stem = maskDownloadStem(report.fileName);

  const run = async (kind: Exclude<Busy, null>) => {
    setError(null);
    setCopied(false);
    setBusy(kind);
    try {
      if (kind === "copy") {
        const blob = await renderPhotoWithAlphaMask(report);
        await copyPngToClipboard(blob);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } else if (kind === "photo") {
        const blob = await renderPhotoWithAlphaMask(report);
        downloadBlob(blob, `${stem}-masked.png`);
      } else {
        const blob = await renderBinaryMask(report);
        downloadBlob(blob, `${stem}-mask.png`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build the image.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={`${critiquePanelClass} px-4 py-3`}>
      <h3 className={critiqueSectionTitleClass}>Download mask</h3>
      <p className="mt-1 text-[10px] text-surface-500">
        Full {report.width}×{report.height} px — the drawn polygon, not a screenshot of the preview.
        The photo+mask is a see-through overlay so the original still shows in the region. The
        black/white file is white = edit for inpainting APIs.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void run("copy")}
          aria-live="polite"
          className="flex-1 rounded-full border border-accent-500/40 bg-accent-500/10 px-4 py-2 text-[11px] font-semibold text-accent-100 hover:border-accent-400/60 hover:bg-accent-500/20 disabled:opacity-60"
        >
          {busy === "copy" ? "Copying…" : copied ? "Copied!" : "Copy photo with mask"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void run("photo")}
          className="flex-1 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[11px] font-semibold text-surface-200 hover:border-white/35 hover:bg-white/10 disabled:opacity-60"
        >
          {busy === "photo" ? "Building…" : "Download photo with mask"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void run("mask")}
          className="flex-1 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[11px] font-semibold text-surface-200 hover:border-white/35 hover:bg-white/10 disabled:opacity-60"
        >
          {busy === "mask" ? "Building…" : "Download mask only"}
        </button>
      </div>
      {error ? <p className="mt-2 text-xs text-red-200">{error}</p> : null}
    </div>
  );
}
