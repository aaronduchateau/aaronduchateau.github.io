import { getSwatch, SCALE_STEPS, type SwatchId } from "./swatches";
import type { ScaleStep } from "./types";

/**
 * Slot value language:
 * - `{ swatch: "amber-200" }` — stock Tailwind RGB (never a remapped hue)
 * - `{ ref: "accent.400" }` — another resolved slot
 * - `{ rgb: "207 250 254" }` — escape hatch for custom mixes
 */
export type SlotValue =
  | { swatch: SwatchId }
  | { ref: string }
  | { rgb: string };

export type ScaleSlotMap = Record<ScaleStep, SlotValue>;

/** CSS custom-property names for component slots (`--slot-demo-badge-title`). */
export const COMPONENT_SLOT_IDS = [
  "demo-badge-title",
  "demo-badge-kicker",
  "demo-badge-border",
  "primary-cta-fill",
  "primary-cta-ink",
  "card-title-hover",
  "card-cta",
  "card-meta",
  "section-eyebrow",
  "muted-copy",
  "ghost-fill",
  "ghost-ink",
  "hairline",
  "success-fill",
  "success-ink",
] as const;

export type ComponentSlotId = (typeof COMPONENT_SLOT_IDS)[number];

export type ComponentSlotMap = Partial<Record<ComponentSlotId, SlotValue>>;

export type SlotResolveContext = {
  accent: Record<ScaleStep, string>;
  surface: Record<ScaleStep, string>;
};

const DEFAULT_COMPONENT_SLOTS: Record<ComponentSlotId, SlotValue> = {
  "demo-badge-title": { ref: "accent.100" },
  "demo-badge-kicker": { ref: "accent.400" },
  "demo-badge-border": { ref: "accent.400" },
  "primary-cta-fill": { ref: "accent.500" },
  "primary-cta-ink": { ref: "surface.950" },
  "card-title-hover": { ref: "accent.100" },
  "card-cta": { ref: "accent.400" },
  "card-meta": { ref: "accent.200" },
  "section-eyebrow": { ref: "accent.300" },
  "muted-copy": { ref: "surface.400" },
  "ghost-fill": { rgb: "255 255 255" },
  "ghost-ink": { rgb: "255 255 255" },
  hairline: { rgb: "255 255 255" },
  "success-fill": { swatch: "emerald-500" },
  "success-ink": { swatch: "emerald-200" },
};

export function resolveSlotValue(
  value: SlotValue,
  ctx: SlotResolveContext,
  seen: Set<string> = new Set(),
): string {
  if ("rgb" in value) return value.rgb;
  if ("swatch" in value) return getSwatch(value.swatch);
  if (seen.has(value.ref)) {
    throw new Error(`Circular slot ref: ${value.ref}`);
  }
  seen.add(value.ref);
  const [family, step] = value.ref.split(".");
  if ((family === "accent" || family === "surface") && step) {
    const scale = family === "accent" ? ctx.accent : ctx.surface;
    const rgb = scale[step as ScaleStep];
    if (!rgb) throw new Error(`Unknown slot ref: ${value.ref}`);
    return rgb;
  }
  throw new Error(`Unknown slot ref: ${value.ref}`);
}

export function resolveComponentSlots(
  ctx: SlotResolveContext,
  overrides: ComponentSlotMap = {},
): Record<ComponentSlotId, string> {
  const next = {} as Record<ComponentSlotId, string>;
  for (const id of COMPONENT_SLOT_IDS) {
    next[id] = resolveSlotValue(overrides[id] ?? DEFAULT_COMPONENT_SLOTS[id], ctx);
  }
  return next;
}

/** Build a 50–950 scale from swatch ids and/or rgb escapes. */
export function resolveScale(map: ScaleSlotMap): Record<ScaleStep, string> {
  const empty: SlotResolveContext = {
    accent: {} as Record<ScaleStep, string>,
    surface: {} as Record<ScaleStep, string>,
  };
  return Object.fromEntries(
    SCALE_STEPS.map((step) => [step, resolveSlotValue(map[step], empty)]),
  ) as Record<ScaleStep, string>;
}

/** Encode a raw RGB scale as `{ rgb }` slots (custom mixes that are not a Tailwind swatch). */
export function rgbScaleToSlots(scale: Record<ScaleStep, string>): ScaleSlotMap {
  return Object.fromEntries(
    SCALE_STEPS.map((step) => [step, { rgb: scale[step] } satisfies SlotValue]),
  ) as ScaleSlotMap;
}
