import type { MilestonePrize } from "./types";

/** Timekeeper prize — Willamette Pass wipe-out in Fun things → Random Pins. */
export const RANDOM_MOUNTAIN_BIKE_CRASH_FEATURE_ID = "random-mountain-bike-crash";

/** Ant Hill Poker (Monkey card) — monkey riding the dog in Fun things → Random Pins. */
export const RANDOM_MONKEY_DOG_FEATURE_ID = "random-monkey-dog";

export type OptionsUnlockTarget = {
  kind: "options";
  panel: "themes" | "versions" | "sounds" | "my-events";
  soundCategory?: "base-clicks" | "content-windows";
};

export type ModalUnlockTarget = {
  kind: "modal";
  namespace: string;
  key: string;
  path?: string[];
  item?: string;
};

export type UnlockedContentTarget = OptionsUnlockTarget | ModalUnlockTarget;

export type UnlockFeatureDef = {
  label: string;
  target: UnlockedContentTarget;
  /** Media item ids this feature unlocks (catalog; apply via gatedByFeature). */
  gatedMediaIds?: readonly string[];
};

export const UNLOCK_FEATURE_CATALOG: Record<string, UnlockFeatureDef> = {
  [RANDOM_MOUNTAIN_BIKE_CRASH_FEATURE_ID]: {
    label: "Mountain bike crash",
    gatedMediaIds: ["random-video-3"],
    target: {
      kind: "modal",
      namespace: "fun",
      key: "random",
      item: "random-video-3",
    },
  },
  [RANDOM_MONKEY_DOG_FEATURE_ID]: {
    label: "Monkey riding the dog",
    gatedMediaIds: ["random-monkey_dog"],
    target: {
      kind: "modal",
      namespace: "fun",
      key: "random",
      item: "random-monkey_dog",
    },
  },
};

export function featureLabel(featureId: string): string {
  return UNLOCK_FEATURE_CATALOG[featureId]?.label ?? featureId;
}

/** Route for the easter-egg “View unlocked content” control — prize-driven. */
export function viewTargetForPrize(prize: MilestonePrize): UnlockedContentTarget | null {
  if (prize.kind === "sound") {
    return {
      kind: "options",
      panel: "sounds",
      soundCategory: prize.category === "baseClick" ? "base-clicks" : "content-windows",
    };
  }
  if (prize.kind === "theme") {
    return { kind: "options", panel: "themes" };
  }
  if (prize.kind === "feature") {
    return UNLOCK_FEATURE_CATALOG[prize.featureId]?.target ?? null;
  }
  return null;
}
