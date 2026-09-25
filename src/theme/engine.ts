import { Engine } from "json-rules-engine";
import { THEME_PALETTES } from "./palettes";
import { allThemeRules } from "./rules";
import {
  contentWindowDurationMs,
  DEFAULT_BASE_CLICK_ID,
  DEFAULT_CONTENT_WINDOW_OPEN_DURATION_MS,
  DEFAULT_CONTENT_WINDOW_SOUND_ID,
  DEFAULT_SOUND_ENABLED,
  DEFAULT_THEME_MUSIC_LOOP_INTERVAL_MS,
  DEFAULT_THEME_MUSIC_SRC,
  isBaseClickPreference,
  isContentWindowPreference,
  type ContentWindowPreference,
} from "./sounds";
import {
  DEFAULT_SECTION_VISIBILITY,
  DEFAULT_THEME_ID,
  THEME_IDS,
  type SectionVisibility,
  type SoundDefaults,
  type ThemeId,
  type ThemeTokens,
} from "./types";

export type ThemeFacts = {
  themeId: string;
  /** Splash “Software Portfolio Only” — hides playful strips on any character. */
  softwarePortfolioOnly?: boolean;
};

export type ResolvedTheme = {
  tokens: ThemeTokens;
  visibility: SectionVisibility;
  soundDefaults: SoundDefaults;
};

let engineSingleton: Engine | null = null;

/** Build (once) the client-side theme rules engine. */
export function getThemeEngine(): Engine {
  if (engineSingleton) return engineSingleton;

  const engine = new Engine(allThemeRules, {
    allowUndefinedFacts: true,
  });

  engineSingleton = engine;
  return engine;
}

function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && (THEME_IDS as string[]).includes(value);
}

function visibilityFromParams(
  params: Record<string, unknown> | undefined,
): Partial<SectionVisibility> {
  if (!params) return {};
  const next: Partial<SectionVisibility> = {};
  if (typeof params.funThings === "boolean") next.funThings = params.funThings;
  if (typeof params.animationStory === "boolean") {
    next.animationStory = params.animationStory;
  }
  if (typeof params.heroLearnMoreSwoop === "boolean") {
    next.heroLearnMoreSwoop = params.heroLearnMoreSwoop;
  }
  if (typeof params.decorativeCardMedia === "boolean") {
    next.decorativeCardMedia = params.decorativeCardMedia;
  }
  if (typeof params.softwareModeThemeGame === "boolean") {
    next.softwareModeThemeGame = params.softwareModeThemeGame;
  }
  return next;
}

/**
 * Run facts through json-rules-engine and return the winning theme tokens
 * plus section visibility from layout rules. Browser-only (ThemeProvider).
 */
export async function resolveTheme(facts: ThemeFacts): Promise<ResolvedTheme> {
  const engine = getThemeEngine();
  const { events } = await engine.run(facts);

  const applyEvent = events.find((e) => e.type === "apply-theme");
  const resolvedId = applyEvent?.params?.themeId;
  const themeId = isThemeId(resolvedId) ? resolvedId : DEFAULT_THEME_ID;

  // Merge every layout event (higher-priority rules typically run first;
  // later events overwrite so theme-specific packs win cleanly).
  let visibility = { ...DEFAULT_SECTION_VISIBILITY };
  let soundDefaults: SoundDefaults = {
    baseClickId: DEFAULT_BASE_CLICK_ID,
    contentWindowSoundId: DEFAULT_CONTENT_WINDOW_SOUND_ID,
    contentWindowOpenDurationMs: DEFAULT_CONTENT_WINDOW_OPEN_DURATION_MS,
    soundEnabled: DEFAULT_SOUND_ENABLED,
    themeMusicSrc: DEFAULT_THEME_MUSIC_SRC,
    themeMusicLoopIntervalMs: DEFAULT_THEME_MUSIC_LOOP_INTERVAL_MS,
  };

  for (const event of events) {
    if (event.type === "set-section-visibility") {
      const next = visibilityFromParams(event.params as Record<string, unknown> | undefined);
      visibility = { ...visibility, ...next };
      continue;
    }
    if (event.type === "set-sound-defaults") {
      const params = (event.params ?? {}) as Record<string, unknown>;
      const nextBase = params.baseClickId;
      const nextOpen = params.contentWindowSoundId;
      const openId: ContentWindowPreference = isContentWindowPreference(nextOpen)
        ? nextOpen
        : (soundDefaults.contentWindowSoundId as ContentWindowPreference);
      const paramDuration =
        typeof params.contentWindowOpenDurationMs === "number" &&
        Number.isFinite(params.contentWindowOpenDurationMs)
          ? Math.max(0, Math.round(params.contentWindowOpenDurationMs))
          : contentWindowDurationMs(openId);
      // Only replace music fields when the rule explicitly sets them — so the
      // default SFX rule (no music params) cannot wipe a prior theme bed.
      const hasMusicSrc =
        typeof params.themeMusicSrc === "string" && params.themeMusicSrc.length > 0;
      const hasMusicInterval =
        typeof params.themeMusicLoopIntervalMs === "number" &&
        Number.isFinite(params.themeMusicLoopIntervalMs);
      soundDefaults = {
        baseClickId: isBaseClickPreference(nextBase) ? nextBase : soundDefaults.baseClickId,
        contentWindowSoundId: openId,
        contentWindowOpenDurationMs: paramDuration,
        soundEnabled:
          typeof params.soundEnabled === "boolean" ? params.soundEnabled : soundDefaults.soundEnabled,
        themeMusicSrc: hasMusicSrc ? (params.themeMusicSrc as string) : soundDefaults.themeMusicSrc,
        themeMusicLoopIntervalMs: hasMusicInterval
          ? Math.max(5_000, Math.round(params.themeMusicLoopIntervalMs as number))
          : soundDefaults.themeMusicLoopIntervalMs,
      };
    }
  }

  return {
    tokens: THEME_PALETTES[themeId],
    visibility,
    soundDefaults,
  };
}

/** @deprecated Prefer resolveTheme — kept for any narrow token-only callers. */
export async function resolveThemeTokens(facts: ThemeFacts): Promise<ThemeTokens> {
  const { tokens } = await resolveTheme(facts);
  return tokens;
}
