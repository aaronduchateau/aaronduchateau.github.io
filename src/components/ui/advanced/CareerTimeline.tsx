"use client";

import { forwardRef, useCallback, useEffect, useRef } from "react";
import { EmployerMark } from "@/components/EmployerMark";
import { usePhoneHorizontalSwipe } from "@/hooks/usePhoneHorizontalSwipe";

export type CareerTimelineMark = {
  initials: string;
  from: string;
  to: string;
};

export type CareerTimelineItem = {
  id: string;
  role: string;
  employer: string;
  period: string;
  summary: string;
  mark: CareerTimelineMark;
};

export type CareerTimelineProps = {
  items: readonly CareerTimelineItem[];
  activeIndex: number;
  timerPaused: boolean;
  timerActive: boolean;
  timerEpoch: number;
  reducedMotion: boolean;
  onSelect: (index: number) => void;
  onNewer: () => void;
  onOlder: () => void;
  className?: string;
};

function getStartYear(period: string) {
  const match = period.match(/\b(19|20)\d{2}\b/);
  return match?.[0] ?? period;
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  );
}

/**
 * Career timeline plate — dots, paddles, and the active role.
 * Parent owns the roster lookup, auto-advance, and activity.
 */
export const CareerTimeline = forwardRef<HTMLElement, CareerTimelineProps>(
  function CareerTimeline(
    {
      items,
      activeIndex,
      timerPaused,
      timerActive,
      timerEpoch,
      reducedMotion,
      onSelect,
      onNewer,
      onOlder,
      className,
    },
    ref,
  ) {
    const timelineScrollRef = useRef<HTMLDivElement>(null);
    const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const activeItem = items[activeIndex] ?? items[0];

    // Swipe left → older; swipe right → newer (same axis as the hidden phone paddles).
    const { onTouchStart: onDetailTouchStart, onTouchEnd: onDetailTouchEnd } =
      usePhoneHorizontalSwipe({
        enabled: items.length > 1,
        onSwipeLeft: () => {
          if (activeIndex < items.length - 1) onOlder();
        },
        onSwipeRight: () => {
          if (activeIndex > 0) onNewer();
        },
      });

    const scrollTimelineToActive = useCallback(
      (index: number) => {
        const container = timelineScrollRef.current;
        const dot = dotRefs.current[index];
        if (!container || !dot) return;

        const containerRect = container.getBoundingClientRect();
        const dotRect = dot.getBoundingClientRect();
        const dotCenter = dotRect.left + dotRect.width / 2;
        const containerCenter = containerRect.left + containerRect.width / 2;
        const delta = dotCenter - containerCenter;
        const maxScroll = container.scrollWidth - container.clientWidth;

        container.scrollTo({
          left: Math.max(0, Math.min(container.scrollLeft + delta, maxScroll)),
          behavior: reducedMotion ? "auto" : "smooth",
        });
      },
      [reducedMotion],
    );

    useEffect(() => {
      scrollTimelineToActive(activeIndex);
    }, [activeIndex, scrollTimelineToActive]);

    useEffect(() => {
      const container = timelineScrollRef.current;
      if (!container) return;
      const onResize = () => scrollTimelineToActive(activeIndex);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, [activeIndex, scrollTimelineToActive]);

    const progressBarClass = (() => {
      if (reducedMotion) return "w-full";
      if (timerActive) return "w-full animate-careerTimerShrink";
      if (timerPaused) return "w-full";
      return "w-0";
    })();

    const dividerOpacityClass = timerPaused && !reducedMotion ? "opacity-50" : "opacity-100";

    if (!activeItem) return null;

    return (
      <article
        ref={ref}
        className={`group relative overflow-hidden theme-radius-card theme-hairline border bg-surface-900/50 ${className ?? ""}`.trim()}
      >
        <div
          className="theme-decorative pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl transition group-hover:opacity-60"
          style={{ background: "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--accent-400)))" }}
        />

        <div className="relative flex h-[21rem] min-h-[21rem] max-h-[21rem] sm:h-[18rem] sm:min-h-[18rem] sm:max-h-[18rem] md:h-[17rem] md:min-h-[17rem] md:max-h-[17rem] lg:h-[15.5rem] lg:min-h-[15.5rem] lg:max-h-[15.5rem] xl:h-[15rem] xl:min-h-[15rem] xl:max-h-[15rem]">
          <button
            type="button"
            onClick={onNewer}
            disabled={activeIndex === 0}
            aria-label="Show newer role"
            className="group/paddle hidden shrink-0 items-center justify-center self-stretch border-r border-white/10 bg-surface-900/50 px-3 transition hover:bg-accent-500/10 disabled:cursor-not-allowed disabled:opacity-35 sm:flex sm:px-4 lg:w-20 xl:w-24"
          >
            <ChevronLeft className="h-10 w-10 text-accent-400/80 transition group-hover/paddle:-translate-x-0.5 group-hover/paddle:text-accent-300 sm:h-12 sm:w-12 lg:h-16 lg:w-16" />
          </button>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div
              ref={timelineScrollRef}
              className="scrollbar-none shrink-0 overflow-x-auto overscroll-x-contain"
            >
              <div className="relative min-w-max px-6 pb-2 pt-5 sm:px-8 sm:pt-4">
                <div className="relative flex items-start gap-5">
                  {items.map((item, index) => {
                    const isActive = index === activeIndex;
                    const isPast = index < activeIndex;

                    return (
                      <button
                        type="button"
                        key={item.id}
                        ref={(el) => {
                          dotRefs.current[index] = el;
                        }}
                        onClick={() => onSelect(index)}
                        className="group/dot flex min-w-[120px] flex-col items-center text-center"
                        aria-pressed={isActive}
                        aria-label={`${item.employer}: ${item.role}`}
                      >
                        <span
                          className={`theme-career-dot h-3 w-3 rounded-full border-2 transition ${
                            isActive || isPast
                              ? "theme-career-dot--on border-accent-400 bg-surface-950 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                              : "theme-career-dot--off border-white/30 bg-surface-950"
                          }`}
                        />
                        <span
                          className={`mt-3 text-xs font-medium transition ${
                            isActive ? "text-accent-200" : "text-surface-400 group-hover/dot:text-surface-300"
                          }`}
                        >
                          {item.employer}
                        </span>
                        <span className="mt-1 font-mono text-[11px] text-surface-500">
                          {getStartYear(item.period)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              className={`relative h-px w-full shrink-0 bg-white/10 transition-opacity duration-300 ${dividerOpacityClass}`}
              aria-hidden
            >
              <div
                key={`${activeIndex}-${timerEpoch}`}
                className={`absolute inset-y-0 left-0 origin-left bg-accent-400 ${progressBarClass}`}
              />
            </div>

            <div
              className="scrollbar-none flex min-h-0 flex-1 touch-pan-y flex-col overflow-y-auto px-6 pb-3 pt-3 sm:px-8 sm:pb-4"
              onTouchStart={onDetailTouchStart}
              onTouchEnd={onDetailTouchEnd}
            >
              <div className="flex min-h-[10rem] flex-1 flex-col sm:min-h-[9rem] md:min-h-[8rem] lg:min-h-[7rem] lg:flex-row lg:items-start lg:gap-6 xl:min-h-[6.5rem]">
                <EmployerMark mark={activeItem.mark} className="hidden lg:flex" />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="theme-heading-ink font-display text-xl font-semibold">{activeItem.role}</h3>
                    <span className="font-mono text-xs text-surface-500">{activeItem.period}</span>
                  </div>
                  <p className="text-sm font-medium text-accent-200/90">{activeItem.employer}</p>
                  <p className="text-sm leading-relaxed text-surface-400">{activeItem.summary}</p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOlder}
            disabled={activeIndex >= items.length - 1}
            aria-label="Show older role"
            className="group/paddle hidden shrink-0 items-center justify-center self-stretch border-l border-white/10 bg-surface-900/50 px-3 transition hover:bg-accent-500/10 disabled:cursor-not-allowed disabled:opacity-35 sm:flex sm:px-4 lg:w-20 xl:w-24"
          >
            <ChevronRight className="h-10 w-10 text-accent-400/80 transition group-hover/paddle:translate-x-0.5 group-hover/paddle:text-accent-300 sm:h-12 sm:w-12 lg:h-16 lg:w-16" />
          </button>
        </div>
      </article>
    );
  },
);
