"use client";

import { Card, CardGrid, PageSection, SectionHeading } from "@/components/ui";
import { MediaModal } from "@/components/MediaModal";
import { MobileContentList } from "@/components/MobileContentList";
import { useMobileOnlyViewport } from "@/hooks/useMediaQuery";
import { slugify, useRouteModal } from "@/lib/useRouteModal";
import { useTheme } from "@/theme/ThemeProvider";
import type { MediaModalConfig } from "@/types/media-modal";

export type YouTubeWorkCard = {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  /** YouTube id for thumbnail + default video modal. Optional when `coverSrc` + `modal` are set. */
  youtubeId?: string;
  /** Card thumbnail when there is no YouTube id. */
  coverSrc?: string;
  modalText: string;
  modalDetail?: string;
  startSeconds?: number;
  modal?: MediaModalConfig;
  /** Optional modal gate (e.g. archive disclaimer) — passed into MediaModalConfig. */
  enterSplash?: MediaModalConfig["enterSplash"];
  /** Card footer CTA; defaults to “Play video”. */
  ctaLabel?: string;
};

export type YouTubeSectionConfig = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  cards: readonly YouTubeWorkCard[];
};

function legacyCardToModal(card: YouTubeWorkCard): MediaModalConfig {
  if (card.modal) {
    return card.enterSplash ? { ...card.modal, enterSplash: card.enterSplash } : card.modal;
  }

  if (!card.youtubeId) {
    throw new Error(`YouTube card "${card.id}" needs youtubeId or a full modal config`);
  }

  return {
    title: card.title,
    date: card.date,
    intro: card.modalText,
    detail: card.modalDetail,
    contextLabel: "Video context",
    enterSplash: card.enterSplash,
    media: [
      {
        type: "video",
        id: `${card.id}-video`,
        youtubeId: card.youtubeId,
        startSeconds: card.startSeconds,
      },
    ],
  };
}

function cardThumbnailSrc(card: YouTubeWorkCard) {
  if (card.coverSrc) return card.coverSrc;
  if (card.youtubeId) return `https://img.youtube.com/vi/${card.youtubeId}/hqdefault.jpg`;
  return "/archive/v1/how-it-works.svg";
}

export function YouTubeCardSection({ id, eyebrow, title, description, cards }: YouTubeSectionConfig) {
  const namespace = `yt-${id ?? slugify(title)}`;
  const { visibility } = useTheme();
  const showDecorativeMedia = visibility.decorativeCardMedia;
  const isMobile = useMobileOnlyViewport();
  const useAdaList = isMobile && !showDecorativeMedia;
  const { active: activeModal, activeKey, path, selection, open, setView, close } =
    useRouteModal<MediaModalConfig>(namespace, (key) => {
      const card = cards.find((c) => c.id === key);
      return card ? legacyCardToModal(card) : null;
    });

  return (
    <PageSection
      divider="top"
      after={
        <MediaModal
          key={activeKey ?? "closed"}
          config={activeModal}
          onClose={close}
          initialPath={path}
          initialItemId={selection}
          onNavigate={setView}
        />
      }
    >
      <SectionHeading id={id} eyebrow={eyebrow} title={title} description={description} />

        {useAdaList ? (
          <MobileContentList
            showDecorativeMedia={showDecorativeMedia}
            items={cards.map((video) => ({
              id: video.id,
              title: video.title,
              date: video.date,
              graphic: {
                kind: "image" as const,
                src: cardThumbnailSrc(video),
                alt: "",
                mark: video.youtubeId ? ("play" as const) : undefined,
              },
              ariaLabel: `${video.ctaLabel ?? (video.youtubeId ? "Play video" : "Open")}: ${video.title}`,
              onClick: () => open(video.id, legacyCardToModal(video)),
            }))}
          />
        ) : (
          <CardGrid compactAtPhone={showDecorativeMedia}>
            {cards.map((video) => {
              const cta = video.ctaLabel ?? (video.youtubeId ? "Play video" : "Open");
              return (
                <Card
                  key={video.id}
                  title={video.title}
                  excerpt={video.excerpt}
                  date={video.date}
                  cta={cta}
                  cover={
                    showDecorativeMedia
                      ? {
                          kind: "video",
                          src: cardThumbnailSrc(video),
                          alt: `${video.title} thumbnail`,
                          play: Boolean(video.youtubeId),
                        }
                      : null
                  }
                  onClick={() => open(video.id, legacyCardToModal(video))}
                  ariaLabel={`${cta}: ${video.title}`}
                  trackId={video.id}
                  compactAtPhone={showDecorativeMedia}
                />
              );
            })}
          </CardGrid>
        )}
    </PageSection>
  );
}
