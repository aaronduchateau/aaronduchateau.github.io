import { olderVideoShowcaseCards } from "@/data/content";
import { isHeroIntroVideoContentId } from "@/data/heroVideoWidget";
import type { ActivityEventType, ActivityStore, MilestoneFacts } from "./types";

const ARCHIVE_CARD_IDS = new Set(olderVideoShowcaseCards.map((card) => card.id));

function uniqueAwardedCount(store: ActivityStore, type: ActivityEventType): number {
  let n = 0;
  for (const entry of Object.values(store.awarded)) {
    if (entry.type === type) n += 1;
  }
  return n;
}

function isArchiveVideoId(contentId: string): boolean {
  if (ARCHIVE_CARD_IDS.has(contentId)) return true;
  for (const id of Array.from(ARCHIVE_CARD_IDS)) {
    if (contentId === id || contentId.startsWith(`${id}-`)) return true;
  }
  return false;
}

/** Build milestone facts from the current activity store (aggregate / combination view). */
export function buildMilestoneFacts(store: ActivityStore): MilestoneFacts {
  const unlockedMilestoneIds: string[] = [];
  for (const entry of Object.values(store.awarded)) {
    if (entry.type === "milestone.unlock") {
      unlockedMilestoneIds.push(entry.contentId);
    }
  }

  let archiveVideoCompleteCount = 0;
  let introVideoCompleteCount = 0;
  for (const entry of Object.values(store.awarded)) {
    if (entry.type === "video.complete" && isArchiveVideoId(entry.contentId)) {
      archiveVideoCompleteCount += 1;
    }
    if (entry.type === "video.complete" && isHeroIntroVideoContentId(entry.contentId)) {
      introVideoCompleteCount += 1;
    }
  }

  return {
    modalOpenCount: uniqueAwardedCount(store, "modal.open"),
    themeChangeCount: uniqueAwardedCount(store, "theme.change"),
    timelineSelectCount: uniqueAwardedCount(store, "timeline.select"),
    timelinePauseCount: uniqueAwardedCount(store, "timeline.pause"),
    photoCritiqueCount: uniqueAwardedCount(store, "demo.photoCritique"),
    zeepEnableCount: uniqueAwardedCount(store, "sound.zeepEnable"),
    archiveVideoCompleteCount,
    introVideoCompleteCount,
    quizCompleteIds: Object.values(store.awarded)
      .filter((entry) => entry.type === "quiz.complete")
      .map((entry) => entry.contentId),
    totalScore: store.totalScore,
    unlockedMilestoneIds,
  };
}

/** Lightweight progress signal for board “available” vs “locked”. */
export function milestoneHasProgress(milestoneId: string, facts: MilestoneFacts): boolean {
  if (milestoneId.startsWith("score-")) {
    return facts.totalScore > 0;
  }
  switch (milestoneId) {
    case "intro-video-end":
      return facts.introVideoCompleteCount > 0;
    case "open-three-modals":
      return facts.modalOpenCount > 0;
    case "timeline-pause":
      return facts.timelinePauseCount > 0 || facts.timelineSelectCount > 0;
    case "theme-hopper":
      return facts.themeChangeCount > 0;
    case "photo-critique-run":
      return facts.photoCritiqueCount > 0;
    case "zeep-survivor":
      return facts.zeepEnableCount > 0;
    case "archive-dive":
      return facts.archiveVideoCompleteCount > 0;
    case "quiz-caveman":
      return facts.quizCompleteIds.includes("quiz-caveman");
    default:
      return false;
  }
}
