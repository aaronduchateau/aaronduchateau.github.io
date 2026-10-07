import type { ComponentSlotMap } from "./slots";

/** Theme ids resolved by the json-rules-engine at the app entry. */
export type ThemeId =
  | "cyberpunk"
  | "relic-guy"
  | "psychedelic-hippie"
  | "cursive-roman-empire"
  | "ada-first"
  | "professional"
  | "conspiracy-theorist"
  | "galaxy-guy"
  | "atlantean"
  | "captain-guy"
  | "nerd"
  | "pop-art-guy"
  | "surrealist"
  | "dog-days-guy"
  | "retro-guy"
  | "driver-guy";

export const THEME_IDS: ThemeId[] = [
  "cyberpunk",
  "relic-guy",
  "driver-guy",
  "psychedelic-hippie",
  "cursive-roman-empire",
  "ada-first",
  "professional",
  "conspiracy-theorist",
  "galaxy-guy",
  "retro-guy",
  "captain-guy",
  "surrealist",
  "pop-art-guy",
  "nerd",
  "dog-days-guy",
  "atlantean",
];

/**
 * Public character names — Aaron-flavored or generic “Guy” labels.
 * Prefer these over IP-adjacent display strings in UI.
 */
export const THEME_LABELS: Record<ThemeId, string> = {
  cyberpunk: "Cyber Guy",
  "relic-guy": "Relic Guy",
  "psychedelic-hippie": "Groovy Guy",
  "cursive-roman-empire": "Empire Guy",
  "ada-first": "ADA Guy",
  professional: "Software Guy",
  "conspiracy-theorist": "Conspiracy Guy",
  "galaxy-guy": "Galaxy Guy",
  atlantean: "Atlantic Guy",
  "captain-guy": "Captain Guy",
  nerd: "Nerd Guy",
  "pop-art-guy": "Pop Art Guy",
  surrealist: "Dream Guy",
  "dog-days-guy": "Dog Days Guy",
  "retro-guy": "Retro Guy",
  "driver-guy": "Driver Guy",
};

/**
 * Fallback fellow names when the previous roster pick already used an Aaron label,
 * so cycling never lands on “Aaron … Aaron” back-to-back.
 */
export const THEME_ALT_LABELS: Partial<Record<ThemeId, string>> = {
  cyberpunk: "Neon Guy",
  "cursive-roman-empire": "Marble Master",
  "ada-first": "Paper Guy",
  professional: "Soft Aaron",
  atlantean: "Deep Sea Guy",
  "captain-guy": "Helm Guy",
  nerd: "Pixel Guy",
  "driver-guy": "Night Ride Guy",
};

export function themeLabelHasAaron(label: string): boolean {
  return /\bAaron\b/i.test(label);
}

/**
 * Resolve the roster/Options display name. When `previousDisplayedLabel` already
 * contains “Aaron” and this theme’s primary does too, use the alt fellow name.
 */
export function themeDisplayLabel(
  themeId: ThemeId,
  previousDisplayedLabel?: string | null,
): string {
  const primary = THEME_LABELS[themeId];
  if (
    previousDisplayedLabel &&
    themeLabelHasAaron(primary) &&
    themeLabelHasAaron(previousDisplayedLabel)
  ) {
    return THEME_ALT_LABELS[themeId] ?? primary;
  }
  return primary;
}

/**
 * Section / chrome gates resolved by json-rules-engine (layout rules), not
 * hard-coded in components. Software Guy (professional id) and the splash
 * software-portfolio-only fact hide playful strips; ADA + those paths skip
 * the hero Learn-more swoop. ADA also turns off decorative card photos.
 */
export type SectionVisibility = {
  funThings: boolean;
  animationStory: boolean;
  /** Decorative right-side “swoop” on the hero video Learn more control. */
  heroLearnMoreSwoop: boolean;
  /**
   * Card / strip background photos and decorative gradients.
   * When false (ADA), surfaces stay solid so text keeps a high contrast ratio.
   * Does not affect the top hero video.
   */
  decorativeCardMedia: boolean;
  /**
   * Software Guy + Software Portfolio Only: offer the easter-egg board
   * opt-in into the theme playground. Driven by layout rules, not themeId checks.
   */
  softwareModeThemeGame: boolean;
};

export const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  funThings: true,
  animationStory: true,
  heroLearnMoreSwoop: true,
  decorativeCardMedia: true,
  softwareModeThemeGame: false,
};

export const DEFAULT_THEME_ID: ThemeId = "cyberpunk";

export const THEME_STORAGE_KEY = "portfolio-theme-id";

/** Same-origin iframes / tabs follow a theme pick (component-preview embed). */
export const THEME_ID_SYNC_CHANNEL = "portfolio-theme-id";

/**
 * Former IP-adjacent theme ids → Guy-branded ids.
 * Used when reading localStorage / activity so old picks keep working.
 */
export const THEME_ID_ALIASES: Record<string, ThemeId> = {
  "indiana-jones": "relic-guy",
  "galaxy-quest": "galaxy-guy",
  constantine: "captain-guy",
  "andy-warhol": "pop-art-guy",
  "toy-story": "dog-days-guy",
  "super-mario": "retro-guy",
  drive: "driver-guy",
};

/** Resolve a stored or historical theme id to the current ThemeId (or null). */
export function canonicalizeThemeId(raw: string | null | undefined): ThemeId | null {
  if (!raw) return null;
  if ((THEME_IDS as string[]).includes(raw)) return raw as ThemeId;
  return THEME_ID_ALIASES[raw] ?? null;
}

/**
 * Sound defaults resolved by json-rules-engine alongside theme tokens.
 * User picks in Options override these via localStorage.
 */
export type SoundDefaults = {
  baseClickId: string;
  contentWindowSoundId: string;
  /** Modal launch animation length; 0 when Content Windows is No Sound. */
  contentWindowOpenDurationMs: number;
  /** Master SFX on/off (Options toggle). */
  soundEnabled: boolean;
  /** Primary theme music sting (rules-engine); loops on an interval, not seamless. */
  themeMusicSrc: string;
  /** Delay between theme-music sting replays (typically 20–30s). */
  themeMusicLoopIntervalMs: number;
};

export type ScaleStep =
  | "50"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900"
  | "950";

/**
 * Per-theme visual contract — colors plus the small shape/chrome details
 * (hero glass, radii, button silhouette, decorative glow). Cyberpunk values
 * must match the pre-theme site exactly.
 */
export type ThemeTokens = {
  id: ThemeId;
  background: string;
  foreground: string;
  heading: string;
  rootFontSize: string;
  navBlur: string;

  /**
   * SiteNav “Aaron.” brand size — about 2× legacy `text-sm`, tuned per display
   * face so visual weight stays comparable across themes. Bar stays `h-14`;
   * the brand is flex-centered and may overflow the bar vertically.
   */
  navBrandFontSize: string;
  /**
   * Line box for the brand (default `1`).
   */
  navBrandLineHeight?: string;
  /**
   * Optical Y correction (`translateY`) for SiteNav “Aaron.”.
   *
   * Flex centers the font’s em/line box next to the menu glyph — not the painted
   * ink. Many display faces leave unused ascent (and unused descender room that
   * “Aaron.” never uses), so the letters look high or low even when the box is
   * perfectly centered. Line-height alone does not move ink inside that box.
   * A small per-theme nudge is the practical optical fix (short of `text-box-trim`
   * once we can rely on it). Positive shifts down. Omitted → `0px`.
   */
  navBrandNudgeY?: string;

  /** Hero background photo path, or null when the theme has no photo (ADA). */
  heroImage: string | null;

  /** Pill / CTA silhouette (cyberpunk: full pill). Full CSS border-radius strings OK. */
  radiusPill: string;
  /** Large cards / hero quote (cyberpunk: 1.5rem = rounded-3xl). */
  radiusCard: string;
  /** Media tiles / smaller panels (cyberpunk: 1rem = rounded-2xl). */
  radiusMedia: string;
  /** Menus, chips, compact controls. */
  radiusControl: string;
  /** Video play control (cyberpunk: circle; Roman: square with slight round). */
  radiusPlay: string;

  /**
   * Optional hover silhouettes (Surrealist melt-deep, etc.).
   * applyTheme falls back to the matching rest radius when omitted.
   */
  radiusPillHover?: string;
  radiusCardHover?: string;
  radiusMediaHover?: string;
  radiusControlHover?: string;
  radiusPlayHover?: string;
  /**
   * Top-only radius for `.theme-card__cover` (TL/TR).
   * When omitted, applyTheme derives top corners from `radiusCard`.
   */
  radiusCardCover?: string;
  radiusCardCoverHover?: string;

  /** Hero vertical scrim opacities over slate-950. */
  heroScrimFrom: string;
  heroScrimVia: string;
  heroScrimTo: string;
  /** Top radial accent color (RGB channels) + strength. */
  heroAccent: string;
  heroAccentAlpha: string;

  /** Quote / glass panel fill opacity over slate-950. */
  glassAlpha: string;
  glassBlur: string;
  /** Soft aura behind hero quote (0 hides it — ADA). */
  decorativeOpacity: string;
  /** Aura gradient channel colors + alphas. */
  auraFrom: string;
  auraFromAlpha: string;
  auraVia: string;
  auraViaAlpha: string;

  borderAlpha: string;
  cardSurfaceAlpha: string;
  cardHoverBorderAlpha: string;
  cardHoverRingAlpha: string;

  /**
   * Decorative home-card photo tint formula (optional — applyTheme falls back).
   * Tint hue always comes from `background` → `--background-channels`.
   * Alphas drive `.theme-photo-tint` / `.theme-gallery-photo-dim`.
   */
  galleryPhotoTintAlpha?: string;
  galleryPhotoTintAlphaHover?: string;
  galleryPhotoDimAlpha?: string;

  /** Neutral scale. Painted as `--surface-*`. */
  surface: Record<ScaleStep, string>;
  /** Accent scale. Painted as `--accent-*`. */
  accent: Record<ScaleStep, string>;

  /** Optional component-slot overrides (ADA hairline / ghost / success). */
  componentSlots?: ComponentSlotMap;
};
