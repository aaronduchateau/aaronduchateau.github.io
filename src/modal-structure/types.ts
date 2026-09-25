/**
 * Modal structure ids resolved by json-rules-engine.
 * Facts → rules → policy pack (same pattern as theme tokens).
 */
export const MODAL_STRUCTURE_IDS = ["default", "repairs"] as const;

export type ModalStructureId = (typeof MODAL_STRUCTURE_IDS)[number];

export const DEFAULT_MODAL_STRUCTURE_ID: ModalStructureId = "default";

/** Where nested-collection entry lands in the strip. */
export type EnterCollectionAt = "first" | "final";

/**
 * Behavioral policy for a MediaModal — owned by the modal-structure rules engine,
 * not ad-hoc conditionals in the modal component.
 */
export type ModalStructurePolicy = {
  /**
   * When viewing a nested collection, badge the last top-level photo as
   * “Intended final result” (pane + thumbnail).
   */
  badgeFinalPhotoInNestedCollections: boolean;
  /**
   * When true, collection cover art is derived from that last photo
   * (parent strip / Open … surface), not a hand-synced `cover.src`.
   */
  coverFromFinalPhoto: boolean;
  /** Selection index policy when drilling into a nested collection. */
  enterCollectionAt: EnterCollectionAt;
  /**
   * Final-result badge becomes a GO BACK control (hover + click exits the
   * nested collection like the header X).
   */
  finalResultBadgeExitsCollection: boolean;
};

export const DEFAULT_MODAL_STRUCTURE_POLICY: ModalStructurePolicy = {
  badgeFinalPhotoInNestedCollections: false,
  coverFromFinalPhoto: false,
  enterCollectionAt: "first",
  finalResultBadgeExitsCollection: false,
};

export type ModalStructureFacts = {
  /** Which modal structure pack to apply — e.g. `"repairs"`. */
  structureId: string;
};
