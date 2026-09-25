"use client";

import { MediaModal } from "@/components/MediaModal";
import {
  animationStoryCards,
  featuredWorkCards,
  HERO_LEARN_MODAL_NAMESPACE,
  HERO_LEARN_PLACEHOLDER_KEY,
  heroLearnPlaceholderModal,
} from "@/data/content";
import { slugify, useRouteModal } from "@/lib/useRouteModal";
import type { MediaModalConfig } from "@/types/media-modal";

function workCardToModal(card: (typeof featuredWorkCards)[number]): MediaModalConfig {
  const enterSplash = "enterSplash" in card ? card.enterSplash : undefined;

  if ("modal" in card && card.modal) {
    return enterSplash ? { ...card.modal, enterSplash } : card.modal;
  }

  if (!card.youtubeId) {
    throw new Error(`Featured work card "${card.id}" needs youtubeId or a full modal config`);
  }

  return {
    title: card.title,
    date: card.date,
    intro: card.modalText,
    detail: card.modalDetail,
    contextLabel: "Video context",
    enterSplash,
    media: [
      {
        type: "video",
        id: `${card.id}-video`,
        youtubeId: card.youtubeId,
        startSeconds: "startSeconds" in card ? card.startSeconds : undefined,
      },
    ],
  };
}

function storyCardToModal(card: (typeof animationStoryCards)[number]): MediaModalConfig {
  return {
    title: card.title,
    date: card.date,
    intro: card.modalText,
    detail: card.modalDetail,
    contextLabel: "Video context",
    media: [
      {
        type: "video",
        id: `${card.id}-video`,
        youtubeId: card.youtubeId,
      },
    ],
  };
}

/**
 * Hosts hero Learn more destinations that are not the testimonials dialog:
 * featured / archive work cards, animation-story cards, and a placeholder.
 * Kept mounted so cue deep-links work even when those sections are theme-gated.
 */
export function HeroLearnMoreModalHost() {
  const { active, activeKey, path, selection, setView, close } = useRouteModal<MediaModalConfig>(
    HERO_LEARN_MODAL_NAMESPACE,
    (key) => {
      if (key === HERO_LEARN_PLACEHOLDER_KEY) return heroLearnPlaceholderModal;

      if (key.startsWith("work-")) {
        const id = key.slice("work-".length);
        const card = featuredWorkCards.find((c) => c.id === id);
        return card ? workCardToModal(card) : heroLearnPlaceholderModal;
      }

      if (key.startsWith("story-")) {
        const id = key.slice("story-".length);
        const card = animationStoryCards.find((c) => c.id === id || slugify(c.id) === id);
        return card ? storyCardToModal(card) : heroLearnPlaceholderModal;
      }

      return heroLearnPlaceholderModal;
    },
  );

  return (
    <MediaModal
      key={activeKey ?? "hero-learn-closed"}
      config={active}
      onClose={close}
      initialPath={path}
      initialItemId={selection}
      onNavigate={setView}
    />
  );
}
