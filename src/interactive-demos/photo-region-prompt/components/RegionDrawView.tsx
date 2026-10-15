"use client";

import { useEffect, useRef, useState } from "react";
import { CritiqueContentHeader } from "@/interactive-demos/photo-critique/components/CritiqueContentHeader";
import {
  critiqueChromePadX,
  critiquePanelClass,
} from "@/interactive-demos/photo-critique/components/photo-critique-layout";
import type { RegionOperation, RegionPoint } from "../types";
import { RegionCanvas } from "./RegionCanvas";

type Props = {
  previewUrl: string;
  fileName: string;
  points: RegionPoint[];
  complete: boolean;
  operation: RegionOperation;
  instruction: string;
  error: string | null;
  building: boolean;
  onAddPoint: (point: RegionPoint) => void;
  onDeleteLast: () => void;
  onComplete: () => void;
  onClear: () => void;
  onOperationChange: (op: RegionOperation) => void;
  onInstructionChange: (value: string) => void;
  onBuild: () => void;
  onCancel: () => void;
};

const toolClass = "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition";
const toolOn = "border-accent-500/50 bg-accent-950/40 text-accent-200";
const toolOff = "border-white/15 text-surface-400 hover:text-surface-200";

export function RegionDrawView({
  previewUrl,
  fileName,
  points,
  complete,
  operation,
  instruction,
  error,
  building,
  onAddPoint,
  onDeleteLast,
  onComplete,
  onClear,
  onOperationChange,
  onInstructionChange,
  onBuild,
  onCancel,
}: Props) {
  const [readyToDraw, setReadyToDraw] = useState(false);
  const instructionRef = useRef<HTMLTextAreaElement>(null);
  const canComplete = readyToDraw && !complete && points.length >= 3;
  const canBuild = readyToDraw && complete && instruction.trim().length > 0 && !building;

  useEffect(() => {
    if (!complete) return;
    instructionRef.current?.focus();
  }, [complete]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CritiqueContentHeader label="Draw a region on" emphasis={fileName} onClose={onCancel} />

      <div className={`mb-2 flex shrink-0 flex-wrap gap-2 ${critiqueChromePadX}`}>
        <span className={`${toolClass} ${complete ? toolOff : toolOn}`}>Add point</span>
        <button
          type="button"
          onClick={onDeleteLast}
          disabled={!readyToDraw || points.length === 0}
          className={`${toolClass} ${toolOff} disabled:opacity-40`}
        >
          Delete last
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={!canComplete}
          className={`${toolClass} ${complete ? toolOn : toolOff} disabled:opacity-40`}
        >
          Complete
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={!readyToDraw || points.length === 0}
          className={`${toolClass} ${toolOff} disabled:opacity-40`}
        >
          Clear
        </button>
      </div>

      <div className={`relative flex min-h-0 flex-1 flex-col ${critiqueChromePadX}`}>
        <RegionCanvas
          src={previewUrl}
          alt={fileName}
          points={points}
          complete={complete}
          onAddPoint={onAddPoint}
          onComplete={onComplete}
        />
        {!readyToDraw ? (
          <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-5 bg-black/65 px-6 text-center">
            <p className="max-w-md text-sm font-semibold leading-relaxed text-surface-100 sm:text-base">
              Click on the image to make a polygon of a specific region you would like to replace
            </p>
            <button
              type="button"
              onClick={() => setReadyToDraw(true)}
              className="rounded-full bg-accent-500/90 px-8 py-2.5 text-sm font-semibold text-surface-950 hover:bg-accent-400"
            >
              Continue
            </button>
          </div>
        ) : null}
      </div>

      <div className={`mt-3 shrink-0 space-y-2 ${critiqueChromePadX}`}>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!readyToDraw}
            onClick={() => onOperationChange("add")}
            className={`${toolClass} ${operation === "add" ? toolOn : toolOff} disabled:opacity-40`}
          >
            Add in region
          </button>
          <button
            type="button"
            disabled={!readyToDraw}
            onClick={() => onOperationChange("remove")}
            className={`${toolClass} ${operation === "remove" ? "border-amber-400/50 bg-amber-950/40 text-amber-200" : toolOff} disabled:opacity-40`}
          >
            Remove from region
          </button>
        </div>
        <div
          className={`${critiquePanelClass} px-3 py-2 transition ${
            complete
              ? "border-accent-400 bg-accent-950/45 ring-2 ring-accent-400/70"
              : ""
          }`}
        >
          <label
            htmlFor="region-instruction"
            className={`font-mono text-[10px] uppercase tracking-widest ${
              complete ? "font-semibold text-accent-100" : "text-surface-500"
            }`}
          >
            What should happen in this area
          </label>
          <textarea
            ref={instructionRef}
            id="region-instruction"
            value={instruction}
            disabled={!readyToDraw}
            onChange={(e) => onInstructionChange(e.target.value)}
            rows={2}
            placeholder={
              operation === "add"
                ? "e.g. Add Benjamin Franklin standing here, matching the light."
                : "e.g. Remove the object in this region and reconstruct the background."
            }
            className="mt-1 w-full resize-none bg-transparent text-sm text-surface-200 outline-none placeholder:text-surface-600"
          />
        </div>
        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : (
          <p className={`text-[10px] ${complete ? "font-semibold text-accent-200" : "text-surface-600"}`}>
            {complete
              ? "Shape is closed. Type what should happen in this area, then tap Build prompt."
              : "Click the photo to add vertices. Tap the first point (or Complete) to close the polygon. Then describe the add or remove."}
          </p>
        )}
      </div>

      <div className={`mt-3 flex shrink-0 ${critiqueChromePadX}`}>
        <button
          type="button"
          disabled={!canBuild}
          onClick={onBuild}
          className="flex-1 rounded-full bg-accent-500/90 px-5 py-2.5 text-sm font-semibold text-surface-950 hover:bg-accent-400 disabled:opacity-60"
        >
          {building ? "Building…" : "Build prompt"}
        </button>
      </div>
    </div>
  );
}
