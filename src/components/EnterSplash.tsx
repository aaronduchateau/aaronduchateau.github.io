"use client";

import { useEffect, useState } from "react";
import { ChromelessYouTubePlayer } from "@/components/ChromelessYouTubePlayer";

const VIDEO_SETTLE_MS = 700;

/** JSON-serializable splash fields. Stored next to each demo; `onContinue` is runtime-only. */
export type EnterSplashConfig = {
  message: string;
  continueLabel?: string;
  youtubeId?: string;
  videoTitle?: string;
  startSeconds?: number;
  /** Optional display date, e.g. "Oct 14, 2026". */
  date?: string;
};

type Props = EnterSplashConfig & {
  onContinue: () => void;
};

/**
 * Shared pre-continue gate for interactive demos and media enter splashes.
 * Optional YouTube sits above the statement; on end it fades and collapses so
 * the copy slides on the y-axis into the centered rest position.
 */
export function EnterSplash({
  message,
  onContinue,
  continueLabel = "Continue",
  youtubeId,
  videoTitle = "Video",
  startSeconds,
  date,
}: Props) {
  const [videoPhase, setVideoPhase] = useState<"on" | "fading" | "off">(
    youtubeId ? "on" : "off",
  );

  useEffect(() => {
    setVideoPhase(youtubeId ? "on" : "off");
  }, [youtubeId]);

  useEffect(() => {
    if (videoPhase !== "fading") return;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reduceMotion ? 0 : VIDEO_SETTLE_MS + 50;
    const timer = window.setTimeout(() => setVideoPhase("off"), delay);
    return () => window.clearTimeout(timer);
  }, [videoPhase]);

  const collapsing = videoPhase === "fading";
  const showVideo = Boolean(youtubeId) && videoPhase !== "off";

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center px-6 text-center">
      {showVideo && youtubeId ? (
        <div
          className="grid w-full max-w-lg transition-[grid-template-rows] ease-out motion-reduce:transition-none"
          style={{
            gridTemplateRows: collapsing ? "0fr" : "1fr",
            transitionDuration: `${VIDEO_SETTLE_MS}ms`,
          }}
          onTransitionEnd={(event) => {
            if (event.propertyName !== "grid-template-rows") return;
            if (videoPhase === "fading") setVideoPhase("off");
          }}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={`mb-8 transition-opacity ease-out motion-reduce:transition-none ${
                collapsing ? "opacity-0" : "opacity-100"
              }`}
              style={{ transitionDuration: `${VIDEO_SETTLE_MS}ms` }}
            >
              <div className="theme-video-player flex h-[min(40vh,20rem)] w-full flex-col border border-white/10 bg-black">
                <ChromelessYouTubePlayer
                  youtubeId={youtubeId}
                  startSeconds={startSeconds}
                  title={videoTitle}
                  className="min-h-0 flex-1"
                  onEnded={() => setVideoPhase("fading")}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="flex flex-col items-center gap-8">
        <div className="flex max-w-md flex-col items-center">
          {date ? (
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-300/80">
              {date}
            </p>
          ) : null}
          <p className="text-lg font-semibold leading-snug tracking-tight text-surface-100 sm:text-xl">
            {message}
          </p>
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-full bg-accent-500/90 px-8 py-2.5 text-sm font-semibold text-surface-950 hover:bg-accent-400"
        >
          {continueLabel}
        </button>
      </div>
    </div>
  );
}
