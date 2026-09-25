"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { renderLibraryStory } from "@/component-library/renderStory";
import { defaultPropsForStory, getLibraryStory } from "@/component-library/catalog";
import { LibraryPreviewCanvas } from "@/component-library/LibraryPreviewCanvas";
import { hydrateCareerTimelineLibraryProps } from "@/component-library/careerTimelineStory";
import { hydrateEducationLibraryProps } from "@/component-library/educationStory";
import { hydrateFullScreenQuoteLibraryProps } from "@/component-library/fullScreenQuoteStory";
import { hydrateLeaveSiteConfirmLibraryProps } from "@/component-library/leaveSiteConfirmStory";
import { hydrateQuestBoardLibraryProps } from "@/component-library/questBoardStory";
import { hydrateTestimonialLibraryProps } from "@/component-library/testimonialStory";
import { hydrateThemeCardLibraryProps } from "@/component-library/themeCardStory";
import type { LibraryPropMap } from "@/component-library/types";

function resolveEmbedProps(storyId: string, queryProps: LibraryPropMap): LibraryPropMap {
  const story = getLibraryStory(storyId);
  if (!story) return queryProps;
  const merged = { ...defaultPropsForStory(story), ...queryProps };
  switch (story.id) {
    case "quest-board-card":
      return hydrateQuestBoardLibraryProps(merged);
    case "testimonial-card":
      return hydrateTestimonialLibraryProps(merged);
    case "education-card":
      return hydrateEducationLibraryProps(merged);
    case "theme-card":
      return hydrateThemeCardLibraryProps(merged);
    case "full-screen-quote":
      return hydrateFullScreenQuoteLibraryProps(merged);
    case "career-timeline":
      return hydrateCareerTimelineLibraryProps(merged);
    case "leave-site-confirm":
      return hydrateLeaveSiteConfirmLibraryProps(merged);
    default:
      return merged;
  }
}

function ComponentPreviewEmbed() {
  const params = useSearchParams();
  const storyId = params.get("story") ?? "primary-cta";
  const queryProps = useMemo(() => {
    const props: LibraryPropMap = {};
    params.forEach((value, key) => {
      if (key === "story" || key.startsWith("_")) return;
      props[key] = value;
    });
    return props;
  }, [params]);

  const props = useMemo(
    () => resolveEmbedProps(storyId, queryProps),
    [storyId, queryProps],
  );

  useEffect(() => {
    document.documentElement.classList.add("component-preview-embed");
    document.documentElement.classList.remove("signature-booting");
    return () => {
      document.documentElement.classList.remove("component-preview-embed");
    };
  }, []);

  const story = getLibraryStory(storyId);

  return (
    <main
      className="box-border flex h-dvh w-full min-w-full flex-col overflow-hidden bg-surface-950 p-4"
      data-component-preview
    >
      <LibraryPreviewCanvas>
        {renderLibraryStory(story?.id ?? storyId, props)}
      </LibraryPreviewCanvas>
    </main>
  );
}

export default function ComponentPreviewPage() {
  return (
    <Suspense
      fallback={
        <main className="flex h-dvh items-center justify-center bg-surface-950 p-8 text-sm text-surface-500">
          Loading preview…
        </main>
      }
    >
      <ComponentPreviewEmbed />
    </Suspense>
  );
}
