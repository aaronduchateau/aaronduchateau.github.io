import type { RuleProperties } from "json-rules-engine";
import { BASE_CLICKS, CONTENT_WINDOW_SOUNDS } from "@/theme/sounds";
import type { ThemeId } from "@/theme/types";
import {
  RANDOM_MONKEY_DOG_FEATURE_ID,
  RANDOM_MOUNTAIN_BIKE_CRASH_FEATURE_ID,
} from "./unlockFeatures";
import type { MilestoneCardPrize, MilestoneDefinition, MilestonePrize } from "./types";

const SCORE_TIER_BLURB =
  "Interact with content you haven't seen before to gain points and unlock new content.";

const QUEST_PLACEHOLDER_CARD = "/cards/Aaron_DuChateau_quest-placeholder.svg";

/** Filename prefix for portfolio photo/icon assets under `public/` (excl. archive/audio). */
const PHOTO_FILENAME_PREFIX = "Aaron_DuChateau_";

function rewardCardSrc(stem: string): string {
  return `/cards/${PHOTO_FILENAME_PREFIX}${stem}_reward_card.png`;
}

/** Local trading-card art in `public/cards/Aaron_DuChateau_{animal}_reward_card.png`. */
const QUEST_ANIMALS: Record<string, { animal: string; imageSrc: string }> = {
  "intro-video-end": { animal: "Puppy", imageSrc: rewardCardSrc("puppy") },
  "timeline-pause": { animal: "Bear", imageSrc: rewardCardSrc("bear") },
  "open-three-modals": { animal: "Moose", imageSrc: rewardCardSrc("moose") },
  "theme-hopper": { animal: "Coyote", imageSrc: rewardCardSrc("coyote") },
  "photo-critique-run": { animal: "Tiger", imageSrc: rewardCardSrc("tiger") },
  "zeep-survivor": { animal: "Husky", imageSrc: rewardCardSrc("husky") },
  "archive-dive": { animal: "Wolf", imageSrc: rewardCardSrc("wolf") },
  "score-anthill-poker": { animal: "Monkey", imageSrc: rewardCardSrc("monkey") },
  "score-sock-drawer": { animal: "Elk", imageSrc: rewardCardSrc("elk") },
  "score-puddle-negotiator": { animal: "Bulldog", imageSrc: rewardCardSrc("bulldog") },
  "score-sidewalk-summit": { animal: "Bird", imageSrc: rewardCardSrc("bird") },
  "score-attic-archaeologist": { animal: "Pengalin", imageSrc: rewardCardSrc("pengalin") },
  "score-mountain-climber": { animal: "Panther", imageSrc: rewardCardSrc("panther") },
  "score-cloudline-warden": { animal: "Blue Whale", imageSrc: rewardCardSrc("blue_whale") },
  "quiz-caveman": { animal: "Caveman", imageSrc: rewardCardSrc("caveman") },
};

function milestoneCard(id: string, title: string): MilestoneCardPrize {
  const animal = QUEST_ANIMALS[id];
  return {
    kind: "card",
    cardId: `card-${id}`,
    title,
    animalName: animal?.animal ?? "Mystery animal",
    imageSrc: animal?.imageSrc ?? QUEST_PLACEHOLDER_CARD,
  };
}

function cardOnlyPrizes(title: string, id: string): readonly MilestonePrize[] {
  return [milestoneCard(id, title)];
}

function themePrize(...themeIds: ThemeId[]): MilestonePrize {
  return { kind: "theme", themeIds };
}

/**
 * Score-tier round — vague effort names (not characters).
 * Ids are stable; unlock when totalScore reaches the threshold.
 * Mid/high tiers grant the three starter-locked themes (Nerd → Dog Days → Atlantic).
 */
export const SCORE_TIER_MILESTONES: readonly MilestoneDefinition[] = [
  {
    id: "score-anthill-poker",
    points: 0,
    title: "Ant Hill Poker",
    description: SCORE_TIER_BLURB,
    scoreThreshold: 450,
    prizes: [
      { kind: "feature", featureId: RANDOM_MONKEY_DOG_FEATURE_ID },
      milestoneCard("score-anthill-poker", "Ant Hill Poker"),
    ],
  },
  {
    id: "score-sock-drawer",
    points: 0,
    title: "Sock Drawer Surveyor",
    description: SCORE_TIER_BLURB,
    scoreThreshold: 792,
    prizes: [
      themePrize("nerd"),
      milestoneCard("score-sock-drawer", "Sock Drawer Surveyor"),
    ],
  },
  {
    id: "score-puddle-negotiator",
    points: 0,
    title: "Puddle Negotiator",
    description: SCORE_TIER_BLURB,
    scoreThreshold: 1133,
    prizes: cardOnlyPrizes("Puddle Negotiator", "score-puddle-negotiator"),
  },
  {
    id: "score-sidewalk-summit",
    points: 0,
    title: "Sidewalk Summiteer",
    description: SCORE_TIER_BLURB,
    scoreThreshold: 1475,
    prizes: [
      themePrize("dog-days-guy"),
      milestoneCard("score-sidewalk-summit", "Sidewalk Summiteer"),
    ],
  },
  {
    id: "score-attic-archaeologist",
    points: 0,
    title: "Attic Archaeologist",
    description: SCORE_TIER_BLURB,
    scoreThreshold: 1817,
    prizes: cardOnlyPrizes("Attic Archaeologist", "score-attic-archaeologist"),
  },
  {
    id: "score-mountain-climber",
    points: 0,
    title: "Mountain Climber",
    description: SCORE_TIER_BLURB,
    scoreThreshold: 2158,
    prizes: cardOnlyPrizes("Mountain Climber", "score-mountain-climber"),
  },
  {
    id: "score-cloudline-warden",
    points: 0,
    title: "Cloud Line Warden",
    description: SCORE_TIER_BLURB,
    scoreThreshold: 2500,
    prizes: [
      themePrize("atlantean"),
      milestoneCard("score-cloudline-warden", "Cloud Line Warden"),
    ],
  },
] as const;

/**
 * Easter-board milestones (ids match intro side quests).
 * Unlocked once via the milestone rules engine.
 */
export const MILESTONE_SCHEDULE: readonly MilestoneDefinition[] = [
  {
    id: "intro-video-end",
    points: 30,
    title: "Opening Act",
    description: "Watch the portfolio intro video end-to-end.",
    prizes: [
      { kind: "sound", category: "baseClick", soundIds: BASE_CLICKS.map((row) => row.id) },
      milestoneCard("intro-video-end", "Opening Act"),
    ],
  },
  {
    id: "timeline-pause",
    points: 25,
    title: "Timekeeper",
    description: "Pause the Career timeline on a specific employer.",
    prizes: [
      { kind: "feature", featureId: RANDOM_MOUNTAIN_BIKE_CRASH_FEATURE_ID },
      milestoneCard("timeline-pause", "Timekeeper"),
    ],
  },
  {
    id: "open-three-modals",
    points: 40,
    title: "Curious Clicker",
    description: "Open three different content windows from the main portfolio.",
    prizes: [
      { kind: "sound", category: "contentWindow", soundIds: CONTENT_WINDOW_SOUNDS.map((row) => row.id) },
      milestoneCard("open-three-modals", "Curious Clicker"),
    ],
  },
  {
    id: "theme-hopper",
    points: 45,
    title: "Character Ninja",
    description:
      "Try three different themes from Options (or the theme playground) on the main portfolio.",
    prizes: cardOnlyPrizes("Character Ninja", "theme-hopper"),
  },
  {
    id: "photo-critique-run",
    points: 35,
    title: "Photo flow",
    description: "Run Photo critique on a demo sample or your own upload.",
    prizes: cardOnlyPrizes("Photo flow", "photo-critique-run"),
  },
  {
    id: "zeep-survivor",
    points: 50,
    title: "Zeep Survivor",
    description: "Enable Zeep Zoop Click and open at least one content window afterward.",
    prizes: cardOnlyPrizes("Zeep Survivor", "zeep-survivor"),
  },
  {
    id: "archive-dive",
    points: 40,
    title: "Archive Diver",
    description: "Watch a clip from the Older Video Showcase end-to-end.",
    prizes: cardOnlyPrizes("Archive Diver", "archive-dive"),
  },
  {
    id: "quiz-caveman",
    points: 222,
    title: "Portfolio Power",
    description: "Pass the Quiz Power check with fewer than three misses.",
    prizes: cardOnlyPrizes("Portfolio Power", "quiz-caveman"),
  },
  ...SCORE_TIER_MILESTONES,
];

type FactCondition = {
  fact: string;
  operator: string;
  value: string | number | boolean;
};

function milestoneRule(
  id: string,
  points: number,
  title: string,
  extra: FactCondition[],
): RuleProperties {
  return {
    name: `milestone-${id}`,
    conditions: {
      all: [
        {
          fact: "unlockedMilestoneIds",
          operator: "doesNotContain",
          value: id,
        },
        ...extra,
      ],
    },
    event: {
      type: "unlock-milestone",
      params: { milestoneId: id, points, title },
    },
    priority: 10,
  };
}

/** json-rules-engine rules driven by `MilestoneFacts`. */
export const allMilestoneRules: RuleProperties[] = [
  milestoneRule("intro-video-end", 30, "Opening Act", [
    { fact: "introVideoCompleteCount", operator: "greaterThanInclusive", value: 1 },
  ]),
  milestoneRule("open-three-modals", 40, "Curious Clicker", [
    { fact: "modalOpenCount", operator: "greaterThanInclusive", value: 3 },
  ]),
  milestoneRule("timeline-pause", 25, "Timekeeper", [
    { fact: "timelinePauseCount", operator: "greaterThanInclusive", value: 1 },
  ]),
  milestoneRule("theme-hopper", 45, "Character Ninja", [
    { fact: "themeChangeCount", operator: "greaterThanInclusive", value: 3 },
  ]),
  milestoneRule("photo-critique-run", 35, "Photo flow", [
    { fact: "photoCritiqueCount", operator: "greaterThanInclusive", value: 1 },
  ]),
  milestoneRule("zeep-survivor", 50, "Zeep Survivor", [
    { fact: "zeepEnableCount", operator: "greaterThanInclusive", value: 1 },
    { fact: "modalOpenCount", operator: "greaterThanInclusive", value: 1 },
  ]),
  milestoneRule("archive-dive", 40, "Archive Diver", [
    { fact: "archiveVideoCompleteCount", operator: "greaterThanInclusive", value: 1 },
  ]),
  milestoneRule("quiz-caveman", 222, "Portfolio Power", [
    { fact: "quizCompleteIds", operator: "contains", value: "quiz-caveman" },
  ]),
  ...SCORE_TIER_MILESTONES.map((row) =>
    milestoneRule(row.id, row.points, row.title, [
      {
        fact: "totalScore",
        operator: "greaterThanInclusive",
        value: row.scoreThreshold!,
      },
    ]),
  ),
];

/** Board / celebration copy for a milestone id. */
export function milestoneDisplayCopy(
  milestoneId: string,
): Pick<MilestoneDefinition, "title" | "description"> | null {
  const row = MILESTONE_SCHEDULE.find((m) => m.id === milestoneId);
  if (!row) return null;
  return { title: row.title, description: row.description };
}
