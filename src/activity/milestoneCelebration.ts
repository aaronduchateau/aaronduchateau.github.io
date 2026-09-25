import { navigateToRouteModal } from "@/lib/useRouteModal";
import {
  EASTER_EGG_BOARD_KEY,
  EASTER_EGG_BOARD_NAMESPACE,
} from "@/lib/easterEggBoardRoute";
import { enqueueCelebrationToast } from "./celebrationQueue";
import type { MilestoneUnlock } from "./milestoneEngine";

export const MILESTONE_UNLOCK_EVENT = "portfolio:milestone-unlock";

export type MilestoneUnlockCelebrationDetail = MilestoneUnlock;

/** Queue a card toast — plays when no content modal is open. */
export function dispatchMilestoneUnlockCelebration(unlock: MilestoneUnlock): void {
  enqueueCelebrationToast(unlock);
}

/** @deprecated Prefer `requestEasterEggBoard` — board is URL-backed. */
export const OPEN_EASTER_EGG_BOARD_EVENT = "portfolio:open-easter-egg-board";

/** Open the main-site easter egg board (locked theme / sound tease). URL-backed. */
export function requestEasterEggBoard(): void {
  if (typeof window === "undefined") return;
  navigateToRouteModal(EASTER_EGG_BOARD_NAMESPACE, EASTER_EGG_BOARD_KEY);
}
