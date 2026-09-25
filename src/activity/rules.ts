import type { RuleProperties } from "json-rules-engine";
import { POINT_SCHEDULE } from "./pointSchedule";

/**
 * Award points once per unique eventKey. Duplicate keys still hit the engine
 * but fire skip-duplicate so the tracker can log without scoring again.
 */
export const allActivityRules: RuleProperties[] = POINT_SCHEDULE.filter(
  (entry) => entry.type !== "milestone.unlock",
).map((entry) => ({
  name: `award-${entry.type}`,
  conditions: {
    all: [
      { fact: "eventType", operator: "equal", value: entry.type },
      { fact: "alreadyAwarded", operator: "equal", value: false },
    ],
  },
  event: {
    type: "award-points",
    params: {
      points: entry.points,
      title: entry.label,
      eventType: entry.type,
    },
  },
  priority: 10,
}));

allActivityRules.push({
  name: "skip-duplicate-award",
  conditions: {
    all: [{ fact: "alreadyAwarded", operator: "equal", value: true }],
  },
  event: {
    type: "skip-duplicate",
    params: {},
  },
  priority: 5,
});
