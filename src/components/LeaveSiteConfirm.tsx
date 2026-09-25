"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui";

export const LEAVE_SITE_PROMPT = "Are we sure we are Leaving?";

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  );
}

function CloseX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l10 10M17 7 7 17" />
    </svg>
  );
}

/** Pretty host + path for the leave-confirm subtitle. */
export function displayExternalUrl(href: string): string {
  try {
    const url = new URL(href);
    const path = url.pathname === "/" ? "" : url.pathname;
    return `${url.host}${path}${url.search}`;
  } catch {
    return href;
  }
}

export function LeaveSiteArmingPaddle({
  armed,
  label,
  onToggle,
}: {
  armed: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={armed}
      aria-label={armed ? `Cancel visit ${label}` : `Prepare to visit ${label}`}
      className="group/chevron flex min-h-[3.5rem] shrink-0 items-center justify-center self-stretch border-t border-white/10 bg-surface-900/50 px-5 py-4 transition hover:bg-accent-500/10 sm:min-h-0 sm:border-l sm:border-t-0 sm:px-6 lg:w-20 xl:w-24"
      data-track-ignore=""
    >
      {armed ? (
        <CloseX className="h-12 w-12 text-accent-400/80 transition group-hover/chevron:rotate-90 group-hover/chevron:text-accent-300 sm:h-14 sm:w-14 lg:h-16 lg:w-16" />
      ) : (
        <ChevronRight className="h-12 w-12 text-accent-400/80 transition group-hover/chevron:translate-y-0.5 group-hover/chevron:text-accent-300 sm:h-14 sm:w-14 sm:group-hover/chevron:translate-x-0.5 sm:group-hover/chevron:translate-y-0 lg:h-16 lg:w-16" />
      )}
    </button>
  );
}

export function LeaveSiteConfirmStack({
  title,
  subtitle,
  href,
  visitLabel = "Visit Site",
  onVisit,
  armed = true,
}: {
  title: string;
  subtitle: string;
  href: string;
  visitLabel?: string;
  onVisit?: () => void;
  armed?: boolean;
}) {
  return (
    <div className="flex w-full max-w-xs flex-col items-center justify-center gap-2.5 text-center sm:gap-3">
      <div
        className={`min-w-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          armed ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
        }`}
      >
        <p className="font-display text-base font-semibold text-white sm:text-lg">{title}</p>
        <p className="mt-0.5 break-all text-[11px] text-surface-400">{subtitle}</p>
      </div>

      <div
        className={`flex shrink-0 justify-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          armed ? "translate-y-0 scale-100 opacity-100 delay-100" : "translate-y-6 scale-95 opacity-0"
        }`}
      >
        <Button
          role="primary"
          size="lg"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={armed ? 0 : -1}
          aria-label={`${visitLabel}: ${title}`}
          trackIgnore
          onClick={(event) => {
            event.stopPropagation();
            onVisit?.();
          }}
        >
          {visitLabel}
        </Button>
      </div>

      <p
        className={`max-w-[16rem] text-balance font-display text-base font-semibold leading-snug tracking-tight text-accent-300 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:max-w-none sm:text-xl ${
          armed ? "translate-y-0 opacity-100 delay-150" : "translate-y-8 opacity-0"
        }`}
      >
        {LEAVE_SITE_PROMPT}
      </p>
    </div>
  );
}

type LeaveSiteConfirmProps = {
  title: string;
  subtitle: string;
  href: string;
  paddleLabel: string;
  visitLabel?: string;
  onVisit?: () => void;
  onTogglePhase: () => void;
  /**
   * 1 = rest body + chevron. 2 = confirm stack + cancel X.
   * YouTube / external watch starts at 2.
   */
  phase: 1 | 2;
  /** Phase-1 body (major-project card). Ignored when phase is 2. */
  children?: ReactNode;
  visitLabelId?: string;
  className?: string;
};

/**
 * Shared leave-site confirm: phase 1 is the source surface + chevron;
 * phase 2 is title, URL, Visit Site, and the leaving prompt, with both
 * the host close control and this paddle X.
 */
export function LeaveSiteConfirm({
  title,
  subtitle,
  href,
  paddleLabel,
  visitLabel,
  onVisit,
  onTogglePhase,
  phase,
  children,
  visitLabelId,
  className = "",
}: LeaveSiteConfirmProps) {
  const armed = phase === 2;

  return (
    <div className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden sm:flex-row ${className}`}>
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children ? (
          <div
            className={`flex h-full min-h-0 flex-1 flex-col ${
              armed ? "pointer-events-none absolute inset-0 opacity-0" : "relative opacity-100"
            }`}
            aria-hidden={armed || undefined}
          >
            {children}
          </div>
        ) : null}
        <div
          className={`flex min-h-0 flex-1 items-center justify-center px-4 py-4 sm:px-6 ${
            armed ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
          }`}
          aria-hidden={!armed}
        >
          <LeaveSiteConfirmStack
            title={title}
            subtitle={subtitle}
            href={href}
            visitLabel={visitLabel}
            onVisit={onVisit}
            armed={armed}
          />
        </div>
      </div>
      {visitLabelId ? (
        <span id={visitLabelId} className="sr-only">
          {armed ? "Visit Site button is available. Press Escape or the close control to cancel." : ""}
        </span>
      ) : null}
      <LeaveSiteArmingPaddle armed={armed} label={paddleLabel} onToggle={onTogglePhase} />
    </div>
  );
}
