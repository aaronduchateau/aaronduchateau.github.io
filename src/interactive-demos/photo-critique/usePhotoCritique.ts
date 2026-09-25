"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { recordActivity } from "@/activity/tracker";
import { analyzeImageSource, loadImageFromUrl } from "./analyzeImage";
import { defaultDemoSampleId, getDemoSample, type DemoSampleId } from "./demoSamples";
import type { ImplementationThreadId } from "./implementationScenario";
import type { CritiqueReport, PhotoInputMode } from "./types";

export type CritiqueResultSource = "demo" | "upload";

export function usePhotoCritique() {
  const [inputMode, setInputMode] = useState<PhotoInputMode>("demo");
  const [demoSampleId, setDemoSampleId] = useState<DemoSampleId>(defaultDemoSampleId);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [report, setReport] = useState<CritiqueReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [resultSource, setResultSource] = useState<CritiqueResultSource | null>(null);
  const [analyzedSampleId, setAnalyzedSampleId] = useState<DemoSampleId | null>(null);
  const [implementationThreadId, setImplementationThreadId] = useState<ImplementationThreadId | null>(
    null,
  );
  const objectUrlRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const runAnalysis = useCallback(async (url: string, label: string) => {
    const token = ++requestIdRef.current;
    // Show the photo immediately with a loading state, then analyze on the main
    // thread after yielding so the preview + spinner paint first. Fully
    // client-side: canvas decode + pixel math run in the browser, no upload.
    setError(null);
    setReport(null);
    setPreviewUrl(url);
    setFileName(label);
    setAnalyzing(true);
    try {
      // Let the preview + spinner render before the work begins.
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      const img = await loadImageFromUrl(url);
      // One more yield so the spinner is visible before the synchronous pass.
      await new Promise((resolve) => setTimeout(resolve, 0));
      const result = await analyzeImageSource(img);
      if (token !== requestIdRef.current) {
        // A newer request superseded this one; ignore the stale result.
        return;
      }
      setReport(result);
      void recordActivity({
        type: "demo.photoCritique",
        contentId: label || "photo-critique",
        label: `Photo critique · ${label || "image"}`,
      });
    } catch (err) {
      if (token !== requestIdRef.current) return;
      setReport(null);
      setPreviewUrl(null);
      setFileName(null);
      setError(err instanceof Error ? err.message : "Failed to analyze image.");
    } finally {
      if (token === requestIdRef.current) setAnalyzing(false);
    }
  }, []);

  const analyzeFile = useCallback(
    (file: File) => {
      if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
        setError("Please upload a JPEG, PNG, or WebP image.");
        return;
      }
      revokeObjectUrl();
      setResultSource("upload");
      setAnalyzedSampleId(null);
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      void runAnalysis(url, file.name);
    },
    [revokeObjectUrl, runAnalysis],
  );

  const selectDemoSample = useCallback((id: DemoSampleId) => {
    setDemoSampleId(id);
    setError(null);
    setReport(null);
  }, []);

  const launchDemo = useCallback(() => {
    revokeObjectUrl();
    setResultSource("demo");
    setAnalyzedSampleId(demoSampleId);
    const sample = getDemoSample(demoSampleId);
    void runAnalysis(sample.src, sample.label);
  }, [demoSampleId, revokeObjectUrl, runAnalysis]);

  const clearResults = useCallback(() => {
    revokeObjectUrl();
    setReport(null);
    setPreviewUrl(null);
    setFileName(null);
    setError(null);
    setResultSource(null);
  }, [revokeObjectUrl]);

  const returnToUpload = useCallback(() => {
    clearResults();
    setAnalyzedSampleId(null);
    setImplementationThreadId(null);
    setInputMode("upload");
  }, [clearResults]);

  const returnToDemo = useCallback(() => {
    clearResults();
    setAnalyzedSampleId(null);
    setImplementationThreadId(null);
    setInputMode("demo");
  }, [clearResults]);

  const returnToSelfQa = useCallback(() => {
    const threadId = analyzedSampleId ?? demoSampleId;
    clearResults();
    setInputMode("implementation");
    setImplementationThreadId(threadId);
    setError(null);
  }, [analyzedSampleId, clearResults, demoSampleId]);

  const openImplementationThread = useCallback((id: ImplementationThreadId) => {
    setImplementationThreadId(id);
    setError(null);
  }, []);

  const closeImplementationThread = useCallback(() => {
    setImplementationThreadId(null);
  }, []);

  const setInputModeAndClearThread = useCallback((mode: PhotoInputMode) => {
    if (mode !== "implementation") setImplementationThreadId(null);
    setInputMode(mode);
  }, []);

  useEffect(() => () => revokeObjectUrl(), [revokeObjectUrl]);

  return {
    inputMode,
    setInputMode: setInputModeAndClearThread,
    implementationThreadId,
    openImplementationThread,
    closeImplementationThread,
    demoSampleId,
    selectDemoSample,
    previewUrl,
    fileName,
    report,
    resultSource,
    error,
    analyzing,
    analyzeFile,
    launchDemo,
    clearResults,
    returnToUpload,
    returnToDemo,
    returnToSelfQa,
  };
}
