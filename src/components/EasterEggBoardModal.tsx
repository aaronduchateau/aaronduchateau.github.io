"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useActivity } from "@/activity/ActivityProvider";
import { resolveIntroSideQuests } from "@/activity/resolveIntroSideQuests";
import { EasterEggBoardIntro } from "@/components/EasterEggBoardIntro";
import { EasterEggBoardPanel, EasterEggBoardScore } from "@/components/EasterEggBoardPanel";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import { ModalFrame } from "@/components/ui";
import { useModalAccessibility } from "@/hooks/useModalAccessibility";
import {
  EASTER_EGG_BOARD_KEY,
  EASTER_EGG_BOARD_NAMESPACE,
  THEME_PLAYGROUND_KEY,
  THEME_PLAYGROUND_NAMESPACE,
  markThemePickerReturnToBoard,
} from "@/lib/easterEggBoardRoute";
import { MODAL_TOPBAR_PAD_X } from "@/lib/modalLayout";
import { navigateToRouteModal, useRouteModal } from "@/lib/useRouteModal";

type EasterEggBoardModalProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Main-site overlay for the easter-egg / score-tier board.
 * Conventional bordered max-width shell (ModalFrame `board`) — not the
 * edge-bleed interactive demo chrome.
 */
export function EasterEggBoardModal({ open, onClose }: EasterEggBoardModalProps) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const { store } = useActivity();
  const quests = useMemo(() => resolveIntroSideQuests(store), [store]);
  const score = store.totalScore;

  useEffect(() => {
    if (!open) setEntered(false);
  }, [open]);

  useModalAccessibility(open, dialogRef, onClose);

  return (
    <ModalFrame
      open={open}
      onClose={onClose}
      chrome="board"
      labelledBy={titleId}
      describedBy={descId}
      dialogRef={dialogRef}
    >
      {!entered ? (
        <EasterEggBoardIntro
          titleId={titleId}
          descriptionId={descId}
          onBack={onClose}
          onContinue={() => setEntered(true)}
          onEnterThemeGame={() => {
            markThemePickerReturnToBoard();
            navigateToRouteModal(THEME_PLAYGROUND_NAMESPACE, THEME_PLAYGROUND_KEY);
          }}
        />
      ) : (
        <>
          <header
            className={`theme-quest-board-header flex h-14 shrink-0 items-center gap-3 border-b border-white/10 ${MODAL_TOPBAR_PAD_X}`}
          >
            <ModalCloseButton onClick={onClose} />
            <h2
              id={titleId}
              className="modal-display-heading min-w-0 flex-1 text-xl text-white sm:text-2xl"
            >
              <span className="modal-display-heading__text">Easter egg board</span>
            </h2>
            <EasterEggBoardScore score={score} id={descId} />
          </header>

          <div className="theme-quest-board-shell">
            <EasterEggBoardPanel quests={quests} columns="two" />
          </div>
        </>
      )}
    </ModalFrame>
  );
}

/** Single URL-backed host — chest, Options, and locked-theme picks all share `?modal=easter-eggs:board`. */
export function EasterEggBoardHost() {
  const { active, close } = useRouteModal(EASTER_EGG_BOARD_NAMESPACE, (key) =>
    key === EASTER_EGG_BOARD_KEY ? true : null,
  );
  return <EasterEggBoardModal open={active === true} onClose={close} />;
}
