"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { CloseIcon } from "@/components/ui/simple/icons";
import { useTestimonialIntroMedia } from "@/hooks/useTestimonialIntroMedia";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { TestimonialSpeechPhase, TestimonialSpeechStatus } from "@/hooks/useTestimonialSpeech";
import { testimonialFirstName } from "@/lib/testimonialIntro";
import type { TranscriptSentence } from "@/lib/testimonialTranscript";
import { TESTIMONIAL_INTRO_BOUNCE } from "@/theme/sounds";

type Props = {
  letterId: string;
  photo: string;
  name: string;
  title: string;
  sentence: TranscriptSentence | null;
  wordIndex: number;
  phase: TestimonialSpeechPhase;
  status: TestimonialSpeechStatus;
  onStop: () => void;
  onIntroComplete: (letterId: string) => void;
};

const stopBtnClass =
  "theme-btn-shape mx-auto grid h-12 w-12 shrink-0 place-items-center border border-white/15 text-accent-300 transition hover:bg-white/10 hover:text-accent-200";

export function TestimonialPlaybackStage({
  letterId,
  photo,
  name,
  title,
  sentence,
  wordIndex,
  phase,
  status,
  onStop,
  onIntroComplete,
}: Props) {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)") === true;
  const intro = phase === "intro";
  const paused = status === "paused";
  const introPlaying = intro && status !== "idle";
  const bounce = TESTIMONIAL_INTRO_BOUNCE && introPlaying && !reduceMotion;
  const givenName = testimonialFirstName(name);
  const words = sentence?.words ?? [];
  const stageRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const coinEmergeRef = useRef<HTMLDivElement>(null);
  const [swoopReadyFor, setSwoopReadyFor] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (!bounce) {
      setSwoopReadyFor(null);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let raf = 0;

    const applyMeasure = () => {
      if (cancelled) return;
      const spacer = spacerRef.current;
      const portrait = portraitRef.current;
      const slot = slotRef.current;
      const stage = stageRef.current;
      if (!spacer || !portrait || !slot || !stage) {
        if (attempts++ < 45) raf = window.requestAnimationFrame(applyMeasure);
        return;
      }
      const hold = spacer.getBoundingClientRect();
      const dest = slot.getBoundingClientRect();
      const origin = stage.getBoundingClientRect();
      // Modal still launching / not laid out yet — wait for real geometry.
      if (hold.width < 8 || dest.width < 8 || origin.width < 8) {
        if (attempts++ < 45) raf = window.requestAnimationFrame(applyMeasure);
        return;
      }
      const lift = window.matchMedia("(min-width: 640px)").matches ? 48 : 0;
      const holdTop = hold.top - lift;
      portrait.style.setProperty("--intro-hold-top", `${holdTop - origin.top}px`);
      portrait.style.setProperty("--intro-hold-left", `${hold.left - origin.left}px`);
      portrait.style.setProperty("--intro-hold-size", `${hold.width}px`);
      portrait.style.setProperty("--intro-swoop-x", `${dest.left - hold.left}px`);
      portrait.style.setProperty("--intro-swoop-y", `${dest.top - holdTop}px`);
      portrait.style.setProperty("--intro-swoop-scale", `${dest.width / hold.width}`);
      const emerge = coinEmergeRef.current;
      if (emerge) {
        const fromX = hold.left + hold.width / 2 - (dest.left + dest.width / 2);
        const fromY = holdTop + hold.width / 2 - (dest.top + dest.height / 2);
        emerge.style.setProperty("--intro-coin-from-x", `${fromX}px`);
        emerge.style.setProperty("--intro-coin-from-y", `${fromY}px`);
      }
      setSwoopReadyFor(letterId);
    };

    // Two frames after bounce so flex/modal layout can settle before we lock CSS vars.
    raf = window.requestAnimationFrame(() => {
      raf = window.requestAnimationFrame(applyMeasure);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, [bounce, letterId, givenName, title]);

  useTestimonialIntroMedia({
    letterId,
    name,
    title,
    active: intro && status !== "idle",
    paused,
    onComplete: () => onIntroComplete(letterId),
  });

  return (
    <div ref={stageRef} className="relative flex h-full min-h-0 flex-col">
      <div
        ref={slotRef}
        className="testimonial-intro-coin-scene relative mx-auto h-[4.5rem] w-[4.5rem] shrink-0"
      >
        {bounce ? (
          <div
            ref={coinEmergeRef}
            className={`testimonial-intro-coin-emerge${swoopReadyFor === letterId ? " testimonial-intro-coin-emerge-run" : ""}`}
            style={{ animationPlayState: paused ? "paused" : "running" }}
          >
            <div
              key={`${letterId}-coin`}
              className={`testimonial-intro-coin${swoopReadyFor === letterId ? " testimonial-intro-coin-run" : ""}`}
              style={{ animationPlayState: paused ? "paused" : "running" }}
            >
              <div
                className="testimonial-intro-coin-face bg-black/45 ring-2 ring-white/15"
                aria-hidden
              />
              <div className="testimonial-intro-coin-face testimonial-intro-coin-face-back relative ring-2 ring-white/15">
                <Image
                  src={photo}
                  alt=""
                  fill
                  className="object-cover grayscale"
                  sizes="72px"
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/10"
            aria-hidden
          />
        )}
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-x-hidden overflow-y-auto overscroll-contain px-1 py-4">
        <div
          className={`absolute inset-0 flex min-h-0 flex-col items-center px-2 text-center ${
            intro ? "opacity-100" : "pointer-events-none opacity-0"
          } justify-center pb-1 sm:justify-end sm:pb-3`}
          aria-hidden={!intro}
        >
          {bounce ? (
            <div ref={spacerRef} className="testimonial-intro-hold-slot" aria-hidden />
          ) : null}
          <p className="font-display max-w-xl shrink-0 text-3xl leading-tight theme-heading-ink sm:text-4xl">
            {givenName}
          </p>
          <p className="mt-3 max-w-md shrink-0 text-sm leading-relaxed text-surface-400 sm:text-base">
            {title}
          </p>
        </div>

        <div
          className={intro ? "pointer-events-none opacity-0" : "opacity-100"}
          aria-hidden={intro}
        >
          {sentence ? (
            <p className="font-display max-w-prose text-center text-2xl leading-snug sm:text-3xl">
              {words.length > 0
                ? words.map((word, i) => {
                    const active = wordIndex === i;
                    const pending = wordIndex >= 0 && wordIndex < i;
                    return (
                      <span key={`${word.start}-${word.text}`}>
                        <span
                          className={`inline-block origin-bottom transition-[color,transform] duration-200 ${
                            active
                              ? "text-accent-300"
                              : pending
                                ? "text-surface-400"
                                : "theme-heading-ink"
                          } ${active && !reduceMotion ? "scale-125" : "scale-100"}`}
                        >
                          {word.text}
                        </span>
                        {i < words.length - 1 ? " " : ""}
                      </span>
                    );
                  })
                : sentence.text}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={onStop}
        aria-label={`Stop reading and show the letter from ${name}`}
        className={`${stopBtnClass} relative z-30`}
      >
        <CloseIcon className="h-5 w-5" />
      </button>

      <div
        ref={portraitRef}
        key={`${letterId}-${bounce ? "intro" : "rest"}`}
        className={`pointer-events-none absolute z-20 ${
          bounce
            ? `testimonial-intro-portrait${swoopReadyFor === letterId ? " testimonial-intro-portrait-run" : ""}`
            : "testimonial-intro-portrait-rest left-1/2 h-[4.5rem] w-[4.5rem]"
        }`}
        style={bounce ? { animationPlayState: paused ? "paused" : "running" } : undefined}
      >
        <div className="relative h-full w-full overflow-hidden rounded-full ring-2 ring-white/15 shadow-[0_18px_36px_rgb(0_0_0_/_0.45)]">
          <Image
            src={photo}
            alt={`Portrait of ${name}`}
            fill
            className="object-cover grayscale"
            sizes="320px"
          />
        </div>
      </div>
    </div>
  );
}
