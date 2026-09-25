import { cardPrizeForMilestone, prizesForMilestone } from "@/activity/milestonePrizes";
import { MILESTONE_SCHEDULE } from "@/activity/milestones";
import type { MilestoneCardPrize, MilestonePrize } from "@/activity/types";
import {
  featureLabel,
  viewTargetForPrize,
  type UnlockedContentTarget,
} from "@/activity/unlockFeatures";
import { INTRO_SIDE_QUESTS, type IntroSideQuest } from "@/data/introScreen";
import { BASE_CLICKS, CONTENT_WINDOW_SOUNDS } from "@/theme/sounds";
import { THEME_LABELS, type ThemeId } from "@/theme/types";

export type QuestBoardCardModel = {
  title: string;
  bounty: string;
  complete: boolean;
  locked: boolean;
  unlockItems: string[];
  card: MilestoneCardPrize | null;
};

/** Presentational prize row — labels and route already resolved by the parent. */
export type PrizeRowDisplay = {
  key: string;
  title: string;
  hint: string;
  labels: string[];
  unlockTarget: UnlockedContentTarget | null;
};

function soundLabelsForIds(
  ids: readonly string[],
  category: "baseClick" | "contentWindow",
): string[] {
  const catalog = category === "baseClick" ? BASE_CLICKS : CONTENT_WINDOW_SOUNDS;
  return ids.map((id) => catalog.find((row) => row.id === id)?.label ?? id);
}

export function prizeRowFromMilestone(
  prize: MilestonePrize,
  complete: boolean,
): PrizeRowDisplay | null {
  if (prize.kind === "card") return null;
  if (prize.kind === "sound") {
    return {
      key: `sound:${prize.category}:${prize.soundIds.join(",")}`,
      title: prize.category === "baseClick" ? "Base clicks" : "Content window sounds",
      hint: complete
        ? "Unlocked and equippable"
        : "These sounds unlock when you finish this quest",
      labels: soundLabelsForIds(prize.soundIds, prize.category),
      unlockTarget: viewTargetForPrize(prize),
    };
  }
  if (prize.kind === "theme") {
    return {
      key: `theme:${prize.themeIds.join(",")}`,
      title: "Themes",
      hint: complete
        ? "Unlocked in Options"
        : "These characters unlock when you finish this quest",
      labels: prize.themeIds.map((id) => THEME_LABELS[id as ThemeId] ?? id),
      unlockTarget: viewTargetForPrize(prize),
    };
  }
  if (prize.kind === "feature") {
    return {
      key: `feature:${prize.featureId}`,
      title: featureLabel(prize.featureId),
      hint: complete
        ? "Unlocked in the portfolio"
        : "This unlocks when you finish this quest",
      labels: [],
      unlockTarget: viewTargetForPrize(prize),
    };
  }
  return null;
}

export function prizeRowsFromPrizes(
  prizes: readonly MilestonePrize[],
  complete: boolean,
): PrizeRowDisplay[] {
  const rows: PrizeRowDisplay[] = [];
  for (const prize of prizes) {
    const row = prizeRowFromMilestone(prize, complete);
    if (row) rows.push(row);
  }
  return rows;
}

export function questBountyLine(quest: IntroSideQuest): string {
  const milestone = MILESTONE_SCHEDULE.find((row) => row.id === quest.id);
  if (!milestone) return quest.blurb;
  const bounty = milestone.points > 0 ? milestone.points : milestone.scoreThreshold;
  if (!bounty) return milestone.description;
  return `${bounty} pts bounty — ${milestone.description}`;
}

export function unlockSummaries(prizes: readonly MilestonePrize[]): string[] {
  const items: string[] = [];
  for (const prize of prizes) {
    if (prize.kind === "sound") {
      const group = prize.category === "baseClick" ? "Base clicks" : "Content window sounds";
      items.push(`${prize.soundIds.length} ${group.toLowerCase()}`);
    } else if (prize.kind === "theme") {
      items.push(
        prize.themeIds.length === 1 ? "1 theme" : `${prize.themeIds.length} themes`,
      );
    } else if (prize.kind === "feature") {
      items.push(featureLabel(prize.featureId));
    }
  }
  return items;
}

/** Controller lookup: quest record → the props the presentational card consumes. */
export function questBoardCardPropsFromQuest(quest: IntroSideQuest): QuestBoardCardModel {
  return {
    title: quest.title,
    bounty: questBountyLine(quest),
    complete: quest.status === "complete",
    locked: quest.status === "locked",
    unlockItems: unlockSummaries(prizesForMilestone(quest.id)),
    card: cardPrizeForMilestone(quest.id),
  };
}

export function resolveIntroQuest(
  questId: string,
  complete: boolean,
): IntroSideQuest {
  const def = INTRO_SIDE_QUESTS.find((row) => row.id === questId) ?? INTRO_SIDE_QUESTS[0];
  return {
    ...def,
    status: complete ? "complete" : "available",
  };
}
