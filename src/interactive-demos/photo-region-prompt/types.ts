export type RegionPoint = { x: number; y: number };

export type RegionBBox = { x: number; y: number; w: number; h: number };

export type RegionOperation = "add" | "remove";

export type RegionInputMode = "originalProblem" | "successes" | "howItWorks" | "upload";

export type RegionResultSource = "demo" | "upload";

/** Default is mask: attach the overlay photo, no vertex list. */
export type RegionPromptKind = "mask" | "coordinates";

export type RegionReport = {
  width: number;
  height: number;
  fileName: string;
  points: RegionPoint[];
  bbox: RegionBBox;
  operation: RegionOperation;
  instruction: string;
  originalUrl: string;
};
