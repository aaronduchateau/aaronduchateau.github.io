"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MODAL_CLOSED_EVENT, MODAL_OPENED_EVENT } from "@/hooks/useBodyScrollLock";
import { SignatureBootSplash } from "@/components/SignatureBootSplash";
import { recordActivity } from "@/activity/tracker";
import { isComponentPreviewPath } from "@/lib/componentPreview";
import { isIntroPath } from "@/lib/routes";
import { ensureTestimonialPlaybackPreload } from "@/lib/testimonialPlaybackPreload";
import { readSoftwarePortfolioOnly } from "@/lib/softwarePortfolioPref";
import { applyThemeTokens } from "./applyTheme";
import { resolveTheme } from "./engine";
import { THEME_PALETTES } from "./palettes";
import {
  applyModalOpenDuration,
  BASE_CLICK_STORAGE_KEY,
  bindModalOpenPlayer,
  bindNavClickPlayer,
  CONTENT_WINDOW_STORAGE_KEY,
  contentWindowDurationMs,
  DEFAULT_BASE_CLICK_ID,
  DEFAULT_CONTENT_WINDOW_OPEN_DURATION_MS,
  DEFAULT_CONTENT_WINDOW_SOUND_ID,
  DEFAULT_SOUND_ENABLED,
  isBaseClickPreference,
  isContentWindowPreference,
  resolveBaseClickPreference,
  measureContentWindowDurationMs,
  DEFAULT_THEME_MUSIC_LOOP_INTERVAL_MS,
  DEFAULT_THEME_MUSIC_SRC,
  NO_SOUND_ID,
  playBaseClick,
  playContentWindowOpen,
  preloadThemeSounds,
  SOUND_ENABLED_STORAGE_KEY,
  pauseThemeMusicLoop,
  startThemeMusicLoop,
  stopThemeMusicLoop,
  type BaseClickPreference,
  type ContentWindowPreference,
} from "./sounds";
import {
  DEFAULT_SECTION_VISIBILITY,
  DEFAULT_THEME_ID,
  THEME_ID_SYNC_CHANNEL,
  THEME_LABELS,
  THEME_STORAGE_KEY,
  canonicalizeThemeId,
  type SectionVisibility,
  type ThemeId,
} from "./types";

/** Theme music preference — default on for intro and main site. */
export const THEME_MUSIC_ENABLED_STORAGE_KEY = "portfolio-theme-music-enabled";
export const DEFAULT_THEME_MUSIC_ENABLED = true;

export type SetThemeIdOptions = {
  /**
   * When true, record a `theme.change` activity event (Character Ninja / Your Event Log).
   * Opt in from Options / theme playground only — intro character picks stay silent.
   */
  trackActivity?: boolean;
};

/** When `preview: false`, persist the preference without playing its clip (intro sound kits). */
export type SoundPreferenceOptions = {
  preview?: boolean;
};

type ThemeContextValue = {
  themeId: ThemeId;
  setThemeId: (id: ThemeId, options?: SetThemeIdOptions) => void;
  visibility: SectionVisibility;
  ready: boolean;
  baseClickId: BaseClickPreference;
  setBaseClickId: (id: BaseClickPreference, options?: SoundPreferenceOptions) => void;
  contentWindowSoundId: ContentWindowPreference;
  setContentWindowSoundId: (id: ContentWindowPreference, options?: SoundPreferenceOptions) => void;
  /** Modal launch animation length for the selected content-window SFX (0 = instant). */
  contentWindowOpenDurationMs: number;
  /** Interaction SFX gate (nav clicks, modal opens, Options previews). */
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  /** Play the currently selected base-click SFX (nav links, etc.). */
  playNavClick: () => void;
  /** Play the currently selected content-window open SFX. */
  playModalOpen: () => void;
  /** Primary theme music bed (rules-engine). Default on; survives intro → main. */
  themeMusicEnabled: boolean;
  setThemeMusicEnabled: (enabled: boolean) => void;
  /**
   * Temporarily hold theme music without clearing the user preference
   * (e.g. hero intro video). Pair with `releaseThemeMusicHold`.
   */
  holdThemeMusic: (holdId?: string) => void;
  /** Clear a hold from `holdThemeMusic` / `suppressThemeMusic` and resume if still enabled. */
  releaseThemeMusicHold: (holdId?: string) => void;
  /** @deprecated Prefer `holdThemeMusic` — same temporary hold, does not persist “off”. */
  suppressThemeMusic: () => void;
  /** Force theme music + interaction SFX off (e.g. intro character cycle). */
  muteAllSounds: () => void;
  /** Turn both theme music and interaction SFX on. */
  unmuteAllSounds: () => void;
  /** Sound-menu: enable/disable base clicks (syncs with Options → No Sound). */
  setClickInteractionsEnabled: (enabled: boolean, options?: SoundPreferenceOptions) => void;
  /** Sound-menu: enable/disable content-window SFX (syncs with Options → No Sound). */
  setContentWindowSoundsEnabled: (enabled: boolean, options?: SoundPreferenceOptions) => void;
  /** Sound-menu master: theme + clicks + content windows. */
  setAllSoundsEnabled: (enabled: boolean) => void;
  /**
   * Reset Base Clicks + Content Windows to first-load native ids
   * (`DEFAULT_BASE_CLICK_ID` / `DEFAULT_CONTENT_WINDOW_SOUND_ID`).
   */
  restoreSoundEffectDefaults: () => void;
  themeMusicSrc: string;
  themeMusicLoopIntervalMs: number;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredThemeId(): ThemeId {
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    const resolved = canonicalizeThemeId(raw);
    if (resolved) {
      if (raw !== resolved) {
        window.localStorage.setItem(THEME_STORAGE_KEY, resolved);
      }
      return resolved;
    }
  } catch {
    /* private mode / blocked storage */
  }
  return DEFAULT_THEME_ID;
}

function readStoredBaseClickId(): BaseClickPreference | null {
  try {
    const raw = window.localStorage.getItem(BASE_CLICK_STORAGE_KEY);
    const resolved = resolveBaseClickPreference(raw);
    if (!resolved) return null;
    if (raw !== resolved) {
      window.localStorage.setItem(BASE_CLICK_STORAGE_KEY, resolved);
    }
    return resolved;
  } catch {
    /* private mode / blocked storage */
  }
  return null;
}

function readStoredContentWindowSoundId(): ContentWindowPreference | null {
  try {
    const raw = window.localStorage.getItem(CONTENT_WINDOW_STORAGE_KEY);
    if (isContentWindowPreference(raw)) return raw;
  } catch {
    /* private mode / blocked storage */
  }
  return null;
}

function readStoredSoundEnabled(): boolean | null {
  try {
    const raw = window.localStorage.getItem(SOUND_ENABLED_STORAGE_KEY);
    if (raw === "true") return true;
    if (raw === "false") return false;
  } catch {
    /* private mode / blocked storage */
  }
  return null;
}

function readStoredThemeMusicEnabled(): boolean | null {
  try {
    const raw = window.localStorage.getItem(THEME_MUSIC_ENABLED_STORAGE_KEY);
    if (raw === "true") return true;
    if (raw === "false") return false;
  } catch {
    /* private mode / blocked storage */
  }
  return null;
}

/**
 * App-entry theme maintainer. Runs json-rules-engine on the client only,
 * then applies CSS custom properties, section visibility, and sound defaults.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME_ID);
  const [visibility, setVisibility] = useState<SectionVisibility>(DEFAULT_SECTION_VISIBILITY);
  const [baseClickId, setBaseClickIdState] =
    useState<BaseClickPreference>(DEFAULT_BASE_CLICK_ID);
  const [contentWindowSoundId, setContentWindowSoundIdState] = useState<ContentWindowPreference>(
    DEFAULT_CONTENT_WINDOW_SOUND_ID,
  );
  const [contentWindowOpenDurationMs, setContentWindowOpenDurationMs] = useState(
    DEFAULT_CONTENT_WINDOW_OPEN_DURATION_MS,
  );
  const [soundEnabled, setSoundEnabledState] = useState(DEFAULT_SOUND_ENABLED);
  const [themeMusicEnabled, setThemeMusicEnabledState] = useState(DEFAULT_THEME_MUSIC_ENABLED);
  const [themeMusicSrc, setThemeMusicSrc] = useState(DEFAULT_THEME_MUSIC_SRC);
  const [themeMusicLoopIntervalMs, setThemeMusicLoopIntervalMs] = useState(
    DEFAULT_THEME_MUSIC_LOOP_INTERVAL_MS,
  );
  const [ready, setReady] = useState(false);
  const themeIdRef = useRef<ThemeId>(themeId);
  themeIdRef.current = themeId;
  const baseClickIdRef = useRef<BaseClickPreference>(baseClickId);
  baseClickIdRef.current = baseClickId;
  const contentWindowSoundIdRef = useRef<ContentWindowPreference>(contentWindowSoundId);
  contentWindowSoundIdRef.current = contentWindowSoundId;
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;
  const themeMusicEnabledRef = useRef(themeMusicEnabled);
  themeMusicEnabledRef.current = themeMusicEnabled;
  const themeMusicSrcRef = useRef(themeMusicSrc);
  themeMusicSrcRef.current = themeMusicSrc;
  const readyRef = useRef(ready);
  readyRef.current = ready;
  /** Named holds (modal stack, hero video) — do not clear `themeMusicEnabled` preference. */
  const themeMusicHoldsRef = useRef(new Set<string>());
  const lastBaseClickIdRef = useRef<BaseClickPreference>(DEFAULT_BASE_CLICK_ID);
  const lastContentWindowSoundIdRef = useRef<ContentWindowPreference>(
    DEFAULT_CONTENT_WINDOW_SOUND_ID,
  );
  const themeSyncChannelRef = useRef<BroadcastChannel | null>(null);

  const commitOpenDuration = useCallback((ms: number) => {
    const safe = Math.max(0, Math.round(ms));
    setContentWindowOpenDurationMs(safe);
    applyModalOpenDuration(safe);
  }, []);

  const syncLaunchDuration = useCallback(
    (openId: ContentWindowPreference, enabled: boolean) => {
      if (!enabled || openId === NO_SOUND_ID) {
        commitOpenDuration(0);
        return;
      }
      const catalogMs = contentWindowDurationMs(openId);
      commitOpenDuration(catalogMs);
      void measureContentWindowDurationMs(openId).then(commitOpenDuration);
    },
    [commitOpenDuration],
  );

  const persistThemeMusicEnabled = useCallback((enabled: boolean) => {
    try {
      window.localStorage.setItem(THEME_MUSIC_ENABLED_STORAGE_KEY, enabled ? "true" : "false");
    } catch {
      /* ignore */
    }
  }, []);

  const persistSoundEnabled = useCallback((enabled: boolean) => {
    try {
      window.localStorage.setItem(SOUND_ENABLED_STORAGE_KEY, enabled ? "true" : "false");
    } catch {
      /* ignore */
    }
  }, []);

  const applyId = useCallback(
    async (id: ThemeId, options?: { hydrateSoundPrefs?: boolean }) => {
      const { tokens, visibility: nextVisibility, soundDefaults } = await resolveTheme({
        themeId: id,
        softwarePortfolioOnly: readSoftwarePortfolioOnly(),
      });
      applyThemeTokens(tokens);
      setThemeIdState(tokens.id);
      setVisibility(nextVisibility);

      // Prefer a stored user pick; otherwise use the theme engine default.
      const storedClick = readStoredBaseClickId();
      if (storedClick) {
        setBaseClickIdState(storedClick);
        if (storedClick !== NO_SOUND_ID) lastBaseClickIdRef.current = storedClick;
      } else if (isBaseClickPreference(soundDefaults.baseClickId)) {
        setBaseClickIdState(soundDefaults.baseClickId);
        if (soundDefaults.baseClickId !== NO_SOUND_ID) {
          lastBaseClickIdRef.current = soundDefaults.baseClickId;
        }
      }

      const storedOpen = readStoredContentWindowSoundId();
      const nextOpen = storedOpen ?? (
        isContentWindowPreference(soundDefaults.contentWindowSoundId)
          ? soundDefaults.contentWindowSoundId
          : DEFAULT_CONTENT_WINDOW_SOUND_ID
      );
      setContentWindowSoundIdState(nextOpen);
      if (nextOpen !== NO_SOUND_ID) lastContentWindowSoundIdRef.current = nextOpen;

      // Sound prefs hydrate once on boot — theme switches must not revive muted music.
      if (options?.hydrateSoundPrefs) {
        const storedEnabled = readStoredSoundEnabled();
        const nextEnabled = storedEnabled ?? soundDefaults.soundEnabled;
        setSoundEnabledState(nextEnabled);
        soundEnabledRef.current = nextEnabled;
        syncLaunchDuration(nextOpen, nextEnabled);

        const storedMusic = readStoredThemeMusicEnabled();
        const nextMusic = storedMusic ?? DEFAULT_THEME_MUSIC_ENABLED;
        setThemeMusicEnabledState(nextMusic);
        themeMusicEnabledRef.current = nextMusic;
      } else {
        syncLaunchDuration(nextOpen, soundEnabledRef.current);
      }

      setThemeMusicSrc(soundDefaults.themeMusicSrc || DEFAULT_THEME_MUSIC_SRC);
      setThemeMusicLoopIntervalMs(
        soundDefaults.themeMusicLoopIntervalMs || DEFAULT_THEME_MUSIC_LOOP_INTERVAL_MS,
      );
    },
    [syncLaunchDuration],
  );

  useEffect(() => {
    preloadThemeSounds();
    void ensureTestimonialPlaybackPreload();
    applyModalOpenDuration(DEFAULT_CONTENT_WINDOW_OPEN_DURATION_MS);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Intro / splash: paint default under the signature plate (forget prior pick).
      // Portfolio-launched: restore the stored theme so reloads keep the look.
      const path = typeof window !== "undefined" ? window.location.pathname : "";
      const stored = isIntroPath(path) ? DEFAULT_THEME_ID : readStoredThemeId();
      if (stored === DEFAULT_THEME_ID) {
        applyThemeTokens(THEME_PALETTES.cyberpunk);
      }
      await applyId(stored, { hydrateSoundPrefs: true });
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [applyId]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY || !event.newValue) return;
      const next = canonicalizeThemeId(event.newValue);
      if (!next) return;
      if (next === themeIdRef.current) return;
      void applyId(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [applyId]);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(THEME_ID_SYNC_CHANNEL);
    themeSyncChannelRef.current = channel;
    channel.onmessage = (event: MessageEvent<unknown>) => {
      const next = typeof event.data === "string" ? canonicalizeThemeId(event.data) : null;
      if (!next) return;
      if (next === themeIdRef.current) return;
      void applyId(next);
    };
    return () => {
      themeSyncChannelRef.current = null;
      channel.close();
    };
  }, [applyId]);

  const setThemeId = useCallback(
    async (id: ThemeId, options?: SetThemeIdOptions) => {
      const previous = themeIdRef.current;
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, id);
      } catch {
        /* ignore */
      }
      await applyId(id);
      try {
        themeSyncChannelRef.current?.postMessage(id);
      } catch {
        /* ignore */
      }
      if (options?.trackActivity && id !== previous) {
        void recordActivity({
          type: "theme.change",
          contentId: id,
          label: THEME_LABELS[id],
          meta: { previous, source: "portfolio" },
        });
      }
    },
    [applyId],
  );

  const ensureSoundEnabled = useCallback(() => {
    if (soundEnabledRef.current) return;
    persistSoundEnabled(true);
    setSoundEnabledState(true);
    soundEnabledRef.current = true;
  }, [persistSoundEnabled]);

  const setBaseClickId = useCallback(
    (id: BaseClickPreference, options?: SoundPreferenceOptions) => {
      const preview = options?.preview !== false;
      try {
        window.localStorage.setItem(BASE_CLICK_STORAGE_KEY, id);
      } catch {
        /* ignore */
      }
      if (id !== NO_SOUND_ID) {
        lastBaseClickIdRef.current = id;
        ensureSoundEnabled();
      }
      setBaseClickIdState(id);
      // Preview the newly chosen clip (skip when muting / master off).
      if (preview && id !== NO_SOUND_ID && soundEnabledRef.current) playBaseClick(id);
    },
    [ensureSoundEnabled],
  );

  const setContentWindowSoundId = useCallback(
    (id: ContentWindowPreference, options?: SoundPreferenceOptions) => {
      const preview = options?.preview !== false;
      try {
        window.localStorage.setItem(CONTENT_WINDOW_STORAGE_KEY, id);
      } catch {
        /* ignore */
      }
      if (id !== NO_SOUND_ID) {
        lastContentWindowSoundIdRef.current = id;
        ensureSoundEnabled();
      }
      setContentWindowSoundIdState(id);
      syncLaunchDuration(id, soundEnabledRef.current);
      if (preview && id !== NO_SOUND_ID && soundEnabledRef.current) playContentWindowOpen(id);
    },
    [ensureSoundEnabled, syncLaunchDuration],
  );

  const setSoundEnabled = useCallback(
    (enabled: boolean) => {
      persistSoundEnabled(enabled);
      setSoundEnabledState(enabled);
      soundEnabledRef.current = enabled;
      syncLaunchDuration(contentWindowSoundIdRef.current, enabled);
    },
    [persistSoundEnabled, syncLaunchDuration],
  );

  const syncThemeMusicPlayback = useCallback(() => {
    if (
      !readyRef.current ||
      !themeMusicEnabledRef.current ||
      !themeMusicSrcRef.current ||
      themeMusicHoldsRef.current.size > 0 ||
      isComponentPreviewPath()
    ) {
      // Preserve playhead while held so resume / Enter portfolio doesn’t restart.
      pauseThemeMusicLoop();
      return;
    }
    startThemeMusicLoop(themeMusicSrcRef.current);
  }, []);

  const setThemeMusicEnabled = useCallback(
    (enabled: boolean) => {
      persistThemeMusicEnabled(enabled);
      setThemeMusicEnabledState(enabled);
      themeMusicEnabledRef.current = enabled;
      if (!enabled) {
        stopThemeMusicLoop();
        return;
      }
      syncThemeMusicPlayback();
    },
    [persistThemeMusicEnabled, syncThemeMusicPlayback],
  );

  const holdThemeMusic = useCallback(
    (holdId = "suppress") => {
      themeMusicHoldsRef.current.add(holdId);
      pauseThemeMusicLoop();
    },
    [],
  );

  const releaseThemeMusicHold = useCallback(
    (holdId = "suppress") => {
      themeMusicHoldsRef.current.delete(holdId);
      syncThemeMusicPlayback();
    },
    [syncThemeMusicPlayback],
  );

  const suppressThemeMusic = useCallback(() => {
    holdThemeMusic("suppress");
  }, [holdThemeMusic]);

  const muteAllSounds = useCallback(() => {
    setSoundEnabled(false);
    setThemeMusicEnabled(false);
  }, [setSoundEnabled, setThemeMusicEnabled]);

  const unmuteAllSounds = useCallback(() => {
    setSoundEnabled(true);
    setThemeMusicEnabled(true);
  }, [setSoundEnabled, setThemeMusicEnabled]);

  const setClickInteractionsEnabled = useCallback(
    (enabled: boolean, options?: SoundPreferenceOptions) => {
      if (enabled) {
        const next =
          lastBaseClickIdRef.current !== NO_SOUND_ID
            ? lastBaseClickIdRef.current
            : DEFAULT_BASE_CLICK_ID;
        setBaseClickId(next, options);
        return;
      }
      setBaseClickId(NO_SOUND_ID, options);
    },
    [setBaseClickId],
  );

  const setContentWindowSoundsEnabled = useCallback(
    (enabled: boolean, options?: SoundPreferenceOptions) => {
      if (enabled) {
        const next =
          lastContentWindowSoundIdRef.current !== NO_SOUND_ID
            ? lastContentWindowSoundIdRef.current
            : DEFAULT_CONTENT_WINDOW_SOUND_ID;
        setContentWindowSoundId(next, options);
        return;
      }
      setContentWindowSoundId(NO_SOUND_ID, options);
    },
    [setContentWindowSoundId],
  );

  const setAllSoundsEnabled = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        setThemeMusicEnabled(true);
        setClickInteractionsEnabled(true);
        setContentWindowSoundsEnabled(true);
        setSoundEnabled(true);
        return;
      }
      setThemeMusicEnabled(false);
      setClickInteractionsEnabled(false);
      setContentWindowSoundsEnabled(false);
      setSoundEnabled(false);
    },
    [
      setThemeMusicEnabled,
      setClickInteractionsEnabled,
      setContentWindowSoundsEnabled,
      setSoundEnabled,
    ],
  );

  /** First-load native Base Clicks + Content Windows (same ids as engine baseline). */
  const restoreSoundEffectDefaults = useCallback(() => {
    setBaseClickId(DEFAULT_BASE_CLICK_ID);
    setContentWindowSoundId(DEFAULT_CONTENT_WINDOW_SOUND_ID);
  }, [setBaseClickId, setContentWindowSoundId]);

  // Content modals temporarily hold the bed; preference stays so close can resume.
  // Intro / Theme Locked pass `pauseThemeMusic: false` and do not take this hold.
  useEffect(() => {
    const onModalOpened = () => {
      themeMusicHoldsRef.current.add("modal");
      pauseThemeMusicLoop();
    };
    const onModalClosed = () => {
      themeMusicHoldsRef.current.delete("modal");
      syncThemeMusicPlayback();
    };
    window.addEventListener(MODAL_OPENED_EVENT, onModalOpened);
    window.addEventListener(MODAL_CLOSED_EVENT, onModalClosed);
    return () => {
      window.removeEventListener(MODAL_OPENED_EVENT, onModalOpened);
      window.removeEventListener(MODAL_CLOSED_EVENT, onModalClosed);
    };
  }, [syncThemeMusicPlayback]);

  const playNavClick = useCallback(() => {
    if (!soundEnabledRef.current) return;
    playBaseClick(baseClickIdRef.current);
  }, []);

  const playModalOpen = useCallback(() => {
    if (!soundEnabledRef.current) return;
    playContentWindowOpen(contentWindowSoundIdRef.current);
  }, []);

  // Site-wide looping theme bed — continues across intro → main when left on.
  // Isolated component-preview iframes must not start a second music loop.
  useEffect(() => {
    syncThemeMusicPlayback();
    return () => {
      stopThemeMusicLoop();
    };
  }, [ready, themeMusicEnabled, themeMusicSrc, syncThemeMusicPlayback]);

  useEffect(() => bindNavClickPlayer(playNavClick), [playNavClick]);
  useEffect(() => bindModalOpenPlayer(playModalOpen), [playModalOpen]);

  const value = useMemo(
    () => ({
      themeId,
      setThemeId,
      visibility,
      ready,
      baseClickId,
      setBaseClickId,
      contentWindowSoundId,
      setContentWindowSoundId,
      contentWindowOpenDurationMs,
      soundEnabled,
      setSoundEnabled,
      playNavClick,
      playModalOpen,
      themeMusicEnabled,
      setThemeMusicEnabled,
      holdThemeMusic,
      releaseThemeMusicHold,
      suppressThemeMusic,
      muteAllSounds,
      unmuteAllSounds,
      setClickInteractionsEnabled,
      setContentWindowSoundsEnabled,
      setAllSoundsEnabled,
      restoreSoundEffectDefaults,
      themeMusicSrc,
      themeMusicLoopIntervalMs,
    }),
    [
      themeId,
      setThemeId,
      visibility,
      ready,
      baseClickId,
      setBaseClickId,
      contentWindowSoundId,
      setContentWindowSoundId,
      contentWindowOpenDurationMs,
      soundEnabled,
      setSoundEnabled,
      playNavClick,
      playModalOpen,
      themeMusicEnabled,
      setThemeMusicEnabled,
      holdThemeMusic,
      releaseThemeMusicHold,
      suppressThemeMusic,
      muteAllSounds,
      unmuteAllSounds,
      setClickInteractionsEnabled,
      setContentWindowSoundsEnabled,
      setAllSoundsEnabled,
      restoreSoundEffectDefaults,
      themeMusicSrc,
      themeMusicLoopIntervalMs,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>
      <SignatureBootSplash themeReady={ready} />
      {/*
        Veiled by `html.signature-booting:not(.theme-boot-ready)` on full reload.
        Unrelated to SPA theme switches — those never set the boot classes.
      */}
      <div className="theme-boot-shell">{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
