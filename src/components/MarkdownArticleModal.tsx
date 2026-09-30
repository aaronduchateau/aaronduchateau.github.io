"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import { useModalAccessibility } from "@/hooks/useModalAccessibility";
import { SimpleMarkdown } from "@/lib/simpleMarkdown";
import { MODAL_VIEWPORT_INNER } from "@/lib/modalLayout";
import { playBoundNavClick } from "@/theme/sounds";
import type { MarkdownArticleModalConfig } from "@/types/markdown-article";

type Props = {
  config: MarkdownArticleModalConfig | null;
  onClose: () => void;
};

/**
 * Text-first modal (no video column): short intro + scrollable markdown body.
 * Shell height matches other portfolio modals; body scrolls independently.
 */
export function MarkdownArticleModal({ config, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useModalAccessibility(Boolean(config) && mounted, dialogRef, onClose);

  useEffect(() => setMounted(true), []);

  if (!config || !mounted) return null;

  const handleClose = () => {
    playBoundNavClick();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] flex flex-col bg-black/70">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="markdown-article-modal-title"
        tabIndex={-1}
        className="relative flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-surface-950"
      >
        <div className={MODAL_VIEWPORT_INNER}>
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10">
            <ModalCloseButton onClick={handleClose} />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-300/80">
              {config.date}
            </p>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-5 sm:py-6">
            <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-surface-500">
              {config.contextLabel}
            </p>
            <h2
              id="markdown-article-modal-title"
              className="modal-display-heading mt-2 shrink-0 text-xl sm:text-2xl"
            >
              <span className="modal-display-heading__text">{config.title}</span>
            </h2>
            <p className="mt-3 shrink-0 text-sm leading-relaxed text-surface-300">{config.intro}</p>
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-white/10 pt-4 pr-1">
              <SimpleMarkdown source={config.markdown} />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
