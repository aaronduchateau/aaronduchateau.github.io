import tailwindColors from "tailwindcss/colors";
import type { ScaleStep } from "./types";

export const SCALE_STEPS: readonly ScaleStep[] = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
];

/** Stock Tailwind v3 hue families (RGB channels, opacity-safe). */
export type SwatchFamily =
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose";

export type SwatchId = `${SwatchFamily}-${ScaleStep}` | "black" | "white";

type Scale = Record<ScaleStep, string>;

const FAMILIES: readonly SwatchFamily[] = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

/**
 * Hardcoded RGB channels that win over Tailwind’s export.
 * Use only when a slot must not follow stock `amber-200` / `cyan-400`.
 */
export const SWATCH_OVERRIDES: Partial<Record<SwatchId, string>> = {
  // "amber-200": "253 230 138",
};

function hexToRgbChannels(hex: string): string {
  const raw = hex.replace("#", "").trim();
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => `${c}${c}`)
          .join("")
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Unsupported Tailwind color value: ${hex}`);
  }
  const n = Number.parseInt(full, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

function familyScale(family: SwatchFamily): Scale {
  const source = tailwindColors[family];
  return Object.fromEntries(
    SCALE_STEPS.map((step) => {
      const id: SwatchId = `${family}-${step}`;
      const override = SWATCH_OVERRIDES[id];
      if (override) return [step, override];
      return [step, hexToRgbChannels(source[step])];
    }),
  ) as Scale;
}

const FAMILY_SCALES: Record<SwatchFamily, Scale> = Object.fromEntries(
  FAMILIES.map((family) => [family, familyScale(family)]),
) as Record<SwatchFamily, Scale>;

const SINGLE: Record<"black" | "white", string> = {
  black: SWATCH_OVERRIDES.black ?? hexToRgbChannels(tailwindColors.black),
  white: SWATCH_OVERRIDES.white ?? hexToRgbChannels(tailwindColors.white),
};

const SWATCH_ID_RE = /^([a-z]+)-(\d{2,3})$/;

/** Resolve a Tailwind swatch id (`amber-200`, `cyan-400`, `black`) to RGB channels. */
export function getSwatch(id: SwatchId): string {
  const override = SWATCH_OVERRIDES[id];
  if (override) return override;
  if (id === "black" || id === "white") return SINGLE[id];
  const match = SWATCH_ID_RE.exec(id);
  if (!match) {
    throw new Error(`Unknown swatch id: ${id}`);
  }
  const family = match[1] as SwatchFamily;
  const step = match[2] as ScaleStep;
  const scale = FAMILY_SCALES[family];
  if (!scale || !(step in scale)) {
    throw new Error(`Unknown swatch id: ${id}`);
  }
  return scale[step];
}

/** Full 50–950 scale from a stock Tailwind family (Cyber accent = cyan). */
export function scaleFromSwatchFamily(family: SwatchFamily): Scale {
  return { ...FAMILY_SCALES[family] };
}

/** Every step the same swatch (ADA accent → black). */
export function flatSwatchScale(id: SwatchId): Scale {
  const rgb = getSwatch(id);
  return Object.fromEntries(SCALE_STEPS.map((step) => [step, rgb])) as Scale;
}

export function isSwatchId(value: string): value is SwatchId {
  if (value === "black" || value === "white") return true;
  const match = SWATCH_ID_RE.exec(value);
  if (!match) return false;
  const family = match[1];
  const step = match[2];
  return (FAMILIES as readonly string[]).includes(family) && SCALE_STEPS.includes(step as ScaleStep);
}
