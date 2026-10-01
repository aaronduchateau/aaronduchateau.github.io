import type { RuleProperties } from "json-rules-engine";
import {
  DEFAULT_BASE_CLICK_ID,
  DEFAULT_CONTENT_WINDOW_OPEN_DURATION_MS,
  DEFAULT_CONTENT_WINDOW_SOUND_ID,
  DEFAULT_SOUND_ENABLED,
  themeMusicSrc,
} from "./sounds";
import { THEME_IDS, type ThemeId } from "./types";

/**
 * Per-theme primary music pack — beds in `/public/audio/theme`.
 * `themeMusicLoopIntervalMs` documents bed length; playback uses `audio.loop`.
 */
const THEME_MUSIC_PACKS: Record<
  ThemeId,
  { themeMusicSrc: string; themeMusicLoopIntervalMs: number }
> = {
  cyberpunk: {
    themeMusicSrc: themeMusicSrc("Perpetual_Rain.mp3"),
    themeMusicLoopIntervalMs: 30_000,
  },
  "relic-guy": {
    themeMusicSrc: themeMusicSrc("Relic_Guy_Loop.mp3"),
    themeMusicLoopIntervalMs: 30_000,
  },
  "psychedelic-hippie": {
    themeMusicSrc: themeMusicSrc("Celestial_Echoes.mp3"),
    themeMusicLoopIntervalMs: 30_000,
  },
  "cursive-roman-empire": {
    themeMusicSrc: themeMusicSrc("Gladiators_March.mp3"),
    themeMusicLoopIntervalMs: 30_000,
  },
  "ada-first": {
    themeMusicSrc: themeMusicSrc("Sidewalk_Cycles.mp3"),
    themeMusicLoopIntervalMs: 30_000,
  },
  professional: {
    themeMusicSrc: themeMusicSrc("Midnight_Groove_Loop.mp3"),
    themeMusicLoopIntervalMs: 30_000,
  },
  // Stand-in until a dedicated Conspiracy Guy bed exists.
  "conspiracy-theorist": {
    themeMusicSrc: themeMusicSrc("Midnight_Drone.mp3"),
    themeMusicLoopIntervalMs: 30_000,
  },
  // Stand-in until a dedicated Galaxy Guy bed exists.
  "galaxy-guy": {
    themeMusicSrc: themeMusicSrc("Celestial_Echoes.mp3"),
    themeMusicLoopIntervalMs: 30_000,
  },
  atlantean: {
    themeMusicSrc: themeMusicSrc("Celestial_Shore.mp3"),
    themeMusicLoopIntervalMs: 30_000,
  },
  "captain-guy": {
    themeMusicSrc: themeMusicSrc("Hallowed_Loop.mp3"),
    themeMusicLoopIntervalMs: 30_000,
  },
  nerd: {
    themeMusicSrc: themeMusicSrc("Parisian_Stroll_Loop.mp3"),
    themeMusicLoopIntervalMs: 30_000,
  },
  "pop-art-guy": {
    themeMusicSrc: themeMusicSrc("Midnight_Drone.mp3"),
    themeMusicLoopIntervalMs: 30_000,
  },
  surrealist: {
    themeMusicSrc: themeMusicSrc("Surreal_Loop.mp3"),
    themeMusicLoopIntervalMs: 30_000,
  },
  "dog-days-guy": {
    themeMusicSrc: themeMusicSrc("Playtime_Parade.mp3"),
    themeMusicLoopIntervalMs: 30_000,
  },
  "retro-guy": {
    themeMusicSrc: themeMusicSrc("Retro_Guy_Stroll.mp3"),
    themeMusicLoopIntervalMs: 30_000,
  },
  "driver-guy": {
    themeMusicSrc: themeMusicSrc("Midnight_Slow_Drive.mp3"),
    themeMusicLoopIntervalMs: 30_000,
  },
};

/**
 * One rule per theme id. The engine is the sole maintainer of which
 * palette/token pack wins — similar to Material theme selection, but
 * driven by declarative JSON conditions instead of a theme provider map.
 */
export const themeRules: RuleProperties[] = THEME_IDS.map((themeId: ThemeId) => ({
  name: `theme:${themeId}`,
  priority: 10,
  conditions: {
    all: [
      {
        fact: "themeId",
        operator: "equal",
        value: themeId,
      },
    ],
  },
  event: {
    type: "apply-theme",
    params: {
      themeId,
    },
  },
}));

/**
 * Fallback: unknown / missing themeId → cyberpunk (preserves original site look).
 */
export const defaultThemeRule: RuleProperties = {
  name: "theme:default-cyberpunk",
  priority: 1,
  conditions: {
    all: [
      {
        fact: "themeId",
        operator: "notIn",
        value: [...THEME_IDS],
      },
    ],
  },
  event: {
    type: "apply-theme",
    params: {
      themeId: "cyberpunk" satisfies ThemeId,
    },
  },
};

/**
 * Software Portfolio Only (splash path): hide playful strips on any theme so
 * picking a character in the intro game does not restore Fun / Animation.
 * Priority 0 so it runs last (later layout events win).
 */
export const softwarePortfolioOnlyRule: RuleProperties = {
  name: "layout:software-portfolio-only",
  priority: 0,
  conditions: {
    all: [
      {
        fact: "softwarePortfolioOnly",
        operator: "equal",
        value: true,
      },
    ],
  },
  event: {
    type: "set-section-visibility",
    params: {
      funThings: false,
      animationStory: false,
      heroLearnMoreSwoop: false,
    },
  },
};

/**
 * Software Only layout: hide playful gallery + animation / storytelling strips,
 * and skip the hero Learn-more swoop.
 */
export const professionalHidePlayfulRule: RuleProperties = {
  name: "layout:professional-hide-playful",
  priority: 20,
  conditions: {
    all: [
      {
        fact: "themeId",
        operator: "equal",
        value: "professional" satisfies ThemeId,
      },
    ],
  },
  event: {
    type: "set-section-visibility",
    params: {
      funThings: false,
      animationStory: false,
      heroLearnMoreSwoop: false,
      softwareModeThemeGame: true,
    },
  },
};

/**
 * ADA First: keep playful sections, no Learn-more swoop, and no decorative
 * card photos/gradients so type stays high-contrast on solid surfaces.
 * (Hero video is unaffected — only card/strip media.)
 */
export const adaHideHeroSwoopRule: RuleProperties = {
  name: "layout:ada-hide-hero-swoop",
  priority: 20,
  conditions: {
    all: [
      {
        fact: "themeId",
        operator: "equal",
        value: "ada-first" satisfies ThemeId,
      },
    ],
  },
  event: {
    type: "set-section-visibility",
    params: {
      funThings: true,
      animationStory: true,
      heroLearnMoreSwoop: false,
      decorativeCardMedia: false,
    },
  },
};

/**
 * Every other theme keeps fun things + animation / storytelling visible,
 * and enables the hero Learn-more swoop adornment.
 */
export const defaultShowPlayfulRule: RuleProperties = {
  name: "layout:default-show-playful",
  priority: 1,
  conditions: {
    all: [
      {
        fact: "themeId",
        operator: "notIn",
        value: ["professional", "ada-first"],
      },
    ],
  },
  event: {
    type: "set-section-visibility",
    params: {
      funThings: true,
      animationStory: true,
      heroLearnMoreSwoop: true,
    },
  },
};

/**
 * Conspiracy Theorist: keep the full evidence board (playful strips + Learn more
 * swoop as a red-string ribbon). Explicit so layout stays intentional vs default.
 */
export const conspiracyShowBoardRule: RuleProperties = {
  name: "layout:conspiracy-show-board",
  priority: 20,
  conditions: {
    all: [
      {
        fact: "themeId",
        operator: "equal",
        value: "conspiracy-theorist" satisfies ThemeId,
      },
    ],
  },
  event: {
    type: "set-section-visibility",
    params: {
      funThings: true,
      animationStory: true,
      heroLearnMoreSwoop: true,
    },
  },
};

/**
 * Galaxy Guy: full bridge HUD — playful strips stay lit, Learn more keeps
 * the holographic swoop command ribbon.
 */
export const galaxyGuyBridgeRule: RuleProperties = {
  name: "layout:galaxy-guy-bridge",
  priority: 20,
  conditions: {
    all: [
      {
        fact: "themeId",
        operator: "equal",
        value: "galaxy-guy" satisfies ThemeId,
      },
    ],
  },
  event: {
    type: "set-section-visibility",
    params: {
      funThings: true,
      animationStory: true,
      heroLearnMoreSwoop: true,
    },
  },
};

/**
 * Atlantean: full undersea court — playful strips + glowing course swoop.
 */
export const atlanteanCourtRule: RuleProperties = {
  name: "layout:atlantean-court",
  priority: 20,
  conditions: {
    all: [
      {
        fact: "themeId",
        operator: "equal",
        value: "atlantean" satisfies ThemeId,
      },
    ],
  },
  event: {
    type: "set-section-visibility",
    params: {
      funThings: true,
      animationStory: true,
      heroLearnMoreSwoop: true,
    },
  },
};

/**
 * Captain Guy: full helm console — playful strips + amber course swoop.
 */
export const captainGuyConsoleRule: RuleProperties = {
  name: "layout:captain-guy-console",
  priority: 20,
  conditions: {
    all: [
      {
        fact: "themeId",
        operator: "equal",
        value: "captain-guy" satisfies ThemeId,
      },
    ],
  },
  event: {
    type: "set-section-visibility",
    params: {
      funThings: true,
      animationStory: true,
      heroLearnMoreSwoop: true,
    },
  },
};

/**
 * Nerd: full den mode — playful strips + star-map swoop.
 */
export const nerdDenRule: RuleProperties = {
  name: "layout:nerd-den",
  priority: 20,
  conditions: {
    all: [
      {
        fact: "themeId",
        operator: "equal",
        value: "nerd" satisfies ThemeId,
      },
    ],
  },
  event: {
    type: "set-section-visibility",
    params: {
      funThings: true,
      animationStory: true,
      heroLearnMoreSwoop: true,
    },
  },
};

/**
 * Pop Art Guy: full print floor — playful strips + pop swoop.
 */
export const popArtGuyPrintRule: RuleProperties = {
  name: "layout:pop-art-guy-print",
  priority: 20,
  conditions: {
    all: [
      {
        fact: "themeId",
        operator: "equal",
        value: "pop-art-guy" satisfies ThemeId,
      },
    ],
  },
  event: {
    type: "set-section-visibility",
    params: {
      funThings: true,
      animationStory: true,
      heroLearnMoreSwoop: true,
    },
  },
};

/**
 * Surrealist: full dream parlor — playful strips + melting swoop.
 */
export const surrealistParlorRule: RuleProperties = {
  name: "layout:surrealist-parlor",
  priority: 20,
  conditions: {
    all: [
      {
        fact: "themeId",
        operator: "equal",
        value: "surrealist" satisfies ThemeId,
      },
    ],
  },
  event: {
    type: "set-section-visibility",
    params: {
      funThings: true,
      animationStory: true,
      heroLearnMoreSwoop: true,
    },
  },
};

/**
 * Dog Days Guy: full animation bay — playful strips + soft toy swoop.
 */
export const dogDaysGuyBayRule: RuleProperties = {
  name: "layout:dog-days-guy-bay",
  priority: 20,
  conditions: {
    all: [
      {
        fact: "themeId",
        operator: "equal",
        value: "dog-days-guy" satisfies ThemeId,
      },
    ],
  },
  event: {
    type: "set-section-visibility",
    params: {
      funThings: true,
      animationStory: true,
      heroLearnMoreSwoop: true,
    },
  },
};

/**
 * Retro Guy: full arcade bay — playful strips + chunky swoop.
 */
export const retroGuyBayRule: RuleProperties = {
  name: "layout:retro-guy-bay",
  priority: 20,
  conditions: {
    all: [
      {
        fact: "themeId",
        operator: "equal",
        value: "retro-guy" satisfies ThemeId,
      },
    ],
  },
  event: {
    type: "set-section-visibility",
    params: {
      funThings: true,
      animationStory: true,
      heroLearnMoreSwoop: true,
    },
  },
};

/**
 * Driver Guy: full night-drive strip — playful galleries + neon swoop.
 */
export const driverGuyNightRule: RuleProperties = {
  name: "layout:driver-guy-night",
  priority: 20,
  conditions: {
    all: [
      {
        fact: "themeId",
        operator: "equal",
        value: "driver-guy" satisfies ThemeId,
      },
    ],
  },
  event: {
    type: "set-section-visibility",
    params: {
      funThings: true,
      animationStory: true,
      heroLearnMoreSwoop: true,
    },
  },
};

/**
 * Default SFX pack for every theme. Per-theme packs can override later with
 * higher-priority `set-sound-defaults` events (same pattern as layout rules).
 */
export const defaultSoundDefaultsRule: RuleProperties = {
  name: "sound:default-base-click",
  priority: 1,
  conditions: {
    all: [
      {
        fact: "themeId",
        operator: "notEqual",
        value: "",
      },
    ],
  },
  event: {
    type: "set-sound-defaults",
    params: {
      baseClickId: DEFAULT_BASE_CLICK_ID,
      contentWindowSoundId: DEFAULT_CONTENT_WINDOW_SOUND_ID,
      contentWindowOpenDurationMs: DEFAULT_CONTENT_WINDOW_OPEN_DURATION_MS,
      soundEnabled: DEFAULT_SOUND_ENABLED,
      // Theme beds come only from `themeMusicRules` — including defaults here
      // would clobber them (this rule runs after higher-priority music rules).
    },
  },
};

/** One music pack per theme — higher priority than the default sound rule. */
export const themeMusicRules: RuleProperties[] = THEME_IDS.map((themeId: ThemeId) => ({
  name: `sound:theme-music:${themeId}`,
  priority: 15,
  conditions: {
    all: [
      {
        fact: "themeId",
        operator: "equal",
        value: themeId,
      },
    ],
  },
  event: {
    type: "set-sound-defaults",
    params: { ...THEME_MUSIC_PACKS[themeId] },
  },
}));

export const allThemeRules: RuleProperties[] = [
  ...themeRules,
  defaultThemeRule,
  professionalHidePlayfulRule,
  softwarePortfolioOnlyRule,
  adaHideHeroSwoopRule,
  defaultShowPlayfulRule,
  conspiracyShowBoardRule,
  galaxyGuyBridgeRule,
  atlanteanCourtRule,
  captainGuyConsoleRule,
  nerdDenRule,
  popArtGuyPrintRule,
  surrealistParlorRule,
  dogDaysGuyBayRule,
  retroGuyBayRule,
  driverGuyNightRule,
  defaultSoundDefaultsRule,
  ...themeMusicRules,
];
