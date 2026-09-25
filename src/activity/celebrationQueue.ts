import { getPortfolioModalLockCount } from "@/hooks/useBodyScrollLock";
import type { MilestoneUnlock } from "./milestoneEngine";
import { readPrizeAnimationsEnabled } from "./prizeAnimationsPref";

export const CELEBRATION_QUEUE_CHANGE_EVENT = "portfolio:celebration-queue-changed";

export type CelebrationReleaseReason = "idle" | "toast-fly" | "modal-closed" | "toast-done";

export type CelebrationQueueSnapshot = {
  version: number;
  playing: MilestoneUnlock | null;
  playNonce: number;
  queuedCount: number;
  flewToChest: boolean;
  releaseReason: CelebrationReleaseReason;
};

type QueueState = {
  toasts: MilestoneUnlock[];
  playing: MilestoneUnlock | null;
  playNonce: number;
  flewToChest: boolean;
  version: number;
  releaseReason: CelebrationReleaseReason;
};

const state: QueueState = {
  toasts: [],
  playing: null,
  playNonce: 0,
  flewToChest: false,
  version: 0,
  releaseReason: "idle",
};

let cachedSnapshot: CelebrationQueueSnapshot = {
  version: 0,
  playing: null,
  playNonce: 0,
  queuedCount: 0,
  flewToChest: false,
  releaseReason: "idle",
};

const listeners = new Set<() => void>();

function emit() {
  state.version += 1;
  cachedSnapshot = {
    version: state.version,
    playing: state.playing,
    playNonce: state.playNonce,
    queuedCount: state.toasts.length,
    flewToChest: state.flewToChest,
    releaseReason: state.releaseReason,
  };
  listeners.forEach((listener) => listener());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CELEBRATION_QUEUE_CHANGE_EVENT));
  }
}

export function getCelebrationQueueSnapshot(): CelebrationQueueSnapshot {
  return cachedSnapshot;
}

export function subscribeCelebrationQueue(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isPortfolioModalBlocking(): boolean {
  return getPortfolioModalLockCount() > 0;
}

/** Score chest should hold the old total until this returns false. */
export function isCelebrationScoreBlocked(): boolean {
  if (typeof window === "undefined") return false;
  if (isPortfolioModalBlocking()) return true;
  if (!readPrizeAnimationsEnabled()) return false;
  if (state.toasts.length > 0) return true;
  if (state.playing && !state.flewToChest) return true;
  return false;
}

export function enqueueCelebrationToast(unlock: MilestoneUnlock): void {
  if (typeof window === "undefined") return;
  if (!readPrizeAnimationsEnabled()) return;
  state.toasts.push(unlock);
  emit();
  flushCelebrationQueue();
}

export function flushCelebrationQueue(): void {
  if (typeof window === "undefined") return;
  if (isPortfolioModalBlocking()) return;
  if (state.playing) return;
  if (!readPrizeAnimationsEnabled()) {
    if (state.toasts.length === 0 && state.releaseReason === "idle") return;
    if (state.toasts.length > 0) state.toasts = [];
    state.releaseReason = "modal-closed";
    emit();
    return;
  }
  const next = state.toasts.shift();
  if (!next) {
    state.releaseReason = "modal-closed";
    emit();
    return;
  }
  state.playing = next;
  state.playNonce += 1;
  state.flewToChest = false;
  emit();
}

export function markToastFlewToChest(): void {
  if (!state.playing || state.flewToChest) return;
  state.flewToChest = true;
  state.releaseReason = "toast-fly";
  emit();
}

export function markToastFinished(playNonce?: number): void {
  if (playNonce !== undefined && playNonce !== state.playNonce) return;
  if (!state.playing) {
    flushCelebrationQueue();
    return;
  }
  state.playing = null;
  state.flewToChest = false;
  state.releaseReason = "toast-done";
  emit();
  flushCelebrationQueue();
}

export function clearCelebrationToasts(): void {
  state.toasts = [];
  state.playing = null;
  state.flewToChest = false;
  state.releaseReason = "idle";
  emit();
}
