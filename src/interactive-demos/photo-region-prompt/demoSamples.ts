import type { RegionOperation, RegionPoint } from "./types";

export type DemoSampleId =
  | "mistyHillside"
  | "gardenTomatoes"
  | "astronautMural"
  | "farmPigs"
  | "busyFountain"
  | "coupleThrones";

export type DemoSampleGroupId = "add" | "remove";

export type DemoSample = {
  id: DemoSampleId;
  label: string;
  description: string;
  src: string;
  group: DemoSampleGroupId;
  operation: RegionOperation;
  points: RegionPoint[];
  instruction: string;
};

const PHOTO = "/interactive-demos/photo-critique";

/** Stub polygons on the same Photo critique v1 assets — approximate regions, not pixel-perfect traces. */
export const demoSamples: DemoSample[] = [
  {
    id: "mistyHillside",
    label: "Misty landscape",
    description: "Add a figure into a foggy hillside clearing.",
    src: `${PHOTO}/Aaron_DuChateau_misty-hillside.jpg`,
    group: "add",
    operation: "add",
    points: [
      { x: 0.52, y: 0.38 },
      { x: 0.78, y: 0.36 },
      { x: 0.84, y: 0.72 },
      { x: 0.48, y: 0.76 },
    ],
    instruction:
      "Add Benjamin Franklin standing in this hillside clearing, matching the fog, scale, and late light of the original photo.",
  },
  {
    id: "gardenTomatoes",
    label: "Garden still-life",
    description: "Add a second ripe tomato on the vine.",
    src: `${PHOTO}/Aaron_DuChateau_garden-tomatoes.png`,
    group: "add",
    operation: "add",
    points: [
      { x: 0.18, y: 0.22 },
      { x: 0.55, y: 0.2 },
      { x: 0.58, y: 0.68 },
      { x: 0.16, y: 0.7 },
    ],
    instruction:
      "Add a second ripe tomato on the vine inside this region, matching the existing fruit’s color, dew, and lighting.",
  },
  {
    id: "astronautMural",
    label: "Street-art mural",
    description: "Add a small object on the empty wall.",
    src: `${PHOTO}/Aaron_DuChateau_astronaut-mural.jpg`,
    group: "add",
    operation: "add",
    points: [
      { x: 0.62, y: 0.48 },
      { x: 0.92, y: 0.5 },
      { x: 0.9, y: 0.88 },
      { x: 0.6, y: 0.86 },
    ],
    instruction:
      "Add a small red bicycle leaning against the wall in this empty stretch, matching the mural’s paint texture and daylight.",
  },
  {
    id: "farmPigs",
    label: "Farm animals",
    description: "Remove one animal and fill with the field.",
    src: `${PHOTO}/Aaron_DuChateau_farm-pigs.jpg`,
    group: "remove",
    operation: "remove",
    points: [
      { x: 0.08, y: 0.42 },
      { x: 0.42, y: 0.4 },
      { x: 0.44, y: 0.86 },
      { x: 0.06, y: 0.88 },
    ],
    instruction:
      "Remove the animal in this region. Fill with matching grass, fence, and ground so the rest of the scene is unchanged.",
  },
  {
    id: "busyFountain",
    label: "Competing subjects",
    description: "Remove the competing face near the fountain.",
    src: `${PHOTO}/Aaron_DuChateau_busy-fountain.jpg`,
    group: "remove",
    operation: "remove",
    points: [
      { x: 0.58, y: 0.28 },
      { x: 0.86, y: 0.26 },
      { x: 0.88, y: 0.72 },
      { x: 0.56, y: 0.74 },
    ],
    instruction:
      "Remove the competing face in this region so the fountain statue remains the only subject. Reconstruct the background behind it.",
  },
  {
    id: "coupleThrones",
    label: "Couple portrait",
    description: "Clear background clutter around the couple.",
    src: `${PHOTO}/Aaron_DuChateau_couple-thrones.jpg`,
    group: "remove",
    operation: "remove",
    points: [
      { x: 0.02, y: 0.08 },
      { x: 0.28, y: 0.1 },
      { x: 0.3, y: 0.55 },
      { x: 0.04, y: 0.58 },
    ],
    instruction:
      "Remove the background clutter in this region. Keep the couple sharp and reconstruct a simple, consistent backdrop.",
  },
];

export const demoSampleGroups: { id: DemoSampleGroupId; label: string; samples: DemoSample[] }[] = [
  {
    id: "add",
    label: "Add something in a region",
    samples: demoSamples.filter((s) => s.group === "add"),
  },
  {
    id: "remove",
    label: "Remove something from a region",
    samples: demoSamples.filter((s) => s.group === "remove"),
  },
];

export const defaultDemoSampleId: DemoSampleId = "mistyHillside";

export function getDemoSample(id: DemoSampleId): DemoSample {
  const sample = demoSamples.find((s) => s.id === id);
  if (!sample) throw new Error(`Unknown demo sample: ${id}`);
  return sample;
}
