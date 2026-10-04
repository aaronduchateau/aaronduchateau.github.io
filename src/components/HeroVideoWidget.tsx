"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  cueForTime,
  cueIndexForTime,
  cueSegmentProgress,
  heroIntroVideoContentId,
  heroVideoWidget,
  resolveHeroLearnMore,
  type HeroVideoCue,
  type HeroVideoVariant,
  type HeroVideoVariantId,
} from "@/data/heroVideoWidget";
import { TESTIMONIALS_MODAL_NAMESPACE } from "@/data/content";
import { recordActivity } from "@/activity/tracker";
import { focusCareerTimeline } from "@/lib/careerTimelineFocus";
import { navigateToRouteModal } from "@/lib/useRouteModal";
import {
  fitPlayerToHost,
  formatVideoTime,
  loadYouTubeApi,
  SCRUB_SEEK_THROTTLE_MS,
  VideoPauseIcon,
  VideoPlayIcon,
  YT_ENDED,
  YT_PLAYING,
  type YtPlayer,
} from "@/lib/youtubeIframeApi";
import { useTheme } from "@/theme/ThemeProvider";

/** Wait after the trailer ends before the Learn more shimmer. */
const LEARN_SHIMMER_DELAY_MS = 1000;

type Stage = "idle" | "choose" | "loading" | "revealed";

export function HeroVideoWidget() {
  const { visibility, playNavClick, holdThemeMusic, releaseThemeMusicHold } = useTheme();
  const hostId = useId().replace(/:/g, "");
  const hostElementId = `hero-yt-${hostId}`;
  const playerRef = useRef<YtPlayer | null>(null);
  const scrubbingRef = useRef(false);
  const pendingScrubTimeRef = useRef<number | null>(null);
  const lastSeekAtRef = useRef(0);
  const cueTimerBarRef = useRef<HTMLDivElement | null>(null);
  const readyRef = useRef(false);
  const playingRef = useRef(false);
  const stageRef = useRef<Stage>("idle");
  const variantIdRef = useRef<HeroVideoVariantId | null>(null);
  const pixelsUnlockedRef = useRef(false);
  const learnShimmerTimerRef = useRef<number | null>(null);
  /** One-shot marker at 3.28s — independent of the cover fade. */
  const pomegranateLoggedRef = useRef(false);

  const [stage, setStage] = useState<Stage>("idle");
  const [variantId, setVariantId] = useState<HeroVideoVariantId | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  /** True only after accurate playhead samples clear introHiddenSeconds. */
  const [pixelsUnlocked, setPixelsUnlocked] = useState(false);
  const [learnShimmer, setLearnShimmer] = useState(false);

  stageRef.current = stage;
  variantIdRef.current = variantId;
  pixelsUnlockedRef.current = pixelsUnlocked;
  readyRef.current = ready;
  playingRef.current = playing;

  const isNonInteractive = variantId === "nonInteractive";
  const introHidden = heroVideoWidget.introHiddenSeconds;
  const fadeStart = heroVideoWidget.coverFadeStartSeconds;
  const fadeDuration = heroVideoWidget.coverFadeDurationSeconds;
  /** Non-interactive: pin to the first cue (Testimonials) only. */
  const cue: HeroVideoCue = isNonInteractive
    ? heroVideoWidget.cues[0]
    : cueForTime(current);
  /**
   * Interactive: cyan fill = progress through the active cue window.
   * Non-interactive: no cyan bar — just the neutral solid hairline track.
   */
  const dividerFill = isNonInteractive ? 0 : (cueSegmentProgress(current) ?? 0);
  const dividerFillVisible = !isNonInteractive && cueSegmentProgress(current) != null;

  /**
   * Player keeps running underneath with sound.
   * Loading cover stays mounted through the fade (opacity from playhead).
   */
  const showSelectionOverlay =
    stage === "choose" || (stage === "revealed" && !pixelsUnlocked);

  const loadingCoverOpacity =
    stage !== "loading"
      ? 0
      : current < fadeStart
        ? 1
        : Math.max(0, 1 - (current - fadeStart) / fadeDuration);

  const paintCueTimerBar = useCallback((timeSeconds: number) => {
    const bar = cueTimerBarRef.current;
    if (!bar) return;
    if (variantIdRef.current === "nonInteractive") {
      // Neutral hairline only — never show the cyan cue fill.
      bar.hidden = true;
      bar.style.transform = "scaleX(0)";
      return;
    }
    const seg = cueSegmentProgress(timeSeconds);
    if (seg == null) {
      bar.style.transform = "scaleX(0)";
      bar.hidden = true;
      return;
    }
    bar.hidden = false;
    bar.style.transform = `scaleX(${seg})`;
  }, []);

  const clearLearnShimmer = useCallback(() => {
    if (learnShimmerTimerRef.current != null) {
      window.clearTimeout(learnShimmerTimerRef.current);
      learnShimmerTimerRef.current = null;
    }
    setLearnShimmer(false);
  }, []);

  const scheduleLearnShimmer = useCallback(() => {
    clearLearnShimmer();
    learnShimmerTimerRef.current = window.setTimeout(() => {
      setLearnShimmer(true);
      learnShimmerTimerRef.current = null;
    }, LEARN_SHIMMER_DELAY_MS);
  }, [clearLearnShimmer]);

  const destroyPlayer = useCallback(() => {
    try {
      playerRef.current?.destroy();
    } catch {
      /* already gone */
    }
    playerRef.current = null;
    clearLearnShimmer();
    setReady(false);
    setPlaying(false);
    setPixelsUnlocked(false);
  }, [clearLearnShimmer]);

  const startPlayback = useCallback((player: YtPlayer) => {
    try {
      // Audio during the hidden intro is fine — only pixels are gated.
      player.unMute();
      player.playVideo();
    } catch {
      /* ignore */
    }
  }, []);

  const mountPlayer = useCallback(
    async (videoId: string) => {
      const YT = await loadYouTubeApi();
      if (stageRef.current !== "loading") return;

      destroyPlayer();
      setPixelsUnlocked(false);

      const player = new YT.Player(hostElementId, {
        videoId,
        width: "100%",
        height: "100%",
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 1,
          // Start muted for autoplay policy; unMute on ready (user just clicked a mode).
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          // Do not force closed captions on — default YouTube CC off.
          cc_load_policy: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: typeof window !== "undefined" ? window.location.origin : "",
        },
        events: {
          onReady: (event) => {
            if (stageRef.current !== "loading" && stageRef.current !== "revealed") return;
            playerRef.current = event.target;
            try {
              event.target.unloadModule?.("captions");
            } catch {
              /* captions module optional */
            }
            const d = event.target.getDuration();
            if (Number.isFinite(d)) setDuration(d);
            setReady(true);
            fitPlayerToHost(hostElementId, event.target);
            // Play from 0 under the loading cover — do not seek past the intro.
            startPlayback(event.target);
          },
          onStateChange: (event) => {
            const ended = event.data === (YT.PlayerState?.ENDED ?? YT_ENDED);
            const isPlaying = event.data === (YT.PlayerState?.PLAYING ?? YT_PLAYING);
            setPlaying(isPlaying);
            if (ended) {
              scheduleLearnShimmer();
              const vid = variantIdRef.current;
              if (vid) {
                void recordActivity({
                  type: "video.complete",
                  contentId: heroIntroVideoContentId(vid),
                  label: "Portfolio intro video",
                });
              }
            }
          },
        },
      });
      playerRef.current = player;
    },
    [destroyPlayer, hostElementId, startPlayback, scheduleLearnShimmer],
  );

  useEffect(() => {
    return () => {
      destroyPlayer();
    };
  }, [destroyPlayer]);

  // One playhead loop for the life of `ready` — do not restart on stage (leaks rAF + listeners).
  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    let alive = true;
    let lastDuration = -1;

    const tick = () => {
      if (!alive) return;
      const stageNow = stageRef.current;
      if (stageNow !== "loading" && stageNow !== "revealed") {
        raf = window.requestAnimationFrame(tick);
        return;
      }

      const p = playerRef.current;
      if (p && !scrubbingRef.current) {
        try {
          const t = p.getCurrentTime();
          const d = p.getDuration();
          if (Number.isFinite(d) && d > 0 && d !== lastDuration) {
            lastDuration = d;
            setDuration(d);
          }

          // Independent 3.28s callback (does not affect overlays / unlock).
          if (!pomegranateLoggedRef.current && Number.isFinite(t) && t >= 3.28) {
            pomegranateLoggedRef.current = true;
            console.log("pomegranate");
          }

          // Cover fades from fadeStart; video + audio keep running underneath.
          if (Number.isFinite(t) && t >= fadeStart) {
            if (!pixelsUnlockedRef.current) {
              setPixelsUnlocked(true);
              fitPlayerToHost(hostElementId, p);
            }
            if (
              stageRef.current === "loading" &&
              t >= fadeStart + fadeDuration
            ) {
              setStage("revealed");
            }
          } else if (t < introHidden) {
            if (pixelsUnlockedRef.current) setPixelsUnlocked(false);
          }

          paintCueTimerBar(t);
          setCurrent(t);
        } catch {
          /* ignore mid-destroy */
        }
      }
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      alive = false;
      window.cancelAnimationFrame(raf);
    };
  }, [ready, introHidden, fadeStart, fadeDuration, paintCueTimerBar, hostElementId]);

  useEffect(() => {
    if (playing && !scrubbingRef.current) return;
    paintCueTimerBar(current);
  }, [current, playing, isNonInteractive, paintCueTimerBar]);

  // Hold theme music only while the intro trailer is actually playing.
  useEffect(() => {
    if (playing) {
      holdThemeMusic("hero-intro-video");
      return () => releaseThemeMusicHold("hero-intro-video");
    }
    releaseThemeMusicHold("hero-intro-video");
  }, [playing, holdThemeMusic, releaseThemeMusicHold]);

  const openChooser = () => {
    playNavClick();
    setStage("choose");
  };

  const selectVariant = (variant: HeroVideoVariant) => {
    playNavClick();
    setVariantId(variant.id);
    // Loading cover goes up immediately on click; video plays underneath.
    setStage("loading");
    setCurrent(0);
    setPixelsUnlocked(false);
    clearLearnShimmer();
    pomegranateLoggedRef.current = false;
    paintCueTimerBar(0);

    const existing = playerRef.current;
    if (existing?.loadVideoById) {
      try {
        existing.loadVideoById(variant.youtubeId);
        startPlayback(existing);
        setReady(true);
        return;
      } catch {
        /* fall through to remount */
      }
    }
    void mountPlayer(variant.youtubeId);
  };

  const pausePlayback = useCallback(() => {
    if (!playingRef.current) return;
    try {
      playerRef.current?.pauseVideo();
    } catch {
      /* ignore */
    }
  }, []);

  const togglePlayback = useCallback(() => {
    if ((stageRef.current !== "loading" && stageRef.current !== "revealed") || !readyRef.current) {
      return;
    }
    const p = playerRef.current;
    if (!p) return;
    if (playingRef.current) {
      p.pauseVideo();
    } else {
      startPlayback(p);
    }
  }, [startPlayback]);

  // While the trailer is playing, any click/tap on the page pauses it
  // (Learn more, nav, cards, etc.). Intentionally capture-phase so it runs
  // before other handlers; play/pause controls still only pause when playing.
  useEffect(() => {
    if (!playing) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-hero-playback-toggle]")) {
        return;
      }
      pausePlayback();
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [playing, pausePlayback]);

  // Space toggles play/pause while the trailer player is active.
  useEffect(() => {
    if (stage !== "loading" && stage !== "revealed") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.key !== " ") return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
          return;
        }
      }
      event.preventDefault();
      togglePlayback();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stage, togglePlayback]);

  const applyScrubTime = useCallback(
    (value: number, forceSeek: boolean) => {
      if ((stageRef.current !== "loading" && stageRef.current !== "revealed") || !playerRef.current) {
        return;
      }
      setCurrent(value);
      paintCueTimerBar(value);
      pendingScrubTimeRef.current = value;

      if (value < introHidden) {
        if (pixelsUnlockedRef.current) setPixelsUnlocked(false);
      }

      const now = performance.now();
      if (forceSeek || now - lastSeekAtRef.current >= SCRUB_SEEK_THROTTLE_MS) {
        lastSeekAtRef.current = now;
        playerRef.current.seekTo(value, true);
      }
    },
    [introHidden, paintCueTimerBar],
  );

  const endScrub = useCallback((event?: ReactPointerEvent<HTMLInputElement>) => {
    if (!scrubbingRef.current) return;
    scrubbingRef.current = false;
    if (event?.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const pending = pendingScrubTimeRef.current;
    if (pending != null) {
      playerRef.current?.seekTo(pending, true);
      lastSeekAtRef.current = performance.now();
      pendingScrubTimeRef.current = null;
    }
  }, []);

  const onScrubPointerDown = (event: ReactPointerEvent<HTMLInputElement>) => {
    scrubbingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onScrubChange = (value: number) => {
    if (!ready) return;
    applyScrubTime(value, false);
  };

  const playerMounted = stage === "loading" || stage === "revealed";

  const progress = duration > 0 ? Math.min(1, current / duration) : 0;
  const cueIndex = isNonInteractive ? 0 : cueIndexForTime(current);

  const onLearnMore = () => {
    playNavClick();
    pausePlayback();
    const target = resolveHeroLearnMore(cue, {
      cueIndex,
      isNonInteractive,
    });
    if (target.kind === "career-timeline") {
      focusCareerTimeline(target.workHistoryId, { pause: true });
      return;
    }
    navigateToRouteModal(target.namespace, target.key, {
      play: target.namespace === TESTIMONIALS_MODAL_NAMESPACE,
    });
  };

  const showSwoop = visibility.heroLearnMoreSwoop;
  const hasLearnMore = true;

  const learnMoreClassName = [
    showSwoop
      ? "hero-learn-btn shrink-0 text-sm font-semibold text-surface-950"
      : "hero-learn-btn theme-btn-shape inline-flex shrink-0 items-center px-4 text-sm font-semibold text-surface-950 shadow-lg shadow-accent-500/20",
    learnShimmer ? "hero-learn-btn--shimmer" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const learnMoreControl = (
    <button type="button" onClick={onLearnMore} className={learnMoreClassName}>
      Learn more
    </button>
  );

  return (
    <div
      className={`hero-video-widget relative w-full max-w-md lg:max-w-lg${
        showSwoop && hasLearnMore ? " hero-video-widget--swoop" : ""
      }`}
    >
      {showSwoop && hasLearnMore ? (
        <span className="hero-learn-ribbon-back" aria-hidden />
      ) : null}

      <div className="theme-glass relative z-10 overflow-visible shadow-2xl">
        <div className="theme-quote-aura pointer-events-none absolute -inset-1 -z-10 blur-lg" />

        <div className="overflow-hidden rounded-t-[inherit]">
          {/* Video frame — iframe always in-place; opaque covers sit above until 4s */}
          <div className="relative aspect-video w-full overflow-hidden bg-surface-950">
            <div
              id={hostElementId}
              className="pointer-events-none absolute inset-0 z-0 h-full w-full [&_iframe]:pointer-events-none [&_iframe]:!absolute [&_iframe]:!inset-0 [&_iframe]:!h-full [&_iframe]:!w-full [&_iframe]:!max-h-none [&_iframe]:!max-w-none [&_iframe]:border-0"
              aria-hidden={!pixelsUnlocked}
            />

            {/* Idle: crest + play (no player yet) */}
            {stage === "idle" ? (
              <div className="absolute inset-0 z-10">
                <Image
                  src={heroVideoWidget.posterSrc}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 32rem"
                  priority
                />
                <div className="absolute inset-0 bg-surface-950/45" aria-hidden />
                <button
                  type="button"
                  onClick={openChooser}
                  aria-label="Play portfolio trailer"
                  className="absolute inset-0 z-10 grid place-items-center"
                >
                  <span
                    className="theme-play-btn relative z-10 h-12 w-12 drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)] sm:h-14 sm:w-14"
                    aria-hidden
                  >
                    <span className="theme-play-triangle" />
                  </span>
                </button>
              </div>
            ) : null}

            {/* Mode chooser (initial pick, or scrub back before introHiddenSeconds) */}
            {showSelectionOverlay ? (
              <div className="absolute inset-0 z-20 bg-surface-950">
                <Image
                  src={heroVideoWidget.posterSrc}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 32rem"
                  priority
                />
                <div className="absolute inset-0 bg-surface-950" aria-hidden />
                <div className="absolute inset-0 z-20 flex flex-col justify-center gap-2 p-3 sm:gap-4 sm:p-6">
                  <p className="sr-only md:not-sr-only md:block text-center font-mono text-[10px] uppercase tracking-[0.2em] text-accent-300/80">
                    Choose a viewing mode
                  </p>
                  <div className="grid gap-3 sm:gap-3.5">
                    {heroVideoWidget.variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => selectVariant(variant)}
                        className={`theme-btn-shape group border px-4 py-3.5 text-left backdrop-blur-sm transition sm:px-5 sm:py-4 ${
                          variantId === variant.id
                            ? "border-accent-400/60 bg-surface-900/90"
                            : "border-white/15 bg-surface-950/70 hover:border-accent-400/50 hover:bg-surface-900/80"
                        }`}
                      >
                        <span className="block font-display text-base font-semibold text-white sm:text-lg">
                          {variant.label}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-surface-400 sm:text-sm">
                          {variant.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {/*
              Loading cover: solid until 4.1s, then opacity fades while video/audio
              keep playing underneath. Removed only after the fade completes.
            */}
            {stage === "loading" ? (
              <div
                className="absolute inset-0 z-30 grid place-items-center bg-surface-950"
                style={{ opacity: loadingCoverOpacity }}
                role="status"
                aria-live="polite"
              >
                <div className="px-6 text-center">
                  <p className="font-display text-lg font-semibold text-white sm:text-xl">
                    Loading trailer…
                  </p>
                  <p className="mt-2 text-xs text-surface-400 sm:text-sm">
                    {variantId === "interactive"
                      ? "Preparing the interactive cut."
                      : "Preparing the non-interactive cut."}
                  </p>
                </div>
              </div>
            ) : null}

            {stage === "revealed" && pixelsUnlocked && playing ? (
              <button
                type="button"
                aria-label="Pause video"
                data-hero-playback-toggle=""
                onClick={togglePlayback}
                className="absolute inset-0 z-10 cursor-pointer bg-transparent"
              />
            ) : null}

            {stage === "revealed" && pixelsUnlocked && !playing ? (
              <button
                type="button"
                onClick={togglePlayback}
                disabled={!ready}
                aria-label="Play video"
                data-hero-playback-toggle=""
                className="absolute inset-0 z-10 grid place-items-center disabled:cursor-wait"
              >
                <div className="absolute inset-0 bg-surface-950/45" aria-hidden />
                <span
                  className="theme-play-btn relative z-10 h-12 w-12 drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)] sm:h-14 sm:w-14"
                  aria-hidden
                >
                  <span className="theme-play-triangle" />
                </span>
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2 px-3 py-2">
            <span className="shrink-0 font-mono text-[10px] tabular-nums text-surface-500">
              {formatVideoTime(current)}
            </span>
            {/*
              Progressbar announces playback position (both interactive + non-interactive).
              The range remains a slider for seeking — separate roles on purpose.
            */}
            <div
              role="progressbar"
              aria-label="Video playback progress"
              aria-valuemin={0}
              aria-valuemax={Math.max(1, Math.round(duration || 1))}
              aria-valuenow={Math.round(Math.min(current, duration || 0))}
              className="sr-only"
            />
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={Math.min(current, duration || 0)}
              disabled={!playerMounted || !ready || duration <= 0}
              aria-label="Seek video timeline"
              className="hero-video-seek h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed disabled:opacity-40"
              style={{ "--seek-progress": `${progress * 100}%` } as CSSProperties}
              onPointerDown={onScrubPointerDown}
              onPointerUp={endScrub}
              onPointerCancel={endScrub}
              onChange={(e) => onScrubChange(Number(e.target.value))}
            />
            <span className="shrink-0 font-mono text-[10px] tabular-nums text-surface-500">
              {formatVideoTime(duration)}
            </span>
            <button
              type="button"
              aria-label={playing ? "Pause" : "Play"}
              title={playing ? "Pause" : "Play"}
              disabled={!playerMounted || !ready}
              data-hero-playback-toggle=""
              onClick={togglePlayback}
              className="theme-btn-shape grid h-6 w-6 shrink-0 place-items-center text-accent-300 transition hover:bg-white/10 hover:text-accent-200 disabled:opacity-40"
            >
              {playing ? <VideoPauseIcon className="h-3 w-3" /> : <VideoPlayIcon className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Same 1px band always — interactive may paint cyan cue fill; non-interactive stays neutral. */}
        <div
          className={`relative h-px w-full shrink-0 transition-opacity duration-300 ${
            isNonInteractive ? "bg-white/20" : "bg-white/10"
          } ${dividerFillVisible && !playing ? "opacity-50" : "opacity-100"}`}
          aria-hidden={!dividerFillVisible}
        >
          <div
            ref={cueTimerBarRef}
            role={dividerFillVisible ? "progressbar" : undefined}
            aria-label={dividerFillVisible ? "Interactive cue segment progress" : undefined}
            aria-valuemin={dividerFillVisible ? 0 : undefined}
            aria-valuemax={dividerFillVisible ? 100 : undefined}
            aria-valuenow={
              dividerFillVisible ? Math.round(Math.min(1, Math.max(0, dividerFill)) * 100) : undefined
            }
            className="absolute inset-y-0 left-0 w-full origin-left bg-accent-400"
            style={{ transform: `scaleX(${dividerFill})` }}
            hidden={!dividerFillVisible}
          />
        </div>

        <div className="hero-learn-cue">
          <div
            key={isNonInteractive ? "testimonials-static" : cue.triggerTime}
            className="hero-learn-cue-copy min-w-0 w-full"
          >
            {/* Full-width title — gated line box; ink can overhang without growing margins. */}
            <h2 className="hero-learn-cue-title font-display text-base font-semibold text-white sm:text-lg">
              <span className="hero-learn-cue-title__text">{cue.title}</span>
            </h2>
            {/* Bottom stays two-column: description + Learn more. */}
            <div className="hero-learn-cue-bottom flex min-w-0 items-end gap-3 sm:gap-4">
              <p className="min-w-0 flex-1 line-clamp-2 text-xs leading-relaxed text-surface-400 sm:text-sm">
                {cue.description}
              </p>
              {hasLearnMore ? (
                showSwoop ? (
                  <div className="hero-learn-ribbon-front">
                    {learnMoreControl}
                    <span className="hero-learn-ribbon-extend" aria-hidden />
                  </div>
                ) : (
                  learnMoreControl
                )
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
