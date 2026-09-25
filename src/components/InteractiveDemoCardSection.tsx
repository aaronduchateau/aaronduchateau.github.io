"use client";

import { Card, CardGrid, PageSection, SectionHeading } from "@/components/ui";
import { InteractiveModal } from "@/components/InteractiveModal";
import { MobileContentList } from "@/components/MobileContentList";
import { useMobileOnlyViewport } from "@/hooks/useMediaQuery";
import { useRouteModal } from "@/lib/useRouteModal";
import { useTheme } from "@/theme/ThemeProvider";
import type { InteractiveModalConfig } from "@/types/interactive-modal";

export type InteractiveDemoCard = {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  modal: InteractiveModalConfig;
};

export type InteractiveDemoSectionConfig = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  cards: readonly InteractiveDemoCard[];
};

export function InteractiveDemoCardSection({
  id,
  eyebrow,
  title,
  description,
  cards,
}: InteractiveDemoSectionConfig) {
  const { visibility } = useTheme();
  const showDecorativeMedia = visibility.decorativeCardMedia;
  const isMobile = useMobileOnlyViewport();
  const useAdaList = isMobile && !showDecorativeMedia;
  const { active, activeKey, open, close } = useRouteModal<InteractiveModalConfig>(
    "demos",
    (key) => cards.find((c) => c.id === key)?.modal ?? null,
  );

  return (
    <PageSection
      divider="top"
      after={<InteractiveModal key={activeKey ?? "closed"} config={active} onClose={close} />}
    >
      <SectionHeading id={id} eyebrow={eyebrow} title={title} description={description} />

      {useAdaList ? (
        <MobileContentList
          showDecorativeMedia={showDecorativeMedia}
          items={cards.map((card) => ({
            id: card.id,
            title: card.title,
            date: card.date,
            graphic: { kind: "demo" as const },
            ariaLabel: `Open demo: ${card.title}`,
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
              cta="Open demo"
              cover={showDecorativeMedia ? { kind: "demo" } : null}
              onClick={() => open(card.id, card.modal)}
              ariaLabel={`Open demo: ${card.title}`}
              trackId={card.id}
              compactAtPhone={showDecorativeMedia}
            />
          ))}
        </CardGrid>
      )}
    </PageSection>
  );
}
