import { ADVANCED_STORIES } from "./advanced/catalog";
import { SIMPLE_STORIES } from "./simple/catalog";
import { handlerDefaultsForStory, objectDefaultsForStory } from "./storyJson";
import { hydrateQuestBoardLibraryProps } from "./questBoardStory";
import { hydrateTestimonialLibraryProps } from "./testimonialStory";
import { hydrateEducationLibraryProps } from "./educationStory";
import { hydrateThemeCardLibraryProps } from "./themeCardStory";
import { hydrateFullScreenQuoteLibraryProps } from "./fullScreenQuoteStory";
import { hydrateCompareSliderLibraryProps } from "./compareSliderStory";
import { hydrateCareerTimelineLibraryProps } from "./careerTimelineStory";
import { hydrateLeaveSiteConfirmLibraryProps } from "./leaveSiteConfirmStory";
import type { LibraryStory, LibraryStoryId } from "./types";

export { LIBRARY_KINDS } from "./types";

export const LIBRARY_STORIES: readonly LibraryStory[] = [
  ...ADVANCED_STORIES,
  ...SIMPLE_STORIES,
];

const STORY_BY_ID = new Map(LIBRARY_STORIES.map((story) => [story.id, story]));

export function getLibraryStory(id: string | null | undefined): LibraryStory | null {
  if (!id) return null;
  return STORY_BY_ID.get(id as LibraryStoryId) ?? null;
}

export function defaultPropsForStory(story: LibraryStory): Record<string, string> {
  const objects = objectDefaultsForStory(story.id);
  const base = {
    ...handlerDefaultsForStory(story.id),
    ...Object.fromEntries(
      Object.entries(objects).map(([key, value]) => [key, JSON.stringify(value)]),
    ),
    ...Object.fromEntries(story.controls.map((control) => [control.key, control.defaultValue])),
  };
  if (story.id === "quest-board-card") return hydrateQuestBoardLibraryProps(base);
  if (story.id === "testimonial-card") return hydrateTestimonialLibraryProps(base);
  if (story.id === "education-card") return hydrateEducationLibraryProps(base);
  if (story.id === "theme-card") return hydrateThemeCardLibraryProps(base);
  if (story.id === "full-screen-quote") return hydrateFullScreenQuoteLibraryProps(base);
  if (story.id === "compare-slider") return hydrateCompareSliderLibraryProps(base);
  if (story.id === "career-timeline") return hydrateCareerTimelineLibraryProps(base);
  if (story.id === "leave-site-confirm") return hydrateLeaveSiteConfirmLibraryProps(base);
  return base;
}

export function storiesForKind(kind: LibraryStory["kind"]): readonly LibraryStory[] {
  return LIBRARY_STORIES.filter((story) => story.kind === kind);
}
