"use client";

import { MediaModal } from "@/components/MediaModal";
import { FullScreenQuote } from "@/components/ui";
import {
  FRESCO_MODAL_KEY,
  FRESCO_MODAL_NAMESPACE,
  frescoQuote,
  frescoQuoteModal,
} from "@/data/content";
import { useRouteModal } from "@/lib/useRouteModal";
import { playBoundNavClick } from "@/theme/sounds";
import type { MediaModalConfig } from "@/types/media-modal";

/** Closing Fresco quote — opens a single-video MediaModal about his values. */
export function FrescoQuoteSection() {
  const { active, activeKey, path, selection, open, setView, close } =
    useRouteModal<MediaModalConfig>(FRESCO_MODAL_NAMESPACE, (key) =>
      key === FRESCO_MODAL_KEY ? frescoQuoteModal : null,
    );

  return (
    <>
      <FullScreenQuote
        id="full-screen-quote"
        quote={frescoQuote.text}
        attribution={frescoQuote.attribution}
        photo={frescoQuote.photoSrc}
        photoAlt={frescoQuote.photoAlt}
        activateLabel="Open Jacque Fresco values talk"
        onActivate={() => {
          playBoundNavClick();
          open(FRESCO_MODAL_KEY, frescoQuoteModal);
        }}
      />
      <MediaModal
        key={activeKey ?? "closed"}
        config={active}
        onClose={close}
        initialPath={path}
        initialItemId={selection}
        onNavigate={setView}
      />
    </>
  );
}
