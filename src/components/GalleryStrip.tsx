"use client";

import Image from "next/image";
import { MediaModal } from "@/components/MediaModal";
import { PageSection, SectionHeading } from "@/components/ui";
import { MobileContentList } from "@/components/MobileContentList";
import { trackAttrs } from "@/activity/trackAttrs";
import { funThingsSection } from "@/data/content";
import { useMobileOnlyViewport } from "@/hooks/useMediaQuery";
import { useRouteModal } from "@/lib/useRouteModal";
import { useTheme } from "@/theme/ThemeProvider";
import type { MediaModalConfig } from "@/types/media-modal";

function funCardModal(cardId: string): MediaModalConfig | null {
  const card = funThingsSection.cards.find((c) => c.id === cardId);
  return card ? { ...card.modal, media: [...card.modal.media] } : null;
}

export function GalleryStrip() {
  const { visibility } = useTheme();
  const showPhotos = visibility.decorativeCardMedia;
  const isMobile = useMobileOnlyViewport();
  const { active: activeModal, activeKey, path, selection, open, setView, close } =
    useRouteModal<MediaModalConfig>("fun", funCardModal);

  return (
    <PageSection
      padding="md"
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
      <div className="mb-8">
          <SectionHeading
            id="human-things"
            eyebrow={funThingsSection.eyebrow}
            title={funThingsSection.title}
            description={funThingsSection.description}
            size="md"
            descriptionClassName="text-sm"
          />
        </div>
        {isMobile ? (
          <MobileContentList
            showDecorativeMedia={showPhotos}
            items={funThingsSection.cards.map((card) => ({
              id: card.id,
              title: card.title,
              date: card.modal.date,
              graphic: { kind: "image" as const, src: card.imageSrc, alt: "" },
              ariaLabel: card.title,
              onClick: () => open(card.id, { ...card.modal, media: [...card.modal.media] }),
            }))}
          />
        ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {funThingsSection.cards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => open(card.id, { ...card.modal, media: [...card.modal.media] })}
              className="group text-left"
              aria-label={card.title}
              {...trackAttrs(card.id)}
            >
              <div className="relative aspect-square overflow-hidden theme-radius-media theme-hairline border bg-surface-900">
                {showPhotos ? (
                  <>
                    <Image
                      src={card.imageSrc}
                      alt=""
                      fill
                      className="theme-gallery-photo object-cover transition duration-500 ease-out group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100"
                      sizes="(max-width: 640px) 50vw, 16vw"
                    />
                    <div className="theme-gallery-photo-tint" aria-hidden />
                    <div className="theme-gallery-photo-dim" aria-hidden />
                    <div className="theme-gallery-photo-title" aria-hidden>
                      <span className="text-center text-sm font-semibold leading-snug tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] sm:text-base">
                        {card.title}
                      </span>
                    </div>
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-surface-950 px-3">
                    <span className="text-center text-sm font-semibold leading-snug tracking-tight text-white sm:text-base">
                      {card.title}
                    </span>
                  </div>
                )}
              </div>
              {/* Keep in flow; fade only so hover never shifts layout */}
              <p
                className={`mt-2 truncate text-xs font-medium text-surface-300 sm:text-sm ${
                  showPhotos
                    ? "opacity-100 transition-opacity duration-300 ease-out group-hover:opacity-0 group-focus-visible:opacity-0 motion-reduce:duration-0"
                    : "opacity-100"
                }`}
              >
                {card.title}
              </p>
            </button>
          ))}
        </div>
        )}
    </PageSection>
  );
}
