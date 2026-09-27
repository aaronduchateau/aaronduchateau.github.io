import { resolveComponentSlots } from "./slots";
import { applyModalLaunchMotion } from "./modalLaunch";
import type { ThemeTokens } from "./types";

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
