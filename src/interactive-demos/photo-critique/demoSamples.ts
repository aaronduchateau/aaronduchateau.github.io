export type DemoSampleId =
  | "astronautMural"
  | "coupleThrones"
  | "farmPigs"
  | "closeUpSmile"
  | "gardenTomatoes"
  | "mistyHillside"
  | "charlieDog"
  | "patrickOnCarpet"
  | "patrickPlayful"
  | "busyFountain"
  | "chaoticFisheye"
  | "beachJump";

export type DemoSampleGroupId = "alright" | "fakeGood";

export type DemoSample = {
  id: DemoSampleId;
  label: string;
  description: string;
  src: string;
  group: DemoSampleGroupId;
};

/** Order matches Self Audit thread grid (alright group), then fake-good samples. */
export const demoSamples: DemoSample[] = [
  {
    id: "gardenTomatoes",
    label: "Garden still-life",
    description: "A single ripe subject against soft greenery.",
    src: "/interactive-demos/photo-critique/Aaron_DuChateau_garden-tomatoes.png",
    group: "alright",
  },
  {
    id: "astronautMural",
    label: "Street-art mural",
    description: "One bold subject dominates a clean wall.",
    src: "/interactive-demos/photo-critique/Aaron_DuChateau_astronaut-mural.jpg",
    group: "alright",
  },
  {
    id: "coupleThrones",
    label: "Couple portrait",
    description: "Two faces anchor an ornate background.",
    src: "/interactive-demos/photo-critique/Aaron_DuChateau_couple-thrones.jpg",
    group: "alright",
  },
  {
    id: "closeUpSmile",
    label: "Close-up portrait",
    description: "Grainy black-and-white face with soft background bokeh.",
    src: "/interactive-demos/photo-critique/Aaron_DuChateau_close-up-smile.jpg",
    group: "alright",
  },
  {
    id: "mistyHillside",
    label: "Misty landscape",
    description: "Low-contrast fog scene with gentle flow.",
    src: "/interactive-demos/photo-critique/Aaron_DuChateau_misty-hillside.jpg",
    group: "alright",
  },
  {
    id: "farmPigs",
    label: "Farm animals",
    description: "Clear subjects with a calm backdrop.",
    src: "/interactive-demos/photo-critique/Aaron_DuChateau_farm-pigs.jpg",
    group: "alright",
  },
  {
    id: "charlieDog",
    label: "Charlie",
    description: "Dog portrait with a clear focal face and calm expression.",
    src: "/interactive-demos/photo-critique/Aaron_DuChateau_charlie-dog.png",
    group: "alright",
  },
  {
    id: "patrickOnCarpet",
    label: "Patrick on carpet",
    description: "Centered dog subject against a busy but readable texture.",
    src: "/interactive-demos/photo-critique/Aaron_DuChateau_patrick-on-carpet.png",
    group: "alright",
  },
  {
    id: "patrickPlayful",
    label: "Patrick playful",
    description: "Expressive pet pose with strong figure-ground separation.",
    src: "/interactive-demos/photo-critique/Aaron_DuChateau_patrick-playful.png",
    group: "alright",
  },
  {
    id: "busyFountain",
    label: "Competing subjects",
    description: "Fountain, statue, and face fight for attention.",
    src: "/interactive-demos/photo-critique/Aaron_DuChateau_busy-fountain.jpg",
    group: "fakeGood",
  },
  {
    id: "chaoticFisheye",
    label: "Chaotic frame",
    description: "Fisheye clutter with no clear focal mass.",
    src: "/interactive-demos/photo-critique/Aaron_DuChateau_chaotic-fisheye.jpg",
    group: "fakeGood",
  },
  {
    id: "beachJump",
    label: "Busy action shot",
    description: "Scattered subjects across a wide beach.",
    src: "/interactive-demos/photo-critique/Aaron_DuChateau_beach-jump.jpg",
    group: "fakeGood",
  },
];

export const demoSampleGroups: { id: DemoSampleGroupId; label: string; samples: DemoSample[] }[] = [
  {
    id: "alright",
    label: "My alright photos",
    samples: demoSamples.filter((s) => s.group === "alright"),
  },
  {
    id: "fakeGood",
    label: "Known “fake good” photos",
    samples: demoSamples.filter((s) => s.group === "fakeGood"),
  },
];

export const defaultDemoSampleId: DemoSampleId = "gardenTomatoes";

export function getDemoSample(id: DemoSampleId): DemoSample {
  const sample = demoSamples.find((s) => s.id === id);
  if (!sample) throw new Error(`Unknown demo sample: ${id}`);
  return sample;
}
