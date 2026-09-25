import { getLibraryStory } from "@/component-library/catalog";
import { COMPONENT_PREVIEW_PATH } from "@/lib/componentPreview";
import type { LibraryPropMap } from "./types";

/** Handler source strings — embed re-applies catalog defaults; never put in the iframe URL. */
const PREVIEW_URL_SKIP = new Set(["onClick"]);

/**
 * Local static-export URL for the isolated iframe canvas.
 * Only serializes catalog control keys (plus story id) so parent-lookup stories
 * stay short (`letterId=…`) and the embed re-hydrates derived fields.
 */
export function buildComponentPreviewSrc(storyId: string, props: LibraryPropMap): string {
  const story = getLibraryStory(storyId);
  const allowed = story ? new Set(story.controls.map((control) => control.key)) : null;
  const params = new URLSearchParams({ story: storyId });
  for (const [key, value] of Object.entries(props)) {
    if (key === "story" || key.startsWith("_") || PREVIEW_URL_SKIP.has(key)) continue;
    if (allowed && !allowed.has(key)) continue;
    params.set(key, value);
  }
  // COMPONENT_PREVIEW_PATH already includes a trailing slash.
  return `${COMPONENT_PREVIEW_PATH}?${params.toString()}`;
}
