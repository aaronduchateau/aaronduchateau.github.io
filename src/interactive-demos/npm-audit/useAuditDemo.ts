"use client";

import { useCallback, useState } from "react";
import { analyzeNpmAudit, parseNpmAuditText } from "./analyzeNpmAudit";
import { demoSampleJson, defaultDemoSampleId, type DemoSampleId } from "./demoSamples";
import type { AuditInputMode, ParsedAuditReport } from "./types";

export function useAuditDemo() {
  const [inputMode, setInputMode] = useState<AuditInputMode>("demo");
  const [pasteText, setPasteText] = useState(() => demoSampleJson(defaultDemoSampleId));
  const [demoSampleId, setDemoSampleId] = useState<DemoSampleId>(defaultDemoSampleId);
  const [parsed, setParsed] = useState<ParsedAuditReport | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const clearResults = useCallback(() => {
    setParsed(null);
    setParseError(null);
  }, []);

  const runAnalysis = useCallback((text: string) => {
    try {
      const report = parseNpmAuditText(text);
      setParsed(analyzeNpmAudit(report));
      setParseError(null);
    } catch (err) {
      setParsed(null);
      setParseError(err instanceof Error ? err.message : "Failed to parse audit JSON.");
    }
  }, []);

  const submitPaste = useCallback(() => {
    runAnalysis(pasteText);
  }, [pasteText, runAnalysis]);

  const submitFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? "");
        setPasteText(text);
        runAnalysis(text);
      };
      reader.onerror = () => setParseError("Could not read the selected file.");
      reader.readAsText(file);
    },
    [runAnalysis],
  );

  const selectDemoSample = useCallback(
    (id: DemoSampleId) => {
      setDemoSampleId(id);
      const json = demoSampleJson(id);
      setPasteText(json);
      setParseError(null);
      setParsed(null);
    },
    [],
  );

  const launchDemo = useCallback(() => {
    runAnalysis(pasteText);
  }, [pasteText, runAnalysis]);

  return {
    inputMode,
    setInputMode,
    pasteText,
    setPasteText,
    demoSampleId,
    selectDemoSample,
    parsed,
    parseError,
    fileName,
    submitPaste,
    submitFile,
    launchDemo,
    clearResults,
  };
}
