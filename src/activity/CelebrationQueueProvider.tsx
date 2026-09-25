"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { MODAL_CLOSED_EVENT } from "@/hooks/useBodyScrollLock";
import { PRIZE_ANIMATIONS_CHANGE_EVENT } from "./prizeAnimationsPref";
import {
  clearCelebrationToasts,
  flushCelebrationQueue,
  getCelebrationQueueSnapshot,
  isCelebrationScoreBlocked,
  markToastFinished,
  markToastFlewToChest,
  subscribeCelebrationQueue,
  type CelebrationQueueSnapshot,
} from "./celebrationQueue";
import type { MilestoneUnlock } from "./milestoneEngine";

type CelebrationQueueContextValue = {
  snapshot: CelebrationQueueSnapshot;
  scoreBlocked: boolean;
  playingUnlock: MilestoneUnlock | null;
  playNonce: number;
  markFlewToChest: () => void;
  markFinished: (playNonce?: number) => void;
};

const CelebrationQueueContext = createContext<CelebrationQueueContextValue | null>(null);

export function CelebrationQueueProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeCelebrationQueue,
    getCelebrationQueueSnapshot,
    getCelebrationQueueSnapshot,
  );

  useEffect(() => {
    const onClosed = () => flushCelebrationQueue();
    window.addEventListener(MODAL_CLOSED_EVENT, onClosed);
    flushCelebrationQueue();
    return () => window.removeEventListener(MODAL_CLOSED_EVENT, onClosed);
  }, []);

  useEffect(() => {
    const onPref = (event: Event) => {
      const enabled = (event as CustomEvent<boolean>).detail;
      if (enabled) return;
      clearCelebrationToasts();
    };
    window.addEventListener(PRIZE_ANIMATIONS_CHANGE_EVENT, onPref);
    return () => window.removeEventListener(PRIZE_ANIMATIONS_CHANGE_EVENT, onPref);
  }, []);

  const value = useMemo<CelebrationQueueContextValue>(
    () => ({
      snapshot,
      scoreBlocked: isCelebrationScoreBlocked(),
      playingUnlock: snapshot.playing,
      playNonce: snapshot.playNonce,
      markFlewToChest: markToastFlewToChest,
      markFinished: markToastFinished,
    }),
    [snapshot],
  );

  return (
    <CelebrationQueueContext.Provider value={value}>{children}</CelebrationQueueContext.Provider>
  );
}

export function useCelebrationQueue(): CelebrationQueueContextValue {
  const ctx = useContext(CelebrationQueueContext);
  if (!ctx) {
    throw new Error("useCelebrationQueue must be used within CelebrationQueueProvider");
  }
  return ctx;
}
