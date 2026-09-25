export type CritiquePoint = { x: number; y: number };

export type CritiqueTier = "strong" | "good" | "needsWork";

/** Coarse attention grid (row-major, normalized 0–1) for the heat-map overlay. */
export type CritiqueHeatmap = {
  width: number;
  height: number;
  values: number[];
};

export type CritiqueReport = {
  width: number;
  height: number;
  lightingScore: number;
  compositionScore: number;
  clarityScore: number;
  overallScore: number;
  tier: CritiqueTier;
  lightingNotes: string[];
  compositionNotes: string[];
  clarityNotes: string[];
  eyeFlowNotes: string[];
  balanceNotes: string[];
  eyeFlowPath: CritiquePoint[];
  attentionCenter: CritiquePoint;
  heatmap: CritiqueHeatmap;
  histogram: number[];
  nearestThird: string;
};

export type PhotoInputMode = "demo" | "upload" | "implementation" | "v2Psd" | "howItWorks";
