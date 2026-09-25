import type { RuleProperties } from "json-rules-engine";
import { MODAL_STRUCTURE_IDS } from "./types";

/**
 * Default modal structure — no repair-album conventions.
 * Other modals (videos, fun-things galleries, etc.) share this unless they
 * set `MediaModalConfig.structureId` to a more specific pack.
 */
export const defaultModalStructureRule: RuleProperties = {
  name: "modal-structure:default",
  priority: 1,
  conditions: {
    all: [
      {
        fact: "structureId",
        operator: "notIn",
        value: MODAL_STRUCTURE_IDS.filter((id) => id !== "default"),
      },
    ],
  },
  event: {
    type: "set-modal-structure",
    params: {
      structureId: "default",
      badgeFinalPhotoInNestedCollections: false,
      coverFromFinalPhoto: false,
      enterCollectionAt: "first",
      finalResultBadgeExitsCollection: false,
    },
  },
};

/**
 * Repairs fun-things modal: nested albums show the final photo as cover,
 * open on the first slide, badge the last photo, and the badge exits the album.
 */
export const repairsModalStructureRule: RuleProperties = {
  name: "modal-structure:repairs",
  priority: 10,
  conditions: {
    all: [
      {
        fact: "structureId",
        operator: "equal",
        value: "repairs",
      },
    ],
  },
  event: {
    type: "set-modal-structure",
    params: {
      structureId: "repairs",
      badgeFinalPhotoInNestedCollections: true,
      coverFromFinalPhoto: true,
      enterCollectionAt: "first",
      finalResultBadgeExitsCollection: true,
    },
  },
};

export const allModalStructureRules: RuleProperties[] = [
  repairsModalStructureRule,
  defaultModalStructureRule,
];
