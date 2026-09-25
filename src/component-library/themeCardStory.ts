import type { CardCover } from "@/components/ui";
import {
  blogPosts,
  featuredWorkCards,
  funThingsSection,
  howThisSiteWorksCards,
  interactiveDemoCards,
} from "@/data/content";
import type { LibraryPropMap } from "./types";

export type ThemeCardRecord = {
  id: string;
  title: string;
  excerpt: string;
  cta: string;
  date: string;
  cover: CardCover | null;
};

function youtubeThumb(youtubeId: string) {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

const featured = featuredWorkCards[0];
const demo = interactiveDemoCards[0];
const article = howThisSiteWorksCards[0];
const fun = funThingsSection.cards[0];
const post = blogPosts[0];

/** Real homepage Card records — parent lookup fills the plate. */
export const THEME_CARD_SAMPLES: readonly ThemeCardRecord[] = [
  {
    id: featured.id,
    title: featured.title,
    excerpt: featured.excerpt,
    date: featured.date,
    cta: "Play video",
    cover: featured.youtubeId
      ? {
          kind: "video",
          src: youtubeThumb(featured.youtubeId),
          alt: `${featured.title} thumbnail`,
          play: true,
        }
      : null,
  },
  {
    id: demo.id,
    title: demo.title,
    excerpt: demo.excerpt,
    date: demo.date,
    cta: "Open demo",
    cover: { kind: "demo" },
  },
  {
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    date: article.date,
    cta: "Read article",
    cover: { kind: "article" },
  },
  {
    id: fun.id,
    title: fun.title,
    excerpt: fun.modal.intro,
    date: fun.modal.date,
    cta: "View highlight",
    cover: { kind: "image", src: fun.imageSrc, alt: "" },
  },
  {
    id: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    cta: "View highlight",
    cover: { kind: "image", src: post.cover, alt: "" },
  },
];

function recordById(cardId: string | undefined) {
  return THEME_CARD_SAMPLES.find((row) => row.id === cardId) ?? THEME_CARD_SAMPLES[0];
}

export function hydrateThemeCardLibraryProps(props: LibraryPropMap): LibraryPropMap {
  const row = recordById(props.cardId);
  return {
    ...props,
    cardId: row.id,
    title: row.title,
    excerpt: row.excerpt,
    cta: row.cta,
    date: row.date,
    cover: row.cover ? JSON.stringify(row.cover) : "null",
  };
}

export function applyThemeCardControl(
  props: LibraryPropMap,
  key: string,
  value: string,
): LibraryPropMap {
  const next = { ...props, [key]: value };
  if (key === "cardId") return hydrateThemeCardLibraryProps(next);
  return next;
}

export function themeCardJsonNeedsHydration(props: LibraryPropMap): boolean {
  if (!props.title || !props.cover) return true;
  try {
    JSON.parse(props.cover) as unknown;
    return false;
  } catch {
    return true;
  }
}
