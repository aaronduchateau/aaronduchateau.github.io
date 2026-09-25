"use client";

import { GalleryStrip } from "@/components/GalleryStrip";
import { MarkdownArticleCardSection } from "@/components/MarkdownArticleCardSection";
import { YouTubeCardSection } from "@/components/YouTubeCardSection";
import {
  animationStorySection,
  howThisSiteWorksSection,
  olderVideoShowcaseSection,
} from "@/data/content";
import { useTheme } from "@/theme/ThemeProvider";

/**
 * Mounts playful / narrative strips only when json-rules-engine layout
 * rules allow them (hidden under the Professional theme).
 */
export function ThemeGatedSections() {
  const { visibility } = useTheme();

  return (
    <>
      {visibility.funThings ? <GalleryStrip /> : null}
      {visibility.animationStory ? (
        <YouTubeCardSection {...animationStorySection} />
      ) : null}
      <YouTubeCardSection {...olderVideoShowcaseSection} />
      {visibility.animationStory ? (
        <MarkdownArticleCardSection {...howThisSiteWorksSection} />
      ) : null}
    </>
  );
}
