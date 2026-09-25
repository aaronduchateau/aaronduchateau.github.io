import { SCORE_TIER_MILESTONES } from "@/activity/milestones";
import {
  isThemeUnlocked,
  STARTER_LOCKED_THEME_COUNT,
} from "@/activity/milestonePrizes";
import { THEME_PALETTES } from "@/theme/palettes";
import { THEME_IDS, themeDisplayLabel, type ThemeId } from "@/theme/types";

/** Trailing N themes in `THEME_IDS` start locked until a milestone grants them. */
export const INTRO_LOCKED_CHARACTER_COUNT = STARTER_LOCKED_THEME_COUNT;

export type IntroSideQuestStatus = "locked" | "available" | "complete";

export type IntroSideQuestCategory = "action" | "score" | "quiz";

export type IntroSideQuest = {
  id: string;
  title: string;
  blurb: string;
  category?: IntroSideQuestCategory;
  /** Resolved at runtime from the milestone rules engine + activity store. */
  status: IntroSideQuestStatus;
};

export type IntroSideQuestDef = Omit<IntroSideQuest, "status">;

export type IntroCharacterStat = {
  id: string;
  label: string;
  /** 0–100 for the progress bar. */
  value: number;
};

export type IntroCharacter = {
  id: ThemeId;
  label: string;
  available: boolean;
  stats: IntroCharacterStat[];
  /** Portrait for the intro sheet; ADA Guy uses Software Guy art (header stays photo-free). */
  art: string | null;
};

const SCORE_TIER_QUESTS: IntroSideQuestDef[] = SCORE_TIER_MILESTONES.map((tier) => ({
  id: tier.id,
  title: tier.title,
  blurb: `${tier.scoreThreshold} pts bounty — ${tier.description}`,
  category: "score" as const,
}));

/**
 * Demo side quests for the intro easter-egg board.
 * Status is resolved via `resolveIntroSideQuests` (milestone rules + activity log).
 */
export const INTRO_SIDE_QUESTS: IntroSideQuestDef[] = [
  {
    id: "quiz-caveman",
    title: "Portfolio Power",
    blurb: "Pass the Quiz Power check — miss fewer than three questions.",
    category: "quiz",
  },
  {
    id: "intro-video-end",
    title: "Opening Act",
    blurb: "Watch the portfolio intro video end-to-end.",
  },
  {
    id: "timeline-pause",
    title: "Timekeeper",
    blurb: "Pause the Career timeline on a specific employer.",
  },
  {
    id: "open-three-modals",
    title: "Curious Clicker",
    blurb: "Open three different content windows from the main portfolio.",
  },
  {
    id: "theme-hopper",
    title: "Character Ninja",
    blurb: "Try three different themes from Options on the main portfolio.",
  },
  {
    id: "photo-critique-run",
    title: "Photo flow",
    blurb: "Run Photo critique on a demo sample or your own upload.",
  },
  {
    id: "zeep-survivor",
    title: "Zeep Survivor",
    blurb: "Enable Zeep Zoop Click… and survive a full navigation lap.",
  },
  {
    id: "archive-dive",
    title: "Archive Diver",
    blurb: "Watch a clip from the Older Video Showcase end-to-end.",
  },
  ...SCORE_TIER_QUESTS,
];

/** Fun RPG-style bars shown beside / over the selected character. */
export const INTRO_CHARACTER_STATS: Record<ThemeId, IntroCharacterStat[]> = {
  cyberpunk: [
    { id: "strength", label: "Strength", value: 68 },
    { id: "endurance", label: "Endurance", value: 74 },
    { id: "empathy", label: "Empathy", value: 71 },
    { id: "wit", label: "Wit", value: 88 },
    { id: "chaos", label: "Chaos", value: 62 },
  ],
  "relic-guy": [
    { id: "strength", label: "Strength", value: 82 },
    { id: "endurance", label: "Endurance", value: 90 },
    { id: "empathy", label: "Empathy", value: 64 },
    { id: "wit", label: "Wit", value: 79 },
    { id: "chaos", label: "Chaos", value: 55 },
  ],
  "psychedelic-hippie": [
    { id: "strength", label: "Strength", value: 48 },
    { id: "endurance", label: "Endurance", value: 66 },
    { id: "empathy", label: "Empathy", value: 94 },
    { id: "wit", label: "Wit", value: 72 },
    { id: "chaos", label: "Chaos", value: 91 },
  ],
  "cursive-roman-empire": [
    { id: "strength", label: "Strength", value: 76 },
    { id: "endurance", label: "Endurance", value: 70 },
    { id: "empathy", label: "Empathy", value: 58 },
    { id: "wit", label: "Wit", value: 84 },
    { id: "chaos", label: "Chaos", value: 40 },
  ],
  "ada-first": [
    { id: "strength", label: "Strength", value: 60 },
    { id: "endurance", label: "Endurance", value: 85 },
    { id: "empathy", label: "Empathy", value: 92 },
    { id: "wit", label: "Wit", value: 80 },
    { id: "chaos", label: "Chaos", value: 18 },
  ],
  professional: [
    { id: "strength", label: "Strength", value: 64 },
    { id: "endurance", label: "Endurance", value: 88 },
    { id: "empathy", label: "Empathy", value: 70 },
    { id: "wit", label: "Wit", value: 86 },
    { id: "chaos", label: "Chaos", value: 22 },
  ],
  "conspiracy-theorist": [
    { id: "strength", label: "Strength", value: 55 },
    { id: "endurance", label: "Endurance", value: 77 },
    { id: "empathy", label: "Empathy", value: 61 },
    { id: "wit", label: "Wit", value: 93 },
    { id: "chaos", label: "Chaos", value: 84 },
  ],
  "galaxy-guy": [
    { id: "strength", label: "Strength", value: 70 },
    { id: "endurance", label: "Endurance", value: 73 },
    { id: "empathy", label: "Empathy", value: 78 },
    { id: "wit", label: "Wit", value: 81 },
    { id: "chaos", label: "Chaos", value: 69 },
  ],
  atlantean: [
    { id: "strength", label: "Strength", value: 85 },
    { id: "endurance", label: "Endurance", value: 80 },
    { id: "empathy", label: "Empathy", value: 75 },
    { id: "wit", label: "Wit", value: 77 },
    { id: "chaos", label: "Chaos", value: 45 },
  ],
  "captain-guy": [
    { id: "strength", label: "Strength", value: 72 },
    { id: "endurance", label: "Endurance", value: 83 },
    { id: "empathy", label: "Empathy", value: 52 },
    { id: "wit", label: "Wit", value: 90 },
    { id: "chaos", label: "Chaos", value: 78 },
  ],
  nerd: [
    { id: "strength", label: "Strength", value: 44 },
    { id: "endurance", label: "Endurance", value: 69 },
    { id: "empathy", label: "Empathy", value: 86 },
    { id: "wit", label: "Wit", value: 97 },
    { id: "chaos", label: "Chaos", value: 58 },
  ],
  "pop-art-guy": [
    { id: "strength", label: "Strength", value: 50 },
    { id: "endurance", label: "Endurance", value: 62 },
    { id: "empathy", label: "Empathy", value: 68 },
    { id: "wit", label: "Wit", value: 89 },
    { id: "chaos", label: "Chaos", value: 95 },
  ],
  surrealist: [
    { id: "strength", label: "Strength", value: 57 },
    { id: "endurance", label: "Endurance", value: 71 },
    { id: "empathy", label: "Empathy", value: 80 },
    { id: "wit", label: "Wit", value: 92 },
    { id: "chaos", label: "Chaos", value: 99 },
  ],
  "dog-days-guy": [
    { id: "strength", label: "Strength", value: 63 },
    { id: "endurance", label: "Endurance", value: 76 },
    { id: "empathy", label: "Empathy", value: 98 },
    { id: "wit", label: "Wit", value: 74 },
    { id: "chaos", label: "Chaos", value: 51 },
  ],
  "retro-guy": [
    { id: "strength", label: "Strength", value: 91 },
    { id: "endurance", label: "Endurance", value: 87 },
    { id: "empathy", label: "Empathy", value: 73 },
    { id: "wit", label: "Wit", value: 66 },
    { id: "chaos", label: "Chaos", value: 60 },
  ],
};

export function introCharacterLabel(
  themeId: ThemeId,
  previousDisplayedLabel?: string | null,
): string {
  return themeDisplayLabel(themeId, previousDisplayedLabel);
}

/** Selectable when the theme is not starter-locked, or a milestone granted its id. */
export function isIntroCharacterAvailable(
  themeId: ThemeId,
  unlockedMilestoneIds: readonly string[] = [],
): boolean {
  return isThemeUnlocked(themeId, unlockedMilestoneIds);
}

function introCharacterStats(themeId: ThemeId): IntroCharacterStat[] {
  return INTRO_CHARACTER_STATS[themeId] ?? INTRO_CHARACTER_STATS.cyberpunk;
}

function introCharacterArt(themeId: ThemeId): string | null {
  if (themeId === "ada-first") return THEME_PALETTES.professional.heroImage;
  return THEME_PALETTES[themeId].heroImage;
}

export function introCharacters(
  previousDisplayedLabel?: string | null,
  unlockedMilestoneIds: readonly string[] = [],
): IntroCharacter[] {
  return THEME_IDS.map((id) => ({
    id,
    label: introCharacterLabel(id, previousDisplayedLabel),
    available: isIntroCharacterAvailable(id, unlockedMilestoneIds),
    stats: introCharacterStats(id),
    art: introCharacterArt(id),
  }));
}
