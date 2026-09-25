export const ACTIVITY_STORAGE_KEY = "portfolio-activity-log";

export type ActivityEventType =
  | "modal.open"
  | "modal.close"
  | "photo.view"
  | "button.click"
  | "video.complete"
  | "theme.change"
  | "timeline.select"
  | "timeline.pause"
  | "project.leavePreview"
  | "project.visitSite"
  | "sound.zeepEnable"
  | "demo.photoCritique"
  | "quiz.complete"
  | "milestone.unlock";

export type ActivityLogEntry = {
  id: string;
  ts: number;
  type: ActivityEventType;
  eventKey: string;
  contentId: string;
  label: string;
  pointsAwarded: number;
  meta?: Record<string, unknown>;
};

export type AwardedAction = {
  eventKey: string;
  type: ActivityEventType;
  contentId: string;
  label: string;
  points: number;
  firstAwardedAt: number;
};

export type ActivityStore = {
  version: 1;
  totalScore: number;
  log: ActivityLogEntry[];
  awarded: Record<string, AwardedAction>;
};

/** Per-event facts for the activity award engine. */
export type ActivityFacts = {
  eventKey: string;
  eventType: ActivityEventType;
  contentId: string;
  alreadyAwarded: boolean;
};

/**
 * Aggregate facts for the milestone engine — combinations / thresholds
 * derived from the activity store after each recorded event.
 */
export type MilestoneFacts = {
  modalOpenCount: number;
  themeChangeCount: number;
  timelineSelectCount: number;
  timelinePauseCount: number;
  photoCritiqueCount: number;
  zeepEnableCount: number;
  archiveVideoCompleteCount: number;
  /** Portfolio hero intro (interactive or non-interactive) watched to the end. */
  introVideoCompleteCount: number;
  /** Quiz ids that have a passing `quiz.complete` award. */
  quizCompleteIds: string[];
  /** Current activity total — drives score-tier milestones. */
  totalScore: number;
  /** Milestone ids already unlocked (`milestone.unlock:<id>`). */
  unlockedMilestoneIds: string[];
};

export type RecordActivityInput = {
  type: ActivityEventType;
  contentId: string;
  label?: string;
  meta?: Record<string, unknown>;
};

export type MilestoneSoundPrize = {
  kind: "sound";
  category: "baseClick" | "contentWindow";
  /** Explicit catalog ids granted when this milestone completes. */
  soundIds: readonly string[];
};

export type MilestoneCardPrize = {
  kind: "card";
  cardId: string;
  title: string;
  /** Animal name shown with this reward card. */
  animalName: string;
  imageSrc: string;
};

export type MilestoneFeaturePrize = {
  kind: "feature";
  featureId: string;
};

export type MilestoneThemePrize = {
  kind: "theme";
  /** Explicit theme ids granted when this milestone completes. */
  themeIds: readonly string[];
};

export type MilestonePrize =
  | MilestoneSoundPrize
  | MilestoneCardPrize
  | MilestoneFeaturePrize
  | MilestoneThemePrize;

export type MilestoneDefinition = {
  id: string;
  /** Bonus points awarded on unlock (0 for score-tier titles). */
  points: number;
  title: string;
  description: string;
  /** When set, unlock once `totalScore` reaches this threshold. */
  scoreThreshold?: number;
  /** Granted when the milestone unlocks (derived from localStorage milestone ids). */
  prizes?: readonly MilestonePrize[];
};

export type GrantedPrizes = {
  baseClickIds: ReadonlySet<string>;
  contentWindowSoundIds: ReadonlySet<string>;
  cards: MilestoneCardPrize[];
  featureIds: ReadonlySet<string>;
  themeIds: ReadonlySet<string>;
};
