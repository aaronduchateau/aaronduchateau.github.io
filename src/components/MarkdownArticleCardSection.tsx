"use client";

import { MarkdownArticleModal } from "@/components/MarkdownArticleModal";
import { Card, CardGrid, PageSection, SectionHeading } from "@/components/ui";
import { MobileContentList } from "@/components/MobileContentList";
import { useMobileOnlyViewport } from "@/hooks/useMediaQuery";
import { useRouteModal } from "@/lib/useRouteModal";
import { useTheme } from "@/theme/ThemeProvider";
import type { MarkdownArticleSectionConfig } from "@/types/markdown-article";

export function MarkdownArticleCardSection({
  id,
  eyebrow,
  title,
  description,
  cards,
}: MarkdownArticleSectionConfig) {
  const { visibility } = useTheme();
  const showDecorativeMedia = visibility.decorativeCardMedia;
  const isMobile = useMobileOnlyViewport();
  const useAdaList = isMobile && !showDecorativeMedia;
  const { active, activeKey, open, close } = useRouteModal(
    id ? `md-${id}` : "md-article",
    (key) => cards.find((c) => c.id === key)?.modal ?? null,
  );

  return (
    <PageSection
      divider="top"
      after={<MarkdownArticleModal key={activeKey ?? "closed"} config={active} onClose={close} />}
    >
      <SectionHeading id={id} eyebrow={eyebrow} title={title} description={description} />

        {useAdaList ? (
          <MobileContentList
            showDecorativeMedia={showDecorativeMedia}
            items={cards.map((card) => ({
              id: card.id,
              title: card.title,
              date: card.date,
              graphic: { kind: "article" as const },
              ariaLabel: `Open: ${card.title}`,
              onClick: () => open(card.id, card.modal),
            }))}
          />
        ) : (
          <CardGrid compactAtPhone={showDecorativeMedia}>
            {cards.map((card) => (
              <Card
                key={card.id}
                title={card.title}
                excerpt={card.excerpt}
                date={card.date}
                cta="Read article"
                cover={showDecorativeMedia ? { kind: "article" } : null}
                onClick={() => open(card.id, card.modal)}
                ariaLabel={`Open: ${card.title}`}
                trackId={card.id}
                compactAtPhone={showDecorativeMedia}
              />
            ))}
          </CardGrid>
        )}
    </PageSection>
  );
}
