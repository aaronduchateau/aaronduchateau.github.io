"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { recordActivity } from "@/activity/tracker";
import { boundingBox } from "./polygon";
import type {
  RegionInputMode,
  RegionOperation,
  RegionPoint,
  RegionReport,
} from "./types";

function loadImageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!url.startsWith("blob:")) img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) {
        reject(new Error("Could not read photo size."));
        return;
      }
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => reject(new Error("Could not decode image."));
    img.src = url;
  });
}

export function usePhotoRegionPrompt() {
  const [inputMode, setInputMode] = useState<RegionInputMode>("originalProblem");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [report, setReport] = useState<RegionReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [building, setBuilding] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<RegionPoint[]>([]);
  const [polygonComplete, setPolygonComplete] = useState(false);
  const [operation, setOperation] = useState<RegionOperation>("add");
  const [instruction, setInstruction] = useState("");
  const [loadingSample, setLoadingSample] = useState(false);
  const objectUrlRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const resetDraw = useCallback(() => {
    setPoints([]);
    setPolygonComplete(false);
    setOperation("add");
    setInstruction("");
  }, []);

  const finishReport = useCallback(
    async (
      url: string,
      label: string,
      nextPoints: RegionPoint[],
      nextOperation: RegionOperation,
      nextInstruction: string,
    ) => {
      const token = ++requestIdRef.current;
      setError(null);
      setReport(null);
      setPreviewUrl(url);
      setFileName(label);
      setBuilding(true);
      try {
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        const size = await loadImageSize(url);
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (token !== requestIdRef.current) return;
        if (nextPoints.length < 3) {
          throw new Error("Complete a polygon with at least three points.");
        }
        if (!nextInstruction.trim()) {
          throw new Error("Describe what to add or remove in the region.");
        }
        const nextReport: RegionReport = {
          width: size.width,
          height: size.height,
          fileName: label,
          points: nextPoints,
          bbox: boundingBox(nextPoints),
          operation: nextOperation,
          instruction: nextInstruction.trim(),
          originalUrl: url,
        };
        setReport(nextReport);
        setDrawing(false);
        void recordActivity({
          type: "demo.photoRegionPrompt",
          contentId: label || "photo-region-prompt",
          label: `AI photo substitution · ${label || "image"}`,
        });
      } catch (err) {
        if (token !== requestIdRef.current) return;
        setReport(null);
        setError(err instanceof Error ? err.message : "Failed to build prompt.");
      } finally {
        if (token === requestIdRef.current) setBuilding(false);
      }
    },
    [],
  );

  const beginUpload = useCallback(
    (file: File) => {
      if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
        setError("Please upload a JPEG, PNG, or WebP image.");
        return;
      }
      revokeObjectUrl();
      setReport(null);
      setError(null);
      resetDraw();
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setPreviewUrl(url);
      setFileName(file.name);
      setDrawing(true);
    },
    [resetDraw, revokeObjectUrl],
  );

  const beginPublicPhoto = useCallback(
    async (src: string, label: string) => {
      setLoadingSample(true);
      setError(null);
      try {
        const res = await fetch(src);
        if (!res.ok) {
          throw new Error("Could not load the sample photo.");
        }
        const blob = await res.blob();
        const type = blob.type && /^image\//.test(blob.type) ? blob.type : "image/png";
        beginUpload(new File([blob], label, { type }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load the sample photo.");
      } finally {
        setLoadingSample(false);
      }
    },
    [beginUpload],
  );

  const buildFromDrawing = useCallback(() => {
    if (!previewUrl || !fileName) return;
    void finishReport(previewUrl, fileName, points, operation, instruction);
  }, [fileName, finishReport, instruction, operation, points, previewUrl]);

  const clearResults = useCallback(() => {
    revokeObjectUrl();
    setReport(null);
    setPreviewUrl(null);
    setFileName(null);
    setError(null);
    setDrawing(false);
    resetDraw();
  }, [resetDraw, revokeObjectUrl]);

  const returnToUpload = useCallback(() => {
    clearResults();
    setInputMode("upload");
  }, [clearResults]);

  const returnToOriginalProblem = useCallback(() => {
    clearResults();
    setInputMode("originalProblem");
    setError(null);
  }, [clearResults]);

  const addPoint = useCallback((point: RegionPoint) => {
    setPoints((prev) => (prev.length >= 24 ? prev : [...prev, point]));
  }, []);

  const deleteLastPoint = useCallback(() => {
    setPolygonComplete(false);
    setPoints((prev) => prev.slice(0, -1));
  }, []);

  const completePolygon = useCallback(() => {
    setPoints((prev) => {
      if (prev.length >= 3) setPolygonComplete(true);
      return prev;
    });
  }, []);

  const clearPolygon = useCallback(() => {
    setPoints([]);
    setPolygonComplete(false);
  }, []);

  useEffect(() => () => revokeObjectUrl(), [revokeObjectUrl]);

  return {
    inputMode,
    setInputMode,
    previewUrl,
    fileName,
    report,
    error,
    building,
    drawing,
    points,
    polygonComplete,
    operation,
    instruction,
    addPoint,
    deleteLastPoint,
    completePolygon,
    clearPolygon,
    setOperation,
    setInstruction,
    beginUpload,
    beginPublicPhoto,
    loadingSample,
    buildFromDrawing,
    clearResults,
    returnToUpload,
    returnToOriginalProblem,
  };
}
