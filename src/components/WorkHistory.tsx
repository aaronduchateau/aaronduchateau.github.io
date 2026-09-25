"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { recordActivity } from "@/activity/tracker";
import {
  CareerTimelineExpandConfirmModal,
  CareerTimelineListModal,
} from "@/components/CareerTimelineListModal";
import { CareerTimeline, PageSection, SectionHeading } from "@/components/ui";
import { workHistory } from "@/data/content";
import {
  CAREER_TIMELINE_FOCUS_EVENT,
  type CareerTimelineFocusDetail,
} from "@/lib/careerTimelineFocus";
import { useTheme } from "@/theme/ThemeProvider";
import { printCareerTimelinePdf } from "@/lib/careerTimelinePdf";

const AUTO_ADVANCE_MS = 8000;

const timerControlClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-surface-900/60 text-accent-400/80 transition hover:border-accent-500/40 hover:bg-accent-950/40 hover:text-accent-300 disabled:cursor-not-allowed disabled:opacity-35";

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

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72a1 1 0 001.5.86l10.5-6.86a1 1 0 000-1.72L9.5 4.28A1 1 0 008 5.14z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
    </svg>
  );
}

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3H3v5M16 3h5v5M8 21H3v-5M21 16v5h-5" />
    </svg>
  );
}

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

export function WorkHistory() {
  const { playNavClick } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timerEpoch, setTimerEpoch] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [expandConfirmOpen, setExpandConfirmOpen] = useState(false);
  const [listModalOpen, setListModalOpen] = useState(false);

  const articleRef = useRef<HTMLElement>(null);

  const goTo = useCallback(
    (index: number, { pauseTimer = false }: { pauseTimer?: boolean } = {}) => {
      if (index === activeIndex || index < 0 || index >= workHistory.length) return;
      playNavClick();
      if (pauseTimer) {
        setTimerPaused(true);
      } else {
        setTimerPaused(false);
        setTimerEpoch((n) => n + 1);
      }
      setActiveIndex(index);
      const item = workHistory[index];
      if (item) {
        void recordActivity({
          type: "timeline.select",
          contentId: item.id,
          label: `${item.employer} · ${item.role}`,
          meta: { employer: item.employer, role: item.role, period: item.period },
        });
      }
    },
    [activeIndex, playNavClick],
  );

  const goNewer = () => {
    if (activeIndex === 0) return;
    goTo(activeIndex - 1, { pauseTimer: true });
  };
  const goOlder = () => {
    if (activeIndex === workHistory.length - 1) return;
    goTo(activeIndex + 1, { pauseTimer: true });
  };

  const handlePlay = useCallback(() => {
    playNavClick();
    setTimerPaused(false);
    setTimerEpoch((n) => n + 1);
  }, [playNavClick]);

  const handlePause = useCallback(() => {
    playNavClick();
    setTimerPaused(true);
    const item = workHistory[activeIndex];
    if (item) {
      void recordActivity({
        type: "timeline.pause",
        contentId: item.id,
        label: `Paused · ${item.employer}`,
        meta: { employer: item.employer, role: item.role },
      });
    }
  }, [playNavClick, activeIndex]);

  const openExpandConfirm = useCallback(() => {
    playNavClick();
    setTimerPaused(true);
    setExpandConfirmOpen(true);
  }, [playNavClick]);

  const confirmExpand = useCallback(() => {
    setExpandConfirmOpen(false);
    setListModalOpen(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const node = articleRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onFocus = (event: Event) => {
      const detail = (event as CustomEvent<CareerTimelineFocusDetail>).detail;
      if (!detail?.workHistoryId) return;
      const index = workHistory.findIndex((item) => item.id === detail.workHistoryId);
      if (index < 0) return;
      setActiveIndex(index);
      if (detail.pause !== false) {
        setTimerPaused(true);
      }
      const item = workHistory[index];
      if (item) {
        void recordActivity({
          type: "timeline.select",
          contentId: item.id,
          label: `${item.employer} · ${item.role}`,
          meta: {
            employer: item.employer,
            role: item.role,
            period: item.period,
            source: "hero-focus",
          },
        });
      }
    };
    window.addEventListener(CAREER_TIMELINE_FOCUS_EVENT, onFocus);
    return () => window.removeEventListener(CAREER_TIMELINE_FOCUS_EVENT, onFocus);
  }, []);

  const timerActive = !reducedMotion && !timerPaused && isInView;

  useEffect(() => {
    if (!timerActive) return;

    const id = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % workHistory.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearTimeout(id);
  }, [timerActive, activeIndex]);

  const openPrint = useCallback(() => {
    playNavClick();
    printCareerTimelinePdf();
  }, [playNavClick]);

  const navControls = (
    <>
      <button
        type="button"
        onClick={goNewer}
        disabled={activeIndex === 0}
        aria-label="Show newer role"
        className={`${timerControlClass} sm:hidden`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={goOlder}
        disabled={activeIndex === workHistory.length - 1}
        aria-label="Show older role"
        className={`${timerControlClass} sm:hidden`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      {!reducedMotion ? (
        <>
          <button
            type="button"
            onClick={handlePlay}
            aria-label="Play timeline auto-advance"
            className={timerControlClass}
          >
            <PlayIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handlePause}
            disabled={timerPaused}
            aria-label="Pause timeline auto-advance"
            className={timerControlClass}
          >
            <PauseIcon className="h-4 w-4" />
          </button>
        </>
      ) : null}
    </>
  );

  const exportControls = (
    <>
      <button
        type="button"
        onClick={openPrint}
        aria-label="Print career timeline"
        title="Print"
        className={timerControlClass}
      >
        <PrintIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={openExpandConfirm}
        aria-label="View full career timeline"
        title="View full timeline"
        className={timerControlClass}
      >
        <ExpandIcon className="h-4 w-4" />
      </button>
    </>
  );

  return (
    <PageSection
      after={
        <>
          <CareerTimelineExpandConfirmModal
            open={expandConfirmOpen}
            onCancel={() => setExpandConfirmOpen(false)}
            onConfirm={confirmExpand}
          />
          <CareerTimelineListModal
            open={listModalOpen}
            onClose={() => setListModalOpen(false)}
            items={workHistory}
          />
        </>
      }
    >
      <SectionHeading
        id="work"
        eyebrow="Work history"
        title="Career timeline"
        titleClassName="min-w-0 flex-1"
        description="A condensed snapshot of Aaron's progression across independent work, product teams, and startup environments."
        descriptionClassName="hidden sm:block"
        actions={
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            {navControls}
            {exportControls}
          </div>
        }
      />
      <div className="mt-3 flex w-full items-center justify-between gap-3 sm:hidden">
        <div className="flex items-center gap-2">{navControls}</div>
        <div className="flex items-center gap-2">{exportControls}</div>
      </div>

      <CareerTimeline
        ref={articleRef}
        className="mt-14"
        items={workHistory}
        activeIndex={activeIndex}
        timerPaused={timerPaused}
        timerActive={timerActive}
        timerEpoch={timerEpoch}
        reducedMotion={reducedMotion}
        onSelect={(index) => goTo(index)}
        onNewer={goNewer}
        onOlder={goOlder}
      />
    </PageSection>
  );
}
