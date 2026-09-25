import { Engine } from "json-rules-engine";
import { allActivityRules } from "./rules";
import type { ActivityFacts } from "./types";

let engineSingleton: Engine | null = null;

export function getActivityEngine(): Engine {
  if (engineSingleton) return engineSingleton;
  const engine = new Engine(allActivityRules, { allowUndefinedFacts: true });
  engineSingleton = engine;
  return engine;
}

export type ActivityEngineResult =
  | { kind: "award"; points: number; title: string }
  | { kind: "skip" }
  | { kind: "none" };

export async function resolveActivityAward(facts: ActivityFacts): Promise<ActivityEngineResult> {
  const engine = getActivityEngine();
  const { events } = await engine.run(facts);

  const award = events.find((e) => e.type === "award-points");
  if (award) {
    const points = typeof award.params?.points === "number" ? award.params.points : 0;
    const title = typeof award.params?.title === "string" ? award.params.title : "Action";
    return { kind: "award", points, title };
  }

  if (events.some((e) => e.type === "skip-duplicate")) {
    return { kind: "skip" };
  }

  return { kind: "none" };
}
