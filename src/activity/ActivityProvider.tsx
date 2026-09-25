"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getActivityStoreSnapshot,
  hydrateActivityStore,
  recordActivity,
  resetActivityStore,
  subscribeActivity,
} from "./tracker";
import { buildMilestoneFacts } from "./milestoneFacts";
import {
  isBaseClickUnlocked,
  isContentWindowSoundUnlocked,
  isThemeUnlocked,
  resolveGrantedPrizes,
} from "./milestonePrizes";
import type { ActivityStore, GrantedPrizes, RecordActivityInput } from "./types";
import { CelebrationQueueProvider } from "./CelebrationQueueProvider";
import { MilestoneUnlockCelebration } from "@/components/MilestoneUnlockCelebration";
import {
  DEFAULT_BASE_CLICK_ID,
  DEFAULT_CONTENT_WINDOW_SOUND_ID,
  NO_SOUND_ID,
} from "@/theme/sounds";
import { useTheme } from "@/theme/ThemeProvider";
import { DEFAULT_THEME_ID } from "@/theme/types";
import { readSoftwarePortfolioOnly } from "@/lib/softwarePortfolioPref";
import { isComponentPreviewPath, isIntroPath } from "@/lib/routes";

type ActivityContextValue = {
  store: ActivityStore;
  hydrated: boolean;
  grantedPrizes: GrantedPrizes;
  unlockedMilestoneIds: readonly string[];
  record: (input: RecordActivityInput) => Promise<void>;
  reset: () => void;
};

const ActivityContext = createContext<ActivityContextValue | null>(null);

function useActivityStore(): ActivityStore {
  return useSyncExternalStore(
    subscribeActivity,
    getActivityStoreSnapshot,
    getActivityStoreSnapshot,
  );
}

/**
 * Hydrates the activity log and mounts global click instrumentation.
 * Modal / photo / video / theme hooks call `recordActivity` directly.
 */
export function ActivityProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const onIntroRoute = isIntroPath(pathname);
  const onPreviewRoute = isComponentPreviewPath(pathname);
  const store = useActivityStore();
  const [hydrated, setHydrated] = useState(false);
  const {
    themeId,
    setThemeId,
    baseClickId,
    contentWindowSoundId,
    setBaseClickId,
    setContentWindowSoundId,
  } = useTheme();

  const unlockedMilestoneIds = useMemo(
    () => buildMilestoneFacts(store).unlockedMilestoneIds,
    [store],
  );
  const grantedPrizes = useMemo(
    () => resolveGrantedPrizes(unlockedMilestoneIds),
    [unlockedMilestoneIds],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await hydrateActivityStore();
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (onPreviewRoute) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-track-ignore]")) return;
      const stamped = target.closest("[data-track-id]");
      if (!(stamped instanceof HTMLElement)) return;
      const contentId = stamped.getAttribute("data-track-id")?.trim();
      if (!contentId) return;
      const label =
        stamped.getAttribute("aria-label")?.trim() ||
        stamped.getAttribute("data-track-label")?.trim() ||
        undefined;
      void recordActivity({
        type: "button.click",
        contentId,
        label,
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [onPreviewRoute]);

  useEffect(() => {
    if (!hydrated || onIntroRoute || onPreviewRoute) return;
    if (readSoftwarePortfolioOnly()) return;
    if (!isThemeUnlocked(themeId, unlockedMilestoneIds)) {
      void setThemeId(DEFAULT_THEME_ID);
    }
  }, [hydrated, onIntroRoute, onPreviewRoute, themeId, unlockedMilestoneIds, setThemeId]);

  const record = useCallback((input: RecordActivityInput) => recordActivity(input), []);
  const reset = useCallback(() => {
    resetActivityStore();
    if (
      baseClickId !== NO_SOUND_ID &&
      !isBaseClickUnlocked(baseClickId, [])
    ) {
      setBaseClickId(DEFAULT_BASE_CLICK_ID, { preview: false });
    }
    if (
      contentWindowSoundId !== NO_SOUND_ID &&
      !isContentWindowSoundUnlocked(contentWindowSoundId, [])
    ) {
      setContentWindowSoundId(DEFAULT_CONTENT_WINDOW_SOUND_ID, { preview: false });
    }
    if (!isThemeUnlocked(themeId, [])) {
      void setThemeId(DEFAULT_THEME_ID);
    }
  }, [
    themeId,
    baseClickId,
    contentWindowSoundId,
    setThemeId,
    setBaseClickId,
    setContentWindowSoundId,
  ]);

  const value = useMemo(
    () => ({
      store,
      hydrated,
      grantedPrizes,
      unlockedMilestoneIds,
      record,
      reset,
    }),
    [store, hydrated, grantedPrizes, unlockedMilestoneIds, record, reset],
  );

  return (
    <ActivityContext.Provider value={value}>
      <CelebrationQueueProvider>
        {children}
        {onPreviewRoute ? null : <MilestoneUnlockCelebration />}
      </CelebrationQueueProvider>
    </ActivityContext.Provider>
  );
}

export function useActivity(): ActivityContextValue {
  const ctx = useContext(ActivityContext);
  if (!ctx) {
    throw new Error("useActivity must be used within ActivityProvider");
  }
  return ctx;
}
