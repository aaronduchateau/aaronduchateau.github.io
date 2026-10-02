import type { RuleProperties } from "json-rules-engine";
import { Engine } from "json-rules-engine";

/** Plaintext code — intentionally not obfuscated yet. */
export const PUMPKIN_EATER_CHEAT_CODE = "PUMPKINEATER2026";

export const CHEAT_UNLOCK_ALL_CONTENT_ID = "pumpkin-eater-2026";
export const CHEAT_UNLOCK_ALL_EVENT_KEY = `cheat.unlock-all:${CHEAT_UNLOCK_ALL_CONTENT_ID}`;

export type CheatUnlockFacts = {
  codeAccepted: boolean;
  cheatAlreadyAwarded: boolean;
};

export type CheatUnlockResult =
  | { kind: "grant"; bonusPoints: number }
  | { kind: "alreadyApplied" }
  | { kind: "none" };

const CHEAT_UNLOCK_ALL_RULE: RuleProperties = {
  name: "cheat:pumpkin-eater-unlock-all",
  priority: 10,
  conditions: {
    all: [
      { fact: "codeAccepted", operator: "equal", value: true },
      { fact: "cheatAlreadyAwarded", operator: "equal", value: false },
    ],
  },
  event: {
    type: "cheat-unlock-all",
    params: {
      bonusPoints: 2500,
      title: "Pumpkin Eater",
    },
  },
};

let cheatEngine: Engine | null = null;

function getCheatEngine(): Engine {
  if (cheatEngine) return cheatEngine;
  cheatEngine = new Engine([CHEAT_UNLOCK_ALL_RULE], { allowUndefinedFacts: true });
  return cheatEngine;
}

/** Rules-engine decision for the unlock-all cheat (no store mutation). */
export async function resolveCheatUnlock(facts: CheatUnlockFacts): Promise<CheatUnlockResult> {
  if (facts.cheatAlreadyAwarded) return { kind: "alreadyApplied" };
  const { events } = await getCheatEngine().run(facts);
  const grant = events.find((event) => event.type === "cheat-unlock-all");
  if (!grant) return { kind: "none" };
  const bonusPoints =
    typeof grant.params?.bonusPoints === "number" ? grant.params.bonusPoints : 2500;
  return { kind: "grant", bonusPoints };
}
