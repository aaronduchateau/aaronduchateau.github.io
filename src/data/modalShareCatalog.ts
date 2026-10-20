import enterSplash from "@/interactive-demos/photo-region-prompt/enterSplash.json";
import {
  EASTER_EGG_BOARD_KEY,
  EASTER_EGG_BOARD_NAMESPACE,
} from "@/lib/easterEggBoardRoute";
import {
  absoluteAssetUrl,
  markdownSectionNamespace,
  modalShareSegments,
  projectSectionNamespace,
  summarize,
  youtubeSectionNamespace,
  youtubeThumb,
  type ModalLocation,
} from "@/lib/modalSharePath";
import type { MediaModalItem } from "@/types/media-modal";
import {
  FRESCO_MODAL_KEY,
  FRESCO_MODAL_NAMESPACE,
  HERO_LEARN_MODAL_NAMESPACE,
  HERO_LEARN_PLACEHOLDER_KEY,
  TESTIMONIALS_MODAL_NAMESPACE,
  animationStoryCards,
  animationStorySection,
  featuredWorkCards,
  frescoQuoteModal,
  funThingsSection,
  hackathonContributionsSection,
  heroLearnPlaceholderModal,
  howThisSiteWorksSection,
  interactiveDemosSection,
  majorProjectsSection,
  olderVideoShowcaseSection,
  person,
  testimonials,
  videoShowcaseSection,
  type ContributionProject,
} from "@/data/content";

/** Fallback card when a modal has no photo or video of its own. */
export const DEFAULT_SHARE_IMAGE = "/photos/Aaron_DuChateau_hero-video-poster.png";

export type ModalShareEntry = ModalLocation & {
  title: string;
  description: string;
  /** Absolute image URL. */
  image: string;
  imageAlt: string;
  /** YouTube thumbs have a known size; local photos omit this. */
  imageWidth?: number;
  imageHeight?: number;
};

type ShareBase = {
  namespace: string;
  key: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
  media?: readonly MediaModalItem[];
};

const DEMO_IMAGES: Record<string, string> = {
  "photo-region-prompt": enterSplash.youtubeId
    ? youtubeThumb(enterSplash.youtubeId)
    : DEFAULT_SHARE_IMAGE,
  "photo-critique": "/interactive-demos/photo-critique/Aaron_DuChateau_busy-fountain.jpg",
};

function withAbsoluteImage(src: string, alt: string, knownYoutube = false): Pick<
  ModalShareEntry,
  "image" | "imageAlt" | "imageWidth" | "imageHeight"
> {
  const image = absoluteAssetUrl(src, DEFAULT_SHARE_IMAGE);
  return {
    image,
    imageAlt: alt,
    ...(knownYoutube || image.includes("i.ytimg.com/")
      ? { imageWidth: 480, imageHeight: 360 }
      : {}),
  };
}

function itemLabel(item: MediaModalItem): string {
  switch (item.type) {
    case "video":
      return summarize(item.intro, 80) || "Video";
    case "photo":
      return item.alt || "Photo";
    case "slideReveal":
      return summarize(item.intro, 80) || "Comparison";
    case "testimonial":
      return item.attribution;
    case "collection":
      return item.title;
    case "recipe":
      return item.title;
    default:
      return "Item";
  }
}

/** Short filenames and alts stay in the title. The summary stays the album or item write-up. */
function itemDescription(item: MediaModalItem, fallback: string): string {
  const specific = (() => {
    switch (item.type) {
      case "video":
        return item.detail || item.intro;
      case "photo":
        return item.detail || item.intro;
      case "slideReveal":
        return item.detail || item.intro;
      case "testimonial":
        return item.quote || item.intro;
      case "collection":
        return item.detail || item.intro;
      case "recipe":
        return item.description || item.subtitle || item.intro;
      default:
        return "";
    }
  })();
  const summary = summarize(specific);
  return summary.length >= 80 ? summary : fallback;
}

function itemImage(item: MediaModalItem, fallback: string): { src: string; alt: string } {
  switch (item.type) {
    case "video":
      return { src: youtubeThumb(item.youtubeId), alt: item.intro || "Video" };
    case "photo":
      return { src: item.src, alt: item.alt || "Photo" };
    case "slideReveal":
      return { src: item.before.src, alt: item.before.alt || item.intro };
    case "testimonial":
      return { src: item.photoSrc || fallback, alt: item.attribution };
    case "collection":
      return { src: item.cover.src, alt: item.cover.alt || item.title };
    case "recipe":
      return {
        src: item.cover.src || item.photos[0]?.src || fallback,
        alt: item.cover.alt || item.title,
      };
    default:
      return { src: fallback, alt: "Portfolio" };
  }
}

function pushShare(
  entries: ModalShareEntry[],
  loc: ModalLocation,
  title: string,
  description: string,
  imageSrc: string,
  imageAlt: string,
) {
  const picture = withAbsoluteImage(imageSrc, imageAlt);
  entries.push({
    ...loc,
    title: summarize(title, 90) || person.name,
    description: description || person.tagline,
    imageAlt: picture.imageAlt,
    image: picture.image,
    imageWidth: picture.imageWidth,
    imageHeight: picture.imageHeight,
  });
}

function addModal(entries: ModalShareEntry[], base: ShareBase) {
  const description = summarize(base.description) || person.tagline;
  pushShare(
    entries,
    { namespace: base.namespace, key: base.key, path: [], item: null },
    base.title,
    description,
    base.image,
    base.imageAlt,
  );

  const media = base.media;
  if (!media || media.length === 0) return;

  const walk = (items: readonly MediaModalItem[], path: string[]) => {
    for (const item of items) {
      const label = itemLabel(item);
      const title = label && label !== base.title ? `${base.title} — ${label}` : base.title;
      const picture = itemImage(item, base.image);
      pushShare(
        entries,
        { namespace: base.namespace, key: base.key, path, item: item.id },
        title,
        itemDescription(item, description),
        picture.src,
        picture.alt,
      );
      if (item.type === "collection") walk(item.items, [...path, item.id]);
      if (item.type === "recipe") {
        const entered = itemImage(item, base.image);
        pushShare(
          entries,
          { namespace: base.namespace, key: base.key, path: [...path, item.id], item: item.id },
          `${base.title} — ${item.title}`,
          itemDescription(item, description),
          entered.src,
          entered.alt,
        );
      }
    }
  };
  walk(media, []);
}

type YoutubeLikeCard = {
  id: string;
  title: string;
  excerpt: string;
  youtubeId?: string;
  coverSrc?: string;
  modalText: string;
  modal?: { title: string; intro: string; media: readonly MediaModalItem[] };
};

function addYoutubeSection(
  entries: ModalShareEntry[],
  section: { id?: string; title: string; cards: readonly YoutubeLikeCard[] },
) {
  const namespace = youtubeSectionNamespace(section);
  for (const card of section.cards) {
    const modal = card.modal;
    const image = card.coverSrc
      ? card.coverSrc
      : card.youtubeId
        ? youtubeThumb(card.youtubeId)
        : modal?.media
          ? itemImage(modal.media[0], DEFAULT_SHARE_IMAGE).src
          : DEFAULT_SHARE_IMAGE;
    const media =
      modal?.media ??
      (card.youtubeId
        ? ([
            {
              type: "video",
              id: `${card.id}-video`,
              youtubeId: card.youtubeId,
            },
          ] as const)
        : undefined);
    addModal(entries, {
      namespace,
      key: card.id,
      title: modal?.title ?? card.title,
      description: modal?.intro || card.modalText || card.excerpt,
      image,
      imageAlt: card.title,
      media,
    });
  }
}

function addProjects(
  entries: ModalShareEntry[],
  section: { id?: string; title: string; projects: readonly ContributionProject[] },
) {
  const namespace = projectSectionNamespace(section);
  for (const project of section.projects) {
    if (!project.modal) continue;
    addModal(entries, {
      namespace,
      key: project.id,
      title: project.modal.title,
      description: project.modal.intro,
      image: project.photo,
      imageAlt: project.company,
      media: project.modal.media,
    });
  }
}

type ShareCard = {
  id: string;
  title: string;
  excerpt: string;
  modal: { title: string; intro: string };
};

function buildModalShareCatalog(): ModalShareEntry[] {
  const entries: ModalShareEntry[] = [];

  const demoCards: readonly ShareCard[] = interactiveDemosSection.cards;
  for (const card of demoCards) {
    addModal(entries, {
      namespace: "demos",
      key: card.id,
      title: card.modal.title,
      description: card.excerpt || card.modal.intro,
      image: DEMO_IMAGES[card.id] ?? DEFAULT_SHARE_IMAGE,
      imageAlt: card.title,
    });
  }

  addYoutubeSection(entries, videoShowcaseSection);
  addYoutubeSection(entries, olderVideoShowcaseSection);
  addYoutubeSection(entries, animationStorySection);
  addProjects(entries, majorProjectsSection);
  addProjects(entries, hackathonContributionsSection);

  for (const card of funThingsSection.cards) {
    addModal(entries, {
      namespace: "fun",
      key: card.id,
      title: card.modal.title,
      description: card.modal.intro,
      image: card.imageSrc,
      imageAlt: card.title,
      media: card.modal.media,
    });
  }

  const articleNamespace = markdownSectionNamespace(howThisSiteWorksSection);
  const articleCards: readonly ShareCard[] = howThisSiteWorksSection.cards;
  for (const card of articleCards) {
    addModal(entries, {
      namespace: articleNamespace,
      key: card.id,
      title: card.modal.title,
      description: card.excerpt || card.modal.intro,
      image: DEFAULT_SHARE_IMAGE,
      imageAlt: card.title,
    });
  }

  for (const note of testimonials) {
    addModal(entries, {
      namespace: TESTIMONIALS_MODAL_NAMESPACE,
      key: note.id,
      title: `${note.name} — recommendation`,
      description: note.quote,
      image: note.photo,
      imageAlt: note.name,
    });
  }

  const frescoVideo = frescoQuoteModal.media.find((item) => item.type === "video");
  addModal(entries, {
    namespace: FRESCO_MODAL_NAMESPACE,
    key: FRESCO_MODAL_KEY,
    title: frescoQuoteModal.title,
    description: frescoQuoteModal.intro,
    image: frescoVideo ? youtubeThumb(frescoVideo.youtubeId) : DEFAULT_SHARE_IMAGE,
    imageAlt: frescoQuoteModal.title,
    media: frescoQuoteModal.media,
  });

  addModal(entries, {
    namespace: HERO_LEARN_MODAL_NAMESPACE,
    key: HERO_LEARN_PLACEHOLDER_KEY,
    title: heroLearnPlaceholderModal.title,
    description: heroLearnPlaceholderModal.intro,
    image: heroLearnPlaceholderModal.media[0].type === "photo"
      ? heroLearnPlaceholderModal.media[0].src
      : DEFAULT_SHARE_IMAGE,
    imageAlt: heroLearnPlaceholderModal.title,
    media: heroLearnPlaceholderModal.media,
  });

  for (const card of featuredWorkCards) {
    const modal = "modal" in card ? card.modal : undefined;
    addModal(entries, {
      namespace: HERO_LEARN_MODAL_NAMESPACE,
      key: `work-${card.id}`,
      title: modal?.title ?? card.title,
      description: modal?.intro || card.modalText || card.excerpt,
      image: card.youtubeId ? youtubeThumb(card.youtubeId) : DEFAULT_SHARE_IMAGE,
      imageAlt: card.title,
      media:
        modal?.media ??
        (card.youtubeId
          ? [
              {
                type: "video" as const,
                id: `${card.id}-video`,
                youtubeId: card.youtubeId,
              },
            ]
          : undefined),
    });
  }

  for (const card of animationStoryCards) {
    addModal(entries, {
      namespace: HERO_LEARN_MODAL_NAMESPACE,
      key: `story-${card.id}`,
      title: card.title,
      description: card.modalText,
      image: youtubeThumb(card.youtubeId),
      imageAlt: card.title,
      media: [
        {
          type: "video",
          id: `${card.id}-video`,
          youtubeId: card.youtubeId,
        },
      ],
    });
  }

  addModal(entries, {
    namespace: EASTER_EGG_BOARD_NAMESPACE,
    key: EASTER_EGG_BOARD_KEY,
    title: "Easter egg board",
    description:
      "A local scoreboard of side quests on this portfolio — themes, clips, and small prizes unlocked by using the site.",
    image: DEFAULT_SHARE_IMAGE,
    imageAlt: "Easter egg board",
  });

  const seen = new Set<string>();
  return entries.filter((entry) => {
    const id = modalShareSegments(entry).join("/");
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export const modalShareCatalog: readonly ModalShareEntry[] = buildModalShareCatalog();

const bySegments = new Map<string, ModalShareEntry>(
  modalShareCatalog.map((entry) => [modalShareSegments(entry).join("/"), entry]),
);

export function findModalShare(slug: readonly string[]): ModalShareEntry | null {
  return bySegments.get(slug.join("/")) ?? null;
}
