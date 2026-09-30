"use client";

import { useId, useRef } from "react";
import { EmployerMark } from "@/components/EmployerMark";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import { Button, ModalFrame, type CareerTimelineItem } from "@/components/ui";
import { useModalAccessibility } from "@/hooks/useModalAccessibility";
import {
  downloadCareerTimelinePdf,
  printCareerTimelinePdf,
} from "@/lib/careerTimelinePdf";
import { playBoundNavClick } from "@/theme/sounds";

function PrintIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 9V4h12v5M6 14H4a1 1 0 01-1-1v-3a2 2 0 012-2h14a2 2 0 012 2v3a1 1 0 01-1 1h-2M6 14h12v6H6v-6z"
      />
    </svg>
  );
}

function PdfIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V9l-5-6z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v6h6M9 13h6M9 17h4" />
    </svg>
  );
}

export function CareerTimelineExpandConfirmModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalAccessibility(open, dialogRef, onCancel);

  return (
    <ModalFrame
      open={open}
      onClose={onCancel}
      chrome="confirm"
      role="alertdialog"
      labelledBy={titleId}
      describedBy={descId}
      dialogRef={dialogRef}
    >
      <div className="absolute right-3 top-3">
        <ModalCloseButton onClick={onCancel} size="sm" />
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-300/80">
        Career timeline
      </p>
      <h2 id={titleId} className="modal-display-heading mt-2 pr-10 text-xl sm:text-2xl">
        <span className="modal-display-heading__text">View full timeline?</span>
      </h2>
      <p id={descId} className="mt-3 text-sm leading-relaxed text-surface-300">
        Normally a confirmation modal like this would be unnecessary for opening a list—but
        it&rsquo;s my portfolio, so let&rsquo;s toss one in for funzies. You&rsquo;ll get a scrollable vertical
        view of every role with the same employers, dates, and summaries as the timeline.
      </p>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button
          role="ghost"
          size="sm"
          onClick={() => {
            playBoundNavClick();
            onCancel();
          }}
        >
          Not now
        </Button>
        <Button
          role="primary"
          size="sm"
          onClick={() => {
            playBoundNavClick();
            onConfirm();
          }}
        >
          Open timeline
        </Button>
      </div>
    </ModalFrame>
  );
}

export function CareerTimelineListModal({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: readonly CareerTimelineItem[];
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalAccessibility(open, dialogRef, onClose);

  return (
    <ModalFrame
      open={open}
      onClose={onClose}
      chrome="list"
      labelledBy={titleId}
      dialogRef={dialogRef}
    >
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 py-4">
        <div className="min-w-0 flex-1 pr-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-300/80">
            Work history
          </p>
          <h2 id={titleId} className="modal-display-heading mt-1 text-xl sm:text-2xl">
            <span className="modal-display-heading__text">Career timeline</span>
          </h2>
          <p className="mt-1 text-sm text-surface-400">
            Full path in order—newest roles first.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            data-track-ignore=""
            aria-label="Print career timeline PDF"
            title="Print"
            onClick={() => {
              playBoundNavClick();
              printCareerTimelinePdf();
            }}
            className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-surface-300 transition hover:border-accent-500/40 hover:text-white"
          >
            <PrintIcon className="h-4 w-4" />
          </button>
          <ModalCloseButton onClick={onClose} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-5">
        <ol className="relative space-y-0">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.id} className="relative flex gap-4 pb-8 last:pb-2 sm:gap-5">
                {!isLast ? (
                  <span
                    className="absolute left-6 top-14 bottom-0 w-px bg-white/10 sm:left-7"
                    aria-hidden
                  />
                ) : null}
                <div className="relative z-[1] shrink-0">
                  <EmployerMark mark={item.mark} size="sm" />
                </div>
                <div className="min-w-0 flex-1 border-b border-white/10 pb-8">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="theme-heading-ink font-display text-lg font-semibold sm:text-xl">
                      {item.role}
                    </h3>
                    <span className="font-mono text-xs text-surface-500">{item.period}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-accent-200/90">{item.employer}</p>
                  <p className="mt-2 text-sm leading-relaxed text-surface-400">{item.summary}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-2 rounded-xl border border-white/10 bg-surface-950/40 px-4 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-surface-500">
            Export
          </p>
          <p className="mt-1 text-sm text-surface-400">
            Clean black-and-white PDF from this timeline—generated in your browser.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              role="ghost"
              size="sm"
              trackIgnore
              className="gap-1.5"
              onClick={() => {
                playBoundNavClick();
                printCareerTimelinePdf();
              }}
            >
              <PrintIcon className="h-3.5 w-3.5" />
              Print
            </Button>
            <Button
              role="primary"
              size="sm"
              trackIgnore
              className="gap-1.5"
              onClick={() => {
                playBoundNavClick();
                downloadCareerTimelinePdf();
              }}
            >
              <PdfIcon className="h-3.5 w-3.5" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </ModalFrame>
  );
}
