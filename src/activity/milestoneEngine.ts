import { Engine } from "json-rules-engine";
import { allMilestoneRules } from "./milestones";
import type { MilestoneFacts } from "./types";

let engineSingleton: Engine | null = null;

export function getMilestoneEngine(): Engine {
  if (engineSingleton) return engineSingleton;
  const engine = new Engine(allMilestoneRules, { allowUndefinedFacts: true });
  engineSingleton = engine;
  return engine;
}

export type MilestoneUnlock = {
  milestoneId: string;
  points: number;
  title: string;
};

/** Run aggregate milestone facts; return every newly unlocked milestone. */
export async function resolveMilestoneUnlocks(facts: MilestoneFacts): Promise<MilestoneUnlock[]> {
  const engine = getMilestoneEngine();
  const { events } = await engine.run(facts);
  const unlocks: MilestoneUnlock[] = [];

  for (const event of events) {
    if (event.type !== "unlock-milestone") continue;
    const milestoneId =
      typeof event.params?.milestoneId === "string" ? event.params.milestoneId : "";
    const points = typeof event.params?.points === "number" ? event.params.points : 0;
    const title = typeof event.params?.title === "string" ? event.params.title : milestoneId;
    if (!milestoneId) continue;
    unlocks.push({ milestoneId, points, title });
  }

  return unlocks;
}
