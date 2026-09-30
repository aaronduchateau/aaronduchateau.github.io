"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MobileContentList } from "@/components/MobileContentList";
import { TestimonialPlaybackStage } from "@/components/TestimonialPlaybackStage";
import { TestimonialSpeechFooter } from "@/components/TestimonialSpeechFooter";
import { PageSection, SectionHeading, TestimonialCard } from "@/components/ui";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import {
  TESTIMONIALS_MODAL_NAMESPACE,
  testimonials,
} from "@/data/content";
import { useMobileOnlyViewport } from "@/hooks/useMediaQuery";
import { useTestimonialSpeech } from "@/hooks/useTestimonialSpeech";
import { useModalAccessibility } from "@/hooks/useModalAccessibility";
import { useModalLaunchClass } from "@/hooks/useModalLaunchClass";
import { MODAL_VIEWPORT_INNER } from "@/lib/modalLayout";
import { haltTestimonialPlayback } from "@/lib/testimonialPlaybackPreload";
import { useRouteModal } from "@/lib/useRouteModal";
import { testimonialFirstName } from "@/lib/testimonialIntro";
import { playBoundNavClick } from "@/theme/sounds";
import { useTheme } from "@/theme/ThemeProvider";

export type Testimonial = (typeof testimonials)[number];

const SWIPE_MIN_DX = 56;
const SWIPE_MAX_DY_RATIO = 0.75;

function testimonialParagraphs(quote: string) {
  return quote.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const navBtnClass =
  "theme-btn-shape grid h-9 w-9 shrink-0 place-items-center border border-white/15 text-accent-300 transition hover:bg-white/10 hover:text-accent-200 sm:h-12 sm:w-12";

function testimonialNavLabel(direction: "previous" | "next", playback: boolean) {
  if (playback) {
    return direction === "next"
      ? "Next testimonial and keep reading"
      : "Previous testimonial and keep reading";
  }
  return direction === "next" ? "Next testimonial" : "Previous testimonial";
}

function TestimonialLetterDialog({
  letter,
  titleId,
  onClose,
  onPrev,
  onNext,
  onTouchStart,
  onTouchEnd,
  speech,
  hideIdleQuote,
  onStartPlayback,
}: {
  letter: Testimonial;
  titleId: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
  speech: ReturnType<typeof useTestimonialSpeech>;
  /** Learn-more autoplay: keep letter text hidden until playback takes over. */
  hideIdleQuote: boolean;
  onStartPlayback: () => void;
}) {
  const karaoke = speech.status !== "idle";
  const showQuote = !karaoke && !hideIdleQuote;
  const canOfferListen = showQuote && speech.supported;
  const sentence = speech.sentences[speech.sentenceIndex] ?? speech.sentences[0] ?? null;

  return (
    <div
      className="relative z-10 flex min-h-0 min-w-0 flex-1 touch-pan-y flex-col py-1 sm:px-2 sm:py-2"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex shrink-0 items-start gap-2">
        <h3
          id={titleId}
          className="section-display-heading min-w-0 flex-1 text-xl leading-tight sm:text-2xl"
        >
          Testimonials
        </h3>
        <div className="flex shrink-0 items-center gap-1.5 sm:hidden">
          <button
            type="button"
            onClick={onPrev}
            className={navBtnClass}
            aria-label={testimonialNavLabel("previous", karaoke)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className={navBtnClass}
            aria-label={testimonialNavLabel("next", karaoke)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <ModalCloseButton onClick={onClose} ariaLabel="Close testimonials dialog" />
        </div>
      </div>

      <div className="relative mt-4 min-h-0 flex-1 sm:mt-5">
        <div
          className={`absolute inset-0 space-y-4 overflow-y-auto overscroll-contain pr-1 transition-opacity duration-300 ${
            showQuote ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={!showQuote}
        >
          {testimonialParagraphs(letter.quote).map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-surface-300">
              {paragraph}
            </p>
          ))}
          {canOfferListen ? (
            <p className="pt-5 text-sm leading-relaxed text-surface-300">
              <span aria-hidden>- </span>
              <button
                type="button"
                onClick={onStartPlayback}
                disabled={!speech.ready}
                className="text-accent-300 underline decoration-accent-300/50 underline-offset-2 transition hover:text-accent-200 hover:decoration-accent-200 disabled:cursor-wait disabled:opacity-60"
              >
                Sit back and relax while we play the rest of the testimonials for you
              </button>
            </p>
          ) : null}
        </div>
        {speech.supported ? (
          <div
            className={`absolute inset-0 ${
              karaoke ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={!karaoke}
          >
            <TestimonialPlaybackStage
              letterId={letter.id}
              photo={letter.photo}
              name={letter.name}
              title={letter.title}
              sentence={sentence}
              wordIndex={speech.wordIndex}
              phase={speech.phase}
              status={speech.status}
              onStop={speech.stop}
              onIntroComplete={speech.completeIntro}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TestimonialModalPanel({
  letter,
  titleId,
  onClose,
  onPrev,
  onNext,
  onTouchStart,
  onTouchEnd,
  onPlaybackComplete,
  autoPlay,
  onAutoPlayConsumed,
}: {
  letter: Testimonial;
  titleId: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
  onPlaybackComplete: () => void;
  autoPlay: boolean;
  onAutoPlayConsumed: () => void;
}) {
  const speech = useTestimonialSpeech(letter, { onPlaybackComplete });
  const playback = speech.status !== "idle";
  const autoPlayStartedRef = useRef(false);
  const { contentWindowOpenDurationMs } = useTheme();
  const { ready: speechReady, supported: speechSupported, status: speechStatus, toggle: speechToggle, stop: speechStop } =
    speech;

  const handleClose = useCallback(() => {
    speechStop();
    onClose();
  }, [onClose, speechStop]);

  useEffect(() => {
    autoPlayStartedRef.current = false;
  }, [letter.id]);

  /**
   * Deep-link / Learn more autoplay must wait until the modal-launch transform
   * finishes. Measuring the intro swoop during scale-in misaligns the portrait
   * with the coin slot (works after Back because the shell is already settled).
   */
  useEffect(() => {
    if (!autoPlay || autoPlayStartedRef.current) return;
    if (!speechReady || !speechSupported) return;
    if (speechStatus !== "idle") return;

    let cancelled = false;
    let raf1 = 0;
    let raf2 = 0;
    const launchMs = Math.max(0, contentWindowOpenDurationMs);

    const start = () => {
      if (cancelled || autoPlayStartedRef.current) return;
      autoPlayStartedRef.current = true;
      onAutoPlayConsumed();
      speechToggle();
    };

    const timer = window.setTimeout(() => {
      raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(start);
      });
    }, launchMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [
    autoPlay,
    contentWindowOpenDurationMs,
    onAutoPlayConsumed,
    speechReady,
    speechStatus,
    speechSupported,
    speechToggle,
  ]);

  return (
    <div className="theme-glass relative z-10 flex h-full min-h-0 w-full flex-col overflow-hidden shadow-2xl">
      <p className="sr-only" aria-live="polite">
        {playback
          ? speech.phase === "intro"
            ? `Introducing ${testimonialFirstName(letter.name)}, ${letter.title}`
            : `Reading ${testimonialFirstName(letter.name)}`
          : !speech.ready
            ? "Loading testimonial playback"
            : ""}
      </p>
      <div className="theme-recommendation-hint theme-decorative" aria-hidden>
        <Image
          src={letter.photo}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 640px) 80vw, 32rem"
        />
      </div>
      <div className="theme-modal-close-plate hidden sm:block">
        <ModalCloseButton onClick={handleClose} ariaLabel="Close testimonials dialog" />
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 items-stretch gap-0 px-4 pt-4 sm:gap-3 sm:px-6 sm:pt-6">
        <button
          type="button"
          onClick={onPrev}
          className={`${navBtnClass} relative z-10 my-auto hidden sm:grid`}
          aria-label={testimonialNavLabel("previous", playback)}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <TestimonialLetterDialog
          letter={letter}
          titleId={titleId}
          onClose={handleClose}
          onPrev={onPrev}
          onNext={onNext}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          speech={speech}
          hideIdleQuote={Boolean(autoPlay && speechSupported && speechStatus === "idle")}
          onStartPlayback={speechToggle}
        />

        <button
          type="button"
          onClick={onNext}
          className={`${navBtnClass} relative z-10 my-auto hidden sm:grid`}
          aria-label={testimonialNavLabel("next", playback)}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <TestimonialSpeechFooter
        name={letter.name}
        title={letter.title}
        photo={letter.photo}
        supported={speech.supported}
        ready={speech.ready}
        status={speech.status}
        phase={speech.phase}
        onToggle={speech.toggle}
      />
    </div>
  );
}

export function Testimonials() {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const mobileSwipeRef = useRef(false);

  const { visibility } = useTheme();
  const isMobile = useMobileOnlyViewport();
  const { active, activeKey, open, close, play, clearPlay } = useRouteModal<Testimonial>(
    TESTIMONIALS_MODAL_NAMESPACE,
    (key) => testimonials.find((t) => t.id === key) ?? null,
  );

  const closeTestimonials = useCallback(() => {
    haltTestimonialPlayback();
    close();
  }, [close]);

  const { className: launchClass, onAnimationEnd } = useModalLaunchClass({
    openKey: activeKey ? "open" : null,
  });

  useModalAccessibility(active !== null && mounted, dialogRef, closeTestimonials);

  const activeIndex = useMemo(() => {
    if (!activeKey) return -1;
    return testimonials.findIndex((t) => t.id === activeKey);
  }, [activeKey]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => {
      mobileSwipeRef.current = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const goRelative = useCallback(
    (delta: number) => {
      if (activeIndex < 0) return;
      const nextIndex = (activeIndex + delta + testimonials.length) % testimonials.length;
      const next = testimonials[nextIndex];
      open(next.id, next, { replace: true });
    },
    [activeIndex, open],
  );

  const onTouchStart = (event: React.TouchEvent) => {
    if (!mobileSwipeRef.current) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (!mobileSwipeRef.current) return;
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_DX) return;
    if (Math.abs(dy) > Math.abs(dx) * SWIPE_MAX_DY_RATIO) return;

    // Swipe left → next, swipe right → previous
    goRelative(dx < 0 ? 1 : -1);
  };

  return (
    <PageSection
      after={
        active && mounted
          ? createPortal(
            <div
              ref={dialogRef}
              className={`${launchClass} fixed inset-0 z-[120] flex h-dvh max-h-dvh flex-col bg-surface-950/80 backdrop-blur-sm`}
              onAnimationEnd={onAnimationEnd}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
            >
              <button
                type="button"
                className="absolute inset-0 cursor-default"
                aria-label="Close testimonials dialog"
                onClick={() => {
                  playBoundNavClick();
                  closeTestimonials();
                }}
              />
              <div className={`${MODAL_VIEWPORT_INNER} relative z-10 min-h-0 flex-1 py-3 sm:py-5`}>
              {/* Fixed viewport height so cycling testimonials does not resize the shell */}
              <TestimonialModalPanel
                letter={active}
                titleId={titleId}
                onClose={closeTestimonials}
                onPrev={() => goRelative(-1)}
                onNext={() => goRelative(1)}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                onPlaybackComplete={() => goRelative(1)}
                autoPlay={play}
                onAutoPlayConsumed={clearPlay}
              />
              </div>
            </div>,
            document.body,
          )
        : null
      }
    >
      <SectionHeading
        id="testimonials"
        eyebrow="Testimonials"
        title="What colleagues say"
        description="Some buddies from my professional network that gave me a thumbs up."
      />

      {isMobile ? (
        <MobileContentList
          showDecorativeMedia={visibility.decorativeCardMedia}
          items={testimonials.map((t) => ({
            id: t.id,
            title: t.name,
            graphic: {
              kind: "image" as const,
              src: t.photo,
              alt: "",
              shape: "circle",
              tone: "bw",
            },
            ariaLabel: `Read full testimonial from ${t.name}`,
            onClick: () => open(t.id, t),
          }))}
        />
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard
              key={t.id}
              name={t.name}
              title={t.title}
              quote={t.quote}
              photo={t.photo}
              onClick={() => open(t.id, t)}
            />
          ))}
        </div>
      )}
    </PageSection>
  );
}

