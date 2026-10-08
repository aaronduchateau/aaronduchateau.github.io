"use client";

import Image from "next/image";
import { DividerWave } from "@/components/DividerWave";
import type { TestimonialSpeechPhase, TestimonialSpeechStatus } from "@/hooks/useTestimonialSpeech";
import { testimonialFirstName } from "@/lib/testimonialIntro";
import { VideoPauseIcon, VideoPlayIcon } from "@/lib/youtubeIframeApi";

const playCircleClass =
  "theme-btn-shape theme-testimonial-play grid h-12 w-12 shrink-0 place-items-center border border-white/15 text-accent-300";

type Props = {
  name: string;
  title: string;
  photo: string;
  supported: boolean;
  ready: boolean;
  status: TestimonialSpeechStatus;
  phase?: TestimonialSpeechPhase;
  onToggle: () => void;
};

export function TestimonialSpeechFooter({
  name,
  title,
  photo,
  supported,
  ready,
  status,
  phase = "reading",
  onToggle,
}: Props) {
  const givenName = testimonialFirstName(name);
  const playing = status === "playing";
  const introducing = phase === "intro" && status !== "idle";
  const loading = !ready;
  const showPlay = loading || supported;
  const canToggle = ready && supported;

  const identity = (
    <>
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white/15">
        <Image
          src={photo}
          alt={`Portrait of ${givenName}`}
          fill
          className="object-cover grayscale"
          sizes="48px"
        />
      </div>
      {showPlay ? (
        <span
          className={`${playCircleClass}${loading ? " theme-testimonial-play--loading" : ""}`}
          aria-hidden
        >
          {playing ? (
            <VideoPauseIcon className="h-4 w-4" />
          ) : (
            <VideoPlayIcon className="h-4 w-4" />
          )}
        </span>
      ) : null}
      <div className="min-w-0">
        <span className="block font-semibold text-white">- {givenName}</span>
        <span className="block text-surface-400">{title}</span>
      </div>
    </>
  );

  return (
    <div className="relative z-10 mt-3 shrink-0 sm:mt-4">
      <DividerWave
        active={playing}
        fillBelow
        seam="top"
        className="absolute inset-0 h-full"
      />
      <div className="relative h-3" aria-hidden />
      {canToggle ? (
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={playing}
          aria-label={
            introducing && playing
              ? `Pause introduction of ${givenName}`
              : introducing
                ? `Resume introduction of ${givenName}`
                : playing
                  ? `Pause reading ${givenName}`
                  : status === "paused"
                    ? `Resume reading ${givenName}`
                    : `Play testimonial from ${givenName}`
          }
          className="relative flex w-full items-center gap-4 px-4 pb-4 pt-3 text-left text-sm text-surface-300 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-300 sm:px-6 sm:pb-6"
        >
          {identity}
        </button>
      ) : (
        <div
          className="relative flex items-center gap-4 px-4 pb-4 pt-3 text-sm text-surface-300 sm:px-6 sm:pb-6"
          aria-busy={loading || undefined}
          aria-label={loading ? "Loading testimonial playback" : undefined}
        >
          {identity}
        </div>
      )}
    </div>
  );
}
