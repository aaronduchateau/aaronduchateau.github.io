import { demoSamples } from "@/interactive-demos/photo-critique/demoSamples";
import type { LibraryPropMap } from "./types";

export type CompareSliderSample = {
  id: string;
  label: string;
  beforeSrc: string;
  afterSrc: string;
  beforeLabel: string;
  afterLabel: string;
};

const EDIT_BY_SAMPLE: Record<string, string> = {
  gardenTomatoes: "/photo-chat-improvments/Aaron_DuChateau_garden-tomatoes-edit.png",
  astronautMural: "/photo-chat-improvments/Aaron_DuChateau_astronaut-mural-edit.png",
  coupleThrones: "/photo-chat-improvments/Aaron_DuChateau_couple-thrones-edit-1.png",
  closeUpSmile: "/photo-chat-improvments/Aaron_DuChateau_close-up-smile-edit.png",
  mistyHillside: "/photo-chat-improvments/Aaron_DuChateau_misty-hillside-edit.png",
  farmPigs: "/photo-chat-improvments/Aaron_DuChateau_farm-pigs-edit.png",
  charlieDog: "/photo-chat-improvments/Aaron_DuChateau_charlie-dog-edit.png",
  patrickOnCarpet: "/photo-chat-improvments/Aaron_DuChateau_patrick-on-carpet-edit.png",
  patrickPlayful: "/photo-chat-improvments/Aaron_DuChateau_patrick-playful-edit.png",
  busyFountain: "/photo-chat-improvments/Aaron_DuChateau_competing-subjects-edit.png",
  chaoticFisheye: "/photo-chat-improvments/Aaron_DuChateau_chaotic-frame-edit.png",
  beachJump: "/photo-chat-improvments/Aaron_DuChateau_busy-action-shot-edit.png",
};

export const COMPARE_SLIDER_SAMPLES: readonly CompareSliderSample[] = demoSamples
  .filter((sample) => EDIT_BY_SAMPLE[sample.id])
  .map((sample) => ({
    id: sample.id,
    label: sample.label,
    beforeSrc: sample.src,
    afterSrc: EDIT_BY_SAMPLE[sample.id],
    beforeLabel: "Original",
    afterLabel: "Suggested",
  }));

export function hydrateCompareSliderLibraryProps(props: LibraryPropMap): LibraryPropMap {
  const sample =
    COMPARE_SLIDER_SAMPLES.find((row) => row.id === props.sampleId) ?? COMPARE_SLIDER_SAMPLES[0];
  if (!sample) return props;
  return {
    ...props,
    sampleId: sample.id,
    beforeSrc: sample.beforeSrc,
    afterSrc: sample.afterSrc,
    beforeLabel: props.beforeLabel || sample.beforeLabel,
    afterLabel: props.afterLabel || sample.afterLabel,
  };
}

export function applyCompareSliderControl(
  props: LibraryPropMap,
  key: string,
  next: string,
): LibraryPropMap {
  const merged = { ...props, [key]: next };
  if (key === "sampleId") return hydrateCompareSliderLibraryProps(merged);
  return merged;
}

export function compareSliderJsonNeedsHydration(props: LibraryPropMap): boolean {
  return Boolean(props.sampleId) && (!props.beforeSrc || !props.afterSrc);
}
