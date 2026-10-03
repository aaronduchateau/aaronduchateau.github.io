import type { LibraryControl, LibraryControlOption, LibraryPropMap, LibraryStory, LibraryStoryId } from "./types";
import { LIBRARY_SAMPLE_QUIZ } from "@/quiz";

export type LibraryHandler = {
  key: string;
  defaultSource: string;
};

const STORY_HANDLERS: Partial<Record<LibraryStoryId, readonly LibraryHandler[]>> = {
  "primary-cta": [{ key: "onClick", defaultSource: "() => alert('Primary CTA')" }],
  "ghost-button": [{ key: "onClick", defaultSource: "() => alert('Ghost button')" }],
  "outline-button": [{ key: "onClick", defaultSource: "() => alert('Outline button')" }],
  "nav-control": [{ key: "onClick", defaultSource: "() => alert('Nav control')" }],
  "theme-card": [{ key: "onClick", defaultSource: "() => alert('Theme card')" }],
  "testimonial-card": [{ key: "onClick", defaultSource: "() => alert('Testimonial card')" }],
  "quiz-player": [{ key: "onBack", defaultSource: "() => {}" }],
  "quest-board-card": [{ key: "onClick", defaultSource: "() => alert('Quest card')" }],
  "modal-close": [{ key: "onClick", defaultSource: "() => alert('Modal close')" }],
  "modal-frame": [{ key: "onClose", defaultSource: "() => alert('Modal frame close')" }],
  preview: [
    { key: "onNatural", defaultSource: "() => alert('Natural')" },
    { key: "onFullscreen", defaultSource: "() => alert('Full screen')" },
    { key: "onTablet", defaultSource: "() => alert('Tablet')" },
    { key: "onPhone", defaultSource: "() => alert('Phone')" },
  ],
};

export function handlersForStory(id: LibraryStoryId): readonly LibraryHandler[] {
  return STORY_HANDLERS[id] ?? [];
}

export function handlerDefaultsForStory(id: LibraryStoryId): LibraryPropMap {
  return Object.fromEntries(handlersForStory(id).map((handler) => [handler.key, handler.defaultSource]));
}

/** Nested objects the JSON overlay can edit (stringified in the prop map / iframe URL). */
export function objectDefaultsForStory(id: LibraryStoryId): Record<string, unknown> {
  if (id === "quiz-player") return { quiz: LIBRARY_SAMPLE_QUIZ };
  return {};
}

function isBooleanControl(control: LibraryControl) {
  return control.options.length > 0 && control.options.every((option) => option.value === "true" || option.value === "false");
}

export function storyPropsToJson(story: LibraryStory, props: LibraryPropMap): Record<string, unknown> {
  if (story.id === "quest-board-card") {
    return questBoardStoryJson(props);
  }
  if (story.id === "testimonial-card") {
    return testimonialStoryJson(props);
  }
  if (story.id === "education-card") {
    return educationStoryJson(props);
  }
  if (story.id === "theme-card") {
    return themeCardStoryJson(props);
  }
  if (story.id === "full-screen-quote") {
    return fullScreenQuoteStoryJson(props);
  }
  if (story.id === "compare-slider") {
    return compareSliderStoryJson(props);
  }
  if (story.id === "career-timeline") {
    return careerTimelineStoryJson(props);
  }
  if (story.id === "leave-site-confirm") {
    return leaveSiteConfirmStoryJson(props);
  }
  const json: Record<string, unknown> = {};
  for (const control of story.controls) {
    const raw = props[control.key] ?? control.defaultValue;
    json[control.key] = isBooleanControl(control) ? raw === "true" : raw;
  }
  for (const handler of handlersForStory(story.id)) {
    json[handler.key] = props[handler.key] ?? handler.defaultSource;
  }
  for (const [key, value] of Object.entries(props)) {
    if (key in json) continue;
    json[key] = hydrateJsonProp(value);
  }
  return json;
}

function educationStoryJson(props: LibraryPropMap): Record<string, unknown> {
  return {
    years: props.years ?? "",
    degree: props.degree ?? "",
    school: props.school ?? "",
    detail: props.detail ?? "",
    splash: hydrateJsonProp(props.splash ?? "{}"),
  };
}

function careerTimelineStoryJson(props: LibraryPropMap): Record<string, unknown> {
  return {
    items: hydrateJsonProp(props.items ?? "[]"),
    activeIndex: Number(props.activeIndex ?? 0),
    paused: props.paused === "true",
  };
}

function leaveSiteConfirmStoryJson(props: LibraryPropMap): Record<string, unknown> {
  return {
    company: props.company ?? "",
    location: props.location ?? "",
    window: props.window ?? "",
    role: props.role ?? "",
    bullets: hydrateJsonProp(props.bullets ?? "[]"),
    photo: props.photo ?? "",
    href: props.href ?? "",
    armed: props.armed === "true",
  };
}

function fullScreenQuoteStoryJson(props: LibraryPropMap): Record<string, unknown> {
  return {
    quote: props.quote ?? "",
    attribution: props.attribution ?? "",
    photo: props.photo ?? "",
    photoAlt: props.photoAlt ?? "",
  };
}

function compareSliderStoryJson(props: LibraryPropMap): Record<string, unknown> {
  return {
    beforeSrc: props.beforeSrc ?? "",
    afterSrc: props.afterSrc ?? "",
    beforeLabel: props.beforeLabel ?? "Original",
    afterLabel: props.afterLabel ?? "Suggested",
  };
}

function themeCardStoryJson(props: LibraryPropMap): Record<string, unknown> {
  return {
    title: props.title ?? "",
    excerpt: props.excerpt ?? "",
    date: props.date ?? "",
    cta: props.cta ?? "",
    cover: props.cover ? hydrateJsonProp(props.cover) : null,
    onClick: props.onClick ?? "() => alert('Theme card')",
  };
}

function testimonialStoryJson(props: LibraryPropMap): Record<string, unknown> {
  return {
    name: props.name ?? "",
    title: props.title ?? "",
    quote: props.quote ?? "",
    photo: props.photo ?? "",
    onClick: props.onClick ?? "() => alert('Testimonial card')",
  };
}

function questBoardStoryJson(props: LibraryPropMap): Record<string, unknown> {
  return {
    complete: props.complete === "true",
    title: props.title ?? "",
    bounty: props.bounty ?? "",
    unlockItems: hydrateJsonProp(props.unlockItems ?? "[]"),
    card: props.card ? hydrateJsonProp(props.card) : null,
    onClick: props.onClick ?? "() => alert('Quest card')",
  };
}

export function stringifyStoryProps(story: LibraryStory, props: LibraryPropMap): string {
  return `${JSON.stringify(storyPropsToJson(story, props), null, 2)}\n`;
}

function jsonValueToProp(value: unknown): string | null {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "object") return JSON.stringify(value);
  return null;
}

function hydrateJsonProp(raw: string): unknown {
  const text = raw.trim();
  if (
    (text.startsWith("{") && text.endsWith("}")) ||
    (text.startsWith("[") && text.endsWith("]"))
  ) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return raw;
    }
  }
  return raw;
}

export function parseStoryJson(raw: string): { props: LibraryPropMap } | { error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Invalid JSON" };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { error: "JSON must be an object of prop keys." };
  }
  const props: LibraryPropMap = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    const next = jsonValueToProp(value);
    if (next == null) {
      return { error: `“${key}” must be a string, number, boolean, object, array, or null.` };
    }
    props[key] = next;
  }
  return { props };
}

export function absorbCustomOptions(
  story: LibraryStory,
  props: LibraryPropMap,
  extras: Record<string, LibraryControlOption[]>,
): Record<string, LibraryControlOption[]> {
  const next: Record<string, LibraryControlOption[]> = { ...extras };
  for (const control of story.controls) {
    const value = props[control.key];
    if (value == null || value === "") continue;
    const known = new Set([
      ...control.options.map((option) => option.value),
      ...(next[control.key] ?? []).map((option) => option.value),
    ]);
    if (!known.has(value)) {
      next[control.key] = [...(next[control.key] ?? []), { value, label: value }];
    }
  }
  return next;
}

export function mergeControlOptions(
  control: LibraryControl,
  extras: Record<string, LibraryControlOption[]>,
): readonly LibraryControlOption[] {
  const extra = extras[control.key];
  if (!extra?.length) return control.options;
  return [...control.options, ...extra];
}

/** Compile a catalog demo handler. Preview iframe only — not for site chrome. */
export function compileDemoHandler(source: string | undefined, fallbackMessage: string): () => void {
  const text = source?.trim();
  const fallback = () => {
    alert(fallbackMessage);
  };
  if (!text) return fallback;
  try {
    // Catalog canvas only: user-edited `() => alert(...)` strings from the JSON overlay.
    const created = new Function(`"use strict"; return (${text});`)();
    if (typeof created === "function") {
      return () => {
        created();
      };
    }
  } catch {
    return fallback;
  }
  return fallback;
}
