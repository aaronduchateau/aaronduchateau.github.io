import type { ReactNode } from "react";

/**
 * Scrollport for every catalog iframe story.
 * The embed document locks html/body overflow so the outer library modal
 * does not rubber-band; this inner region is the only place tall stories
 * (icons grid, quiz, cards) can scroll when they exceed the frame.
 */
export function LibraryPreviewCanvas({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-0 min-w-0 w-full flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
      {children}
    </div>
  );
}
