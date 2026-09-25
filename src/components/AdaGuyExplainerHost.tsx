"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import { Button, ModalFrame } from "@/components/ui";
import { adaGuyThemeNote } from "@/data/content";
import { useModalAccessibility } from "@/hooks/useModalAccessibility";
import { ADA_GUY_EXPLAINER_EVENT } from "@/lib/adaGuyExplainer";
import { playBoundNavClick } from "@/theme/sounds";

/**
 * Listens for a top-level ADA Guy theme pick and shows the simple note modal.
 * Content lives in `adaGuyThemeNote` — this is only the view.
 */
export function AdaGuyExplainerHost() {
  const note = adaGuyThemeNote;
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onRequest = () => setOpen(true);
    window.addEventListener(ADA_GUY_EXPLAINER_EVENT, onRequest);
    return () => window.removeEventListener(ADA_GUY_EXPLAINER_EVENT, onRequest);
  }, []);

  const close = () => {
    playBoundNavClick();
    setOpen(false);
  };

  useModalAccessibility(open, dialogRef, close);

  return (
    <ModalFrame
      open={open}
      onClose={close}
      chrome="note"
      labelledBy={titleId}
      describedBy={descId}
      dialogRef={dialogRef}
    >
      <div className="absolute right-3 top-3">
        <ModalCloseButton onClick={close} size="sm" />
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-300/80">
        {note.eyebrow}
      </p>
      <h2 id={titleId} className="modal-display-heading mt-2 pr-10 text-xl sm:text-2xl">
        <span className="modal-display-heading__text">{note.title}</span>
      </h2>
      <p id={descId} className="mt-4 text-sm leading-relaxed text-surface-200">
        {note.intro}
      </p>
      <p className="theme-muted mt-4 text-sm leading-relaxed">{note.intent}</p>

      <h3 className="theme-muffin-ada-title mt-6">{note.featuredHeading}</h3>
      <p className="mt-3 text-sm leading-relaxed text-surface-300">{note.featuredBody}</p>

      <blockquote className="theme-ada-note-quote">{note.quote}</blockquote>

      <div className="mt-6 flex justify-end">
        <Button role="primary" size="sm" onClick={close}>
          Got it
        </Button>
      </div>
    </ModalFrame>
  );
}
