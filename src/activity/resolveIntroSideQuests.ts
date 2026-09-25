import { INTRO_SIDE_QUESTS, type IntroSideQuest } from "@/data/introScreen";
import { buildMilestoneFacts } from "./milestoneFacts";
import { SCORE_TIER_MILESTONES } from "./milestones";
import { getActivityStoreSnapshot } from "./tracker";
import type { ActivityStore } from "./types";

const SCORE_THRESHOLDS = new Map(
  SCORE_TIER_MILESTONES.map((tier) => [tier.id, tier.scoreThreshold ?? 0]),
);

/** Resolve easter-board quest statuses from the activity store + milestone facts. */
export function resolveIntroSideQuests(
  store: ActivityStore = getActivityStoreSnapshot(),
): IntroSideQuest[] {
  const facts = buildMilestoneFacts(store);
  const unlocked = new Set(facts.unlockedMilestoneIds);

  return INTRO_SIDE_QUESTS.map((quest) => {
    let status: IntroSideQuest["status"];
    const scoreThreshold = SCORE_THRESHOLDS.get(quest.id);
    const scoreMet =
      typeof scoreThreshold === "number" &&
      scoreThreshold > 0 &&
      facts.totalScore >= scoreThreshold;

    if (unlocked.has(quest.id) || scoreMet) {
      status = "complete";
    } else {
      status = "available";
    }
    return { ...quest, status };
  });
}
