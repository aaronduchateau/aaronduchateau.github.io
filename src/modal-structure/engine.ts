import { Engine } from "json-rules-engine";
import { allModalStructureRules } from "./rules";
import {
  DEFAULT_MODAL_STRUCTURE_POLICY,
  type EnterCollectionAt,
  type ModalStructureFacts,
  type ModalStructurePolicy,
} from "./types";

let engineSingleton: Engine | null = null;

/** Build (once) the client-side modal-structure rules engine. */
export function getModalStructureEngine(): Engine {
  if (engineSingleton) return engineSingleton;

  const engine = new Engine(allModalStructureRules, {
    allowUndefinedFacts: true,
  });

  engineSingleton = engine;
  return engine;
}

function enterCollectionAtFromParams(value: unknown): EnterCollectionAt {
  return value === "final" ? "final" : "first";
}

function policyFromParams(params: Record<string, unknown> | undefined): ModalStructurePolicy {
  if (!params) return { ...DEFAULT_MODAL_STRUCTURE_POLICY };
  return {
    badgeFinalPhotoInNestedCollections: params.badgeFinalPhotoInNestedCollections === true,
    coverFromFinalPhoto: params.coverFromFinalPhoto === true,
    enterCollectionAt: enterCollectionAtFromParams(params.enterCollectionAt),
    finalResultBadgeExitsCollection: params.finalResultBadgeExitsCollection === true,
  };
}

/**
 * Run facts through json-rules-engine and return the modal structure policy.
 * Browser-oriented (MediaModal); safe to call from client effects.
 */
export async function resolveModalStructure(
  facts: ModalStructureFacts,
): Promise<ModalStructurePolicy> {
  const engine = getModalStructureEngine();
  const { events } = await engine.run(facts);

  let policy = { ...DEFAULT_MODAL_STRUCTURE_POLICY };
  for (const event of events) {
    if (event.type === "set-modal-structure") {
      policy = policyFromParams(event.params as Record<string, unknown> | undefined);
    }
  }
  return policy;
}
