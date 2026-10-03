import { resolveComponentSlots } from "./slots";
import { applyModalLaunchMotion } from "./modalLaunch";
import { colorToRgbChannels } from "./swatches";
import type { ThemeTokens } from "./types";

/** Shared decorative home-card photo tint formula — theme supplies hue via background. */
const GALLERY_PHOTO_TINT_ALPHA = "0.78";
const GALLERY_PHOTO_TINT_ALPHA_HOVER = "0.28";
const GALLERY_PHOTO_DIM_ALPHA = "0.5";

/**
 * Top-only border-radius for card covers (TL/TR, bottom square).
 * Supports 1-value, 4-value, and elliptical 8-value (`a b c d / e f g h`) strings.
 */
export function coverRadiusFromCard(radiusCard: string): string {
  const raw = radiusCard.trim();
  if (!raw) return "0";
  if (raw.includes("/")) {
    const [horizPart, vertPart] = raw.split("/").map((part) => part.trim());
    const horiz = horizPart.split(/\s+/).filter(Boolean);
    const vert = vertPart.split(/\s+/).filter(Boolean);
    if (horiz.length === 4 && vert.length === 4) {
      return `${horiz[0]} ${horiz[1]} 0 0 / ${vert[0]} ${vert[1]} 0 0`;
    }
  }
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return `${parts[0]} ${parts[0]} 0 0`;
  if (parts.length === 2) return `${parts[0]} ${parts[1]} 0 0`;
  if (parts.length === 3) return `${parts[0]} ${parts[1]} 0 ${parts[2]}`;
  if (parts.length >= 4) return `${parts[0]} ${parts[1]} 0 0`;
  return raw;
}

const TOKEN_STYLE_MAP: { key: keyof ThemeTokens; cssVar: string }[] = [
  { key: "background", cssVar: "--background" },
  { key: "foreground", cssVar: "--foreground" },
  { key: "heading", cssVar: "--heading" },
  { key: "rootFontSize", cssVar: "--root-font-size" },
  { key: "navBlur", cssVar: "--nav-blur" },
  { key: "radiusPill", cssVar: "--radius-pill" },
  { key: "radiusCard", cssVar: "--radius-card" },
  { key: "radiusMedia", cssVar: "--radius-media" },
  { key: "radiusControl", cssVar: "--radius-control" },
  { key: "radiusPlay", cssVar: "--radius-play" },
  { key: "heroScrimFrom", cssVar: "--hero-scrim-from" },
  { key: "heroScrimVia", cssVar: "--hero-scrim-via" },
  { key: "heroScrimTo", cssVar: "--hero-scrim-to" },
  { key: "heroAccent", cssVar: "--hero-accent" },
  { key: "heroAccentAlpha", cssVar: "--hero-accent-alpha" },
  { key: "glassAlpha", cssVar: "--glass-alpha" },
  { key: "glassBlur", cssVar: "--glass-blur" },
  { key: "decorativeOpacity", cssVar: "--decorative-opacity" },
  { key: "auraFrom", cssVar: "--aura-from" },
  { key: "auraFromAlpha", cssVar: "--aura-from-alpha" },
  { key: "auraVia", cssVar: "--aura-via" },
  { key: "auraViaAlpha", cssVar: "--aura-via-alpha" },
  { key: "borderAlpha", cssVar: "--border-alpha" },
  { key: "cardSurfaceAlpha", cssVar: "--card-surface-alpha" },
  { key: "cardHoverBorderAlpha", cssVar: "--card-hover-border-alpha" },
  { key: "cardHoverRingAlpha", cssVar: "--card-hover-ring-alpha" },
];

/**
 * Paint resolved theme tokens onto `<html>`.
 * Fonts stay on next/font slots; non-default faces are switched via
 * `[data-theme]` rules in globals.css (see THEME.md).
 */
export function applyThemeTokens(tokens: ThemeTokens): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.dataset.theme = tokens.id;
  applyModalLaunchMotion(tokens.id);

  for (const { key, cssVar } of TOKEN_STYLE_MAP) {
    const value = tokens[key];
    if (typeof value === "string") {
      root.style.setProperty(cssVar, value);
    }
  }

  const pillHover = tokens.radiusPillHover ?? tokens.radiusPill;
  const cardHover = tokens.radiusCardHover ?? tokens.radiusCard;
  const mediaHover = tokens.radiusMediaHover ?? tokens.radiusMedia;
  const controlHover = tokens.radiusControlHover ?? tokens.radiusControl;
  const playHover = tokens.radiusPlayHover ?? tokens.radiusPlay;
  root.style.setProperty("--radius-pill-hover", pillHover);
  root.style.setProperty("--radius-card-hover", cardHover);
  root.style.setProperty("--radius-media-hover", mediaHover);
  root.style.setProperty("--radius-control-hover", controlHover);
  root.style.setProperty("--radius-play-hover", playHover);
  root.style.setProperty(
    "--radius-card-cover",
    tokens.radiusCardCover ?? coverRadiusFromCard(tokens.radiusCard),
  );
  root.style.setProperty(
    "--radius-card-cover-hover",
    tokens.radiusCardCoverHover ?? coverRadiusFromCard(cardHover),
  );

  root.style.setProperty(
    "--background-channels",
    colorToRgbChannels(tokens.background),
  );
  root.style.setProperty(
    "--gallery-photo-tint-alpha",
    tokens.galleryPhotoTintAlpha ?? GALLERY_PHOTO_TINT_ALPHA,
  );
  root.style.setProperty(
    "--gallery-photo-tint-alpha-hover",
    tokens.galleryPhotoTintAlphaHover ?? GALLERY_PHOTO_TINT_ALPHA_HOVER,
  );
  root.style.setProperty(
    "--gallery-photo-dim-alpha",
    tokens.galleryPhotoDimAlpha ?? GALLERY_PHOTO_DIM_ALPHA,
  );

  for (const [step, value] of Object.entries(tokens.surface)) {
    root.style.setProperty(`--surface-${step}`, value);
  }
  for (const [step, value] of Object.entries(tokens.accent)) {
    root.style.setProperty(`--accent-${step}`, value);
  }

  const slots = resolveComponentSlots(
    {
      accent: tokens.accent,
      surface: tokens.surface,
    },
    tokens.componentSlots,
  );
  for (const [id, rgb] of Object.entries(slots)) {
    root.style.setProperty(`--slot-${id}`, rgb);
  }

  const availableBg = tokens.accent["400"];
  const completeBg = tokens.auraVia;
  root.style.setProperty("--quest-available-bg", availableBg);
  root.style.setProperty("--quest-available-ink", contrastingInk(availableBg, tokens.surface));
  root.style.setProperty("--quest-complete-bg", completeBg);
  root.style.setProperty("--quest-complete-ink", contrastingInk(completeBg, tokens.surface));
}

function rgbLuminance(channels: string): number {
  const parts = channels.trim().split(/\s+/).map(Number);
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return 0;
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(parts[0]) + 0.7152 * lin(parts[1]) + 0.0722 * lin(parts[2]);
}

function contrastingInk(bg: string, surface: ThemeTokens["surface"]): string {
  return rgbLuminance(bg) > 0.38 ? surface["950"] : surface["50"];
}
