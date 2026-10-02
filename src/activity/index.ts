export { ActivityProvider, useActivity } from "./ActivityProvider";
export { CelebrationQueueProvider, useCelebrationQueue } from "./CelebrationQueueProvider";
export {
  enqueueCelebrationToast,
  isCelebrationScoreBlocked,
} from "./celebrationQueue";
export { POINT_SCHEDULE, pointsFor, labelFor } from "./pointSchedule";
export { MILESTONE_SCHEDULE, SCORE_TIER_MILESTONES } from "./milestones";
export { buildMilestoneFacts } from "./milestoneFacts";
export {
  cardPrizeForMilestone,
  isBaseClickUnlocked,
  isContentWindowSoundUnlocked,
  isFeatureUnlocked,
  isThemeUnlocked,
  prizesForMilestone,
  resolveGrantedPrizes,
  STARTER_LOCKED_THEME_IDS,
} from "./milestonePrizes";
export {
  RANDOM_MOUNTAIN_BIKE_CRASH_FEATURE_ID,
  RANDOM_MONKEY_DOG_FEATURE_ID,
  UNLOCK_FEATURE_CATALOG,
  featureLabel,
  viewTargetForPrize,
} from "./unlockFeatures";
export { applyFeatureGates, navigateToUnlockedContent } from "./unlockRoutes";
export { resolveIntroSideQuests } from "./resolveIntroSideQuests";
export { recordActivity, resetActivityStore, getActivityStoreSnapshot, applyUnlockAllCheat } from "./tracker";
export type { UnlockAllCheatStatus } from "./tracker";
export {
  PUMPKIN_EATER_CHEAT_CODE,
  CHEAT_UNLOCK_ALL_EVENT_KEY,
} from "./cheatRules";
export {
  DEFAULT_PRIZE_ANIMATIONS_ENABLED,
  persistPrizeAnimationsEnabled,
  PRIZE_ANIMATIONS_STORAGE_KEY,
  readPrizeAnimationsEnabled,
} from "./prizeAnimationsPref";
export { trackAttrs, TRACK_IGNORE_ATTR } from "./trackAttrs";
export { ACTIVITY_STORAGE_KEY } from "./types";
export type {
  ActivityEventType,
  ActivityLogEntry,
  ActivityStore,
  AwardedAction,
  MilestoneFacts,
  MilestoneDefinition,
  MilestonePrize,
  MilestoneCardPrize,
  MilestoneFeaturePrize,
  MilestoneSoundPrize,
  MilestoneThemePrize,
  GrantedPrizes,
  RecordActivityInput,
} from "./types";
