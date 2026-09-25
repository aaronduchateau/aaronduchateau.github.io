import {
  BASE_CLICKS,
  CONTENT_WINDOW_SOUNDS,
  DEFAULT_BASE_CLICK_ID,
  DEFAULT_CONTENT_WINDOW_SOUND_ID,
  NO_SOUND_ID,
} from "@/theme/sounds";
import { THEME_IDS, type ThemeId } from "@/theme/types";
import { MILESTONE_SCHEDULE } from "./milestones";
import type {
  GrantedPrizes,
  MilestoneCardPrize,
  MilestonePrize,
  MilestoneSoundPrize,
  MilestoneThemePrize,
} from "./types";

const STARTER_BASE_CLICK_IDS = new Set<string>([NO_SOUND_ID, DEFAULT_BASE_CLICK_ID]);
const STARTER_CONTENT_WINDOW_IDS = new Set<string>([
  NO_SOUND_ID,
  DEFAULT_CONTENT_WINDOW_SOUND_ID,
]);

/** Trailing roster slots start locked; prizes grant explicit theme ids later. */
export const STARTER_LOCKED_THEME_COUNT = 3;
export const STARTER_LOCKED_THEME_IDS: readonly ThemeId[] = THEME_IDS.slice(
  -STARTER_LOCKED_THEME_COUNT,
);

const STARTER_LOCKED_THEME_SET = new Set<string>(STARTER_LOCKED_THEME_IDS);

function isSoundPrize(prize: MilestonePrize): prize is MilestoneSoundPrize {
  return prize.kind === "sound";
}

function isCardPrize(prize: MilestonePrize): prize is MilestoneCardPrize {
  return prize.kind === "card";
}

function isThemePrize(prize: MilestonePrize): prize is MilestoneThemePrize {
  return prize.kind === "theme";
}

/** Flatten milestone prize defs for ids unlocked in the activity store. */
export function resolveGrantedPrizes(unlockedMilestoneIds: readonly string[]): GrantedPrizes {
  const unlocked = new Set(unlockedMilestoneIds);
  const baseClickIds = new Set<string>(STARTER_BASE_CLICK_IDS);
  const contentWindowSoundIds = new Set<string>(STARTER_CONTENT_WINDOW_IDS);
  const cards: MilestoneCardPrize[] = [];
  const featureIds = new Set<string>();
  const themeIds = new Set<string>();

  for (const milestone of MILESTONE_SCHEDULE) {
    if (!unlocked.has(milestone.id)) continue;
    for (const prize of milestone.prizes ?? []) {
      if (isSoundPrize(prize)) {
        const target =
          prize.category === "baseClick" ? baseClickIds : contentWindowSoundIds;
        for (const soundId of prize.soundIds) target.add(soundId);
      } else if (isCardPrize(prize)) {
        cards.push(prize);
      } else if (prize.kind === "feature") {
        featureIds.add(prize.featureId);
      } else if (isThemePrize(prize)) {
        for (const themeId of prize.themeIds) themeIds.add(themeId);
      }
    }
  }

  return { baseClickIds, contentWindowSoundIds, cards, featureIds, themeIds };
}

export function isBaseClickUnlocked(
  soundId: string,
  unlockedMilestoneIds: readonly string[],
): boolean {
  if (soundId === NO_SOUND_ID) return true;
  return resolveGrantedPrizes(unlockedMilestoneIds).baseClickIds.has(soundId);
}

export function isContentWindowSoundUnlocked(
  soundId: string,
  unlockedMilestoneIds: readonly string[],
): boolean {
  if (soundId === NO_SOUND_ID) return true;
  return resolveGrantedPrizes(unlockedMilestoneIds).contentWindowSoundIds.has(soundId);
}

/** Starter-locked themes stay gated until a milestone grants that theme id. */
export function isThemeUnlocked(
  themeId: string,
  unlockedMilestoneIds: readonly string[],
): boolean {
  if (!STARTER_LOCKED_THEME_SET.has(themeId)) return true;
  return resolveGrantedPrizes(unlockedMilestoneIds).themeIds.has(themeId);
}

export function isFeatureUnlocked(
  featureId: string,
  unlockedMilestoneIds: readonly string[],
): boolean {
  return resolveGrantedPrizes(unlockedMilestoneIds).featureIds.has(featureId);
}

/** Card prize for a single milestone id (complete quests on the board). */
export function cardPrizeForMilestone(milestoneId: string): MilestoneCardPrize | null {
  const milestone = MILESTONE_SCHEDULE.find((row) => row.id === milestoneId);
  if (!milestone?.prizes) return null;
  return milestone.prizes.find(isCardPrize) ?? null;
}

/** All prizes declared on a milestone (sounds, card, features). */
export function prizesForMilestone(milestoneId: string): readonly MilestonePrize[] {
  return MILESTONE_SCHEDULE.find((row) => row.id === milestoneId)?.prizes ?? [];
}

/** All catalog ids in a sound category (for milestone prize definitions). */
export const ALL_BASE_CLICK_IDS = BASE_CLICKS.map((row) => row.id);
export const ALL_CONTENT_WINDOW_SOUND_IDS = CONTENT_WINDOW_SOUNDS.map((row) => row.id);
